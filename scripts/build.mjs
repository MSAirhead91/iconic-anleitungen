import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const guides=JSON.parse(await fs.readFile(path.join(root,'guides.json'),'utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const seen=new Set();
for(const guide of guides){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug)||seen.has(guide.slug))throw Error('Ungueltiger oder doppelter Slug');
 seen.add(guide.slug);
 const source=path.resolve(root,guide.source);
 if(!source.startsWith(path.join(root,'guides')+path.sep))throw Error('Quelle ausserhalb guides');
 await fs.access(source);
 await fs.mkdir(path.join(dist,guide.slug),{recursive:true});
 execFileSync(process.execPath,[path.join(root,'design/render.mjs'),source,path.join(dist,guide.slug,'index.html'),path.join(root,'node_modules')],{stdio:'inherit'});
}
const [logo,fonts]=await Promise.all(['logo.svg','fonts.css'].map(n=>fs.readFile(path.join(root,'design',n),'utf8')));
const cards=guides.map(g=>'<a class="card" href="'+g.slug+'/"><strong>'+escape(g.title)+'</strong><span>'+escape(g.description)+'</span><small>Stand: '+escape(g.stand||'')+'</small></a>');
for(let i=0;i<guides.length;i++){
 const stand=(await fs.readFile(path.join(root,path.dirname(guides[i].source),'stand.txt'),'utf8')).trim();
 cards[i]=cards[i].replace('Stand: </small>','Stand: '+escape(stand)+'</small>');
}
const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICONIC Anleitungen</title><style>'+fonts+'body{margin:0;background:#f0f4f5;color:#333;font:16px/1.55 usual,Arial,sans-serif}main{max-width:860px;margin:32px auto;padding:24px}header{background:white;padding:28px;border-top:8px solid #19677d;border-radius:5px}img{width:110px}h1{color:#19677d;margin:32px 0 8px;font-size:clamp(26px,5vw,38px)}p{margin:0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px;margin-top:24px}.card{display:flex;flex-direction:column;gap:10px;padding:24px;background:#eaf3f5;color:#005e76;text-decoration:none;border-radius:5px;border:1px solid #d5e4e8}.card:hover{background:#d7e9ed}.card:focus-visible{outline:3px solid #19677d;outline-offset:3px}.card span{color:#333}.card small{margin-top:auto}@media(max-width:480px){main{margin:12px auto;padding:12px}header{padding:22px}}</style></head><body><main><header><img src="data:image/svg+xml;base64,'+Buffer.from(logo).toString('base64')+'" alt="ICONIC SALES"><h1>ICONIC Anleitungen</h1><p>Hier finden Sie unsere Anleitungen zur Einrichtung und Zusammenarbeit.</p></header><div class="grid">'+cards.join('')+'</div></main></body></html>';
await fs.writeFile(path.join(dist,'index.html'),html);
await fs.writeFile(path.join(dist,'.nojekyll'),'');
console.log('Erzeugt: Startseite und '+guides.length+' freigegebene Anleitung(en).');