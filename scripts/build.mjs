import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const guides=JSON.parse(await fs.readFile(path.join(root,'guides.json'),'utf8'));
const locales=['de','en'];
const text={de:{title:'ICONIC Anleitungen',intro:'Hier finden Sie unsere Anleitungen zur Einrichtung und Zusammenarbeit.',stand:'Stand',choice:'Sprachauswahl'},en:{title:'ICONIC Guides',intro:'Find our guides for getting started and working with ICONIC.',stand:'Updated',choice:'Choose language'}};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const seen=new Set();
for(const guide of guides){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(guide.slug)||seen.has(guide.slug))throw Error('Invalid or duplicate slug');
 seen.add(guide.slug);
 for(const locale of locales){
  const version=guide.versions?.[locale];
  if(!version?.title||!version?.description||!version?.source)throw Error('Missing language version: '+guide.slug+'/'+locale);
  const source=path.resolve(root,version.source);
  if(!source.startsWith(path.join(root,'guides')+path.sep))throw Error('Source outside guides');
  await fs.access(source);
  await fs.mkdir(path.join(dist,locale,guide.slug),{recursive:true});
  const other=locale==='de'?'en':'de';
  execFileSync(process.execPath,[path.join(root,'design/render.mjs'),source,path.join(dist,locale,guide.slug,'index.html'),path.join(root,'node_modules'),locale,'../../'+other+'/'+guide.slug+'/','../'],{stdio:'inherit'});
 }
}
const [logo,fonts]=await Promise.all(['logo.svg','fonts.css'].map(n=>fs.readFile(path.join(root,'design',n),'utf8')));
const style=fonts+'body{margin:0;background:#f0f4f5;color:#333;font:16px/1.55 usual,Arial,sans-serif}main{max-width:860px;margin:32px auto;padding:24px}header{background:white;padding:28px;border-top:8px solid #19677d;border-radius:5px}img{width:110px}h1{color:#19677d;margin:32px 0 8px;font-size:clamp(26px,5vw,38px)}p{margin:0}.site-links{display:flex;flex-wrap:wrap;gap:8px 20px;margin:0 0 18px}.site-links a{display:inline-flex;align-items:center;min-height:44px;color:#19677d}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px;margin-top:24px}.card{display:flex;flex-direction:column;gap:10px;padding:24px;background:#eaf3f5;color:#005e76;text-decoration:none;border-radius:5px;border:1px solid #d5e4e8}.card:hover{background:#d7e9ed}a:focus-visible{outline:3px solid #19677d;outline-offset:3px}.card span{color:#333}.card small{margin-top:auto}@media(max-width:480px){main{margin:12px auto;padding:12px}header{padding:22px}}';
function page(locale,title,intro,cards,links=''){
 return '<!doctype html><html lang="'+locale+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><style>'+style+'</style></head><body><main>'+links+'<header><img src="data:image/svg+xml;base64,'+Buffer.from(logo).toString('base64')+'" alt="ICONIC SALES"><h1>'+escape(title)+'</h1><p>'+intro+'</p></header><div class="grid">'+cards.join('')+'</div></main></body></html>';
}
for(const locale of locales){
 const t=text[locale];const cards=[];
 for(const guide of guides){const v=guide.versions[locale];const stand=(await fs.readFile(path.join(root,path.dirname(v.source),'stand.txt'),'utf8')).trim();cards.push('<a class="card" href="'+guide.slug+'/"><strong>'+escape(v.title)+'</strong><span>'+escape(v.description)+'</span><small>'+t.stand+': '+escape(stand)+'</small></a>');}
 const links='<div class="site-links"><a href="../">'+t.choice+'</a><a href="../de/" lang="de" hreflang="de"'+(locale==='de'?' aria-current="page"':'')+'>Deutsch</a><a href="../en/" lang="en" hreflang="en"'+(locale==='en'?' aria-current="page"':'')+'>English</a></div>';
 await fs.writeFile(path.join(dist,locale,'index.html'),page(locale,t.title,escape(t.intro),cards,links));
}
const choices=['<a class="card" href="de/" lang="de" hreflang="de"><strong>Deutsch</strong><span>Alle Anleitungen auf Deutsch ansehen.</span></a>','<a class="card" href="en/" lang="en" hreflang="en"><strong>English</strong><span>View all guides in English.</span></a>'];
await fs.writeFile(path.join(dist,'index.html'),page('de','ICONIC Anleitungen / Guides','Bitte wählen Sie Ihre Sprache. <span lang="en">Please choose your language.</span>',choices));
const canonical=new Set(['de','en',...guides.flatMap(g=>locales.map(l=>l+'/'+g.slug))]);const aliases=new Set();
for(const guide of guides)for(const alias of guide.legacyPaths||[]){
 if(!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(alias)||canonical.has(alias)||aliases.has(alias))throw Error('Invalid or colliding legacy route: '+alias);aliases.add(alias);
 const dir=path.join(dist,...alias.split('/'));await fs.mkdir(dir,{recursive:true});
 const target=path.relative(dir,path.join(dist,'de',guide.slug)).split(path.sep).join('/')+'/';
 const redirect='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weiterleitung / Redirect</title><script>location.replace('+JSON.stringify(target)+'+location.search+location.hash);</script><meta http-equiv="refresh" content="0;url='+escape(target)+'"><link rel="canonical" href="'+escape(target)+'"></head><body><p>Die Anleitung finden Sie jetzt hier: <a href="'+escape(target)+'">Deutsche Anleitung öffnen / Open German guide</a>.</p></body></html>';
 await fs.writeFile(path.join(dir,'index.html'),redirect);
}
await fs.writeFile(path.join(dist,'.nojekyll'),'');
console.log('Built: language selection, DE/EN overviews, '+guides.length*2+' localized guides and '+aliases.size+' legacy redirects.');