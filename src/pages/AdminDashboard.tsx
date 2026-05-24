import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, Plus, Trash2, Edit2, X, UploadCloud, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('orders');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', category: '', img: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error(error);
    });

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error(error);
    });

    const qCat = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubCat = onSnapshot(qCat, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error(error);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCat();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategoryName.trim() });
      setNewCategoryName('');
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality, smaller size
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    
    try {
      const base64Data = await compressImage(file);
      setUploadProgress(100);
      setProductForm(prev => ({ ...prev, img: base64Data }));
      setUploading(false);
    } catch (error) {
      console.error('Image compression failed', error);
      alert('Failed to process image. Please try again.');
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.category) {
      alert("Please select a category");
      return;
    }
    if (!productForm.img) {
      alert("Please upload an image");
      return;
    }
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productForm,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditingProduct(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: '', img: '' });
    } catch (err) {
      console.error("Error saving product", err);
      alert("Failed to save product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white">
      {/* Sidebar/Header */}
      <header className="bg-brand-primary border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-xl text-white tracking-tight">3DPitara Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            View Store
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Navigation */}
        <aside className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${activeTab === 'orders' ? 'bg-brand-accent text-brand-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${activeTab === 'products' ? 'bg-brand-accent text-brand-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${activeTab === 'categories' ? 'bg-brand-accent text-brand-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Layers className="w-5 h-5" />
            Categories
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 min-h-[500px]">
          {activeTab === 'orders' && (
            <div className="bg-brand-primary rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold font-heading mb-6">Orders Management</h2>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-gray-400">No orders found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                          <th className="pb-3 px-4 font-medium">Customer</th>
                          <th className="pb-3 px-4 font-medium">Product</th>
                          <th className="pb-3 px-4 font-medium">Price</th>
                          <th className="pb-3 px-4 font-medium">Date</th>
                          <th className="pb-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-white">{order.customerName}</div>
                              <div className="text-xs text-gray-400">{order.address}</div>
                            </td>
                            <td className="py-4 px-4 text-gray-300">{order.productName}</td>
                            <td className="py-4 px-4 text-brand-highlight">{order.price}</td>
                            <td className="py-4 px-4 text-gray-400 text-sm">
                              {order.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                            </td>
                            <td className="py-4 px-4">
                              <select 
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-brand-accent focus:outline-none"
                              >
                                <option value="received">Received</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'products' && (
            <div className="bg-brand-primary rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-heading">Products Management</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      try {
                        const STATIC_PRODUCTS = [
                          { category: "Anime Collection", name: "Naruto Keychain", price: "₹199", img: "/naruto.png" },
                          { category: "Anime Collection", name: "Gojo Keychain", price: "₹229", img: "/gojo.png" },
                          { category: "Anime Collection", name: "Luffy Keychain", price: "₹219", img: "/luffy.png" },
                          { category: "Anime Collection", name: "Itachi Keychain", price: "₹249", img: "/itachi.png" },
                          { category: "Gaming Collection", name: "PlayStation Keychain", price: "₹179", img: "/playstation.png" },
                          { category: "Gaming Collection", name: "Xbox Keychain", price: "₹189", img: "/xbox.png" },
                          { category: "Gaming Collection", name: "PUBG Helmet", price: "₹199", img: "/pubg.png" },
                          { category: "Gaming Collection", name: "Valorant Logo", price: "₹209", img: "/valorant.png" },
                          { category: "Custom Name", name: "Single Name Tag", price: "₹149", img: "/single.png" },
                          { category: "Custom Name", name: "Couple Name Tag", price: "₹249", img: "/couple.png" },
                          { category: "Custom Name", name: "Glow in Dark Name", price: "₹199", img: "/glow.png" },
                          { category: "Custom Name", name: "Team Name Tag", price: "₹349", img: "/team.png" },
                          { category: "Logo Collection", name: "Company Logo", price: "₹299", img: "/company.png" },
                          { category: "Logo Collection", name: "Startup Logo", price: "₹299", img: "/startup.png" },
                          { category: "Logo Collection", name: "Store Logo", price: "₹299", img: "/store.png" },
                          { category: "Logo Collection", name: "Custom Logo Base", price: "₹349", img: "/logo.png" }
                        ];
                        const cats = ["Anime Collection", "Gaming Collection", "Custom Name", "Logo Collection"];
                        for (const cat of cats) {
                           await addDoc(collection(db, 'categories'), { name: cat });
                        }
                        for (const item of STATIC_PRODUCTS) {
                          await addDoc(collection(db, 'products'), {
                            ...item,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                          });
                        }
                        alert('Seeded successfully!');
                      } catch (err) {
                        console.error(err);
                        alert('Failed to seed');
                      }
                    }}
                    className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors"
                  >
                    Seed Data
                  </button>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', price: '', category: '', img: '' });
                      setIsEditingProduct(true);
                      setUploading(false);
                      setUploadProgress(0);
                    }}
                    className="bg-brand-accent text-brand-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
              </div>

              {isEditingProduct ? (
                <form onSubmit={handleSaveProduct} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg font-heading">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                    <button type="button" onClick={() => { setIsEditingProduct(false); setUploading(false); setUploadProgress(0); }} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-[#161616] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-accent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Price (e.g. ₹199)</label>
                      <input required type="text" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-[#161616] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-accent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Category</label>
                      <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-[#161616] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-accent outline-none">
                        <option value="" disabled>Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Image</label>
                      <div 
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-24 bg-[#161616] border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-brand-accent transition-colors relative overflow-hidden mb-2"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <span className="text-brand-accent font-medium text-sm mb-1">Uploading...</span>
                            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-accent" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : productForm.img && productForm.img.startsWith('blob:') ? (
                           // Hide blob URL visually here if needed, but not strictly a blob
                          <div className="flex items-center gap-2">
                             <img src={productForm.img} alt="Preview" className="h-16 w-16 object-cover rounded" />
                             <span className="text-xs text-brand-highlight px-2 py-1 bg-white/10 rounded">Image Selected</span>
                          </div>
                        ) : productForm.img ? (
                          <div className="flex items-center gap-2">
                             <img src={productForm.img} alt="Preview" className="h-16 w-16 object-cover rounded" />
                             <span className="text-xs text-brand-highlight px-2 py-1 bg-white/10 rounded">Image Present</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 mb-1" />
                            <span className="text-xs">Drag & drop or Click to upload</span>
                            <span className="text-[10px] text-gray-500 mt-1">(Image will be automatically compressed)</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*" 
                      />
                      <input 
                        type="text" 
                        value={productForm.img} 
                        onChange={e => setProductForm({...productForm, img: e.target.value})} 
                        placeholder="Or enter image URL here..." 
                        className="w-full bg-[#161616] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-brand-accent outline-none" 
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={uploading} className="bg-brand-accent text-brand-primary font-bold px-6 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50">
                    Save Product
                  </button>
                </form>
              ) : null}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="text-gray-400 col-span-full">No products found. Add some!</div>
                ) : (
                  products.map(product => (
                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
                      <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#111]">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-brand-highlight px-2 py-1 rounded text-xs font-bold">
                          {product.price}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-brand-accent mb-1">{product.category}</div>
                        <h4 className="font-bold text-white mb-4 line-clamp-1">{product.name}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setProductForm({ name: product.name, price: product.price, category: product.category, img: product.img });
                              setEditingProduct(product);
                              setIsEditingProduct(true);
                            }}
                            className="flex-1 py-1.5 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'categories' && (
            <div className="bg-brand-primary rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold font-heading mb-6">Categories Management</h2>
              
              <form onSubmit={handleAddCategory} className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">New Category Name</label>
                  <input required type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Anime Collection" className="w-full bg-[#161616] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-accent outline-none" />
                </div>
                <button type="submit" className="bg-brand-accent text-brand-primary font-bold px-6 py-2 rounded-lg hover:bg-white transition-colors h-[42px] flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="space-y-3">
                {categories.length === 0 ? (
                  <div className="text-gray-400">No categories found. Wait or add one!</div>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <span className="font-semibold text-white">{cat.name}</span>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
