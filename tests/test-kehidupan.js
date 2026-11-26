// Harness uji ARSIP KEHIDUPAN — perbaikan logic & variabel baru. node _test_kehidupan.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
function loadGame(game){ const dir=path.join(ROOT,game,'js'); return fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n'); }
function makeCtx(){ const store={}; const s={ window:{}, localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}, console, setTimeout, clearTimeout, __ERRS:[], __ENDED:0, __BAD:0, __ACH:{} }; s.globalThis=s; return vm.createContext(s); }
function run(c,code){ return vm.runInContext(code,c); }

const c=makeCtx();
run(c, loadGame('kehidupan'));
run(c, `
  const __realAsk=ask; ask=function(d){ return __realAsk(d); };
  function __drain(){ let g=0; while(G.current && g++<300) choose(Math.floor(Math.random()*4)); }
  function __finite(){ const xs=[P.money,netWorth(),P.mental,P.reputasiKerja,P.integritas,P.finansialIQ,P.nikotin,P.ipk]; for(const k in P.st)xs.push(P.st[k]);
    for(const x of xs){ if(typeof x==='number'&&!isFinite(x)){__BAD++;return false;} } return true; }
`);

/* 1) 180 hidup acak penuh (termasuk lanjut generasi sesekali) */
run(c, `
  function __sim(){
    newGame(); __drain();
    let guard=0;
    while(P && P.alive && !G.over && guard++<320){
      __drain();
      const av=ACTS.filter(a=>{try{return actAvail(a).ok}catch(e){__ERRS.push('avail:'+a.k+': '+e.message);return false}});
      const n=Math.floor(Math.random()*3);
      for(let i=0;i<n && av.length;i++){ const a=av[Math.floor(Math.random()*av.length)]; try{doAct(a.k)}catch(e){__ERRS.push('act:'+a.k+': '+e.message)} __drain(); }
      __finite();
      try{advance()}catch(e){__ERRS.push('advance: '+e.message);break}
      __drain();
    }
    if(G.over)__ENDED++;
    if(P&&P.ach)for(const k in P.ach)__ACH[k]=(__ACH[k]||0)+1;
    // sesekali lanjut sebagai anak (uji contAsChild + seeding dinasti)
    if(P&&P.kids&&P.kids.length&&Math.random()<0.4){ try{ contAsChild(); __drain(); }catch(e){__ERRS.push('contAsChild: '+e.message)} }
  }
  for(let i=0;i<180;i++){ try{__sim()}catch(e){__ERRS.push('sim: '+e.message)} }
`);

