// Harness uji ARSIP NIAGA (simulator pengusaha) — tanpa jsdom. node _test_niaga.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
function loadGame(game){
  const dir=path.join(ROOT,game,'js');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort();
  return files.map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
}
function makeCtx(){
  const store={};
  const sandbox={ window:{}, localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}, console, setTimeout, clearTimeout, __SEEN:[], __ERRS:[], __ENDED:0, __BAD:0, __NW:[] };
  sandbox.globalThis=sandbox;
  return vm.createContext(sandbox);
}
function run(c,code){ return vm.runInContext(code,c); }

const c=makeCtx();
run(c, loadGame('niaga'));
run(c, `
  const __realAsk=ask; ask=function(d){ __SEEN.push(d.title||''); return __realAsk(d); };
  function __drain(){ let g=0; while(G.current && g++<600) choose(Math.floor(Math.random()*6)); }
  function __finite(){ const xs=[P.kas,P.utang,P.gelap,P.investasi,netWorth()]; for(const x of xs){ if(!isFinite(x)){__BAD++;return false;} } for(const u of P.usaha){ if(!isFinite(u.modal)||!isFinite(u.kinerja)||!isFinite(labaUsaha(u))||!isFinite(nilaiUsaha(u))){__BAD++;return false;} } return true; }
`);

/* 1) 300 karier acak penuh */
run(c, `
  function __sim(){
    newGame(); __drain();
    let guard=0;
    while(P && P.alive && !G.over && guard++<80){
      __drain();
      const av=ACTS.filter(a=>{try{return actAvail(a).ok}catch(e){__ERRS.push('avail:'+a.k+': '+e.message);return false}});
      const n=Math.floor(Math.random()*4);
      for(let i=0;i<n && av.length;i++){
        const a=av[Math.floor(Math.random()*av.length)];
        try{doAct(a.k)}catch(e){__ERRS.push('act:'+a.k+': '+e.message)}
        __drain();
      }
      __finite();
      try{advance()}catch(e){__ERRS.push('advance: '+e.message);break}
      __drain();
    }
    if(G.over)__ENDED++;
    __NW.push(netWorth());
  }
  for(let i=0;i<300;i++){ try{__sim()}catch(e){__ERRS.push('sim: '+e.message)} }
`);

/* 2) targeted: tiap jenis PELUANG, semua jalur DD + keputusan */
run(c, `
  newGame(); __drain();
  for(let pass=0; pass<PELUANG.length*70; pass++){
    P.alive=true; G.over=false; G.current=null; G.queue=[]; P.kas=Math.max(P.kas,5e9);
    const jenis=PELUANG[pass%PELUANG.length];
    const x=Math.random(); const mutu=x<0.34?'bagus':x<0.7?'biasa':'jebakan';
    let base=Math.round((Math.max(P.kas,30e6)*0.5+80e6)*(0.5+Math.random()*1.3));
    let sektor=null; if(jenis.tipe==='buka'||jenis.tipe==='mitra'){sektor=pick(SEKTOR);base=Math.max(base,Math.round(sektor.modalMin*(0.8+Math.random()*0.9)));}
    const cc={jenis,tipe:jenis.tipe,mutu,cost:base,sektor,clues:[],checked:{},done:false};
    try{ tawarkanPeluang(cc); __drain(); __finite(); }catch(e){__ERRS.push('peluang:'+jenis.k+'/'+mutu+': '+e.message)}
  }
`);

/* 3) targeted: aksi siasat gelap → heat → razia → resolve/ditangkap */
run(c, `
  for(let i=0;i<500;i++){
    newGame(); __drain();
    P.kas=20e9; P.st.relasi=70; P.heat=0;
    if(!P.usaha.length)P.usaha.push(bukaUsahaObj('kuliner',100e6,{skala:3,brand:50}));
    P.usaha.push(bukaUsahaObj('tambang',3e9,{skala:4}));
    for(const k of ['suapTender','kartel','upahMurah','abaiLingkungan','pajakSiasat']){
      const a=ACTS.find(x=>x.k===k); P.used={};
      try{ if(actAvail(a).ok){ a.e(); __drain(); } }catch(e){__ERRS.push('siasat:'+k+': '+e.message)}
    }
    for(let j=0;j<6;j++){ P.heat=90; P.penjara=0; G.over=false; G.current=null;
      try{ razia(); __drain(); }catch(e){__ERRS.push('razia: '+e.message)} }
    __finite();
  }
`);

