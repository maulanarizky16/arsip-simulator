// Uji urutan lapisan (z-index) tampilan. Kolom kiri desktop (section.doc) dibuat sticky dengan z-index;
// semua lapisan layar penuh di luar kolom itu harus berada DI ATAS-nya, kalau tidak pop-up tertutup
// (bug: pop-up "Berkas belum ditutup" tertimpa kolom log saat game dibuka ulang).
'use strict';
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const css=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* z-index terakhir yang berlaku untuk selector (urutan file = urutan dimuat: game → art → platform → theme) */
function zOf(sel,files){
  let z=null;
  const esc=sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp('(?:^|[},\\s])(?:html\\s+)?'+esc+'\\s*\\{[^}]*?z-index:\\s*(-?\\d+)','g');
  for(const f of files){ let m; const t=css(f); while((m=re.exec(t)))z=+m[1]; }
  return z;
}
const hasil=[]; const cek=(n,ok,info)=>hasil.push([n,!!ok,info]);
for(const g of ['it','wni','kehidupan','hakim','negara','niaga']){
  const files=[g+'/style.css','assets/art.css','platform.css','assets/theme.css'];
  const doc=zOf('main > section.doc',files);
  cek(g+': kolom kiri sticky punya z-index',doc!=null,doc);
  for(const [nama,sel] of [['pop-up berkas/layar akhir (#overlay)','#overlay'],['pop-up buat karakter','.aa-creator'],
                           ['modal platform','.arsip-modal'],['dialog handle/bagikan','.arsip-handle-wrap, .arsip-share-wrap']]){
    const z=zOf(sel,files);
    cek(g+': '+nama+' di atas kolom kiri',z!=null&&z>doc,{z,doc});
  }
}
let gagal=0;
for(const [n,ok,info] of hasil){ if(!ok)gagal++; console.log('  '+(ok?'ok  ':'GAGAL')+' · '+n+(ok?'':' → '+JSON.stringify(info))); }
console.log(gagal?'\n❌ '+gagal+' PEMERIKSAAN GAGAL':'\n✅ SEMUA TES LAPISAN LOLOS');
process.exit(gagal?1:0);
