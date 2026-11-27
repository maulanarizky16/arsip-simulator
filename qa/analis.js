// QA/QC ANALIS DATA — memainkan banyak hidup/karier di satu simulator dengan dua profil pemain, lalu menulis laporan.
// Pemakaian:  node qa/analis.js <game> [jumlahHidupPerProfil]     contoh: node qa/analis.js it 200
//             npm run qa -- it
// Profil pemain:
//   acak  = memilih aksi & opsi secara acak, kuis dijawab acak  → mengukur jangkauan konten & ketahanan
//   wajar = selalu memilih opsi pertama (umumnya opsi "baik"), kuis dijawab benar, aksi acak → mengukur keseimbangan
// Laporan: qa/laporan/<game>.md (+ ringkasan di konsol). Exit 1 bila ada error/teks rusak (NaN, undefined, [object).
// Yang diukur:
//  - aksi: berapa kali tersedia & dipakai, rata-rata perubahan uang PRIBADI per aksi (cek "siapa yang bayar")
//  - aksi yang tak pernah bisa dipakai & kartu yang tak pernah muncul (konten mati/syarat mustahil)
//  - akhir hidup: sebab, lama main, uang akhir, jenjang tertinggi (bila game punya P.maxLv), tanda jasa
//  - stat yang sering macet di 0 / 100
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
const GAME=process.argv[2];
const N_HIDUP=+process.argv[3]||200;
const CFG={
  it:       {uang:'P.money', satuan:'tahun', maks:70},
  wni:      {uang:'P.saldo', satuan:'bulan', maks:40},
  kehidupan:{uang:'P.money', satuan:'tahun', maks:110},
  hakim:    {uang:'P.money', satuan:'tahun', maks:60},
  negara:   {uang:'P.money', satuan:'tahun', maks:70},
  niaga:    {uang:'P.kas',   satuan:'tahun', maks:70}
};
if(!CFG[GAME]){ console.error('Game tidak dikenal. Pilih: '+Object.keys(CFG).join(', ')); process.exit(2); }
const cfg=CFG[GAME];

/* ---------- muat game di sandbox (tanpa DOM), sama seperti tes ---------- */
const SEED=require(path.join(ROOT,'tests','_seed'));
const dir=path.join(ROOT,GAME,'js');
const src=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
const code=(SEED+src).replace(/\(function boot\(\)\{[\s\S]*?\}\)\(\);\s*$/,'');
const store={};
const sb={window:{},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},console:{log(){},warn(){},error(){}},setTimeout,clearTimeout};
sb.globalThis=sb;
const ctx=vm.createContext(sb);
const run=s=>vm.runInContext(s,ctx);
run(code);

/* ---------- instrumen: kartu, log, tanda jasa, teks rusak ---------- */
run(`
globalThis.__Q=null; globalThis.__reset=()=>{ __Q={judul:{},rusak:[],ach:{}}; }; __reset();
const __RUSAK=/undefined|NaN|\\[object|Infinity/;
const __ask=ask; ask=function(d){ __Q.judul[d.title]=(__Q.judul[d.title]||0)+1;
  const t=(String(d.title)+' '+String(d.text||'')+' '+(d.opts||[]).map(o=>o.t+' '+(o.sub||'')).join(' ')).replace(/<[^>]+>/g,'');
  if(__RUSAK.test(t))__Q.rusak.push('KARTU '+d.title+': '+t.slice(0,200));
  return __ask(d); };
const __log=addLog; addLog=function(h,c){ const t=String(h).replace(/<[^>]+>/g,''); if(__RUSAK.test(t))__Q.rusak.push('LOG: '+t.slice(0,200)); return __log(h,c); };
const __ach=ach; ach=function(k){ const baru=P&&P.ach&&!P.ach[k]; const r=__ach(k); if(baru&&P.ach[k])__Q.ach[k]=(__Q.ach[k]||0)+1; return r; };
globalThis.__uang=()=>{ try{ return ${cfg.uang}||0; }catch(e){ return 0; } };
globalThis.__PROFIL='acak';
globalThis.__drain=function(){ let g=0; while(G.current&&g++<400){ const n=G.current.opts.length; choose(__PROFIL==='wajar'?0:Math.floor(Math.random()*n)); } };
`);
const pakaiErr=[];
const pakai=s=>{ try{ return run(s); }catch(e){ pakaiErr.push(e.message+' @ '+s.slice(0,60)); return null; } };
/* aksi di luar daftar ACTS (mis. menekuni hobi di Kehidupan: doAct('tekuni:<hobi>')) ikut dicoba, dilaporkan sebagai satu baris 'tekuni' */
const AKSI_TERSEDIA=`JSON.stringify(ACTS.filter(a=>{ try{ return actAvail(a).ok; }catch(e){ return false; } }).map(a=>a.k).concat(typeof tekuni==='function'&&P&&P.hobi&&!(P.penjara>0)?P.hobi.map(h=>'tekuni:'+h.k).filter(k=>!P.used[k]):[]))`;
const kunci=k=>k.startsWith('tekuni:')?'tekuni':k;