/* 4) targeted: events penuh di berbagai kondisi makro + bangkrut + suksesi */
run(c, `
  for(let i=0;i<800;i++){
    newGame(); __drain();
    P.alive=true; G.over=false; G.current=null; G.queue=[];
    if(!P.usaha.length){P.usaha.push(bukaUsahaObj('ritel',150e6,{skala:2}));P.usaha.push(bukaUsahaObj('properti',900e6,{skala:3}));}
    N.ekonomi=pick(['boom','normal','resesi']); P.st.stres=90; P.buruh=30; P.keluarga=true; P.anak=1; P.age=56;
    if(Math.random()<0.3)P.kas=-2e9;     // picu cek bangkrut
    try{ events(); __drain(); __finite(); }catch(e){__ERRS.push('events: '+e.message)}
  }
`);

/* 5) nilaiAkhir finit & valid pada banyak state acak + epilog */
run(c, `
  for(let i=0;i<400;i++){
    newGame(); __drain();
    P.usaha=[]; const ns=ri(0,6);
    for(let j=0;j<ns;j++)P.usaha.push(bukaUsahaObj(pick(SEKTOR).k, ri(1,20)*1e8, {skala:ri(1,6),brand:ri(0,100),kinerja:ri(0,100),milik:[0.3,0.6,1][ri(0,2)]}));
    P.kas=ri(-3,80)*1e9; P.utang=ri(0,30)*1e9; P.investasi=ri(0,40)*1e9; P.reputasi=ri(0,100);
    P.legH=ri(-60,60); P.legN=ri(-60,60); P.buruh=ri(0,100); P.csrTotal=ri(0,10)*1e9; P.gelapTotal=ri(0,10)*1e9;
    P.suapKali=ri(0,4); P.ipoKali=ri(0,3); P.akuisisiKali=ri(0,4); P.vonis=Math.random()<0.3; P.modusPajak=Math.random()<0.5?'patuh':'hindar';
    let v; try{ v=nilaiAkhir(); }catch(e){__ERRS.push('nilaiAkhir: '+e.message); continue; }
    if(!isFinite(v.harta)||!isFinite(v.nama)||v.harta<0||v.harta>100||v.nama<0||v.nama>100)__BAD++;
    P.alive=false; G.over=true;
    try{ showEpilog(); }catch(e){__ERRS.push('showEpilog: '+e.message)}
  }
`);

/* 6) INVARIAN EKONOMI: usaha kecil sehat harus bisa untung; sektor terdiferensiasi (siklus harga); franchise one-shot; tanpa runaway */
run(c, `
  globalThis.__ECON={viab:{},cycle:{}};
  newGame(); __drain();
  N.ekonomi='normal'; N.daya=55; N.pandemiSisa=0;
  for(const k in N.harga)N.harga[k]=1;
  P.st.operasi=45; P.st.pemasaran=45;
  // 6a: usaha kecil sehat (kinerja 70, brand 35, share 8, sRelasi 60) — rata-rata laba harus positif
  for(const s of SEKTOR){ if(s.modalMin>150e6)continue;
    let sum=0,n=300; for(let i=0;i<n;i++){ const u=bukaUsahaObj(s.k,s.modalMin,{kinerja:70,brand:35,share:8,sRelasi:60}); sum+=labaUsaha(u); }
    __ECON.viab[s.k]=Math.round(sum/n);
  }
  // 6b: siklus harga komoditas mempengaruhi sektor cyclical
  for(const k of ['tambang','agro','kuliner']){
    const mk=SEKTOR_MAP[k].modalMin*4;
    const u=bukaUsahaObj(k,mk,{kinerja:70,brand:40,share:10,sRelasi:60});
    N.harga[k]=0.6; let lo=0; for(let i=0;i<400;i++)lo+=labaUsaha(u); lo/=400;
    N.harga[k]=1.6; let hi=0; for(let i=0;i<400;i++)hi+=labaUsaha(u); hi/=400; N.harga[k]=1;
    __ECON.cycle[k]=[Math.round(lo),Math.round(hi)];
  }
  // 6c: franchise satu kali per usaha
  newGame(); __drain();
  const uf=bukaUsahaObj('kuliner',300e6,{skala:4,brand:60,milik:1}); P.usaha=[uf]; P.kas=2e9; P.used={};
  const fr=ACTS.find(a=>a.k==='franchise');
  __ECON.fr1=actAvail(fr).ok;
  if(actAvail(fr).ok){ fr.e(); __drain(); }
  __ECON.frWaralaba=!!uf.waralaba; __ECON.fr2=actAvail(fr).ok;
  // 6d: milik dihormati — kondisi N identik, hanya milik beda; rata-rata laba*milik harus rasio ~0.5
  (function(){
    newGame(); __drain(); N.ekonomi='normal'; for(const k in N.harga)N.harga[k]=1; N.daya=55; N.pandemiSisa=0;
    P.st.operasi=50; P.st.pemasaran=50;
    const par={skala:3,kinerja:80,brand:50,share:20,sRelasi:70};
    const uF=bukaUsahaObj('ritel',400e6,Object.assign({milik:1.0},par));
    const uH=bukaUsahaObj('ritel',400e6,Object.assign({milik:0.5},par));
    let sf=0,sh=0,n=3000; for(let i=0;i<n;i++){ sf+=labaUsaha(uF)*uF.milik; sh+=labaUsaha(uH)*uH.milik; }
    __ECON.milik=[Math.round(sf/n),Math.round(sh/n)];
  })();
  // evaluasi viability di dalam vm (akses SEKTOR_MAP)
  let okCount=0,total=0;
  for(const k in __ECON.viab){ total++; if(__ECON.viab[k]>=0)okCount++; }
  __ECON.viabOkCount=okCount; __ECON.viabTotal=total;
  __ECON.viabBad=Object.keys(__ECON.viab).filter(k=>__ECON.viab[k] < -SEKTOR_MAP[k].modalMin*0.3);
`);
const econ=JSON.parse(run(c,'JSON.stringify(__ECON)'));
const viabOk = econ.viabOkCount >= Math.ceil(econ.viabTotal*0.7) && econ.viabBad.length===0;
const cycleOk=['tambang','agro','kuliner'].every(k=>econ.cycle[k] && econ.cycle[k][1]>econ.cycle[k][0]);
const frOk = econ.fr1===true && econ.frWaralaba===true && econ.fr2===false;
const milikOk = econ.milik && Math.abs(econ.milik[1]/(econ.milik[0]||1) - 0.5) < 0.12;

