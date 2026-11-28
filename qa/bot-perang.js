// QA Perang — bot "panglima wajar": menjaga amunisi & moral, menyerang hanya saat unggul, berdamai begitu tujuan tercapai.
// Mengukur apakah hasil perang masuk akal untuk berbagai pasangan negara (yang jauh lebih kuat seharusnya menang, yang seimbang alot).
// Pakai: node qa/bot-perang.js [jumlahPerangPerSkenario]
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const SEED=require(path.join(ROOT,'tests','_seed'));
const dir=path.join(ROOT,'perang','js');
const src=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
sb.globalThis=sb; const ctx=vm.createContext(sb); const run=s=>vm.runInContext(s,ctx);
run((SEED+src).replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,''));
run(`
globalThis.__ERR=[];
function __drain(){ let g=0; while(G.current&&g++<100){ const t=G.current.title, o=G.current.opts; let i=0;
  if(t==='TUJUAN TERCAPAI'||t==='UTUSAN LAWAN'||t==='UTUSAN PBB'||t==='AMBANG NUKLIR'||t==='TAWANAN PERANG'||t==='KOTA TERKEPUNG'||t==='SALAH SASARAN'||t==='TAWARAN SEKUTU')i=0;
  else if(t==='MENYERAH?')i=1;
  try{ choose(i); }catch(e){ __ERR.push(t+': '+e.message); G.current=null; G.queue=[]; } } }
function __act(k){ const a=ACTS.find(x=>x.k===k); try{ if(a&&actAvail(a).ok){ doAct(k); __drain(); return true; } }catch(e){ __ERR.push('aksi '+k+': '+e.message); G.current=null; G.queue=[]; } return false; }
globalThis.__perang=function(a,b,tj){
  newGame(); G.current=null; G.queue=[]; P.neg=a; P.lawan=b; mulaiPerang(tj);
  let g=0;
  while(!G.over&&g++<120){
    const cA=NEG[P.neg], cB=NEG[N.e.k];
    const rasio=kuatDarat(sisiKita(),cA)/Math.max(kuatDarat(N.e,cB),1);
    const sasaran=tj==='bertahan'?0:tj==='sengketa'?32:100;
    /* postur: serang saat unggul & amunisi cukup; kalau tidak, bertahan */
    P.post.d=N.front>=sasaran&&tj!=='total'?'bertahan':(rasio>=1.15&&P.st.amunisi>=35&&P.st.logistik>=35?'ofensif':rasio>=0.9&&P.st.amunisi>=30?'tekan':'bertahan');
    P.post.u=kuatUdara(sisiKita(),cA)>=kuatUdara(N.e,cB)*0.8?(N.udara<40?'rebut':'cas'):'hemat';
    const rl=kuatLaut(sisiKita(),cA)/Math.max(kuatLaut(N.e,cB),1);
    P.post.l=rl<0.6?'pangkalan':(N.seberang&&N.front>=0&&N.laut>=35&&P.post.d!=='bertahan'?'amfibi':rl>=1.5&&N.laut>20?'blokade':'kawal');
    if(P.st.amunisi<50)__act('amunisi');
    if(P.st.moral<50)__act('rotasi');
    if(P.st.publik<45)__act('propaganda');
    if(P.dana<0)__act('pajak');
    /* kalah jumlah: segera panggil cadangan & gali kubu (seperti yang dilakukan negara kecil sungguhan) */
    if(P.f.pasukan<P.awal.pasukan*0.75||rasio<0.85||(tj==='bertahan'&&N.front<-40))__act('mobilisasi');
    if((tj==='bertahan'||rasio<0.85)&&P.fort<5)__act('kubu');
    if(rasio<0.85&&P.st.dunia>=50)__act('sekutu');
    if(N.front>=sasaran&&tj!=='total'&&N.minggu>=4)__act('gencatan');
    if(N.front<=-55&&N.minggu>=6)__act('gencatan');
    try{ advance(); }catch(e){ __ERR.push('advance: '+e.message); break; } __drain();
  }
  const v=G.over?nilaiAkhir():{menang:0,manusia:0};
  return JSON.stringify({hasil:P.hasil||'belum',minggu:N.minggu,front:Math.round(N.front),menang:v.menang,manusia:v.manusia,gugur:Math.round(P.tewas),gugurPct:Math.round(P.tewas/P.awal.pasukan*100)}); };`);
const n=+process.argv[2]||40;
const SKEN=[['idn','mys','sengketa','unggul, berbatasan'],['idn','mys','bertahan','unggul, diserang'],['mys','idn','sengketa','lemah menyerang'],['idn','aus','bertahan','seimbang, seberang laut'],['idn','aus','sengketa','menyerbu seberang laut'],
  ['idn','sgp','total','besar vs kecil berteknologi'],['ukr','rus','bertahan','lemah diserang raksasa'],['rus','ukr','total','raksasa menyerang'],['kor','prk','bertahan','diserang negara nuklir'],['ind','pak','sengketa','dua negara nuklir'],
  ['usa','chn','sengketa','dua adidaya'],['vnm','chn','bertahan','bertahan dari raksasa'],['jpn','chn','bertahan','pulau vs raksasa'],['isr','egy','bertahan','kecil berteknologi'],['tur','irn','sengketa','seimbang, pegunungan'],['chn','vnm','total','raksasa vs tetangga darat'],['usa','bra','total','adidaya, seberang laut'],['ind','pak','total','memojokkan negara nuklir']];
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
console.log('Bot panglima wajar, '+n+' perang per skenario.\n');
console.log('skenario'.padEnd(44)+'menang  damai  rugi/kalah  jatuh  beku  kiamat | minggu  gugur%  skorM  skorK');
for(const [a,b,tj,ket] of SKEN){
  const L=[]; for(let i=0;i<n;i++)L.push(JSON.parse(run(`__perang('${a}','${b}','${tj}')`)));
  const c=f=>String(Math.round(L.filter(f).length/n*100)+'%').padStart(5);
  console.log((a+'→'+b+' '+tj+' ('+ket+')').padEnd(44)+c(x=>x.hasil==='menang'||x.hasil==='menangTerbatas')+'  '+c(x=>x.hasil==='damai')+'  '+c(x=>x.hasil==='damaiRugi'||x.hasil==='kalah')+'      '+c(x=>x.hasil==='jatuh')+' '+c(x=>x.hasil==='beku')+'  '+c(x=>x.hasil==='kiamat')+
    ' | '+String(med(L.map(x=>x.minggu))).padStart(5)+'  '+String(med(L.map(x=>x.gugurPct))).padStart(5)+'  '+String(med(L.map(x=>x.menang))).padStart(5)+'  '+String(med(L.map(x=>x.manusia))).padStart(5));
}
const err=JSON.parse(run('JSON.stringify(__ERR)')); console.log('\nerror: '+err.length+(err.length?' → '+[...new Set(err)].slice(0,6).join(' || '):''));
process.exit(err.length?1:0);