/* ---------- satu putaran simulasi untuk satu profil ---------- */
function jalankan(profil){
  run(`__reset(); __PROFIL=${JSON.stringify(profil)}; globalThis.__KUIS_PINTAR=${profil==='wajar'};`);
  const aksi={}, hidup=[], statEkstrem={};
  for(let h=0;h<N_HIDUP;h++){
    /* bila game punya lanjut-generasi (contAsChild), sepertiga hidup diteruskan sebagai anak → menguji warisan, silsilah, dinasti */
    if(h>0&&run('typeof contAsChild==="function"&&!!P&&!!P.kids&&P.kids.length>0')&&Math.random()<0.35)pakai('contAsChild(); __drain();');
    else pakai('newGame(); __drain();');
    let lama=0;
    for(let g=0;g<cfg.maks*1.5;g++){
      if(run('!P||!P.alive||G.over'))break;
      for(const k of new Set(JSON.parse(pakai(AKSI_TERSEDIA)||'[]').map(kunci)))(aksi[k]=aksi[k]||{tersedia:0,dipakai:0,dUang:[]}).tersedia++;
      const nAksi=Math.floor(Math.random()*4);
      for(let i=0;i<nAksi;i++){
        const pil=JSON.parse(pakai(AKSI_TERSEDIA)||'[]'); if(!pil.length)break;
        const kAsli=pil[Math.floor(Math.random()*pil.length)], k=kunci(kAsli);
        const u0=run('__uang()'); pakai(`doAct(${JSON.stringify(kAsli)}); __drain();`); const u1=run('__uang()');
        (aksi[k]=aksi[k]||{tersedia:1,dipakai:0,dUang:[]}).dipakai++; aksi[k].dUang.push(u1-u0);
        if(run('!P.alive||G.over'))break;
      }
      if(run('!P.alive||G.over'))break;
      pakai('advance(); __drain();'); lama++;
      const st=JSON.parse(pakai('JSON.stringify(P.st||{})')||'{}');
      for(const s in st){ if(typeof st[s]!=='number')continue; const e=(statEkstrem[s]=statEkstrem[s]||{nol:0,seratus:0,total:0}); e.total++; if(st[s]<=0)e.nol++; if(st[s]>=100)e.seratus++; }
    }
    const akhir=JSON.parse(pakai(`JSON.stringify({sebab:P.sebab||(P.alive?(G.over?'tamat':'batas simulasi'):'berkas ditutup oleh pemain'),uang:__uang(),ach:Object.keys(P.ach||{}).length,maxLv:P.maxLv})`)||'{}');
    akhir.lama=lama; hidup.push(akhir);
  }
  return {profil,aksi,hidup,statEkstrem,Q:JSON.parse(run('JSON.stringify(__Q)'))};
}
const hasil=[jalankan('acak'),jalankan('wajar')];

