// Uji fitur baru Simulator IT: mini-game teknis, latar acak, satir, jalur baru, kehidupan kantor, postmortem.
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','it','js');
let code=SEED+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
code=code.replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,'');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console,setTimeout,clearTimeout};
sb.globalThis=sb;
const c=vm.createContext(sb); const run=s=>vm.runInContext(s,c);
run(code);
run(`globalThis.__J=[]; const __a=ask; ask=function(d){ __J.push(d.title); return __a(d); };
  function __drain(pilih){ let g=0; while(G.current&&g++<300){ const n=G.current.opts.length; choose(pilih!=null?Math.min(pilih,n-1):Math.floor(Math.random()*n)); } }
  function __baru(){ newGame(); __drain(0); }`);
const hasil=[]; const cek=(n,ok,info)=>hasil.push([n,!!ok,info]);

// bank soal
const bank=JSON.parse(run('JSON.stringify(Object.entries(SOAL_IT).map(([k,a])=>[k,a.length,a.filter(s=>!s.o||s.o.length<2||new Set(s.o).size!==s.o.length||(s.w&&s.w.length!==s.o.length)).length]))'));
for(const [k,n,rusak] of bank)cek('bank IT '+k+' cukup & valid',n>=(k==='sd'?3:5)&&!rusak,{n,rusak});
cek('tiap spesialisasi punya kategori soal',run('SPES.every(s=>KAT_SPES[s.k]&&KAT_SPES[s.k].every(k=>SOAL_IT[k]))'));
cek('jaringan & IoT punya bank soal terpisah (tak ada soal yang sama)',run('SOAL_IT.net&&SOAL_IT.iot&&!SOAL_IT.net.some(s=>SOAL_IT.iot.some(t=>t.q===s.q))'));
cek('fokus belajar jaringan & IoT terpisah',run('FOKUS_IT.find(f=>f.k==="jaringan").kat.join()==="net"&&FOKUS_IT.find(f=>f.k==="iot").kat.join()==="iot"'));
// tiap jalur sertifikasi: bank soal cukup untuk setiap tingkat (≥5 soal per tingkat 1/2/3), 4 gelar, biaya naik per grade
const jal=JSON.parse(run(`JSON.stringify(SERT_JALUR.map(j=>{ const b=SOAL_IT[j.soal]||[]; const n=d=>b.filter(s=>(s.d||1)===d).length;
  return {k:j.k,d1:n(1),d2:n(2),d3:n(3),gelar:j.gelar.length,naik:j.biaya.every((x,i)=>!i||x>j.biaya[i-1])}; }))`));
for(const j of jal)cek('sertifikasi '+j.k+': 4 grade, biaya naik, soal per tingkat cukup',j.gelar===4&&j.naik&&j.d1>=5&&j.d2>=5&&j.d3>=5,j);
cek('grade 0..3 bernama Fundamental → Expert, makin sulit',run(`GRADE.map(g=>g.n).join()==="Fundamental,Associate,Professional,Expert"&&GRADE.every((g,i)=>!i||(g.skill>=GRADE[i-1].skill&&g.mix.reduce((a,b)=>a+b)>GRADE[i-1].mix.reduce((a,b)=>a+b)))`));
// soal ujian mengikuti tingkat grade
run(`__baru(); globalThis.__mix=GRADE.map(g=>soalTingkat(['net'],g.mix).map(s=>s.d||1));`);
cek('soal ujian sesuai tingkat grade (Fundamental semua dasar, Expert semua lanjut)',run('__mix[0].every(d=>d===1)&&__mix[3].every(d=>d===3)&&__mix.every(m=>m.length===5)'),run('__mix'));

// latar acak
run(`globalThis.__L={}; for(let i=0;i<200;i++){ __baru(); __L[P.latar]=(__L[P.latar]||0)+1; }`);
const L=JSON.parse(run('JSON.stringify(__L)'));
cek('kelima latar muncul',run('LATAR_IT.every(l=>__L[l.k]>0)'),L);
cek('usia mengikuti latar (SMK 19, switcher 27)',run(`(()=>{ for(let i=0;i<100;i++){ __baru(); if(P.latar==='smk'&&P.age!==19)return false; if(P.latar==='switcher'&&P.age!==27)return false; } return true; })()`));

