import {mkdir, copyFile, cp, rm, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
for (const file of ['index.html','styles.css','app.js','data.js','card-data.js','cards.js','favicon.svg']) {
  await copyFile(path.join(root,file),path.join(out,file));
}
await cp(path.join(root,'assets'),path.join(out,'assets'), {
  recursive:true,
  filter: source => !source.endsWith('.DS_Store') && !(path.basename(path.dirname(source)) === 'cards' && source.endsWith('.webp'))
});
console.log('KD 2027 CALENDAR: static website ready in dist/');
