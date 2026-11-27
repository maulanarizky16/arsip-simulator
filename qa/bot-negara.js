// QA Negara — bot "politisi tekun": gabung partai, bangun popularitas & pengaruh, maju pemilu ke kursi tertinggi yang memenuhi syarat.
// Pemain acak di qa/analis.js hampir tak pernah menang pemilu, sehingga separuh isi game (kepala daerah, menteri, presiden) tak teruji.
// Pakai: node qa/bot-negara.js [jumlahKarier] [kotor]     ("kotor" = serangan fajar, titipan proyek, mark-up)
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const SEED=require(path.join(ROOT,'tests','_seed'));
const dir=path.join(ROOT,'negara','js');
const src=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
sb.globalThis=sb; const ctx=vm.createContext(sb); const run=s=>vm.runInContext(s,ctx);
run((SEED+src).replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,''));
run(`
globalThis.__kotor=${process.argv[3]==='kotor'}; globalThis.__ERR=[]; globalThis.__JUDUL={};
const __ask=ask; ask=function(d){ __JUDUL[d.title]=1; return __ask(d); };
globalThis.__drain=function(){ let g=0; while(G.current&&g++<300){ const t=G.current.title, o=G.current.opts; let i=Math.floor(Math.random()*o.length);
  if(/^MAJU PEMILU/.test(t))i=Math.max(0,o.length-2);                       /* kursi tertinggi yang memenuhi syarat */
  else if(/^DANA KAMPANYE/.test(t))i=Math.max(0,o.length-2);                /* dana terbesar yang terjangkau */
  else if(/^DEBAT KANDIDAT/.test(t))i=0;
  else if(t==='MALAM SEBELUM PENCOBLOSAN')i=__kotor?0:o.length-1;
  else if(t==='GANTUNG JAS?'||/^MUNDUR/.test(t)||/^TUTUP/.test(t))i=o.length-1;
  else if(t==='PENYIDIK DI DEPAN PINTU')i=0;
  try{ choose(i); }catch(e){ __ERR.push(t+': '+e.message); G.current=null; G.queue=[]; } } };
function __act(k){ const a=ACTS.find(x=>x.k===k); try{ if(a&&actAvail(a).ok){ doAct(k); __drain(); return true; } }catch(e){ __ERR.push('aksi '+k+': '+e.message); G.current=null; G.queue=[]; } return false; }
globalThis.__one=function(){
  newGame(); __drain(); let presThn=0, umurPres=0, vonisBersih=false;
  for(let y=0;y<70;y++){ if(!P.alive||G.over)break;
    if(!P.partai)__act('gabung');
    for(const k of ['basis','lobi','loyal','wawancara','kelilingDaerah','medsos','opini','olahraga'])__act(k);
    if(P.st.stres>55)__act('rehat');
    if(!P.jab&&lvNow()<=1)__act('demo');
    if(__kotor&&P.jab){ __act('titipan'); __act('markup'); if(P.gelap>=1e9)__act('cuci'); if(P.money+P.gelap>=2e9)__act('mahar'); }
    __act('maju');
    if(P.jab){ const av=ACTS.filter(a=>a.tab==='kebijakan'&&actAvail(a).ok); for(let i=0;i<3&&av.length;i++)__act(av[Math.floor(Math.random()*av.length)].k); }
    if(P.money>=100e6&&Math.random()<0.2)__act('depoSetor');
    const g0=P.gelapTotal, v0=P.vonis;
    try{ advance(); __drain(); }catch(e){ __ERR.push('advance: '+e.message); break; }
    if(!v0&&P.vonis&&g0<=0)vonisBersih=true;
    if(P.jab&&P.jab.k==='presiden'){ presThn++; if(!umurPres)umurPres=P.age; }
  }
  return JSON.stringify({maxLv:P.maxLv,latar:P.latar,age:P.age,presThn,umurPres,vonis:P.vonis,vonisBersih,money:P.money+P.depo,pop:P.st.popularitas,terms:P.terms,ach:Object.keys(P.ach)}); };`);
const N=+process.argv[2]||200, L=[]; for(let i=0;i<N;i++)L.push(JSON.parse(run('__one()')));
const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s.length?s[Math.min(s.length-1,Math.floor(p*s.length))]:0};
const f=v=>v>=1e9?(v/1e9).toFixed(1)+' M':Math.round(v/1e6)+' jt';
const pc=fn=>Math.round(L.filter(fn).length/N*100)+'%';
console.log('jabatan tertinggi: '+['tanpa jabatan','DPRD','Wali Kota/DPR','Gubernur','Menteri','Presiden'].map((n,i)=>n+' '+pc(x=>x.maxLv===i)).join(' · '));
console.log('jadi presiden '+pc(x=>x.presThn>0)+' · umur saat pertama jadi presiden (termuda/median): '+(q(L.filter(x=>x.umurPres).map(x=>x.umurPres),0)||'-')+' / '+(q(L.filter(x=>x.umurPres).map(x=>x.umurPres),0.5)||'-'));
console.log('divonis '+pc(x=>x.vonis)+' · divonis korupsi padahal tak pernah menerima uang gelap '+pc(x=>x.vonisBersih)+' · harta akhir p10/p50/p90: '+[0.1,0.5,0.9].map(p=>f(q(L.map(x=>x.money),p))).join(' / '));
for(const lt of ['aktivis','dinasti','jurnalis','pengusaha','guru']){ const z=L.filter(x=>x.latar===lt); if(z.length)console.log('  latar '+lt+' (n='+z.length+'): presiden '+Math.round(z.filter(x=>x.presThn>0).length/z.length*100)+'% · menjabat apa pun '+Math.round(z.filter(x=>x.maxLv>0).length/z.length*100)+'% · harta akhir median '+f(q(z.map(x=>x.money),0.5))); }
const ac={}; for(const x of L)for(const k of x.ach)ac[k]=(ac[k]||0)+1;
console.log('tanda jasa %: '+Object.entries(ac).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+Math.round(v/N*100)).join(' '));
const judul=Object.keys(JSON.parse(run('JSON.stringify(__JUDUL)'))), literal=new Set(); for(const m of src.matchAll(/title:\s*'([^'\\]+)'/g))literal.add(m[1]);
const tak=[...literal].filter(t=>!judul.some(x=>x===t||(/[\s:—-]$/.test(t)&&x.startsWith(t)))).sort();
console.log('kartu yang tak pernah muncul ('+tak.length+'/'+literal.size+'): '+(tak.join(' | ')||'-'));
const err=JSON.parse(run('JSON.stringify(__ERR)')); console.log('error: '+err.length+(err.length?' → '+[...new Set(err)].slice(0,8).join(' || '):''));
process.exit(err.length?1:0);
