// Uji form soal (assets/kuis.js) dengan DOM sungguhan (jsdom) di IT, WNI, dan Kehidupan:
// jawaban yang dicentang benar-benar terbaca, soal kosong ditahan, pindah laci tidak menghapus centang,
// tombol angka tidak bisa mengumpulkan form yang belum lengkap.
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT=path.join(__dirname,'..');

function muat(game){
  const vc=new VirtualConsole(); const err=[];
  vc.on('jsdomError',e=>{ const m=String(e&&e.message||e); if(!/Not implemented|scrollTo|focus/i.test(m))err.push(m); });
  const dom=new JSDOM(fs.readFileSync(path.join(ROOT,game+'.html'),'utf8'),{runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc,url:'http://localhost/'});
  const win=dom.window; win.scrollTo=()=>{};
  const dir=path.join(ROOT,game,'js');
  const art=fs.readFileSync(path.join(ROOT,'assets','art.js'),'utf8');
  const code=SEED+art+'\n;\n'+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
  const ctx=dom.getInternalVMContext();
  vm.runInContext(code,ctx,{filename:game+'.bundle.js'});
  const run=s=>vm.runInContext(s,ctx);
  run(`window.__q=s=>document.querySelector(s); window.__qa=s=>Array.prototype.slice.call(document.querySelectorAll(s));
    window.__klik=el=>el&&el.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true}));
    window.__siap=function(){ let g=0; while(g++<60){ const ok=__q('.aa-creator [data-cr="ok"]'); if(ok){ __klik(ok); continue; } if(!G.current)break; choose(0); } };
    window.__siap();`);
  return {run,err};
}
const SOAL=`[{q:'Satu tambah satu?',o:['2','3','4','5']},{q:'Ibu kota Indonesia (UU IKN)?',o:['Nusantara','Bandung','Medan','Surabaya']},{q:'Warna langit cerah?',o:['biru','hijau','ungu','merah']}]`;
/* pilih opsi benar (indeks 0 di bank) untuk soal ke-qi pada form yang tampil */
const PILIH_BENAR=`function __pilih(qi,salah){ const q=__qa('.kz-q')[qi]; if(!q)return; const r=q.querySelectorAll('input[type=radio]'); for(const x of r){ if((x.value==='0')!==!!salah){ x.checked=true; x.dispatchEvent(new window.Event('change',{bubbles:true})); return; } } }`;

const hasil=[]; const cek=(n,ok,info)=>hasil.push([n,!!ok,info]);
for(const game of ['it','wni','kehidupan']){
  const {run,err}=muat(game);
  run(PILIH_BENAR);

  // 1. semua benar → terbaca benar semua (bug lama: semua "tidak dijawab")
  run(`window.__H=null; Kuis.lembar('UJI',null,${SOAL},h=>{ window.__H=h; }); __pilih(0); __pilih(1); __pilih(2); __klik(__q('#kartu button[data-i]'));`);
  const h1=JSON.parse(run('JSON.stringify(window.__H)'));
  cek(game+': jawaban yang dicentang terbaca (3/3 benar)',h1&&h1.benar===3&&h1.jumlah===3,h1);

  // 2. campuran benar/salah terhitung tepat
  run(`window.__H=null; Kuis.lembar('UJI',null,${SOAL},h=>{ window.__H=h; }); __pilih(0); __pilih(1,true); __pilih(2); __klik(__q('#kartu button[data-i]'));`);
  const h2=JSON.parse(run('JSON.stringify(window.__H)'));
  cek(game+': 1 salah → 2/3 benar',h2&&h2.benar===2,h2);

  // 3. ada soal kosong → tidak terkumpul, soal kosong ditandai, form tetap tampil
  run(`window.__H=null; Kuis.lembar('UJI',null,${SOAL},h=>{ window.__H=h; }); __pilih(0); __klik(__q('#kartu button[data-i]'));`);
  cek(game+': soal kosong menahan pengumpulan',run('window.__H===null&&!!__q("#kartu .kz")'));
  cek(game+': soal kosong ditandai + pesan peringatan',run('__qa(".kz-q.kz-miss").length===2&&/2 soal/.test((__q(".kz-warn")||{}).textContent||"")'),run('(__q(".kz-warn")||{}).textContent'));

  // 4. pindah laci (render ulang) tidak menghapus centang
  run(`const t=__qa('#tabs button[data-tab]'); if(t.length)__klik(t[t.length-1]); render();`);
  cek(game+': render ulang tidak menghapus centang',run('__qa("#kartu .kz input:checked").length===1'));

  // 5. tombol angka tidak mengumpulkan form yang belum lengkap
  run(`document.body.dispatchEvent(new window.KeyboardEvent('keydown',{key:'1',bubbles:true,cancelable:true}));`);
  cek(game+': tombol angka ditahan saat form belum lengkap',run('window.__H===null&&!!__q("#kartu .kz")'));

  // 6. setelah dilengkapi → terkumpul dengan benar
  run(`__pilih(1); __pilih(2); const __b=__q('#kartu button[data-i]'); if(__b)__klik(__b);`);
  const h3=JSON.parse(run('JSON.stringify(window.__H)'));
  cek(game+': setelah dilengkapi terkumpul 3/3',h3&&h3.benar===3,h3);

  // 7. soal berbobot (w) terbaca poinnya
  run(`window.__H=null; Kuis.lembar('UJI',null,[{q:'Sikap?',o:['baik','cukup','buruk'],w:[5,3,1]}],h=>{ window.__H=h; }); __pilih(0); __klik(__q('#kartu button[data-i]'));`);
  const h4=JSON.parse(run('JSON.stringify(window.__H)'));
  cek(game+': soal berbobot terbaca (5/5 poin)',h4&&h4.poin===5&&h4.poinMaks===5,h4);

  cek(game+': tanpa error DOM',err.length===0,err.slice(0,3));
}

// Kehidupan: lembar soal sekolah memakai mesin yang sama
{
  const {run}=muat('kehidupan'); run(PILIH_BENAR);
  run(`window.__B=null; lembarSoal('UJI SEKOLAH',null,${SOAL},(b,n)=>{ window.__B=[b,n]; }); __pilih(0); __pilih(1); __pilih(2); __klik(__q('#kartu button[data-i]'));`);
  const b=JSON.parse(run('JSON.stringify(window.__B)'));
  cek('kehidupan: lembar soal sekolah terbaca 3/3',b&&b[0]===3&&b[1]===3,b);
}
// IT: form latihan/sertifikasi lewat aksi sungguhan
{
  const {run}=muat('it'); run(PILIH_BENAR);
  run(`P.money=1e9; P.st.jaringan=90; window.__s0=P.sertifikat.length; ujianSertifikasi(SERT_JALUR.find(j=>j.k==='net'),0);
    __qa('.kz-q').forEach((_,i)=>__pilih(i)); __klik(__q('#kartu button[data-i]'));`);
  cek('it: ujian sertifikasi dijawab benar semua → lulus',run('sertGrade("net")===0'),run('JSON.stringify(P.sertifikat)'));
}

let gagal=0;
for(const [n,ok,info] of hasil){ if(!ok)gagal++; console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' → '+JSON.stringify(info))); }
console.log(gagal?'\n❌ '+gagal+' PEMERIKSAAN GAGAL':'\n✅ SEMUA TES FORM SOAL (DOM) LOLOS');
process.exit(gagal?1:0);
