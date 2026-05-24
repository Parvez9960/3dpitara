import fs from 'fs';
const dir = fs.readdirSync('./src');
const sorted = dir.map(f => ({ 
  name: f, 
  time: fs.statSync('./src/' + f).mtime.getTime(),
  date: fs.statSync('./src/' + f).mtime
})).sort((a,b) => b.time - a.time);
console.log(sorted.slice(0, 5));
