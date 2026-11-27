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

// ASET KANTOR: monitoring & backup dibiayai perusahaan, bukan gaji karyawan
run(`__baru(); P.money=50e6; __J.length=0; doAct('observability');`);
cek('karyawan: pasang monitoring → kartu ajukan anggaran, bukan potong uang',run('__J.includes("AJUKAN ANGGARAN MONITORING & ALERTING")&&P.money===50e6'),run('JSON.stringify([__J,P.money])'));
run(`choose(G.current.opts.length-1);`);
cek('"Nanti saja" mengembalikan jatah aksi',run('!P.used.observability&&!P.obsv'));
run(`globalThis.__uang=[]; for(let i=0;i<40&&!P.obsv;i++){ P.used={}; P.reputasi=90; P.st.soft=90; const m=P.money; doAct('observability'); choose(0); __uang.push(m-P.money); }`);
cek('proposal bisa disetujui & biaya ditanggung kantor (uang pribadi utuh)',run('P.obsv&&__uang.every(x=>x===0)'),run('JSON.stringify([P.obsv,__uang.slice(0,5)])'));
run(`__baru(); P.money=50e6; P.st.sistem=95; globalThis.__l0=P.lembur||0; for(let i=0;i<40&&!P.backupKuat;i++){ P.used={}; doAct('backup'); choose(1); }`);
cek('jalur open-source: gratis tapi menambah lembur',run('P.backupKuat&&P.money===50e6&&P.lembur>__l0'),run('JSON.stringify([P.backupKuat,P.money,P.lembur])'));
run(`__baru(); P.founder=true; P.money=50e6; __J.length=0; doAct('observability');`);
cek('founder startup sendiri: bayar dari kas sendiri, tanpa proposal',run('P.obsv&&P.money===30e6&&!__J.some(t=>/ANGGARAN/.test(t))'),run('JSON.stringify([P.obsv,P.money,__J])'));
cek('keterangan aksi menyebut siapa yang bayar',run(`(()=>{ const a=ACTS.find(x=>x.k==='backup'); P.founder=false; const s1=a.sub(); P.founder=true; const s2=a.sub(); return /Dibayar kantor/.test(s1)&&/kas startup/.test(s2); })()`));
run(`globalThis.__kb=[]; for(let i=0;i<60;i++){ __baru(); P.obsv=true; P.backupKuat=true; P.founder=true; P.tempat='startup'; kondisiKantorBaru(); __kb.push([P.obsv,P.backupKuat,P.founder]); }`);
cek('pindah kantor: monitoring/backup kantor lama tidak ikut terbawa',run('__kb.some(x=>!x[0])&&__kb.some(x=>!x[1])&&__kb.every(x=>!x[2])'));

// PROMOSI: skill karier = skill utama spesialisasi, bukan rata-rata 4 skill
run(`__baru(); P.spes='network'; P.st.jaringan=80; P.st.sistem=60; P.st.ngoding=10; P.st.keamanan=10;`);
cek('skill karier spesialis jaringan tidak tertahan skill coding',run('skillKarier()>=70'),run('skillKarier()'));

// TIM: mulai memimpin tim saat naik ke Lead
run(`__baru(); naikJab('lead');`);
cek('naik Lead → mewarisi tim 2–3 orang & laci TIM aktif',run('adaTim()&&P.tim.anggota.length>=2&&P.tim.anggota.length<=3&&ACTS.some(a=>a.tab==="tim"&&actAvail(a).ok)'),run('JSON.stringify(P.tim&&P.tim.anggota.length)'));
// kandidat: CV yang melebih-lebihkan terungkap lewat tes teknis
run(`globalThis.__oc=[]; for(let i=0;i<300;i++){ const k=buatKandidat('medior'); if(k.sifat==='overclaim')__oc.push(k.skillCV-k.skill); }`);
cek('kandidat "melebih-lebihkan CV": skill asli jauh di bawah klaim',run('__oc.length>5&&__oc.every(d=>d>=10)'),run('__oc.slice(0,5)'));
run(`globalThis.__k=buatKandidat('junior'); wawancaraKandidat(__k,[__k]); choose(0);`);
cek('wawancara: pertanyaan "tes teknis" mengungkap skill asli',run('__k.tahu.skill===true&&__k.ditanya===1'));
run('__drain(99);');
// negosiasi: tawaran ≥ gaji minimal diterima, anggota masuk dengan gaji itu; rekan setara bergaji lebih rendah iri
run(`P.tim.anggota=[]; const o=buatOrangTim('medior'); o.gaji=5e6; o.moral=70; P.tim.anggota.push(o); globalThis.__o=o;
  globalThis.__terima=0; for(let i=0;i<20;i++){ const k=buatKandidat('medior'); P.tim.anggota=P.tim.anggota.filter(m=>m===__o); const n=P.tim.anggota.length; putuskanTawaran(k,Math.round(k.ask*1.1/1e5)*1e5,[k]); __drain(99); if(P.tim.anggota.length>n)__terima++; }`);
cek('tawaran di atas permintaan hampir selalu diterima',run('__terima>=17'),run('__terima'));
cek('rekan setara yang digaji lebih rendah jadi iri (moral turun)',run('__o.moral<70'),run('__o.moral'));
run(`globalThis.__tolak=0; for(let i=0;i<40;i++){ const k=buatKandidat('senior'); const n=P.tim.anggota.length; putuskanTawaran(k,Math.round(k.min*0.7/1e5)*1e5,[k]); __drain(99); if(P.tim.anggota.length===n)__tolak++; else P.tim.anggota.pop(); }`);
cek('tawaran jauh di bawah gaji minimal umumnya ditolak',run('__tolak>=30'),run('__tolak'));
// proses tahunan: tumbuh, moral, resign — tanpa error selama puluhan tahun
run(`__baru(); naikJab('lead'); globalThis.__ok=true; try{ for(let y=0;y<30;y++){ P.tim.arah=pick(Object.keys(ARAHAN_TIM)); timTahunan(); __drain(); if(P.tim.anggota.length<2)P.tim.anggota.push(buatOrangTim('junior')); } }catch(e){ __ok=e.message; }`);
cek('30 tahun proses tim tanpa error',run('__ok===true'),run('__ok'));
// founder membayar gaji tim dari kas sendiri; karyawan tidak
run(`__baru(); P.founder=true; P.tim={anggota:[buatOrangTim('senior')],arah:'stabil',ekstra:0,tahun:0}; P.tim.anggota[0].gaji=20e6; P.tim.anggota[0].moral=100; P.tim.anggota[0].sifat='kolaboratif'; P.tim.anggota[0].hobi='baca'; P.tim.anggota[0].motif=2; P.tim.anggota[0].skill=60; P.money=1e9; timTahunan(); __drain(99); globalThis.__mf=1e9-P.money;`);
cek('founder: gaji tim setahun dibayar dari kas startup',run('__mf>=240e6'),run('__mf'));
run(`__baru(); naikJab('lead'); P.money=1e9; timTahunan(); __drain(99);`);
cek('karyawan: gaji tim dibayar perusahaan (uang pribadi utuh)',run('P.money===1e9'),run('P.money'));
// pindah kantor: tim lama tidak ikut, Lead mewarisi tim baru
run(`__baru(); naikJab('lead'); const lama=P.tim.anggota.map(m=>m.id).join(); kondisiKantorBaru(); globalThis.__beda=P.tim&&P.tim.anggota.map(m=>m.id).join()!==lama;`);
cek('pindah kantor sebagai Lead: tim lama ditinggal, tim baru diwarisi',run('__beda===true'));

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
