// Tes ARSIP PERANG (headless): perang acak tanpa error/NaN, semua akhir bisa tercapai, dan hukum dasar strategi berlaku
// (yang kuat lebih sering menang, negara seberang laut butuh penguasaan laut, postur bertahan lebih hemat nyawa).
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const dir=path.join(__dirname,'..','perang','js');
const code=(SEED+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n'))
  .replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,'');
const store={};
const ctx={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=''+v;},removeItem:k=>{delete store[k];}},console,setTimeout,clearTimeout};
ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(code,ctx,{filename:'perang.bundle.js'});
const run=s=>vm.runInContext(s,ctx);

run(`
globalThis.__ERR=[]; globalThis.__BAD=0; globalThis.__HASIL={}; globalThis.__SEEN={};
const __ask=ask; ask=function(d){ __SEEN[d.title]=1; return __ask(d); };
function __drain(){ let g=0; while(G.current&&g++<200){ try{ choose(Math.floor(Math.random()*G.current.opts.length)); }catch(e){ __ERR.push('kartu '+(G.current&&G.current.title)+': '+e.message); G.current=null; G.queue=[]; } } }
function __finite(){ if(!P.f)return; const xs=[P.dana,N.front,N.udara,N.laut,N.eskalasi,P.tewas,P.sipilLawan,P.sipilKita]; for(const k in P.st)xs.push(P.st[k]); for(const k in P.f)xs.push(P.f[k]); for(const k in N.e.f)xs.push(N.e.f[k]); for(const k in N.e.st)xs.push(N.e.st[k]);
  for(const x of xs)if(typeof x!=='number'||!isFinite(x)){ __BAD++; return; } for(const k in P.f)if(P.f[k]<0)__BAD++; }
/* mulai perang tertentu tanpa kartu */
function __mulai(a,b,tj){ newGame(); G.current=null; G.queue=[]; P.neg=a; P.lawan=b; mulaiPerang(tj); }
function __acak(){
  newGame(); __drain();
  let g=0;
  while(P.alive&&!G.over&&g++<140){
    const n=Math.floor(Math.random()*4);
    for(let i=0;i<n;i++){ const av=ACTS.filter(a=>{ try{ return actAvail(a).ok; }catch(e){ __ERR.push('avail '+a.k+': '+e.message); return false; } }); if(!av.length)break;
      const a=av[Math.floor(Math.random()*av.length)]; if(a.k==='menyerah'&&Math.random()<0.9)continue;
      try{ doAct(a.k); }catch(e){ __ERR.push('aksi '+a.k+': '+e.message); } __drain(); if(G.over)break; }
    if(G.over)break;
    try{ advance(); }catch(e){ __ERR.push('advance: '+e.message); break; } __drain(); __finite();
  }
  if(G.over){ __HASIL[P.hasil]=(__HASIL[P.hasil]||0)+1; try{ const v=nilaiAkhir(); if(!(v.menang>=0&&v.menang<=100&&v.manusia>=0&&v.manusia<=100))__BAD++; ringkasanPerang(); }catch(e){ __ERR.push('nilai: '+e.message); } }
  else __ERR.push('perang tidak berakhir dalam 140 minggu');
}
for(let i=0;i<400;i++){ try{ __acak(); }catch(e){ __ERR.push('sim: '+e.message); } }

/* ---- hukum strategi ---- */
globalThis.__CHK={};
/* 1) kuat vs lemah (berbatasan darat), dua-duanya menyerang biasa: yang kuat harus maju */
function __duel(a,b,tj,postur,minggu){ __mulai(a,b,tj); Object.assign(P.post,postur); for(let i=0;i<minggu&&!G.over;i++){ advance(); __drain(); if(!G.over)Object.assign(P.post,postur); } return {front:N.front,hasil:P.hasil,tewas:P.tewas,laut:N.laut}; }
let maju=0; for(let i=0;i<20;i++){ const x=__duel('chn','vnm','total',{d:'ofensif',u:'cas',l:'kawal'},25); if(x.front>15||x.hasil==='menang'||x.hasil==='menangTerbatas')maju++; } __CHK.kuatMaju=maju;
let lemah=0; for(let i=0;i<20;i++){ const x=__duel('mys','idn','total',{d:'ofensif',u:'cas',l:'kawal'},25); if(x.front>15)lemah++; } __CHK.lemahMaju=lemah;
/* 2) seberang laut tanpa angkatan laut: tidak bisa maju jauh walau darat kuat */
let nyebrang=0; for(let i=0;i<20;i++){ const x=__duel('prk','jpn','total',{d:'ofensif',u:'cas',l:'pangkalan'},25); if(x.front>20)nyebrang++; } __CHK.nyebrangTanpaLaut=nyebrang;
/* 3) bertahan lebih hemat nyawa daripada ofensif (lawan & lama sama) */
let tO=0,tB=0; for(let i=0;i<15;i++){ tO+=__duel('idn','mys','sengketa',{d:'ofensif',u:'cas',l:'kawal'},12).tewas; tB+=__duel('idn','mys','sengketa',{d:'bertahan',u:'cas',l:'kawal'},12).tewas; } __CHK.tewas=[+tO.toFixed(2),+tB.toFixed(2)];
/* 4) memojokkan negara bernuklir menaikkan eskalasi sampai muncul kartu ambang nuklir */
__mulai('usa','prk','total'); N.front=80; delete __SEEN['AMBANG NUKLIR']; for(let i=0;i<14&&!G.over;i++){ N.front=Math.max(N.front,80); advance(); __drain(); } __CHK.ambang=!!__SEEN['AMBANG NUKLIR'];
/* 5) maksimal 3 perintah khusus per minggu; postur tidak dihitung */
__mulai('idn','mys','sengketa'); P.dana=1e7; let jalan=0; for(const k of ['intel','lobi','propaganda','opsus','rotasi']){ const a=ACTS.find(x=>x.k===k); if(actAvail(a).ok){ doAct(k); __drain(); jalan++; } } __CHK.perintah=jalan; __CHK.posturMasihBisa=actAvail(ACTS.find(x=>x.k==='posturD')).ok;
/* 6) simpan → muat tidak merusak keadaan */
__mulai('idn','aus','bertahan'); advance(); __drain(); const snap=JSON.parse(JSON.stringify({P,N})); resumeGame({P:snap.P,N:snap.N,feed:[],tab:'darat',over:false}); try{ advance(); __drain(); __finite(); __CHK.muat=true; }catch(e){ __CHK.muat=false; __ERR.push('muat: '+e.message); }
/* 6b) perang yang melewati batas waktu membeku */
__mulai('idn','mys','sengketa'); N.minggu=MAKS_MINGGU-1; P.post.d='bertahan'; advance(); __drain(); __CHK.beku=P.hasil;
/* 6a) kekalahan total bisa terjadi: negara kecil yang terus mundur dari raksasa tetangganya */
let kalahN=0; for(let i=0;i<10;i++){ const x=__duel('vnm','chn','bertahan',{d:'mundur',u:'hemat',l:'pangkalan'},75); if(x.hasil==='kalah')kalahN++; } __CHK.kalahN=kalahN; pulihkanDunia();
/* 6c) peta dunia: negara yang kalah total jadi abu-abu, tidak bisa dipilih lagi, dan bisa dipulihkan */
pulihkanDunia();
__mulai('usa','bra','total'); akhiri('menang','uji'); __CHK.abu=sudahKalah('bra')&&!sudahKalah('usa');
newGame(); while(G.current&&G.current.title!=='PILIH NEGARA')choose(0);
__CHK.takBisaDipilih=!!G.current&&!G.current.opts.some(o=>o.t==='Brasil')&&G.current.opts.some(o=>o.t==='Indonesia'); G.current=null; G.queue=[];
__mulai('mys','idn','total'); akhiri('kalah','uji'); __CHK.kitaAbu=sudahKalah('mys');
__mulai('ind','pak','total'); akhiri('kiamat','uji'); __CHK.duaAbu=sudahKalah('ind')&&sudahKalah('pak');
__mulai('idn','aus','sengketa'); akhiri('menangTerbatas','uji'); __CHK.terbatasTidak=!sudahKalah('aus');
__CHK.peta=typeof petaDunia==='function'&&NEGARA.every(c=>POS[c.k]&&KODE[c.k])&&/class="pd-neg mati"/.test(petaDunia());
pulihkanDunia(); __CHK.pulih=!sudahKalah('bra')&&negaraHidup().length===NEGARA.length;
/* 7) basis data utuh */
__CHK.negara=NEGARA.length; __CHK.dataRusak=NEGARA.filter(c=>!(c.aktif>0&&c.pdb>0&&c.tek>0&&MEDAN[c.geo])).map(c=>c.k);
__CHK.batasTakDikenal=BATAS_DARAT.filter(p=>p.split('-').some(k=>!NEG[k]));
`);
const chk=JSON.parse(run('JSON.stringify(__CHK)')), hasil=JSON.parse(run('JSON.stringify(__HASIL)')), err=JSON.parse(run('JSON.stringify(__ERR)')), bad=run('__BAD'), seen=Object.keys(JSON.parse(run('JSON.stringify(__SEEN)')));
const fail=[];
if(err.length)fail.push(err.length+' error');
if(bad)fail.push(bad+' nilai tak sah');
if(chk.beku!=='beku')fail.push('perang tidak membeku di batas waktu ('+chk.beku+')');
if(!(chk.kalahN>=1))fail.push('kekalahan total tak pernah terjadi ('+chk.kalahN+'/10)');
for(const h of ['menang','menangTerbatas','damai','damaiRugi','jatuh'])if(!hasil[h])fail.push('akhir "'+h+'" tak pernah tercapai');
if(!(chk.kuatMaju>=16))fail.push('negara kuat gagal maju ('+chk.kuatMaju+'/20)');
if(!(chk.lemahMaju<=4))fail.push('negara lemah terlalu mudah maju ('+chk.lemahMaju+'/20)');
if(!(chk.nyebrangTanpaLaut<=2))fail.push('menyeberang laut tanpa angkatan laut ('+chk.nyebrangTanpaLaut+'/20)');
if(!(chk.tewas[1]<chk.tewas[0]))fail.push('bertahan tidak lebih hemat nyawa '+chk.tewas);
if(!chk.ambang)fail.push('kartu ambang nuklir tak muncul');
if(chk.perintah!==3||!chk.posturMasihBisa)fail.push('batas perintah per minggu ('+chk.perintah+', postur '+chk.posturMasihBisa+')');
if(!chk.muat)fail.push('simpan/muat');
if(!(chk.abu&&chk.takBisaDipilih&&chk.kitaAbu&&chk.duaAbu&&chk.terbatasTidak&&chk.peta&&chk.pulih))fail.push('peta dunia '+JSON.stringify({abu:chk.abu,pilih:chk.takBisaDipilih,kita:chk.kitaAbu,dua:chk.duaAbu,terbatas:chk.terbatasTidak,peta:chk.peta,pulih:chk.pulih}));
if(chk.dataRusak.length||chk.batasTakDikenal.length)fail.push('basis data: '+chk.dataRusak+' '+chk.batasTakDikenal);
console.log('PERANG  error:',err.length,err.slice(0,8),'| nilai tak sah:',bad);
console.log('  akhir perang (400 perang acak):',hasil);
console.log('  kartu unik:',seen.length,'| negara di basis data:',chk.negara);
console.log('  kuat maju '+chk.kuatMaju+'/20 · lemah maju '+chk.lemahMaju+'/20 · menyeberang tanpa laut '+chk.nyebrangTanpaLaut+'/20 · gugur ofensif/bertahan '+chk.tewas.join(' / ')+' ribu · ambang nuklir '+chk.ambang+' · perintah/minggu '+chk.perintah);
console.log(fail.length?'\n❌ GAGAL → '+fail.join('; '):'\n✅ SEMUA TES PERANG LOLOS');
process.exit(fail.length?1:0);
