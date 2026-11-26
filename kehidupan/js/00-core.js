'use strict';
/* ================= UTIL ================= */
const r=Math.random, ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasDoc=typeof document!=='undefined';
const $=id=>hasDoc?document.getElementById(id):null;
function rp(n){
  const neg=n<0; n=Math.abs(n); let s;
  if(n>=1e9)s=(n/1e9).toFixed(n>=1e10?0:1).replace('.',',')+' M';
  else if(n>=1e6)s=(n/1e6).toFixed(n>=1e8?0:1).replace('.',',')+' jt';
  else if(n>=1e3)s=Math.round(n/1e3)+' rb';
  else s=String(Math.round(n));
  return (neg?'−Rp ':'Rp ')+s;
}
const NAMA_L=['Agus','Budi','Rizky','Fajar','Dimas','Andre','Yoga','Ilham','Bayu','Galih','Reza','Hendra','Doni','Arif','Eko'];
const NAMA_P=['Sari','Dewi','Putri','Ayu','Rina','Intan','Maya','Citra','Laras','Nadia','Fitri','Wulan','Sinta','Mega','Ratna'];
const BLK_L=['Pratama','Saputra','Wijaya','Santoso','Ramadhan','Nugroho','Hidayat','Setiawan','Firmansyah','Mahendra'];
const BLK_P=['Lestari','Utami','Maharani','Anggraini','Permata','Kusuma','Rahmawati','Safitri','Puspita','Andini'];
const KOTA=['Balikpapan','Samarinda','Banjarmasin','Pontianak','Surabaya','Jakarta','Bandung','Yogyakarta','Makassar','Medan'];
const KOTA_METRO=['Jakarta','Surabaya','Bandung','Medan','Makassar'];
const NAMA_KUCING=['Oyen','Mochi','Kunyit','Tompel','Belang','Snow','Cimol','Bagas'];
function namaOrang(g){ return g==='L'? pick(NAMA_L)+' '+pick(BLK_L) : pick(NAMA_P)+' '+pick(BLK_P); }

