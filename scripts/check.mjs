import fs from 'node:fs/promises';import path from 'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const dist=path.join(root,'dist');const guides=JSON.parse(await fs.readFile(path.join(root,'guides.json'),'utf8'));const locales=['de','en'];
const allowed=new Set(['index.html','.nojekyll',...locales.map(l=>l+'/index.html'),...guides.flatMap(g=>locales.map(l=>l+'/'+g.slug+'/index.html')),...guides.flatMap(g=>(g.legacyPaths||[]).map(p=>p+'/index.html'))]);
async function walk(dir,prefix=''){const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Symlink in publish directory');const rel=prefix+e.name;if(e.isDirectory())result.push(...await walk(path.join(dir,e.name),rel+'/'));else result.push(rel);}return result;}
const output=await walk(dist);for(const rel of output)if(!allowed.has(rel))throw Error('Unapproved output: '+rel);if(output.length!==allowed.size)throw Error('Missing output');
for(const rel of output.filter(x=>x.endsWith('.html'))){
 const html=await fs.readFile(path.join(dist,rel),'utf8');
 if(/(?:file:\/\/|[A-Z]:\\|Stefan Gutheil|alberts@|HRM Textil)/i.test(html))throw Error('Internal path or example data in '+rel);
 if(/\{\{[a-zA-Z]+\}\}/.test(html))throw Error('Untranslated UI template in '+rel);
 if(rel.startsWith('en/')&&!html.includes('<html lang="en">'))throw Error('Wrong page language: '+rel);
 if(rel.startsWith('de/')&&!html.includes('<html lang="de">'))throw Error('Wrong page language: '+rel);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('Duplicate IDs in '+rel);
 for(const [,href]of html.matchAll(/\bhref="([^"]*)"/g)){
  if(href.startsWith('data:'))continue;
  if(href.startsWith('#')){if(!ids.includes(href.slice(1)))throw Error('Missing anchor '+href+' in '+rel);continue;}
  if(/^(https?:|mailto:)/.test(href))continue;
  const target=path.resolve(path.dirname(path.join(dist,rel)),decodeURIComponent(href.split(/[?#]/)[0]),href.endsWith('/')?'index.html':'');
  if(!target.startsWith(dist+path.sep))throw Error('Link leaves publish directory: '+rel+' '+href);
  await fs.access(target);
 }
}
for(const guide of guides){
 for(const locale of locales){const html=await fs.readFile(path.join(dist,locale,guide.slug,'index.html'),'utf8');const other=locale==='de'?'en':'de';if(!html.includes('../../'+other+'/'+guide.slug+'/'))throw Error('Missing language counterpart');}
 for(const alias of guide.legacyPaths||[]){const html=await fs.readFile(path.join(dist,alias,'index.html'),'utf8');if(!html.includes('location.search+location.hash'))throw Error('Legacy redirect loses query or anchor');}
}
console.log('Publish allowlist, language pairs, IDs, links and legacy redirects passed.');