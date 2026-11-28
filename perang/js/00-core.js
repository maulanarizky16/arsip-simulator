'use strict';
/* ================= UTIL ================= */
const r=Math.random, ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasDoc=typeof document!=='undefined';
const $=id=>hasDoc?document.getElementById(id):null;
/* uang dalam JUTA dolar AS */
function usd(j){
  const neg=j<0; j=Math.abs(Math.round(j)); let s;
  if(j>=1e6)s=(j/1e6).toFixed(j>=1e7?0:1).replace('.',',')+' triliun';
  else if(j>=1e3)s=(j/1e3).toFixed(j>=1e4?0:1).replace('.',',')+' miliar';
  else s=j+' juta';
  return (neg?'−':'')+'US$ '+s;
}
/* bilangan bulat dengan pemisah ribuan */
function bil(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
/* jumlah orang; masukan dalam RIBU orang */
function org(ribu){
  if(ribu>=1000)return (ribu/1000).toFixed(ribu>=10000?1:2).replace('.',',')+' juta';
  if(ribu>=1)return bil(ribu*1000);
  return bil(Math.max(0,ribu*1000));
}
function tanda(v){ return (v>=0?'+':'−')+Math.abs(Math.round(v)); }
/* nama panglima (untuk pop-up buat karakter) */
const NAMA_L=['Bagas','Arya','Wira','Satria','Yudha','Dimas','Raka','Bima','Gilang','Hendra','Teguh','Aditya'];
const NAMA_P=['Kirana','Laras','Sekar','Ratna','Citra','Dewi','Ayu','Nadia','Wulan','Anjani','Maharani','Tiara'];
const BLK=['Wiratama','Prakoso','Santosa','Nugraha','Hadikusumo','Pratama','Suryadi','Wibisono','Mahendra','Kusumah','Adiwijaya','Permana'];
function namaOrang(g){ return (g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK); }
