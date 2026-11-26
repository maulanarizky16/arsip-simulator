'use strict';
/* ================= UTIL ================= */
const r=Math.random, ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasDoc=typeof document!=='undefined';
const $=id=>hasDoc?document.getElementById(id):null;
function rp(n){
  const neg=n<0; n=Math.abs(n); let s;
  if(n>=1e12)s=(n/1e12).toFixed(n>=1e13?0:1).replace('.',',')+' T';
  else if(n>=1e9)s=(n/1e9).toFixed(n>=1e10?0:1).replace('.',',')+' M';
  else if(n>=1e6)s=(n/1e6).toFixed(n>=1e8?0:1).replace('.',',')+' jt';
  else if(n>=1e3)s=Math.round(n/1e3)+' rb';
  else s=String(Math.round(n));
  return (neg?'−Rp ':'Rp ')+s;
}
const NAMA_L=['Agus','Budi','Hendra','Surya','Joko','Bambang','Rudi','Hartono','Wawan','Dedi','Iwan','Eko','Andi','Teguh','Yusuf','Rizal'];
const NAMA_P=['Sri','Dewi','Ratna','Yanti','Maya','Lilis','Endang','Wati','Susan','Mega','Indah','Nuri','Tari','Fitri','Vera','Linda'];
const BLK=['Pratama','Wijaya','Santoso','Halim','Gunawan','Tanuwijaya','Sanjaya','Wibowo','Salim','Hartanto','Kusuma','Lim'];
const KOTA=['Balikpapan','Samarinda','Banjarmasin','Pontianak','Surabaya','Jakarta','Bandung','Semarang','Makassar','Medan','Solo','Bali'];
function namaOrang(g){ return (g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK); }
/* nama usaha menyesuaikan skala & sektor */
const KATA1=['Maju','Berkah','Sejahtera','Sentosa','Jaya','Makmur','Sumber','Cahaya','Mitra','Karya','Abadi','Mulia','Barokah','Surya','Bintang','Harapan'];
const KATA2=['Jaya','Abadi','Bersama','Sentosa','Makmur','Lestari','Utama','Mandiri','Sukses','Gemilang','Sejahtera','Group'];
function namaUsaha(sek,skala){
  const inti=pick(KATA1)+(r()<0.6?' '+pick(KATA2):'');
  if(skala>=5)return 'PT '+inti+' Tbk';
  if(skala>=4)return 'PT '+inti;
  if(skala>=3)return 'CV '+inti;
  const pf=sek.pfx||'Usaha';
  return pf+' '+inti;
}
