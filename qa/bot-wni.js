// QA WNI — bot "warga hemat": gaya hidup hemat, masak sendiri, jaga kewarasan dengan cara gratis, cari tambahan saat seret,
// tidak menyentuh pinjol/judol, dan di tiap kartu memilih opsi yang hasil langsungnya paling baik (melihat satu langkah ke depan).
// Mengukur: apakah pemain yang berhati-hati bisa bertahan 36 bulan? Pemain acak di qa/analis.js rata-rata hanya ±16 bulan.
// Pakai: node qa/bot-wni.js [jumlahHidup]
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const SEED=require(path.join(ROOT,'tests','_seed'));
const dir=path.join(ROOT,'wni','js');
const src=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
sb.globalThis=sb; const ctx=vm.createContext(sb); const run=s=>vm.runInContext(s,ctx);
run((SEED+src).replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,''));
run(`
globalThis.__ERR=[]; globalThis.__KUIS_PINTAR=true;
/* nilai keadaan: dompet (juta) + kewarasan & kesehatan; utang dihukum berat */
function __nilai(){ if(G.over)return P.ending==='tahan'||P.ending==='diaspora'?1e6:-1e6; return (P.saldo+P.tabungan+P.emas-P.utang*1.6)/1e6*2+P.st.waras*1.2+P.st.sehat*0.5+(P.profesi?25:0)+P.skill*0.1; }
function __salin(){ return JSON.stringify({P,N}); }
function __pulih(s,cur,q,over){ const o=JSON.parse(s); P=o.P; N=o.N; G.current=cur; G.queue=q.slice(); G.over=over; }
/* pilih opsi kartu dengan mencoba tiap opsi 3× (hasil sebagian acak) lalu mengambil rata-rata terbaik */
function __pilih(){
  const cur=G.current, n=cur.opts.length; if(n===1)return 0;
  if(/^(TUTUP|RESIGN|AJUKAN PINJOL)/.test(cur.title))return n-1;
  const s0=__salin(), q0=G.queue.slice(); let best=0, bv=-Infinity;
  for(let i=0;i<n;i++){ let tot=0;
    for(let k=0;k<3;k++){ try{ choose(i); let g=0; while(G.current&&G.current!==cur&&g++<6)choose(0); tot+=__nilai(); }catch(e){ tot-=1e5; } __pulih(s0,cur,q0,false); }
    if(tot/3>bv){ bv=tot/3; best=i; } }
  return best;
}
function __drain(){ let g=0; while(G.current&&!G.over&&g++<80){ let i=0; try{ i=__pilih(); choose(i); }catch(e){ __ERR.push('kartu '+(G.current&&G.current.title)+': '+e.message); G.current=null; G.queue=[]; } } }
function __act(k){ const a=ACTS.find(x=>x.k===k); try{ if(a&&!G.over&&actAvail(a).ok){ doAct(k); __drain(); return true; } }catch(e){ __ERR.push('aksi '+k+': '+e.message); G.current=null; G.queue=[]; } return false; }
globalThis.__one=function(){
  newGame(); __drain();
  P.gaya='hemat';
  let g=0;
  while(!G.over&&g++<45){
    const biaya=biayaPokok();
    __act('masak');
    if(P.st.waras<55)__act('rebahan');
    if(P.st.waras<45)__act('telponOrtu');
    if(P.st.waras<35&&P.saldo>biaya+400e3)__act('psikolog');
    if(P.st.sehat<60)__act('jogging');
    if(P.st.nrimo<60)__act('ibadah');
    if(!P.profesi)__act('lamar');
    if(P.saldo<biaya*1.2&&P.st.waras>=45){ __act('sampingan'); if(P.profesi&&P.st.waras>=55)__act('lembur'); }
    if(P.utang>0&&P.saldo>biaya)__act('bayarUtang');
    if(P.saldo>biaya*2.5)__act('nabung');
    if(P.saldo<0&&P.tabungan+P.emas>0)__act('tarik');
    if(g%6===3)__act('kursus');
    try{ advance(); }catch(e){ __ERR.push('advance: '+e.message); break; } __drain();
  }
  const v=G.over?nilaiAkhir():{};
  return JSON.stringify({ending:P.ending||'belum',bulan:N.ke,latar:P.latar,profesi:P.profesi||'menganggur',kota:P.kota,saldo:P.saldo+P.tabungan+P.emas-P.utang,waras:P.st.waras,dompet:v.dompet,sw:v.waras}); };`);
const n=+process.argv[2]||150, L=[]; for(let i=0;i<n;i++)L.push(JSON.parse(run('__one()')));
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s.length?s[Math.floor(s.length/2)]:0};
const pc=(z,f)=>z.length?Math.round(z.filter(f).length/z.length*100)+'%':'-';
const jt=v=>(v/1e6).toFixed(1)+' jt';
console.log('Bot warga hemat, '+n+' hidup.');
const e={}; for(const x of L)e[x.ending]=(e[x.ending]||0)+1;
console.log('akhir cerita:',Object.entries(e).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+Math.round(v/n*100)+'%').join(' · '));
console.log('bertahan 36 bulan (tahan/diaspora): '+pc(L,x=>x.ending==='tahan'||x.ending==='diaspora')+' · lama main median '+med(L.map(x=>x.bulan))+' bulan · kekayaan bersih akhir median '+jt(med(L.map(x=>x.saldo))));
for(const k of ['sandwich','petani','menengah','pns','pengusaha','pejabat','sultan','yatim']){ const z=L.filter(x=>x.latar===k); if(z.length)console.log('  latar '+k.padEnd(10)+' n='+String(z.length).padStart(3)+' · bertahan '+pc(z,x=>x.ending==='tahan'||x.ending==='diaspora').padStart(4)+' · kekayaan akhir median '+jt(med(z.map(x=>x.saldo)))); }
const kota={}; for(const x of L)(kota[x.kota]=kota[x.kota]||[]).push(x);
console.log('  per kota: '+Object.entries(kota).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,z])=>k+' '+pc(z,x=>x.ending==='tahan'||x.ending==='diaspora')).join(' · '));
const err=JSON.parse(run('JSON.stringify(__ERR)')); console.log('error: '+err.length+(err.length?' → '+[...new Set(err)].slice(0,6).join(' || '):''));
process.exit(err.length?1:0);
