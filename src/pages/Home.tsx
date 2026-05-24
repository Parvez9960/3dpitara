import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ADDED THIS LINE
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Youtube,
  Menu,
  X,
  CheckCircle2,
  Package,
  Clock,
  Star,
  ChevronDown,
  MessageCircle,
  Truck,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';

const STATIC_PRODUCTS = [
  { category: "Anime Collection", items: [
    { name: "Naruto Keychain", price: "₹199", img: "/naruto.png" },
    { name: "Gojo Keychain", price: "₹229", img: "/gojo.png" },
    { name: "Luffy Keychain", price: "₹219", img: "/luffy.png" },
    { name: "Itachi Keychain", price: "₹249", img: "/itachi.png" },
  ]},
  { category: "Gaming Collection", items: [
    { name: "PlayStation Keychain", price: "₹179", img: "/playstation.png" },
    { name: "Xbox Keychain", price: "₹189", img: "/xbox.png" },
    { name: "PUBG Helmet", price: "₹199", img: "/pubg.png" },
    { name: "Valorant Logo", price: "₹209", img: "/valorant.png" },
  ]},
  { category: "Custom Name", items: [
    { name: "Single Name", price: "₹249", img: "/single.png" },
    { name: "Couple Name", price: "₹349", img: "/couple.png" },
    { name: "Glow Name Tag", price: "₹399", img: "/glow.png" },
  ]},
  { category: "Logo Collection", items: [
    { name: "Company Logo", price: "₹299", img: "/company.png" },
    { name: "Startup Branding", price: "₹349", img: "/startup.png" },
    { name: "Team Merchandise", price: "₹399", img: "/team.png" },
  ]}
];

const REVIEWS = [
  { text: "Amazing quality and smooth finish!", author: "Rahul S.", rating: 5 },
  { text: "Best custom gift I ever ordered.", author: "Sneha P.", rating: 5 },
  { text: "Fast delivery and perfect design.", author: "Adnan K.", rating: 5 },
  { text: "Exactly as I imagined.", author: "Ayesha M.", rating: 5 },
  { text: "Affordable and premium looking.", author: "Aman J.", rating: 5 },
];

const FAQS = [
  { q: "Can I create my own custom design?", a: "Yes, you can share your design or idea with us and we'll bring it to life!" },
  { q: "How long does delivery take?", a: "Typically 3–7 working days depending on your location and the complexity of the design." },
  { q: "Do you deliver all over India?", a: "Yes, we ship our keychains and accessories across India." },
  { q: "Do you take bulk orders?", a: "Absolutely! We cater to corporate events, parties, and merchandise in bulk with special pricing." },
  { q: "Can I preview before printing?", a: "Yes, we share a 3D digital preview of custom designs before we start the printing process for your approval." },
];

