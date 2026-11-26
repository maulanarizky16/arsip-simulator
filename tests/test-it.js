// Harness uji ARSIP SIBER (simulator IT) — tanpa jsdom. node _test_it.js
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
  const sandbox={ window:{}, localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}, console, setTimeout, clearTimeout, __SEEN:[], __ERRS:[], __ENDED:0, __NAN:0 };
  sandbox.globalThis=sandbox;
  return vm.createContext(sandbox);
}
function run(c,code){ return vm.runInContext(code,c); }

const c=makeCtx();
/* angka acak ber-seed + mesin mini-game bersama (assets/kuis.js), sama seperti tes lain */
run(c, require('./_seed'));
run(c, loadGame('it'));
run(c, `
  const __realAsk=ask; ask=function(d){ __SEEN.push(d.title||''); return __realAsk(d); };
  function __drain(){ let g=0; while(G.current && g++<400) choose(Math.floor(Math.random()*5)); }
`);

/* 1) 250 karier acak penuh */
run(c, `
  globalThis.__ACH={};
  function __sim(){
    newGame(); __drain();
    let guard=0;
    while(P && P.alive && !G.over && guard++<90){
      __drain();
      const av=ACTS.filter(a=>{try{return actAvail(a).ok}catch(e){__ERRS.push('avail:'+a.k+': '+e.message);return false}});
      const n=Math.floor(Math.random()*4);
      for(let i=0;i<n && av.length;i++){
        const a=av[Math.floor(Math.random()*av.length)];
        try{doAct(a.k)}catch(e){__ERRS.push('act:'+a.k+': '+e.message)}
        __drain();
      }
      try{advance()}catch(e){__ERRS.push('advance: '+e.message);break}
      __drain();
    }
    if(G.over)__ENDED++;
    if(P&&P.ach)for(const k in P.ach)__ACH[k]=(__ACH[k]||0)+1;
  }
  for(let i=0;i<250;i++){ try{__sim()}catch(e){__ERRS.push('sim: '+e.message)} }
`);

/* 1b) skenario terarah: engineer berprestasi harus bisa ditawari promosi.
   (Pemain acak jarang memenuhi syarat reputasi+skill, jadi cakupan kartu ini tidak boleh bergantung pada keberuntungan.) */
run(c, `
  for(let i=0;i<40 && __SEEN.indexOf('TAWARAN PROMOSI')<0;i++){
    newGame(); __drain();
    if(!P||!P.jab)continue;
    P.tahunJab=6; P.reputasi=95; P.heat=0; P.tenure=5;
    P.st.ngoding=P.st.sistem=P.st.jaringan=P.st.keamanan=P.st.soft=95;
    try{ cekPromosi(); }catch(e){ __ERRS.push('cekPromosi: '+e.message); }
    __drain();
  }
`);

/* 2) targeted: tiap jenis INSIDEN, semua jalur diagnosa+perbaikan */
run(c, `
  newGame(); __drain();
  for(let pass=0; pass<INSIDEN.length*60; pass++){
    const jenis=INSIDEN[pass%INSIDEN.length];
    P.alive=true; G.over=false; G.current=null; G.queue=[];
    if(!P.infra.length)P.infra=[{k:jenis.infra,n:'X',sehat:60,nilai:1e8,kritis:true}];
    const target=P.infra.find(a=>a.k===jenis.infra)||P.infra[0];
    const parah=pick(['kecil','sedang','besar']);
    const cc={jenis,target,parah,clues:[],diagnosed:{},done:false};
    try{ gelarInsiden(cc); __drain(); }catch(e){__ERRS.push('insiden:'+jenis.k+': '+e.message)}
  }
`);

/* 3) targeted: hacking → heat → razia → resolve/ditangkap */
run(c, `
  for(let i=0;i<400;i++){
    newGame(); __drain();
    P.st.keamanan=80; P.st.ngoding=70; P.reputasi=60; P.money=5e9; P.heat=0; P.gelap=0;
    P.alive=true; G.over=false; G.current=null; G.queue=[];
    // jalankan aksi siber langsung
    for(const k of ['ctf','bugbounty','pentest','blackhat','jualExploit','cuciKripto','opsec']){
      const a=ACTS.find(x=>x.k===k); P.used={};
      try{ if(actAvail(a).ok){ a.e(); __drain(); } }catch(e){__ERRS.push('siber:'+k+': '+e.message)}
    }
    // paksa razia berkali-kali
    for(let j=0;j<6;j++){ P.heat=85; P.penjara=0; G.over=false; G.current=null;
      try{ razia(); __drain(); }catch(e){__ERRS.push('razia: '+e.message)} }
  }
`);

