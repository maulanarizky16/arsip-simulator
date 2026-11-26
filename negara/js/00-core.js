'use strict';
/* ================= UTIL ================= */
const r=Math.random, ri=(a,b)=>a+Math.floor(r()*(b-a+1)), pick=a=>a[Math.floor(r()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasDoc=typeof document!=='undefined';
const $=id=>hasDoc?document.getElementById(id):null;
function rp(n){
  const neg=n<0; n=Math.abs(Math.round(n));
  let s;
  if(n>=1e12)s=(n/1e12).toFixed(n%1e12?1:0).replace('.',',')+' T';
  else if(n>=1e9)s=(n/1e9).toFixed(n%1e9?1:0).replace('.',',')+' M';
  else if(n>=1e6)s=(n/1e6).toFixed(0)+' jt';
  else s=n.toLocaleString('id-ID');
  return (neg?'−':'')+'Rp '+s;
}
function rpT(n){ return (n<0?'−':'')+'Rp '+Math.abs(Math.round(n)).toLocaleString('id-ID')+' T'; }