/* ---------- olah ---------- */
const rp=v=>{ const a=Math.abs(v), s=v<0?'−':''; if(a>=1e9)return s+'Rp '+(a/1e9).toFixed(1)+' M'; if(a>=1e6)return s+'Rp '+(a/1e6).toFixed(1)+' jt'; return s+'Rp '+Math.round(a/1e3)+' rb'; };
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const pct=(arr,p)=>{ const s=arr.slice().sort((a,b)=>a-b); return s.length?s[Math.min(s.length-1,Math.floor(p*s.length))]:0; };
const judulKode=new Set(); for(const m of src.matchAll(/title:\s*'([^'\\]+)'/g))judulKode.add(m[1]);
const achDef=JSON.parse(pakai('JSON.stringify(typeof ACH_DEF!=="undefined"?ACH_DEF:{})')||'{}');
const daftarAksi=JSON.parse(pakai('JSON.stringify(ACTS.map(a=>[a.k,a.lbl,a.tab]))')||'[]');
if(hasil.some(h=>h.aksi.tekuni))daftarAksi.push(['tekuni','Tekuni hobi','hobi']);
const semuaJudul={}, semuaAch={}; let rusak=[];
for(const h of hasil){ for(const t in h.Q.judul)semuaJudul[t]=(semuaJudul[t]||0)+h.Q.judul[t]; for(const k in h.Q.ach)semuaAch[k]=(semuaAch[k]||0)+h.Q.ach[k]; rusak=rusak.concat(h.Q.rusak); }

