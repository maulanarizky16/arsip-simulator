// Harness uji ARSIP WNI (tanpa jsdom): ratusan hidup acak + skenario terarah tiap akhir cerita.
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','wni','js');
const code=SEED+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const sandbox={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console,setTimeout,clearTimeout};
sandbox.globalThis=sandbox;
const c=vm.createContext(sandbox);
const run=s=>vm.runInContext(s,c);
run(code);
run(`
  globalThis.__ERR=[]; globalThis.__SEEN={}; globalThis.__END={}; globalThis.__NAN=0; globalThis.__LATAR={};
  const __ask=ask; ask=function(d){ __SEEN[d.title]=(__SEEN[d.title]||0)+1; return __ask(d); };
  function __drain(){ let g=0; while(G.current&&g++<300){ try{ choose(Math.floor(Math.random()*G.current.opts.length)); }catch(e){ __ERR.push('choose: '+e.message); G.current=null; } } }
  function __cekAngka(){
    const nums=[P.saldo,P.utang,P.tabungan,P.emas,P.gaji,P.skill,N.harga].concat(Object.values(P.st));
    if(nums.some(x=>typeof x!=='number'||!isFinite(x)))__NAN++;
  }
  function __hidup(){
    newGame(); __LATAR[P.latar]=(__LATAR[P.latar]||0)+1; __drain();
    let guard=0;
    while(!G.over&&guard++<60){
      const av=ACTS.filter(a=>{ try{ return actAvail(a).ok; }catch(e){ __ERR.push('avail '+a.k+': '+e.message); return false; } });
      const n=Math.floor(Math.random()*4);
      for(let i=0;i<n&&av.length&&!G.over;i++){ const a=av[Math.floor(Math.random()*av.length)]; try{ doAct(a.k); }catch(e){ __ERR.push('act '+a.k+': '+e.message); } __drain(); }
      try{ advance(); }catch(e){ __ERR.push('advance: '+e.message); break; }
      __drain(); __cekAngka();
    }
    if(G.over){ __END[P.ending]=(__END[P.ending]||0)+1; try{ const v=nilaiAkhir(); if(!isFinite(v.dompet)||!isFinite(v.waras))__NAN++; }catch(e){ __ERR.push('nilai: '+e.message); } }
    else __ERR.push('hidup tidak berakhir dalam 60 langkah');
  }
  for(let i=0;i<300;i++){ try{ __hidup(); }catch(e){ __ERR.push('hidup: '+e.message); } }
`);
/* skenario terarah: tiap akhir cerita harus bisa tercapai */
const cek=[];
function skenario(nama,setup,harap){
  run(`newGame(); __drain(); ${setup}`);
  const got=run('P.ending');
  cek.push([nama,got===harap,got]);
}
skenario('kewarasan habis → pulang','P.st.waras=1; P.st.nrimo=0; fx({waras:-30}); endCheck();','pulang');
skenario('sakit parah → tumbang','P.st.sehat=0; endCheck();','tumbang');
skenario('utang menggunung → dc','P.utang=200e6; utangCek();','dc');
skenario('#KaburAjaDulu → diaspora','P.skill=80; P.saldo=40e6; doAct("kabur"); choose(0);','diaspora');
skenario('papa di-OTT → kiriman berhenti','P.latar="pejabat"; P.kiriman=5e6; P.orangDalam=true; N.ke=10; EVENTS.find(e=>e.k==="ott").run(); __drain(); if(P.kiriman===0&&!P.orangDalam)P.ending="ott-ok";','ott-ok');
skenario('generasi sandwich → kirim uang tiap bulan','P.latar="sandwich"; P.kiriman=-800e3; P.kirimanTotal=0; P.st.waras=90; P.st.sehat=90; P.saldo=20e6; advance(); __drain(); if(P.kirimanTotal<=-800e3)P.ending="kirim-ok";','kirim-ok');
skenario('anak sultan malas → dompet tidak otomatis tinggi','P.latar="sultan"; P.saldo=200e6; P.modalAwal=200e6; P.kirimanTotal=15e6*36; P.saldo+=P.kirimanTotal-300e6; if(nilaiAkhir().dompet<60)P.ending="adil-ok";','adil-ok');
skenario('36 bulan → tahan','for(let i=0;i<40&&!G.over;i++){ P.st.waras=80; P.st.sehat=80; P.utang=0; P.saldo=50e6; __drain(); advance(); __drain(); }','tahan');
const err=run('__ERR.slice(0,15)'), nErr=run('__ERR.length'), nan=run('__NAN');
const end=JSON.parse(run('JSON.stringify(__END)')), seen=JSON.parse(run('JSON.stringify(__SEEN)'));
const wajib=['NASIB LAHIR','PEKERJAAN SEKARANG','MUDIK LEBARAN','PERTANYAAN WAJIB LEBARAN','MUSIM BUKBER','LOMBA 17-AN','SALDO MINUS','TOKEN LISTRIK BUNYI','UNDANGAN NIKAH LAGI','BOS CHAT JAM 10 MALAM','PANGGILAN KERJA'];
const hilang=wajib.filter(t=>!seen[t]);
console.log('WNI  errors:',nErr,nErr?err:'');
console.log('     akhir cerita (300 hidup acak):',end,'| nilai non-finite:',nan);
const lat=JSON.parse(run('JSON.stringify(__LATAR)'));
const latarHilang=JSON.parse(run('JSON.stringify(LATAR.map(l=>l.k))')).filter(k=>!lat[k]);
console.log('     nasib lahir (300 hidup):',lat,'| belum muncul:',latarHilang.length?latarHilang:'tidak ada');
console.log('     kartu unik terlihat:',Object.keys(seen).length,'| kartu wajib belum muncul:',hilang.length?hilang:'tidak ada');
for(const [n,ok,got] of cek)console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' (dapat: '+got+')'));
const gagal=cek.filter(x=>!x[1]).length+latarHilang.length;
console.log(nErr||nan||hilang.length||gagal?'\n❌ ADA MASALAH':'\n✅ SEMUA TES WNI LOLOS');
process.exit(nErr||nan||hilang.length||gagal?1:0);