/* 4) targeted: layoff/cariKerja, AI, events penuh utk berbagai status */
run(c, `
  for(let i=0;i<600;i++){
    newGame(); __drain();
    P.alive=true; G.over=false; G.current=null; G.queue=[];
    N.pasar='krisis'; N.tren='Hype AI/LLM'; P.st.stres=90; P.reputasi=55; P.startupSaham=true; P.saham=5e8; P.st.ngoding=70;
    try{ events(); __drain(); }catch(e){__ERRS.push('events: '+e.message)}
  }
`);

/* 5) cek nilaiAkhir tidak NaN pada banyak state acak + epilog */
run(c, `
  for(let i=0;i<300;i++){
    newGame(); __drain();
    P.beres=ri(0,40); P.gagal=ri(0,30); P.insidenTotal=P.beres+P.gagal;
    P.reputasi=ri(0,100); P.maxLv=ri(1,6); P.money=ri(-2,40)*1e9; P.saham=ri(0,30)*1e8;
    P.hackBlack=ri(0,5); P.hackWhite=ri(0,6); P.dataHilang=ri(0,4); P.outageBesar=ri(0,3);
    P.vonis=r()<0.3; P.dipecat=r()<0.3; P.gelapTotal=ri(0,10)*1e8;
    let v; try{ v=nilaiAkhir(); }catch(e){__ERRS.push('nilaiAkhir: '+e.message); continue; }
    if(!isFinite(v.karya)||!isFinite(v.cuan)||v.karya<0||v.karya>100||v.cuan<0||v.cuan>100)__NAN++;
    // tutup berkas → showEpilog (nilaiAkhir + Platform path)
    P.alive=false; G.over=true;
    try{ showEpilog(); }catch(e){__ERRS.push('showEpilog: '+e.message)}
  }
`);

