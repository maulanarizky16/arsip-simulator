// Tes simulator IT — alur baru: mulai tanpa pekerjaan → lamar → panggilan → wawancara; resign; usaha sampingan;
// software house dengan klien; gaji ikut zaman, pajak & biaya hidup (uang tidak menumpuk begitu saja).
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','it','js');
const code=(SEED+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n'))
  .replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,'');
const store={};
const ctx={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=''+v;},removeItem:k=>{delete store[k];}},console,setTimeout,clearTimeout};
ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(code,ctx,{filename:'it.bundle.js'});
const run=s=>vm.runInContext(s,ctx);
const hasil=[]; const cek=(n,ok,info)=>hasil.push([n,!!ok,info]);

run(`globalThis.__IT_LANGSUNG_KERJA=false; globalThis.__ERR=[]; globalThis.__J=[];
  const __ask=ask; ask=function(d){ __J.push(d.title); return __ask(d); };
  function __drain(pilih){ let g=0; while(G.current&&g++<300){ const n=G.current.opts.length; try{ choose(pilih!=null?Math.min(pilih,n-1):Math.floor(Math.random()*n)); }catch(e){ __ERR.push('kartu '+(G.current&&G.current.title)+': '+e.message); G.current=null; G.queue=[]; } } }
  function __baru(){ newGame(); __drain(0); }
  function __kerja(k){ const tm=TEMPAT.find(t=>t.k===(k||'korporat')); terimaKerja(tm); G.current=null; G.queue=[]; }`);

/* 1) mulai tanpa pekerjaan */
run(`__J.length=0; __baru(); globalThis.__s1=[P.menganggur,P.tempat,P.pernahKerja,kerjaAktif(),jabLabel(),__J.includes('TEMPAT KERJA PERTAMA'),!!P.ach.junior,P.infra.length,
  actAvail(ACTS.find(a=>a.k==='lamarKerja')).ok,actAvail(ACTS.find(a=>a.k==='resign')).ok];`);
cek('mulai: belum bekerja, tidak ada kartu pilih tempat kerja, belum dapat tanda jasa',run('__s1[0]===true&&__s1[1]===null&&__s1[2]===false&&!__s1[3]&&/^Pencari kerja/.test(__s1[4])&&!__s1[5]&&!__s1[6]&&__s1[7]===0'),run('__s1'));
cek('mulai: aksi Lamar kerja tersedia, Resign belum',run('__s1[8]&&!__s1[9]'),run('__s1.slice(8)'));
run(`const m0=P.money; drift(); insiden(); G.current=null; G.queue=[]; globalThis.__s1b=[P.money<m0,P.insidenTotal];`);
cek('belum bekerja: tanpa gaji, biaya hidup jalan, tanpa insiden',run('__s1b[0]&&__s1b[1]===0'),run('__s1b'));

/* 2) lamar → panggilan → wawancara → diterima */
run(`globalThis.__KUIS_PINTAR=true; globalThis.__dapat=0; globalThis.__adaPanggilan=0;
  for(let i=0;i<60;i++){ __baru(); N.pasar='normal'; __J.length=0; for(let y=0;y<8&&P.menganggur;y++){ P.used={}; doAct('lamarKerja'); __drain(0); } if(__J.includes('PANGGILAN WAWANCARA'))__adaPanggilan++; if(!P.menganggur&&P.tempat&&P.ach.junior&&P.infra.length)__dapat++; }
  globalThis.__KUIS_PINTAR=false;
  globalThis.__gagal=0; for(let i=0;i<60;i++){ __baru(); N.pasar='krisis'; P.reputasi=10; P.used={}; doAct('lamarKerja'); __drain(0); if(P.menganggur)__gagal++; }`);
cek('lamar kerja: muncul kartu panggilan wawancara',run('__adaPanggilan>=55'),run('__adaPanggilan'));
cek('jawaban wawancara bagus → hampir selalu dapat kerja dalam beberapa tahun',run('__dapat>=54'),run('__dapat'));
cek('pasar beku + jawaban asal: sering gagal (tidak otomatis diterima)',run('__gagal>=30'),run('__gagal'));

/* 3) resign */
run(`__baru(); __kerja('korporat'); P.used={}; globalThis.__r0=[actAvail(ACTS.find(a=>a.k==='resign')).ok,actAvail(ACTS.find(a=>a.k==='lamarKerja')).ok];
  doAct('resign'); __drain(0); globalThis.__r1=[P.menganggur,P.tempat,kerjaAktif(),jabLabel(),P.riwayat.some(x=>/^Resign dari/.test(x.t)),actAvail(ACTS.find(a=>a.k==='lamarKerja')).ok];`);
cek('resign: tersedia saat bekerja, lalu jadi menganggur & bisa melamar lagi',run('__r0[0]&&!__r0[1]&&__r1[0]&&__r1[1]===null&&!__r1[2]&&/^Menganggur/.test(__r1[3])&&__r1[4]&&__r1[5]'),run('[__r0,__r1]'));

