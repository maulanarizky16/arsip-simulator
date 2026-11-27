'use strict';
// QA Niaga — bot "pengusaha tekun": bermain dengan strategi masuk akal (rawat usaha, suntik modal, due diligence, pinjam secukupnya)
// untuk mengukur seberapa jauh pemain serius bisa tumbuh. Pemain acak di qa/analis.js tidak cocok untuk game strategi.
// Pakai: node qa/bot-niaga.js [jumlahHidup] [kotor]     ("kotor" = ikut menyuap tender, menekan upah, mengemplang pajak)
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const SEED=require(path.join(ROOT,'tests','_seed'));
const dir=path.join(ROOT,'niaga','js');
const src=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
sb.globalThis=sb; const ctx=vm.createContext(sb); const run=s=>vm.runInContext(s,ctx);
run((SEED+src).replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,''));
run(`
globalThis.__kotor=${process.argv[3]==='kotor'};
function __opt(re){ return G.current.opts.findIndex(o=>re.test(o.t)); }
globalThis.__drain=function(){ let g=0; while(G.current&&g++<300){ const t=G.current.title, o=G.current.opts; let i=0;
  if(t==='LATAR BELAKANG')i=Math.floor(Math.random()*o.length);
  else if(t==='DUE DILIGENCE')i=0;
  else if(t==='KEPUTUSAN'){ const tx=G.current.text; const m=tx.match(/meyakinkan: <b>(\\d+)<\\/b> dari (\\d+)/); const c=__last; const emas=c?c.clues.filter(f=>/PELUANG EMAS/.test(f.text)).length:0, jeb=c?c.clues.filter(f=>/JEBAKAN/.test(f.text)).length:0;
    if(emas>=2&&jeb===0)i=0; else i=o.length-1; if(/periksa lagi/.test(o[i].t))i=o.length-1; }
  else if(t==='PELUANG BISNIS')i=0;
  else if(t==='TUTUP BERKAS?')i=1;
  else if(t==='TAWARAN AKUISISI')i=1;
  else if(t==='SIASAT PAJAK')i=__kotor?1:0;
  else if(/^(KEMBANGKAN|TINGKATKAN|KAMPANYE|REKRUT|PERKUAT|RISET|IPO|WARALABAKAN|EKSPOR|CARI INVESTOR)/.test(t)&&globalThis.__pilih!=null){ i=Math.min(__pilih,o.length-1); }
  else if(t==='BUKA USAHA BARU'){ let best=-1,bv=-1; o.forEach((x,j)=>{ const s=SEKTOR.find(z=>z.n===x.t); if(s&&s.k!=='tek'){ const v=s.margin*(1-s.risk)*s.modalMin; if(v>bv&&s.modalMin<=P.kas*0.7||best<0){bv=v;best=j;} } }); i=best<0?0:best; }
  choose(i); } };
const __dd=dueDiligence; globalThis.__last=null; dueDiligence=function(c){ __last=c; return __dd(c); };
const __pd=putusanDeal; putusanDeal=function(c){ __last=c; return __pd(c); };
function __act(k){ const a=ACTS.find(x=>x.k===k); if(a&&actAvail(a).ok){ doAct(k); __drain(); return true; } return false; }
globalThis.__one=function(){
  newGame(); __drain(); let maxSk=0,maxNW=0,ipo=0;
  for(let y=0;y<60;y++){ if(!P.alive||G.over)break;
    if(!P.usaha.length)__act('buka');
    if(!P.usaha.length)__act('kerja');
    __act('belajar'); __act('olahraga'); if(P.st.stres>50)__act('rehat');
    // rawat usaha: kinerja & merek
    P.usaha.forEach((u,j)=>{ __pilih=j; if(u.kinerja<80&&P.kas>u.modal*0.3)__act('mutu'); if(u.brand<65&&P.kas>u.modal*0.3)__act('pemasaran'); if(u.sRelasi<70&&P.kas>u.modal*0.3)__act('pasok'); });
    // tumbuh: naik kelas usaha terbesar selama kas cukup
    for(let k=0;k<3;k++){ let j=-1,bm=0; P.usaha.forEach((u,x)=>{ if(u.skala<6&&P.kas>=u.modal*(0.6+0.1*u.skala)*1.3&&u.modal>bm){bm=u.modal;j=x;} }); if(j<0)break;
      const list=P.usaha.filter(u=>u.skala<6&&P.kas>=Math.round(u.modal*(0.6+0.1*u.skala))); __pilih=list.indexOf(P.usaha[j]); if(!__act('kembangkan'))break; }
    __pilih=0; __act('ipo'); __act('franchise');
    if(P.usaha.length&&P.usaha.length<4&&P.kas>netWorth()*0.5&&P.kas>300e6)__act('buka');
    if(P.usaha.length&&P.utang<netWorth()*0.25&&N.suku<12)__act('pinjam');
    if(P.utang>0&&P.kas>netWorth()*0.6)__act('bayarUtang');
    if(__kotor){ __act('suapTender'); __act('upahMurah'); __act('abaiLingkungan'); }
    __pilih=null;
    advance(); __drain();
    const nw=netWorth(); if(nw>maxNW)maxNW=nw; maxSk=Math.max(maxSk,P.usaha.reduce((m,u)=>Math.max(m,u.skala),0));
  }
  return JSON.stringify({maxNW,maxSk,nw:netWorth(),age:P.age,latar:P.latar,ach:Object.keys(P.ach),bangkrut:P.bangkrutTotal,vonis:P.vonis,usaha:P.usaha.length}); };`);
const N=+process.argv[2]||200, L=[]; for(let i=0;i<N;i++)L.push(JSON.parse(run('__one()')));
const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*s.length))]};
const f=v=>v>=1e12?(v/1e12).toFixed(1)+' T':v>=1e9?(v/1e9).toFixed(1)+' M':Math.round(v/1e6)+' jt';
console.log('kekayaan puncak p10/p50/p90/maks:',[0.1,0.5,0.9,0.999].map(p=>f(q(L.map(x=>x.maxNW),p))).join(' / '));
console.log('kekayaan akhir  p10/p50/p90:',[0.1,0.5,0.9].map(p=>f(q(L.map(x=>x.nw),p))).join(' / '),' umur med',q(L.map(x=>x.age),0.5));
console.log('skala tertinggi:',[0,1,2,3,4,5,6].map(k=>k+':'+Math.round(L.filter(x=>x.maxSk===k).length/N*100)+'%').join(' '),' pernah pailit',Math.round(L.filter(x=>x.bangkrut>0).length/N*100)+'%',' vonis',Math.round(L.filter(x=>x.vonis).length/N*100)+'%');
for(const lt of ['nekat','pro','warisan','online','warung']){ const z=L.filter(x=>x.latar===lt); if(z.length)console.log('  latar',lt,'n',z.length,'puncak med',f(q(z.map(x=>x.maxNW),0.5)),'p90',f(q(z.map(x=>x.maxNW),0.9))); }
const ac={}; for(const x of L)for(const k of x.ach)ac[k]=(ac[k]||0)+1;
console.log('ach%:',Object.entries(ac).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+Math.round(v/N*100)).join(' '));
