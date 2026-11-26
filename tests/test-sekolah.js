// Uji sekolah & kuliah di Simulator Kehidupan: bank soal, form maks. 5 soal, nama ujian sesuai era,
// alur semester sampai wisuda, IPK wajar, skripsi molor.
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','kehidupan','js');
const code=SEED+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console,setTimeout,clearTimeout};
sb.globalThis=sb;
const c=vm.createContext(sb);
const run=s=>vm.runInContext(s,c);
run(code.replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,''));   // jangan jalankan boot
const hasil=[];
const cek=(nama,ok,info)=>hasil.push([nama,!!ok,info]);

/* 1) bank soal */
const bank=JSON.parse(run('JSON.stringify(Object.entries(SOAL).map(([k,a])=>[k,a.length,a.filter(s=>!s.o||s.o.length<2||new Set(s.o).size!==s.o.length||(s.lucu&&(!s.r||s.r.length!==s.o.length))).map(s=>s.q)]))'));
for(const [k,n,rusak] of bank){ cek('bank '+k+' punya ≥3 soal & opsi valid',n>=3&&!rusak.length,rusak.length?rusak:n); }
const jur=JSON.parse(run('JSON.stringify(JURUSAN.map(j=>j.k))'));
cek('tiap jurusan punya bank soal & karier',jur.every(k=>run(`!!SOAL['k_${k}']&&!!KARIER['${k}']`)),jur);

/* 2) form maks. 5 soal */
run(`globalThis.__MAXQ=0; const __ls=lembarSoal; lembarSoal=function(j,i,soal,d){ __MAXQ=Math.max(__MAXQ,soal.length); return __ls(j,i,soal,d); };`);

/* 3) nama ujian & jalur sesuai era */
cek('EBTANAS sebelum 2003',run("namaUjianAkhir('SMA',2000)")==='EBTANAS');
cek('UN dibatalkan 2020',run("namaUjianAkhir('SMA',2020)")===null);
cek('Asesmen Nasional sejak 2021',run("namaUjianAkhir('SMP',2022)")==='Asesmen Nasional');
cek('SBMPTN 2015',run("namaSeleksi(2015).tes")==='SBMPTN');
cek('SNBP/SNBT sejak 2023',run("namaSeleksi(2024).rapor")==='SNBP'&&run("namaSeleksi(2024).tes")==='UTBK-SNBT');
cek('Bidikmisi 2015, KIP Kuliah 2021',run("namaBeasiswa(2015)")==='Bidikmisi'&&run("namaBeasiswa(2021)")==='KIP Kuliah');

/* 4) banyak hidup acak: pastikan kuliah berjalan sampai wisuda */
run(`
  globalThis.__ERR=[]; globalThis.__W=0; globalThis.__KUL=0; globalThis.__IPK=[]; globalThis.__SEM=[]; globalThis.__JUDUL={};
  const __ask=ask; ask=function(d){ __JUDUL[d.title.split(' — ')[0].replace(/ \\d+.*$/,'')]=1; return __ask(d); };
  function __drain(){ let g=0; while(G.current&&g++<400){ const o=G.current.opts; let i=Math.floor(Math.random()*o.length);
      const kul=o.findIndex(x=>x.t==='Kuliah'); if(kul>=0&&Math.random()<0.85)i=kul;
      try{ choose(i); }catch(e){ __ERR.push('choose '+G.current&&G.current.title+': '+e.message); G.current=null; } } }
  for(let n=0;n<220;n++){
    try{
      newGame(); __drain(); let pernah=false, g=0;
      while(P&&P.alive&&P.age<30&&g++<40){
        if(Math.random()<0.5){ try{ doAct('belajar'); }catch(e){ __ERR.push('belajar: '+e.message); } __drain(); }
        if(P.kuliah)pernah=true;
        const k=P.kuliah;
        advance(); __drain();
        if(k&&!P.kuliah&&P.eduLevel>=4){ __W++; __IPK.push(P.ipk); __SEM.push(k.ips.length+'/'+(k.lama*2)); }
      }
      if(pernah)__KUL++;
    }catch(e){ __ERR.push('hidup: '+e.message); }
  }
`);
const nErr=run('__ERR.length'), err=run('__ERR.slice(0,10)');
const kul=run('__KUL'), w=run('__W'), ipk=JSON.parse(run('JSON.stringify(__IPK)')), sem=JSON.parse(run('JSON.stringify(__SEM)'));
const judul=Object.keys(JSON.parse(run('JSON.stringify(__JUDUL)')));
cek('tanpa error saat hidup acak',nErr===0,nErr?err:0);
cek('ada yang kuliah & wisuda',kul>20&&w>10,{kuliah:kul,wisuda:w});
cek('IPK selalu 2.00–4.00',ipk.every(x=>x>=2&&x<=4&&isFinite(x)),ipk.slice(0,8));
cek('semester lengkap saat wisuda',sem.every(s=>{const [a,b]=s.split('/').map(Number);return a>=b-1;}),sem.slice(0,8));
cek('form tidak pernah lebih dari 5 soal',run('__MAXQ')<=5&&run('__MAXQ')>0,run('__MAXQ'));
const wajib=['LATIHAN SOAL','JALUR MASUK KULIAH','PILIH JURUSAN','OSPEK','SEMESTER','UAS SEMESTER','KKN DI DESA','SKRIPSI: JUDUL DITOLAK','JADWAL SIDANG SKRIPSI','SIDANG SKRIPSI'];
const hilang=wajib.filter(t=>!judul.some(j=>j.startsWith(t)));
cek('pop-up sekolah & kuliah muncul semua',!hilang.length,hilang);

/* 5) skripsi ditunda → kuliah molor */
run(`newGame(); __drain(); P.age=18; P.st.smart=80; P.kelas='kaya';
  P.kuliah={jur:'teknik',n:'Teknik',program:'pts',mulai:18,lama:4,biaya:0,beasiswa:true,sem:6,ips:[3,3,3,3,3,3],bonus:0,kkn:true,skripsi:0,molor:0};
  globalThis.__lamaAwal=P.kuliah.lama; sidangMulai(8); __drain();`);
cek('skripsi tertunda → masa kuliah molor',run('P.kuliah&&P.kuliah.lama')===run('__lamaAwal')+1);

let gagal=0;
for(const [n,ok,info] of hasil){ if(!ok)gagal++; if(!ok||process.env.VERBOSE)console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' → '+JSON.stringify(info))); }
console.log('SEKOLAH  pemeriksaan: '+hasil.length+' · kuliah '+kul+' hidup · wisuda '+w+' · rata-rata IPK '+(ipk.reduce((a,b)=>a+b,0)/Math.max(1,ipk.length)).toFixed(2));
console.log(gagal?'\n❌ '+gagal+' PEMERIKSAAN GAGAL':'\n✅ SEMUA TES SEKOLAH LOLOS');
process.exit(gagal?1:0);
