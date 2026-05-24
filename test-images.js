import fs from 'fs';
const dir = fs.readdirSync('./public');
const sorted = dir.map(f => ({ 
  name: f, 
  time: fs.statSync('./public/' + f).mtime.getTime(),
  date: fs.statSync('./public/' + f).mtime
})).sort((a,b) => b.time - a.time);
console.log(sorted.slice(0, 5));