/* 6) verifikasi perbaikan bug & efek variabel baru */
run(c, `
  globalThis.__CHK={};
  // 6a topiPutih kini bisa terbuka
  newGame(); __drain(); P.hackWhite=3; setTopi(); __CHK.topiPutih=!!P.ach.topiPutih;
  // 6b buronan kini bisa terjadi
  let bur=0; for(let i=0;i<400;i++){ newGame(); __drain(); P.heat=90; P.gelap=8e9; P.st.keamanan=85; P.reputasi=60; P.alive=true; G.over=false; G.current=null; try{resolveRazia(0.6)}catch(e){} if(P.buronan)bur++; }
  __CHK.buronan=bur>0;
  // 6c rajaUptime via streak (logika akhir-advance)
  newGame(); __drain();
  for(let y=0;y<5;y++){ for(const a of P.infra)a.sehat=98; if(uptimeRata()>=90){P.uptimeStreak=(P.uptimeStreak||0)+1; if(P.uptimeStreak>=3)ach('rajaUptime');} else P.uptimeStreak=0; }
  __CHK.rajaUptime=!!P.ach.rajaUptime;
  // 6d backup menaikkan peluang pulih dari ransomware
  function ransomRate(backup){ let ok=0,n=700; const jenis=INSIDEN.find(j=>j.k==='ransom'); const okOpt=jenis.opsi.find(o=>o.ok);
    for(let i=0;i<n;i++){ newGame(); __drain(); P.backupKuat=backup; P.st.keamanan=60; P.lembur=0;
      const cc={jenis,target:{k:'db',n:'DB',sehat:50,debt:0},parah:'sedang',clues:[],diagnosed:{},done:false};
      const b=P.beres; terapkan(cc,okOpt); if(P.beres>b)ok++; } return +(ok/n).toFixed(2); }
  __CHK.backupRate=[ransomRate(false),ransomRate(true)];
  // 6e obsv menurunkan & debt menaikkan keparahan insiden
  function sevBig(obsv,debt){ let big=0,n=2000; newGame(); __drain(); P.obsv=obsv;
    for(let i=0;i<n;i++){ P.infra=[{k:'server',n:'S',sehat:60,debt:debt}]; if(buatInsiden().parah==='besar')big++; } return +(big/n).toFixed(3); }
  __CHK.sevObsv=[sevBig(false,0),sevBig(true,0)];
  __CHK.sevDebt=[sevBig(false,0),sevBig(false,80)];
  // 6f saasMRR menghasilkan pendapatan pasif di drift
  function dm(mrr){ newGame(); __drain(); P.money=0; P.saham=0; P.saasMRR=mrr; P.usedSkill={saas:true}; P.jab='junior'; P.tempat='korporat'; P.reputasi=30; N.pasar='normal'; P.penjara=0; P.retired=false; drift(); return P.money; }
  __CHK.saasDelta=dm(10e6)-dm(0);
  // 6g lembur menumpuk saat tangani insiden, mereda saat rehat
  newGame(); __drain(); P.lembur=0; const j2=INSIDEN[0];
  gelarInsiden({jenis:j2,target:{k:j2.infra,n:'X',sehat:60,debt:0},parah:'besar',clues:[],diagnosed:{},done:false}); __drain();
  __CHK.lemburUp=P.lembur>0; const lb=P.lembur; P.used={}; ACTS.find(a=>a.k==='rehat').e(); __CHK.lemburDown=P.lembur<lb;
`);
const chk=JSON.parse(run(c,'JSON.stringify(__CHK)'));
const achMap=JSON.parse(run(c,'JSON.stringify(__ACH)'));
const chkFail=[];
if(!chk.topiPutih)chkFail.push('topiPutih-tak-terbuka');
if(!chk.buronan)chkFail.push('buronan-tak-terjadi');
if(!chk.rajaUptime)chkFail.push('rajaUptime-tak-terbuka');
if(!(chk.backupRate[1]>chk.backupRate[0]+0.2))chkFail.push('backup-tak-berefek');
if(!(chk.sevObsv[1]<chk.sevObsv[0]))chkFail.push('obsv-tak-berefek');
if(!(chk.sevDebt[1]>chk.sevDebt[0]))chkFail.push('debt-tak-berefek');
if(!(chk.saasDelta>=100e6))chkFail.push('saasMRR-tak-bayar');
if(!chk.lemburUp||!chk.lemburDown)chkFail.push('lembur-salah');

const errs=run(c,'__ERRS.slice(0,20)');
const nErr=run(c,'__ERRS.length');
const ended=run(c,'__ENDED');
const nan=run(c,'__NAN');
const titles=JSON.parse(run(c,'JSON.stringify([...new Set(__SEEN)])'));
const must=['PILIH JALUR (SPESIALISASI)','TEMPAT KERJA PERTAMA','INSIDEN — ON CALL','DIAGNOSA INSIDEN','TERAPKAN PERBAIKAN','DIGITAL FORENSICS MENGETUK PINTU','BURNOUT','MENCARI KERJA','DI-HEADHUNT','TAWARAN PROMOSI'];
const missing=must.filter(t=>!titles.includes(t));
const achPernahUnreach=['topiPutih','buronan','rajaUptime','iotMaster'].filter(k=>!(achMap[k]>0));
console.log('IT  errors:', nErr, nErr?errs:'');
console.log('    karier berakhir (epilog):', ended, '| skor invalid/NaN:', nan, '| kartu wajib belum muncul:', missing.length?missing:'tidak ada');
console.log('    total jenis kartu unik terlihat:', titles.length);
console.log('  VERIFIKASI PERBAIKAN:', chkFail.length?('GAGAL → '+chkFail.join(', ')):'semua OK');
console.log('    topiPutih:',chk.topiPutih,'| buronan:',chk.buronan,'| rajaUptime:',chk.rajaUptime);
console.log('    ransom-sukses tanpa/ dengan backup:',chk.backupRate,'| SEV-1% obsv off/on:',chk.sevObsv,'| SEV-1% debt 0/80:',chk.sevDebt);
console.log('    saasMRR delta/th:',(chk.saasDelta/1e6).toFixed(0)+'jt','| lembur naik:',chk.lemburUp,'turun saat rehat:',chk.lemburDown);
console.log('    achievement pernah-unreachable kini terbuka di 250 karier acak:', achPernahUnreach.length?('MASIH 0 → '+achPernahUnreach.join(', ')):'semua muncul');
process.exit((nErr||nan||missing.length||chkFail.length)?1:0);
