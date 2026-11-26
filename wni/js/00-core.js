'use strict';
/* ================= UTIL ================= */
const r=Math.random, ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasDoc=typeof document!=='undefined';
const $=id=>hasDoc?document.getElementById(id):null;
function rp(n){
  const neg=n<0; n=Math.abs(n); let s;
  if(n>=1e12)s=(n/1e12).toFixed(1).replace('.',',')+' T';
  else if(n>=1e9)s=(n/1e9).toFixed(1).replace('.',',')+' M';
  else if(n>=1e6)s=(n/1e6).toFixed(n>=1e8?0:1).replace('.',',')+' jt';
  else if(n>=1e3)s=Math.round(n/1e3)+' rb';
  else s=String(Math.round(n));
  return (neg?'−Rp ':'Rp ')+s;
}
const NAMA_L=['Agus','Budi','Dimas','Fajar','Rizky','Bayu','Yoga','Ilham','Reza','Arif','Eko','Wahyu','Andi','Galih','Hendra','Rendi'];
const NAMA_P=['Sari','Dewi','Putri','Ayu','Rina','Intan','Nadia','Citra','Wulan','Fitri','Mega','Tania','Laras','Nurul','Dinda','Salsa'];
const BLK=['Saputra','Pratama','Hidayat','Setiawan','Kurniawan','Lestari','Wulandari','Ramadhan','Nugroho','Santoso','Purnomo','Siregar','Simanjuntak','Hasibuan','Wijaya','Syahputra'];
function namaOrang(g){ return (g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK); }
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
