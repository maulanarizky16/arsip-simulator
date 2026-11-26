// Uji 7 mini-game bersama (assets/kuis.js) di Simulator WNI & Kehidupan.
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
function muat(game){
  const dir=path.join(__dirname,'..',game,'js');
  let code=SEED+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
  code=code.replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,'');
  const store={};
  const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console,setTimeout,clearTimeout};
  sb.globalThis=sb;
  const c=vm.createContext(sb); vm.runInContext(code,c);
  vm.runInContext(`globalThis.__JUDUL=[]; const __a=ask; ask=function(d){ __JUDUL.push(d.title); return __a(d); };
    function __drain(pilih){ let g=0; while(G.current&&g++<300){ const n=G.current.opts.length; choose(pilih!=null?Math.min(pilih,n-1):Math.floor(Math.random()*n)); } }`,c);
  return s=>vm.runInContext(s,c);
}
const hasil=[]; const cek=(n,ok,info)=>hasil.push([n,!!ok,info]);

/* ---------- WNI ---------- */
const w=muat('wni');
// bank soal
const B=JSON.parse(w('JSON.stringify(Object.fromEntries(Object.entries(Kuis.BANK).map(([k,a])=>[k,{n:a.length,rusak:a.filter(s=>s.h?typeof s.fakta!=="boolean":(!s.o||s.o.length<2||new Set(s.o).size!==s.o.length||(s.w&&s.w.length!==s.o.length))).length}])))'));
for(const k in B)cek('bank '+k+' cukup & valid',B[k].n>=(k==='wawancara'||k==='mertua'?3:5)&&!B[k].rusak,B[k]);
// SKD selalu selesai, ambang batas konsisten
w(`globalThis.__S=[]; for(let i=0;i<60;i++){ newGame(); __drain(0); Kuis.skd(h=>__S.push(h)); __drain(); }`);
const S=JSON.parse(w('JSON.stringify(__S)'));
cek('SKD selalu selesai',S.length===60,S.length);
cek('SKD: lolos hanya jika semua ambang terpenuhi',S.every(h=>h.lolos===(h.twk>=3&&h.tiu>=3&&h.tkp>=18)),S.slice(0,3));
// tawar-menawar
w(`globalThis.__T=[]; for(let i=0;i<120;i++){ let selesai=false, harga; Kuis.tawar('motor bekas',12e6,h=>{selesai=true;harga=h;}); let g=0; while(G.current&&g++<20)choose(Math.floor(Math.random()*G.current.opts.length)); __T.push([selesai,harga,g]); }`);
const T=JSON.parse(w('JSON.stringify(__T)'));
cek('tawar-menawar selalu berakhir (≤ 8 ronde)',T.every(t=>t[0]&&t[2]<=8),T.filter(t=>!t[0]||t[2]>8).slice(0,3));
cek('harga deal masuk akal (≤ harga buka, ≥ 60%)',T.filter(t=>t[1]!=null).every(t=>t[1]<=12e6&&t[1]>=7.2e6),T.filter(t=>t[1]!=null&&(t[1]>12e6||t[1]<7.2e6)).slice(0,3));
cek('ada deal & ada yang gagal',T.some(t=>t[1]!=null)&&T.some(t=>t[1]==null));
// CPNS: lolos SKD + menang SKB → jadi PNS
w(`newGame(); __drain(0); P.skill=95; const __skd=Kuis.skd; Kuis.skd=d=>d({lolos:true,twk:5,tiu:5,tkp:25}); globalThis.__r0=Math.random; Math.random=()=>0.01; ikutCPNS(); Math.random=__r0; Kuis.skd=__skd;`);
cek('CPNS: lolos → profesi PNS',w('P.profesi')==='pns',w('P.profesi'));
// anggaran
w(`newGame(); __drain(0); P.profesi='karyawan'; P.gaji=6e6; P.saldo=20e6; P.tabungan=0; P.anggaran={tabung:20,ingin:10}; P.st.waras=80; P.st.sehat=80; advance(); __drain(0);`);
cek('anggaran: tabungan otomatis terisi',w('P.tabungan')>=1e6,w('P.tabungan'));
// wawancara sebelum diterima kerja
w(`newGame(); __drain(0); __JUDUL.length=0; tawaranKerja('Uji'); __drain(0);`);
cek('WNI: wawancara muncul sebelum diterima kerja',w('__JUDUL.includes("WAWANCARA KERJA")'),w('__JUDUL'));
// cek fakta
w(`newGame(); __drain(0); __JUDUL.length=0; EVENTS.find(e=>e.k==='hoax').run(); __drain();`);
cek('WNI: form cek fakta muncul',w('__JUDUL.includes("CEK FAKTA GRUP WA")'));
// calon mertua
w(`newGame(); __drain(0); P.pasangan=true; __JUDUL.length=0; EVENTS.find(e=>e.k==='nikahDesak').run(); __drain(0);`);
cek('WNI: bertemu calon mertua sebelum nikah',w('__JUDUL[0]')==='BERTEMU CALON MERTUA',w('__JUDUL'));
// SIM: resmi atau nembak bisa didapat
w(`globalThis.__SIM={resmi:0,nembak:0}; for(let i=0;i<80;i++){ globalThis.__KUIS_PINTAR=i%2===0; newGame(); __drain(0); P.sim=false; bikinSIM(); __drain(); if(P.sim){ if(P.ach.simNembak)__SIM.nembak++; else __SIM.resmi++; } } globalThis.__KUIS_PINTAR=false;`);
const SIM=JSON.parse(w('JSON.stringify(__SIM)'));
cek('SIM: jalur resmi (pemain pintar) & nembak sama-sama bisa',SIM.resmi>0&&SIM.nembak>0,SIM);
// motor bekas
w(`globalThis.__M=0; for(let i=0;i<40;i++){ newGame(); __drain(0); P.motor=false; P.saldo=20e6; beliMotorBekas(); __drain(); if(P.motor)__M++; }`);
cek('motor bekas bisa dibeli lewat tawar-menawar',w('__M')>0,w('__M'));