const WHATSAPP_NUMBER = "919834818849";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi 3DPitara, I would like to place an order!`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.57c-.198 0-.52.074-.792.347-.272.273-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function Navbar({ onTrackOrder }: { onTrackOrder: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Shop", href: "#shop" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" }
  ];

  return (
    <nav className="fixed w-full z-50 bg-brand-primary/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <img src="/logo2.png" alt="3DPitara Logo" className="w-[180px] h-auto object-contain cursor-pointer drop-shadow-sm hover:drop-shadow-md transition-all" />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <a key={link.name} href={link.href} className="text-gray-300 hover:text-brand-accent transition-colors text-sm font-medium">
                {link.name}
              </a>
            ))}
            <button
              onClick={onTrackOrder}
              className="text-gray-300 hover:text-brand-accent transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Track Order
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="bg-brand-accent text-brand-primary px-5 py-2.5 rounded-full font-semibold hover:bg-white transition-colors flex items-center gap-2">
              <WhatsAppIcon className="w-4 h-4" />
              Order Now
            </a>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-primary border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {links.map(link => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-brand-accent transition-colors text-lg font-medium"
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={() => { setIsOpen(false); onTrackOrder(); }}
                className="block w-full text-left text-gray-300 hover:text-brand-accent transition-colors text-lg font-medium"
              >
                Track Order
              </button>
              <a 
                href={WHATSAPP_LINK} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex bg-brand-accent text-brand-primary px-6 py-3 rounded-full font-semibold hover:bg-white transition-colors items-center gap-2 mt-4"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Order on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-accent/20 via-brand-primary to-brand-primary -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-highlight text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              <span>Print Your Imagination</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
            >
              Custom 3D Printed <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">Keychains</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Anime • Gaming • Personalized Names • Logos. High-quality, durable, and crafted exactly how you want it.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <a href="#shop" className="w-full sm:w-auto bg-brand-accent text-brand-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                Shop Collection
                <ChevronRight className="w-5 h-5" />
              </a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10">
                <WhatsAppIcon className="w-5 h-5" />
                Custom Order
              </a>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400 font-medium"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-accent" />
                Across India
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-brand-highlight" />
                4.9/5 Ratings
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative lg:h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-accent/20"
          >
            {/* Hero Image */}
            <img 
              src="/hero.jpeg" 
              alt="3D Printed Keychains Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold font-heading">Flat 10% OFF</div>
                  <div className="text-brand-highlight text-sm">On Your First Order</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary">
                  <Printer className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: <ShieldCheck className="w-8 h-8 text-brand-accent" />, title: "Premium Print Quality", desc: "Smooth finish and durable material built to last." },
    { icon: <Printer className="w-8 h-8 text-brand-accent" />, title: "Fully Customizable", desc: "Design it your way. Any name, any logo, any shape." },
    { icon: <Truck className="w-8 h-8 text-brand-accent" />, title: "Fast Delivery", desc: "Reliable shipping across India with updates." },
    { icon: <Zap className="w-8 h-8 text-brand-accent" />, title: "Affordable Pricing", desc: "Creative products without premium pricing." },
  ];

  return (
    <section className="py-20 bg-brand-primary relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Why Choose 3DPitara</h2>
          <p className="text-gray-400">Professional 3D printing technology delivering precision in every piece.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-brand-accent/10 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    let qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    let unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    let qCat = query(collection(db, 'categories'), orderBy('name', 'asc'));
    let unsubCat = onSnapshot(qCat, (snapshot) => {
      const fetchedCats = snapshot.docs.map(doc => doc.data().name);
      setCategories(fetchedCats);
      if (fetchedCats.length > 0 && !activeCategory) {
         setActiveCategory(fetchedCats[0]);
      }
    });
    
    return () => {
      unsubProducts();
      unsubCat();
    };
  }, [activeCategory]);

  const handleOrderClick = (product: any) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        customerName: customerForm.name.trim(),
        customerPhone: customerForm.phone.trim(),
        productName: selectedProduct.name,
        price: selectedProduct.price,
        status: 'received',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const message = encodeURIComponent(`Hi 3DPitara, I would like to place an order for ${selectedProduct.name}!\n\nMy Order ID: ${docRef.id}\nName: ${customerForm.name}\nPhone: ${customerForm.phone}`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
      
      setOrderModalOpen(false);
      setCustomerForm({ name: '', phone: '' });
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try direct WhatsApp.');
    }
  };

  return (
    <section id="shop" className="py-24 bg-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12 gap-8">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Our Collection</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Browse our top-selling 3D printed keychains or order a custom design made specially for you.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === category 
                    ? 'bg-brand-accent text-brand-primary' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-400">Loading products...</div>
        ) : (
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.filter(p => p.category === activeCategory).map((item, idx) => (
              <div key={idx} className="group bg-brand-primary border border-white/10 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-colors">
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-brand-primary/80 backdrop-blur-sm text-brand-highlight px-3 py-1 rounded-full text-xs font-bold border border-brand-highlight/20">
                    {item.price}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-4 font-heading">{item.name}</h3>
                  <button 
                    onClick={() => handleOrderClick(item)}
                    className="w-full py-2.5 border border-white/20 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-accent hover:text-brand-primary hover:border-brand-accent transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center p-8 border border-brand-accent/30 bg-brand-accent/5 rounded-3xl w-full max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold font-heading text-white mb-2">Want something completely unique?</h3>
            <p className="text-gray-400 mb-6">We accept custom design requests. Just share your idea, sketch, or logo!</p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="bg-brand-accent text-brand-primary px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
              Request Custom Design
            </a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {orderModalOpen && selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setOrderModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold font-heading text-white mb-2">Order Details</h3>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-4 mb-6">
                 <img src={selectedProduct.img} alt={selectedProduct.name} className="w-16 h-16 rounded-lg object-cover" />
                 <div>
                   <div className="font-semibold text-white">{selectedProduct.name}</div>
                   <div className="text-brand-accent font-medium text-sm">{selectedProduct.price}</div>
                 </div>
              </div>

              <form onSubmit={submitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Your Full Name</label>
                  <input 
                    required type="text" value={customerForm.name} 
                    onChange={e => setCustomerForm({...customerForm, name: e.target.value})} 
                    placeholder="e.g. Rahul Sharma" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-accent outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">WhatsApp Phone Number</label>
                  <input 
                    required type="tel" value={customerForm.phone} 
                    onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} 
                    placeholder="10-digit mobile number" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-accent outline-none" 
                  />
                </div>
                <div className="bg-brand-accent/10 border border-brand-accent/20 p-3 rounded-lg text-brand-accent text-sm flex gap-2">
                  <Package className="w-5 h-5 shrink-0" />
                  <p>Next you will be redirected to WhatsApp to confirm your order and get your tracking ID.</p>
                </div>
                <button type="submit" className="w-full bg-brand-accent text-brand-primary font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
                  Proceed to WhatsApp <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", title: "Choose & Share", desc: "Select a design from our collection or share your custom idea/logo.", icon: <Star className="w-6 h-6 text-brand-primary" /> },
    { num: "02", title: "Customization", desc: "Tell us the specific names, colors, or tweaks you want.", icon: <CheckCircle2 className="w-6 h-6 text-brand-primary" /> },
    { num: "03", title: "Approve Preview", desc: "We'll send you a digital preview for confirmation before printing.", icon: <Zap className="w-6 h-6 text-brand-primary" /> },
    { num: "04", title: "Print & Deliver", desc: "We 3D print it beautifully and ship it straight to your door.", icon: <Package className="w-6 h-6 text-brand-primary" /> },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-brand-primary text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-16">Customization made simple. Just follow these four easy steps.</p>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {idx !== steps.length - 1 && (
                <div className="hidden md:block absolute top-10 w-full left-[50%] h-[2px] bg-white/10" />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-brand-accent flex items-center justify-center text-3xl font-heading font-black text-brand-primary mb-6 shadow-[0_0_30px_rgba(0,200,83,0.3)]">
                  {step.icon}
                </div>
                <h3 className="text-white text-xl font-bold font-heading mb-3">{step.num}. {step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-20 bg-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">About 3DPitara</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              3DPitara is a Pune-based custom 3D printing store specializing in unique, premium-quality personalized keychains and accessories.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              We turn your ideas into stylish 3D printed creations from anime-inspired collectibles to gaming keychains, custom name tags, logo keychains, and personalized gifts. Every product is designed with precision and crafted to deliver creativity, durability, and individuality.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-l-2 border-brand-accent pl-4">
                <div className="text-3xl font-bold text-white font-heading text-brand-highlight">100+</div>
                <div className="text-gray-400 text-sm">Designs</div>
              </div>
              <div className="border-l-2 border-brand-accent pl-4">
                <div className="text-3xl font-bold text-white font-heading text-brand-highlight">PAN</div>
                <div className="text-gray-400 text-sm">India Delivery</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="/logo2.png" alt="3DPitara Logo" className="rounded-2xl w-full h-64 object-cover" />
            <img src="/store1.png" alt="3D Printed Product" className="rounded-2xl w-full h-64 object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-brand-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Reviews */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8">What Customers Say</h2>
            <div className="space-y-4 shadow-xl">
              {REVIEWS.map((review, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <div className="flex text-brand-highlight mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-200 italic mb-4">"{review.text}"</p>
                  <div className="text-sm font-bold text-gray-400">— {review.author}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                  >
                    <span className="font-semibold text-white">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-brand-accent transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold font-heading text-xl mb-4">Delivery Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-gray-400">Ready Designs</span>
                  <span className="text-white font-medium">3–5 Days</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-gray-400">Custom Orders</span>
                  <span className="text-white font-medium">5–7 Days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bulk Orders</span>
                  <span className="text-white font-medium">7–12 Days</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Footer({ onOpenPayment }: { onOpenPayment: () => void }) {
  return (
    <footer className="bg-[#0a0a0a] pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo2.png" alt="3DPitara Logo" className="w-[180px] h-auto object-contain cursor-pointer drop-shadow-sm transition-all" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Print Your Imagination. High-quality 3D printed custom keychains and accessories.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/3d_pitara?igsh=MTFpZWZmOTZmanIwZQ==" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-accent hover:text-brand-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/3d_pitara?igsh=MTFpZWZmOTZmanIwZQ==" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-accent hover:text-brand-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@Gearupj" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-brand-accent hover:text-brand-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 font-heading">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-400 hover:text-white transition-colors text-sm">Home</a></li>
              <li><a href="#shop" className="text-gray-400 hover:text-white transition-colors text-sm">Shop Collection</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 font-heading">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-brand-accent shrink-0" />
                <span>Kondhwa, Pune, Maharashtra 411048</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-brand-accent shrink-0" />
                <span>+91 98348 18849</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-brand-accent shrink-0" />
                <a href="mailto:support@3dpitara.in" className="hover:text-white">support@3dpitara.in</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 font-heading">Working Hours</h4>
             <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Mon – Fri</span>
                <span>10:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 AM – 9:00 PM</span>
              </li>
              <li className="flex justify-between text-brand-highlight">
                <span>Sunday</span>
                <span>11:00 AM – 6:00 PM</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-sm text-gray-400 mb-3">Accepted Payments</div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={onOpenPayment} className="px-2 py-1 bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors cursor-pointer rounded text-xs text-white">UPI</button>
                <button onClick={onOpenPayment} className="px-2 py-1 bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors cursor-pointer rounded text-xs text-white">GPay</button>
                <button onClick={onOpenPayment} className="px-2 py-1 bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors cursor-pointer rounded text-xs text-white">PhonePe</button>
                <button onClick={onOpenPayment} className="px-2 py-1 bg-white/10 hover:bg-brand-accent hover:text-brand-primary transition-colors cursor-pointer rounded text-xs text-white">Paytm</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm flex flex-col md:flex-row justify-center gap-4 md:gap-8 items-center border-t border-white/10 pt-8 mt-8 pb-10">
          <p>© {new Date().getFullYear()} 3DPitara. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0 items-center">
            <p>Owner: Juned Shaikh</p>
            <span className="text-white/20">|</span>
            <Link to="/admin" className="hover:text-brand-accent transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a 
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg shadow-green-500/30 hover:scale-110 transition-transform flex items-center justify-center group"
    >
      <WhatsAppIcon className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
        Order on WhatsApp
      </span>
    </a>
  );
}

function TrackOrderModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrderData(null);
    try {
      const docRef = doc(db, 'orders', orderId.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrderData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Order not found. Please verify your tracking ID.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold font-heading text-white mb-2">Track Order</h3>
            <p className="text-sm text-gray-400 mb-6">Enter your Order Tracking ID to see the latest status.</p>
            
            <form onSubmit={handleTrack} className="flex gap-2 mb-6">
              <input 
                required type="text" value={orderId} 
                onChange={e => setOrderId(e.target.value)} 
                placeholder="Order ID" 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-brand-accent outline-none" 
              />
              <button type="submit" disabled={loading} className="bg-brand-accent text-brand-primary px-5 rounded-lg font-bold hover:bg-white disabled:opacity-50 transition-colors">
                {loading ? '...' : 'Track'}
              </button>
            </form>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {orderData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">ORDER DETALS</div>
                <div className="font-semibold text-white mb-4 text-lg">{orderData.productName}</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Customer</span>
                     <span className="text-white font-medium">{orderData.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400">Price</span>
                     <span className="text-white font-medium">{orderData.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-3 border-t border-white/10">
                     <span className="text-gray-400">Current Status</span>
                     <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent font-bold rounded-full uppercase text-xs tracking-wider">
                       {orderData.status}
                     </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaymentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const upiId = "junedjshaikh9145-2@oksbi";
  const upiLink = `upi://pay?pa=${upiId}&pn=Juned%20Shaikh&cu=INR`;
  // Using an external QR API to dynamically generate a clean QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#161616] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-center"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold font-heading text-white mb-2">Scan & Pay</h3>
            <p className="text-sm text-gray-400 mb-6">Scan with any UPI app to make a payment.</p>
            
            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-md border-[4px] border-white/20 relative">
               <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
            </div>
            
            <div className="mb-6">
              <div className="text-xs text-brand-accent uppercase font-bold tracking-wider mb-1">UPI ID</div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-white font-medium text-sm inline-block font-mono">
                {upiId}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400">Or tap below to open specific apps (Mobile only)</p>
              <div className="grid grid-cols-2 gap-2">
                 <a href={`intent://pay?pa=${upiId}&pn=Juned%20Shaikh&cu=INR#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end;`} className="bg-white/5 hover:bg-brand-accent hover:text-brand-primary text-white transition-colors text-sm font-semibold py-2 rounded-lg border border-white/10 text-center flex items-center justify-center">GPay</a>
                 <a href={`intent://pay?pa=${upiId}&pn=Juned%20Shaikh&cu=INR#Intent;scheme=upi;package=com.phonepe.app;end;`} className="bg-white/5 hover:bg-brand-accent hover:text-brand-primary text-white transition-colors text-sm font-semibold py-2 rounded-lg border border-white/10 text-center flex items-center justify-center">PhonePe</a>
                 <a href={`intent://pay?pa=${upiId}&pn=Juned%20Shaikh&cu=INR#Intent;scheme=upi;package=net.one97.paytm;end;`} className="bg-white/5 hover:bg-brand-accent hover:text-brand-primary text-white transition-colors text-sm font-semibold py-2 rounded-lg border border-white/10 text-center flex items-center justify-center">Paytm</a>
                 <a href={upiLink} className="bg-white/5 hover:bg-brand-accent hover:text-brand-primary text-white transition-colors text-sm font-semibold py-2 rounded-lg border border-white/10 text-center flex items-center justify-center">Other Apps</a>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-primary text-gray-100 font-sans font-antialiased selection:bg-brand-accent selection:text-brand-primary">
      <Navbar onTrackOrder={() => setIsTrackModalOpen(true)} />
      <main>
        <Hero />
        <Features />
        <Shop />
        <HowItWorks />
        <About />
        <ReviewsFAQ />
      </main>
      <Footer onOpenPayment={() => setIsPaymentModalOpen(true)} />
      <FloatingWhatsApp />
      <TrackOrderModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}