const errs=run(c,'__ERRS.slice(0,25)');
const nErr=run(c,'__ERRS.length');
const ended=run(c,'__ENDED');
const bad=run(c,'__BAD');
const nwArr=run(c,'__NW');
const maxNw=nwArr.length?Math.max.apply(null,nwArr):0;
const runawayOk = isFinite(maxNw) && maxNw < 1e15;   // tidak meledak ke nilai absurd
const titles=JSON.parse(run(c,'JSON.stringify([...new Set(__SEEN)])'));
const must=['LATAR BELAKANG','PELUANG BISNIS','DUE DILIGENCE','KEPUTUSAN','BUKA USAHA BARU','DITJEN PAJAK & APH MENGETUK','BURUH MOGOK','TAWARAN AKUISISI','SUKSESI IMPERIUM','TERANCAM BANGKRUT'];
const missing=must.filter(t=>!titles.includes(t));
console.log('NIAGA  errors:', nErr, nErr?errs:'');
console.log('       karier berakhir (epilog):', ended, '| nilai non-finite/invalid:', bad, '| kartu wajib belum muncul:', missing.length?missing:'tidak ada');
console.log('       kekayaan bersih maks teramati:', maxNw.toExponential(2), '| runaway-aman:', runawayOk, '| total jenis kartu unik:', titles.length);
console.log('  INVARIAN EKONOMI:');
console.log('    usaha kecil sehat untung:', econ.viabOkCount+'/'+econ.viabTotal, viabOk?'OK':'GAGAL', '| rugi-parah:', econ.viabBad.length?econ.viabBad:'tidak ada');
console.log('    contoh laba/th (kinerja70 brand35):', Object.fromEntries(Object.entries(econ.viab).map(([k,v])=>[k,(v/1e6).toFixed(1)+'jt'])));
console.log('    siklus harga (lo@0.6 / hi@1.6):', cycleOk?'OK':'GAGAL', Object.fromEntries(Object.entries(econ.cycle).map(([k,v])=>[k,(v[0]/1e6).toFixed(0)+'jt / '+(v[1]/1e6).toFixed(0)+'jt'])));
console.log('    franchise one-shot:', frOk?'OK':'GAGAL', '(tersedia='+econ.fr1+' waralaba='+econ.frWaralaba+' ulang='+econ.fr2+')');
console.log('    milik dihormati (0.5 ≈ separuh dari 1.0):', milikOk?'OK':'GAGAL', '['+(econ.milik[0]/1e6).toFixed(0)+'jt, '+(econ.milik[1]/1e6).toFixed(0)+'jt]');
const invarianGagal = !viabOk || !cycleOk || !frOk || !milikOk || !runawayOk;
process.exit((nErr||bad||missing.length||invarianGagal)?1:0);