// belajar → form 3 soal
run(`__baru(); __J.length=0; doAct('belajar'); __drain(0); __drain();`);
cek('belajar memunculkan latihan soal',run('__J.some(t=>t.startsWith("LATIHAN"))'),run('__J'));

// belajar IoT: soal hanya dari bank IoT
run(`__baru(); __J.length=0; globalThis.__lembar=Kuis.lembar; globalThis.__soalIoT=null; Kuis.lembar=function(j,i,s,d,o){ if(/^LATIHAN/.test(j))__soalIoT=s.map(x=>x.q); return __lembar(j,i,s,d,o); };
  doAct('belajar'); choose(FOKUS_IT.findIndex(f=>f.k==='iot')); __drain(0); Kuis.lembar=__lembar;`);
cek('latihan IoT hanya berisi soal IoT',run('__soalIoT&&__soalIoT.length===3&&__soalIoT.every(q=>SOAL_IT.iot.some(s=>s.q===q))'),run('__soalIoT'));

// sertifikasi: gagal → biaya hangus, pintar → lulus
const NET='SERT_JALUR.find(j=>j.k==="net")';
run(`__baru(); P.money=100e6; globalThis.__KUIS_PINTAR=false; ujianSertifikasi(${NET},0); __drain(0); globalThis.__sertBayar=100e6-P.money;`);
cek('sertifikasi: biaya ujian dipotong (lulus atau tidak)',run(`__sertBayar>=${NET}.biaya[0]`),run('__sertBayar'));
run(`__baru(); P.money=100e6; globalThis.__KUIS_PINTAR=true; ujianSertifikasi(${NET},0); __drain(0); globalThis.__KUIS_PINTAR=false;`);
cek('sertifikasi: pemain pintar lulus Grade 0 (Fundamental)',run('sertGrade("net")===0'),run('JSON.stringify(P.sertifikat)'));
// jenjang: grade berikutnya butuh grade sebelumnya + syarat skill + jenjang karier
run(`__baru(); P.money=1e9; P.st.jaringan=30;`);
cek('grade berikutnya = Associate, dikunci skill rendah',run(`(()=>{ P.sertifikat=['net0']; const b=sertBisa(${NET}); return b.g===1&&!b.ok&&/skill/.test(b.why); })()`),run(`JSON.stringify(sertBisa(${NET}))`));
cek('Professional dikunci jenjang Junior',run(`(()=>{ P.sertifikat=['net0','net1']; P.st.jaringan=90; P.jab='junior'; const b=sertBisa(${NET}); return b.g===2&&!b.ok&&/jenjang/.test(b.why); })()`),run(`JSON.stringify(sertBisa(${NET}))`));
cek('Expert terbuka untuk Senior berskill tinggi',run(`(()=>{ P.sertifikat=['net0','net1','net2']; P.st.jaringan=90; P.jab='senior'; const b=sertBisa(${NET}); return b.g===3&&b.ok; })()`));
run(`globalThis.__KUIS_PINTAR=true; ujianSertifikasi(${NET},3); __drain(0); globalThis.__KUIS_PINTAR=false;`);
cek('lulus Expert → grade 3 + tanda jasa',run('sertGrade("net")===3&&!!P.ach.sertExpert'));
cek('setelah Expert, jalur itu tertutup (grade tertinggi)',run(`sertBisa(${NET}).max===true`));
cek('bonus insiden & gaji naik mengikuti grade',run(`sertBonusDomain('jaringan')===GRADE[3].bonus&&sertBonusGaji()>0`));
// menu sertifikasi: "Nanti saja" tidak menghabiskan jatah aksi tahunan
run(`__baru(); P.money=50e6; __J.length=0; doAct('sertifikasi'); __drain(99);`);
cek('menu sertifikasi muncul & "Nanti saja" mengembalikan jatah aksi',run('__J.includes("AMBIL SERTIFIKASI")&&!P.used.sertifikasi'),run('JSON.stringify([__J,P.used])'));
// migrasi save lama (sebelum ada grade)
run(`__baru(); P.sertifikat=['ccnp','oscp','cka','pmp','cloud','zzz']; migrasiSertifikat();`);
cek('save lama dimigrasi ke jalur + grade',run('sertGrade("net")===2&&sertGrade("sec")===2&&sertGrade("k8s")===2&&sertGrade("pm")===2&&sertGrade("cloud")===1&&P.sertifikat.length===5'),run('JSON.stringify(P.sertifikat)'));