const baris=[]; const L=s=>baris.push(s);
L('# Laporan QA/QC data — '+GAME);
L('');
L('_'+N_HIDUP+' hidup/karier per profil. **acak** = aksi & opsi acak, kuis acak. **wajar** = opsi pertama, kuis benar, aksi acak. Dibuat '+new Date().toISOString().slice(0,16).replace('T',' ')+'._');
L('');
L('## Ringkasan per profil');
L('| Ukuran | acak | wajar |'); L('|---|---|---|');
const kol=f=>'| '+hasil.map(f).join(' | ')+' |';
L('| Lama main ('+cfg.satuan+'), median [p10–p90] '+kol(h=>{ const l=h.hidup.map(x=>x.lama); return pct(l,0.5)+' ['+pct(l,0.1)+'–'+pct(l,0.9)+']'; }));
L('| Uang akhir median '+kol(h=>rp(pct(h.hidup.map(x=>x.uang),0.5))));
L('| Uang akhir p10 / p90 '+kol(h=>{ const u=h.hidup.map(x=>x.uang); return rp(pct(u,0.1))+' / '+rp(pct(u,0.9)); }));
L('| Uang akhir terendah '+kol(h=>rp(Math.min(...h.hidup.map(x=>x.uang)))));
L('| Tanda jasa per hidup (rata-rata) '+kol(h=>avg(h.hidup.map(x=>x.ach)).toFixed(1)));
if(hasil[0].hidup.some(x=>x.maxLv!=null)){
  L('| Jenjang tertinggi (sebaran maxLv) '+kol(h=>{ const c={}; for(const x of h.hidup)c[x.maxLv]=(c[x.maxLv]||0)+1; return Object.keys(c).sort((a,b)=>a-b).map(k=>'lv'+k+': '+Math.round(c[k]/h.hidup.length*100)+'%').join(', '); }));
}
L('');
L('Error: **'+pakaiErr.length+'** · teks rusak (undefined/NaN/[object): **'+rusak.length+'**');
L('');
for(const h of hasil){
  L('## Akhir cerita — profil '+h.profil);
  const sebab={}; for(const x of h.hidup){ const k=String(x.sebab).slice(0,70); sebab[k]=(sebab[k]||0)+1; }
  for(const [k,v] of Object.entries(sebab).sort((a,b)=>b[1]-a[1]).slice(0,10))L('- '+k+': '+v+' ('+Math.round(v/N_HIDUP*100)+'%)');
  L('');
}
L('## Aksi: pemakaian & perubahan uang pribadi (profil acak)');
L('"Δ uang" = rata-rata perubahan uang PRIBADI setelah aksi (termasuk pilihan lanjutan). Negatif = pemain membayar. Cocokkan dengan logika: siapa yang seharusnya membayar? (Investasi/saham memindahkan uang ke aset, bukan hilang.)');
L('');
L('| Aksi | Tersedia | Dipakai | Δ uang rata-rata | Δ terkecil |'); L('|---|---:|---:|---:|---:|');
const A=hasil[0].aksi;
for(const [k,lbl,tab] of daftarAksi){
  const a=A[k]||{tersedia:0,dipakai:0,dUang:[]};
  L('| '+lbl+' ('+tab+') | '+a.tersedia+' | '+a.dipakai+' | '+(a.dUang.length?rp(avg(a.dUang)):'—')+' | '+(a.dUang.length?rp(Math.min(...a.dUang)):'—')+' |');
}
const takPernah=daftarAksi.filter(([k])=>!hasil.some(h=>h.aksi[k]&&h.aksi[k].tersedia));
L('');
L('**Aksi yang tak pernah bisa dipakai di kedua profil ('+takPernah.length+'):** '+(takPernah.length?takPernah.map(x=>x[1]).join(', '):'tidak ada'));
L('');
L('## Stat yang sering macet di batas (>15% waktu)');
let adaMacet=false;
for(const h of hasil)for(const [s,e] of Object.entries(h.statEkstrem)){ const n=e.nol/e.total, c=e.seratus/e.total; if(n>0.15||c>0.15){ adaMacet=true; L('- ['+h.profil+'] '+s+': di 0 '+Math.round(n*100)+'% waktu, di 100 '+Math.round(c*100)+'%'); } }
if(!adaMacet)L('- tidak ada');
L('');
const achTak=Object.keys(achDef).filter(k=>!semuaAch[k]);
L('## Tanda jasa yang tak pernah didapat di kedua profil ('+achTak.length+'/'+Object.keys(achDef).length+')');
L(achTak.length?achTak.map(k=>'- '+achDef[k]+' (`'+k+'`)').join('\n'):'- semua pernah didapat');
L('');
const _jl=Object.keys(semuaJudul); const takMuncul=[...judulKode].filter(t=>!semuaJudul[t]&&!(/[\s:—-]$/.test(t)&&_jl.some(x=>x.startsWith(t)))).sort();
L('## Kartu (judul literal di kode) yang tak pernah muncul ('+takMuncul.length+'/'+judulKode.size+')');
L(takMuncul.length?takMuncul.map(t=>'- '+t).join('\n'):'- semua muncul');
L('');
L('## Kartu yang paling sering muncul (gabungan)');
for(const [t,n] of Object.entries(semuaJudul).sort((a,b)=>b[1]-a[1]).slice(0,12))L('- '+t+': '+n+'×');
if(rusak.length){ L(''); L('## Teks rusak'); for(const t of [...new Set(rusak)].slice(0,20))L('- '+t); }
if(pakaiErr.length){ L(''); L('## Error'); for(const t of [...new Set(pakaiErr)].slice(0,20))L('- '+t); }

const outDir=path.join(__dirname,'laporan'); fs.mkdirSync(outDir,{recursive:true});
const out=path.join(outDir,GAME+'.md');
fs.writeFileSync(out,baris.join('\n')+'\n');
console.log(baris.slice(0,14).join('\n'));
console.log('\nLaporan lengkap: '+path.relative(ROOT,out));
process.exit(pakaiErr.length||rusak.length?1:0);