/* 4) uang tidak terlalu gampang: gaji ikut zaman, pajak & biaya hidup */
run(`__baru(); __kerja('korporat'); P.reputasi=30; N.pasar='normal'; P.gajiAdj=1; P.sertifikat=[];
  N.tahun=2008; const g08=gajiTahun(); N.tahun=2024; const g24=gajiTahun(); globalThis.__g=[g08,g24];
  N.tahun=2010; P.money=0; P.saasMRR=0; P.saham=0; P.keluarga=false; P.anak=0; const g=gajiTahun(); drift(); globalThis.__tab=[g,P.money];
  globalThis.__pajak=[pajakIT(10e6),pajakIT(2e9)>pajakIT(1e9)*2];`);
cek('gaji 2008 jauh lebih kecil daripada 2024',run('__g[0]<__g[1]*0.6'),run('__g'));
cek('gaji tidak seluruhnya jadi tabungan (pajak + biaya hidup)',run('__tab[1]>0&&__tab[1]<__tab[0]*0.75'),run('__tab'));
cek('pajak: penghasilan kecil bebas, penghasilan besar progresif',run('__pajak[0]===0&&__pajak[1]'),run('__pajak'));
run(`__baru(); __kerja('korporat'); P.st.ngoding=60; P.reputasi=40; let mrr=0; for(let y=0;y<10;y++){ P.used={}; doAct('sidepro'); doAct('sidepro'); mrr=Math.max(mrr,P.saasMRR); } globalThis.__mrr=mrr;`);
cek('produk SaaS sampingan: MRR tumbuh pelan & dibatasi (≤ Rp 40 jt/bln)',run('__mrr<=40e6'),run('__mrr'));

/* 5) usaha sampingan */
run(`__baru(); P.money=200e6; N.tahun=2016; P.used={}; __J.length=0; doAct('sampingan'); globalThis.__sp0=[__J.includes('BUKA USAHA SAMPINGAN'),G.current?G.current.opts.map(o=>o.t):[]]; __drain(0);
  globalThis.__sp1=[!!P.sampingan,P.money<200e6,actAvail(ACTS.find(a=>a.k==='sampingan')).ok,actAvail(ACTS.find(a=>a.k==='tutupSampingan')).ok];
  let tot=0,n=0; for(let i=0;i<200;i++){ P.sampingan={k:'servis',n:'Servis & rakit komputer',thn:0,rugi:0,modal:15e6}; const m=P.money; sampinganTahunan(); tot+=P.money-m; n++; } globalThis.__spAvg=tot/n; P.sampingan={k:'servis',n:'x',thn:0,rugi:0,modal:15e6};
  P.used={}; doAct('tutupSampingan'); globalThis.__sp2=!P.sampingan;`);
cek('sampingan: bisa dibuka walau belum bekerja; daftar mengikuti tahun (warnet hilang 2016)',run("__sp0[0]&&__sp0[1].length>=4&&!__sp0[1].includes('Warnet kecil')&&__sp1[0]&&__sp1[1]&&!__sp1[2]&&__sp1[3]"),run('[__sp0,__sp1]'));
cek('sampingan: hasil rata-rata kecil (di bawah gaji junior setahun) tapi positif',run('__spAvg>2e6&&__spAvg<60e6'),run('Math.round(__spAvg)'));
cek('sampingan: bisa ditutup',run('__sp2'));

/* 6) software house */
run(`__baru(); __kerja('agency'); P.money=500e6; P.st.ngoding=70; P.st.soft=70; P.reputasi=60; N.tahun=2018; N.pasar='normal'; P.used={};
  globalThis.__sh0=actAvail(ACTS.find(a=>a.k==='bukaSH')).ok; doAct('bukaSH'); __drain(0);
  globalThis.__sh1=[!!P.sh,P.sh&&P.sh.penuh,P.tempat,P.founder,gajiTahun(),/^Pemilik/.test(jabLabel()),!!P.ach.softwareHouse,adaTim(),P.riwayat.some(x=>/^Resign dari/.test(x.t))];
  let klien=0; for(let i=0;i<40&&P.sh.klien.length<3;i++){ P.used={}; doAct('cariKlien'); __drain(0); } klien=P.sh.klien.length;
  globalThis.__sh2=[klien,omzetSH()>0,bebanSH()>0,tenagaSH()>0];
  const m=P.money; P.tim.anggota=[]; shTahunan(); G.current=null; G.queue=[]; globalThis.__sh3=[P.money>m,P.sh.total>0];
  /* kewalahan → kepuasan klien turun */
  for(const c of P.sh.klien){ c.puas=60; c.beban=3; c.sisa=5; } shTahunan(); G.current=null; G.queue=[]; globalThis.__sh4=P.sh.klien.every(c=>c.puas<60)||P.sh.klien.length<klien;
  P.used={}; for(const c of P.sh.klien)c.puas=50; doAct('rawatKlien'); globalThis.__sh5=P.sh.klien.every(c=>c.puas>50);
  /* kejadian klien tidak error */
  for(let i=0;i<120&&P.sh;i++){ if(P.sh.klien.length<2)P.sh.klien.push(buatKlien()); try{ kejadianSH(); }catch(e){ __ERR.push('kejadianSH: '+e.message); } __drain(); }
  if(!P.sh){ P.sh={n:'Uji',penuh:true,klien:[buatKlien(),buatKlien()],thn:0,total:0,klienTotal:2,kosong:0}; P.tempat='softwarehouse'; P.menganggur=false; }
  P.used={}; doAct('tutupSH'); __drain(0); globalThis.__sh6=[!P.sh,P.menganggur];`);