// CTF
run(`__baru(); P.st.keamanan=60; __J.length=0; doAct('ctf'); __drain();`);
cek('CTF memunculkan tantangan',run('__J.includes("KOMPETISI CTF")'));

// wawancara teknis saat mencari kerja
run(`__baru(); __J.length=0; cariKerja(); __drain(0); __drain();`);
cek('mencari kerja lewat wawancara teknis',run('__J.includes("WAWANCARA TEKNIS")'),run('__J'));

// remote luar negeri: pemain pintar diterima
run(`__baru(); P.st.soft=70; P.st.ngoding=80; globalThis.__KUIS_PINTAR=true; lamarRemoteLN(); __drain(0); globalThis.__KUIS_PINTAR=false;`);
cek('remote LN: lolos → kerja remote',run("P.tempat==='remote'"),run('P.tempat'));

// postmortem setelah insiden besar
run(`__baru(); __J.length=0; const c0=buatInsiden(); c0.parah='besar'; c0.clues=[]; terapkan(c0,{ok:true}); __drain(0);`);
cek('postmortem muncul setelah insiden besar',run('__J.includes("POSTMORTEM INSIDEN")'),run('__J'));
cek('blameless menaikkan budaya tim',run('P.budaya>50'),run('P.budaya'));

// penilaian kinerja & PIP
run(`__baru(); P.pip=1; __J.length=0; hasilKinerja(10); __drain(0);`);
cek('kinerja buruk dua kali → PIP',run('__J.includes("PERFORMANCE IMPROVEMENT PLAN")'),run('__J'));
run(`__baru(); P.pip=0; hasilKinerja(90); __drain(0);`);
cek('kinerja bagus → Exceeds',run('!!P.ach.exceeds'));

// ISA bootcamp
run(`(()=>{ for(let i=0;i<100;i++){ __baru(); if(P.latar==='bootcamp')break; } })(); P.isa=24; const m=P.money; eventsIT(); __drain(0); globalThis.__isa=[P.isa,m-P.money];`);
cek('ISA bootcamp memotong gaji',run('__isa[0]===12'),run('__isa'));

// banyak karier acak: satir & kantor muncul, tanpa error
run(`globalThis.__E=[]; for(let i=0;i<120;i++){ try{ __baru(); let g=0; while(P.alive&&!G.over&&g++<40){ const av=ACTS.filter(a=>actAvail(a).ok); for(let k=0;k<2&&av.length;k++){ try{ doAct(av[Math.floor(Math.random()*av.length)].k); }catch(e){ __E.push(e.message); } __drain(); } try{ advance(); }catch(e){ __E.push('advance: '+e.message); break; } __drain(); } }catch(e){ __E.push(e.message); } }`);
cek('120 karier acak tanpa error',run('__E.length')===0,run('__E.slice(0,5)'));
const judul=run('__J');
for(const t of ['PENILAIAN KINERJA TAHUNAN','"KAMU ANAK IT, KAN?"','DEPLOY JUMAT SORE','LATAR BELAKANG','WAWANCARA TEKNIS'])cek('muncul: '+t,judul.includes(t));

let gagal=0;
for(const [n,ok,info] of hasil){ if(!ok)gagal++; console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' → '+JSON.stringify(info))); }
console.log(gagal?'\n❌ '+gagal+' PEMERIKSAAN GAGAL':'\n✅ SEMUA TES IT BARU LOLOS');
process.exit(gagal?1:0);