/* ---------- KEHIDUPAN ---------- */
const k=muat('kehidupan');
k(`newGame(); __drain(0); P.age=22; __JUDUL.length=0; jobOffers(POOL_UMUM,2); __drain(0);`);
cek('Kehidupan: wawancara sebelum diterima kerja',k('__JUDUL.includes("WAWANCARA KERJA")'),k('__JUDUL'));
k(`newGame(); __drain(0); P.age=26; P.gender='L'; P.money=100e6; P.love={nama:'Sari Dewi',rel:90,thn:3,married:false,sifat:{n:'hangat'}}; __JUDUL.length=0; doAct('lamar'); __drain(0);`);
cek('Kehidupan: bertemu calon mertua saat melamar',k('__JUDUL[0]')==='BERTEMU CALON MERTUA',k('__JUDUL'));
k(`newGame(); __drain(0); P.age=25; P.st.health=90; P.st.smart=90; P.money=50e6; __JUDUL.length=0; daftarProfesi(); const i=G.current.opts.findIndex(o=>/PNS/.test(o.t)); choose(i); __drain();`);
cek('Kehidupan: jalur PNS lewat SKD',k('__JUDUL.some(t=>t.startsWith("SKD CPNS"))'),k('__JUDUL'));
k(`newGame(); __drain(0); P.age=17; P.sim=false; __JUDUL.length=0; doAct('sim'); __drain();`);
cek('Kehidupan: ujian SIM muncul',k('__JUDUL.includes("UJIAN TEORI SIM")'),k('__JUDUL'));

let gagal=0;
for(const [n,ok,info] of hasil){ if(!ok)gagal++; console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' → '+JSON.stringify(info))); }
console.log(gagal?'\n❌ '+gagal+' PEMERIKSAAN GAGAL':'\n✅ SEMUA TES MINI-GAME LOLOS');
process.exit(gagal?1:0);