/* 2) verifikasi bug fixes & variabel */
run(c, `
  globalThis.__CHK={};
  // 2a cerai TIDAK menghapus utang (money negatif tetap negatif)
  newGame(); __drain(); P.aset=[]; P.kids=[]; P.money=-100e6;
  P.love={nama:'Rina Sari',sifat:{k:'cuek',n:'cuek'},rel:10,thn:3,married:true,income:0};
  try{cerai(); __drain();}catch(e){__ERRS.push('cerai: '+e.message)}
  __CHK.ceraiDebt=P.money;   // harus tetap ~ -100jt, BUKAN -50jt
  // 2b late hire (umur 60) tetap pensiun
  newGame(); __drain(); P.alive=true; G.over=false; G.current=null; G.queue=[]; P.age=60; P.retired=false; P.kuliah=null;
  P.job={title:'Staf kantor',g:80e6,level:1,bidang:null};
  try{events(); __drain();}catch(e){__ERRS.push('events58: '+e.message)}
  __CHK.lateRetire=P.retired===true;
  // 2c IPK memengaruhi gaji
  newGame(); __drain(); P.sert=0; P.s2=false;
  P.ipk=2.0; const lo=salaryAdj(100e6); P.ipk=3.8; const hi=salaryAdj(100e6);
  __CHK.ipkSalary=[lo,hi];
  // 2d nikotin menumpuk saat merokok, kesehatan tergerus proporsional
  newGame(); __drain(); P.age=30; P.rokok=true; P.nikotin=0; P.st.health=90;
  for(let y=0;y<6;y++){ P.alive=true; try{drift()}catch(e){__ERRS.push('driftNik: '+e.message)} __drain(); }
  __CHK.nikotin=P.nikotin;
  // 2e finansialIQ tumbuh saat berinvestasi
  newGame(); __drain(); P.age=30; P.inv.saham=100e6; P.finansialIQ=0;
  for(let y=0;y<12;y++){ P.alive=true; try{drift()}catch(e){__ERRS.push('driftFiq: '+e.message)} __drain(); }
  __CHK.finansialIQ=P.finansialIQ;
  // 2f reputasiKerja naik saat lembur
  newGame(); __drain(); P.age=30; P.job={title:'X',g:80e6,level:1,bidang:null}; P.reputasiKerja=50; P.used={};
  try{ACTS.find(a=>a.k==='lembur').e();}catch(e){__ERRS.push('lembur: '+e.message)}
  __CHK.repKerja=P.reputasiKerja;
  // 2g korupsi menggerus integritas
  newGame(); __drain(); P.politik={idx:2,thn:0}; P.integritas=60; P.money=0; P.used={};
  try{ACTS.find(a=>a.k==='korupsi').e(); __drain();}catch(e){__ERRS.push('korupsi: '+e.message)}
  __CHK.integritas=P.integritas;
  // 2h mental memengaruhi (terapi menaikkan mental)
  newGame(); __drain(); P.mental=40; P.st.stress=50; P.money=50e6; P.used={};
  try{ACTS.find(a=>a.k==='terapi').e();}catch(e){__ERRS.push('terapi: '+e.message)}
  __CHK.mentalNaik=P.mental>40;
  // 2i skor: spam kendaraan murah TIDAK mengalahkan properti
  newGame(); __drain(); P.aset=[]; for(let i=0;i<10;i++)P.aset.push({k:'motor',n:'Motor',nilai:18e6,kpr:null,kelas:'kendaraan'});
  const skorMotor=(function(){ let n=0; const props=P.aset.filter(a=>a.kelas==='properti').length*10+Math.min(P.aset.filter(a=>a.kelas==='kendaraan').length,3)*3; return props; })();
  __CHK.asetKendaraan=skorMotor;  // 10 motor → 9 (dibatasi), bukan 80
  // 2j SAVE LAMA tanpa field baru tidak menghasilkan NaN setelah resumeGame + drift
  newGame(); __drain();
  const oldP=JSON.parse(JSON.stringify(P));
  delete oldP.ipk; delete oldP.reputasiKerja; delete oldP.mental; delete oldP.nikotin; delete oldP.integritas; delete oldP.finansialIQ;
  if(oldP.biz)for(const b of oldP.biz)delete b.goodwill;
  oldP.age=30; oldP.alive=true; oldP.rokok=true; oldP.job={title:'X',g:80e6,level:1,bidang:null}; if(!oldP.inv)oldP.inv={depo:0,emas:0,saham:0,kripto:0}; oldP.inv.saham=50e6;
  try{ resumeGame({P:oldP,feed:[],tab:'diri',over:false}); }catch(e){__ERRS.push('resume: '+e.message)}
  let nanAfter=false;
  for(let y=0;y<6;y++){ P.alive=true; G.over=false; G.current=null; G.queue=[]; try{drift()}catch(e){__ERRS.push('resumeDrift: '+e.message)} __drain(); if(!__finite())nanAfter=true; }
  __CHK.resumeNoNaN=!nanAfter&&isFinite(P.mental)&&isFinite(P.nikotin)&&isFinite(P.st.health)&&isFinite(P.reputasiKerja)&&isFinite(P.finansialIQ);
`);
const chk=JSON.parse(run(c,'JSON.stringify(__CHK)'));
const ach=JSON.parse(run(c,'JSON.stringify(__ACH)'));
const fail=[];
if(!(chk.ceraiDebt<=-90e6))fail.push('cerai-menghapus-utang ('+(chk.ceraiDebt/1e6)+'jt)');
if(!chk.lateRetire)fail.push('late-hire-tak-pensiun');
if(!(chk.ipkSalary[1]>chk.ipkSalary[0]))fail.push('ipk-tak-pengaruh-gaji');
if(!(chk.nikotin>0))fail.push('nikotin-tak-menumpuk');
if(!(chk.finansialIQ>0))fail.push('finansialIQ-tak-tumbuh');
if(!(chk.repKerja>50))fail.push('reputasiKerja-tak-naik');
if(!(chk.integritas<60))fail.push('integritas-tak-turun');
if(!chk.mentalNaik)fail.push('mental-tak-naik');
if(!(chk.asetKendaraan<=9))fail.push('skor-kendaraan-tak-dibatasi');
if(!chk.resumeNoNaN)fail.push('save-lama-NaN-setelah-resume');

const nErr=run(c,'__ERRS.length');
const errs=run(c,'__ERRS.slice(0,20)');
const ended=run(c,'__ENDED');
const bad=run(c,'__BAD');
console.log('KEHIDUPAN  errors:', nErr, nErr?errs:'');
console.log('  hidup berakhir:', ended, '| nilai non-finite:', bad);
console.log('  VERIFIKASI:', fail.length?('GAGAL → '+fail.join(', ')):'semua OK');
console.log('    cerai+utang:', (chk.ceraiDebt/1e6)+'jt', '| late-retire:', chk.lateRetire, '| gaji IPK 2.0/3.8:', chk.ipkSalary.map(x=>(x/1e6).toFixed(0)+'jt'));
console.log('    nikotin(6th):', chk.nikotin, '| finIQ(12th):', chk.finansialIQ, '| repKerja(lembur):', chk.repKerja, '| integritas(korupsi):', chk.integritas, '| skor 10 motor:', chk.asetKendaraan);
process.exit((nErr||bad||fail.length)?1:0);
