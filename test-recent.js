import fs from 'fs';
import path from 'path';

function findRecentFiles(dir, cutoffTime, results = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git') continue;
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findRecentFiles(fullPath, cutoffTime, results);
    } else {
      if (stat.mtime.getTime() > cutoffTime) {
        results.push({ name: fullPath, time: stat.mtime.getTime(), date: stat.mtime });
      }
    }
  }
  return results;
}

const cutoff = Date.now() - 3 * 3600 * 1000; // last 3 hours
const recent = findRecentFiles('.', cutoff);
recent.sort((a,b) => b.time - a.time);
console.log(recent.slice(0, 10));