cek('software house: bisa dibuka, jadi pemilik penuh waktu (tanpa gaji), bisa merekrut tim',run("__sh0&&__sh1[0]&&__sh1[1]&&__sh1[2]==='softwarehouse'&&__sh1[3]&&__sh1[4]===0&&__sh1[5]&&__sh1[6]&&__sh1[7]&&__sh1[8]"),run('__sh1'));
cek('software house: klien didapat lewat Cari klien; ada omzet, beban & tenaga',run('__sh2[0]>=3&&__sh2[1]&&__sh2[2]&&__sh2[3]'),run('__sh2'));
cek('software house: tagihan klien masuk tiap tahun',run('__sh3[0]&&__sh3[1]'),run('__sh3'));
cek('software house: tim kewalahan → klien tidak puas',run('__sh4'));
cek('software house: jaga hubungan menaikkan kepuasan',run('__sh5'));
cek('software house: jual/tutup → kembali tanpa pekerjaan tetap',run('__sh6[0]&&__sh6[1]'),run('__sh6'));
run(`__baru(); __kerja('korporat'); P.money=500e6; P.st.ngoding=70; P.used={}; doAct('bukaSH'); choose(1); __drain(0); globalThis.__sh7=[!!P.sh,P.sh&&P.sh.penuh,P.tempat,gajiTahun()>0,tenagaSH()<1];`);
cek('software house sambilan: tetap bekerja & bergaji, tenaga terbatas',run("__sh7[0]&&__sh7[1]===false&&__sh7[2]==='korporat'&&__sh7[3]&&__sh7[4]"),run('__sh7'));

/* 7) 150 karier acak penuh dengan alur baru: tanpa error & tanpa NaN */
run(`globalThis.__bad=0; globalThis.__st={kerja:0,sh:0,samp:0,tamat:0};
  for(let i=0;i<150;i++){ newGame(); __drain(); let g=0, pk=false, sh=false, sp=false;
    while(P.alive&&!G.over&&g++<70){
      const av=ACTS.filter(a=>{ try{ return actAvail(a).ok; }catch(e){ __ERR.push('avail '+a.k+': '+e.message); return false; } });
      for(let j=0;j<3&&av.length;j++){ const a=av[Math.floor(Math.random()*av.length)]; if(a.k==='tutup')continue; try{ doAct(a.k); }catch(e){ __ERR.push('aksi '+a.k+': '+e.message); } __drain(); if(G.over)break; }
      if(G.over)break;
      try{ advance(); }catch(e){ __ERR.push('advance: '+e.message); break; } __drain();
      if(!isFinite(P.money)||!isFinite(P.st.stres)||(P.sh&&!isFinite(omzetSH())))__bad++;
      if(P.pernahKerja&&P.tempat)pk=true; if(P.sh)sh=true; if(P.sampingan)sp=true;
    }
    if(pk)__st.kerja++; if(sh)__st.sh++; if(sp)__st.samp++; if(G.over)__st.tamat++; }`);
const st=JSON.parse(run('JSON.stringify(__st)')), err=JSON.parse(run('JSON.stringify(__ERR)'));
cek('150 karier acak: tanpa error',err.length===0,err.slice(0,6));
cek('150 karier acak: tanpa nilai tak sah',run('__bad')===0,run('__bad'));
cek('karier acak: sebagian besar pernah dapat kerja; sampingan & software house ikut terpakai',st.kerja>=100&&st.samp>=20&&st.sh>=3,st);

let gagal=0;
console.log('=== TES IT: CARI KERJA, RESIGN, SAMPINGAN, SOFTWARE HOUSE ===');
for(const [n,ok,info] of hasil){ if(!ok)gagal++; console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' → '+JSON.stringify(info))); }
console.log('  statistik 150 karier acak:',st);
console.log(gagal?'\n❌ '+gagal+' PEMERIKSAAN GAGAL':'\n✅ SEMUA TES IT USAHA LOLOS');
process.exit(gagal?1:0);
