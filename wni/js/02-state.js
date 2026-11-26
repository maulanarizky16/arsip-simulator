'use strict';
/* ================= STATE ================= */
let P=null, N=null;
const G={current:null, queue:[], over:false, feed:[], tab:'diri', acted:0};

function newGame(){
  if(window.ArsipArt&&ArsipArt.creator('wni',newGame))return;   /* pop-up buat karakter dulu */
  const ID=window.ArsipArt?ArsipArt.identity():{};
  const g=ID.gender||(r()<0.5?'L':'P');
  const kota=pick(KOTA);
  const lt=acakLatar();
  N={ tahun:2026, bulan:1, ke:1, harga:1, bbmNaik:false };
  P={
    nama:namaOrang(g), gender:g, kota:kota.n, kotaIdx:kota.idx, macet:kota.macet, banjirP:kota.banjir,
    age:ri(23,27), alive:true, sebab:null, ending:null,
    latar:lt.k, latarN:lt.n, kiriman:lt.kiriman||0, kirimanTotal:0, orangDalam:!!lt.orangDalam, makanDiskon:lt.makanDiskon||0,
    profesi:null, profesiN:'—', gaji:0, bulanKerja:0, kontrakSisa:0, pernahPHK:false,
    st:{waras:ri(62,74),sehat:ri(74,88),gengsi:ri(30,45),nrimo:ri(38,52),relasi:ri(45,60)},
    skill:40,
    saldo:Math.round((lt.saldo[0]+r()*(lt.saldo[1]-lt.saldo[0]))*10)*100e3, tabungan:0, emas:0, emasModal:0, utang:0, cicilan:[],
    motor:false, rumah:false, pasangan:false, menikah:false,
    gaya:'normal', masakBulan:false,
    arisan:false, arisanDapat:0,
    judol:0, judolRugi:0,
    kondanganKali:0, healingKali:0, pinjolKali:0, sideKali:0, lemburKali:0, burukKali:0, viralKali:0,
    sumWaras:0, minSaldo:0, maxNet:0, bulanHidup:0, thrKali:0, naikGajiTerakhir:0,
    riwayat:[], ach:{}, used:{}, cd:{}
  };
  if(ID.nama)P.nama=ID.nama;
  if(ID.skin)P.skin=ID.skin;
  for(const k in lt.st)P.st[k]=clamp(P.st[k]+lt.st[k],0,100);
  if(lt.gaya)P.gaya=lt.gaya;
  P.modalAwal=P.saldo;
  P.lahir=N.tahun-P.age;
  P.arsipNo='NIK '+ri(31,64)+ri(10,99)+ri(10,99)+'-'+ri(100000,999999)+'-'+ri(1000,9999);
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='diri'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  monthHeader();
  addLog('Januari '+N.tahun+', '+P.kota+'. <b>'+P.nama+'</b> ('+P.age+' th) resmi menjadi bagian dari 280 juta warga +62 yang berjuang dari gajian ke gajian. Saldo awal: '+rp(P.saldo)+'. Semangat, katanya.');
  addLog('Nasib lahir: <b>'+lt.n+'</b>. '+lt.d,'sys');
  milestone('Mulai berjuang di '+P.kota+' ('+lt.n+')');
  arahanWni();
  const kirimTxt=lt.kiriman>0?'<br><br>Setiap bulan orang tua mentransfer <b>'+rp(lt.kiriman)+'</b>. Hidup terasa adil, untukmu.':
    lt.kiriman<0?'<br><br>Setiap bulan kamu wajib mengirim <b>'+rp(-lt.kiriman)+'</b> ke keluarga.':'';
  ask({title:'NASIB LAHIR',text:'<b>'+lt.judul+'.</b><br><br>'+lt.d+kirimTxt+'<br><br>Saldo awal: <b>'+rp(P.saldo)+'</b>'+(lt.orangDalam?' · Punya <b>orang dalam</b> di mana-mana.':'')+'.',
    opts:[{t:'Terima nasib »',e:()=>{}}]});
  ask({title:'PEKERJAAN SEKARANG',text:'Sehari-hari kamu cari nafkah sebagai apa?'+(lt.orangDalam?' (Ada juga jalur "khusus" untukmu.)':''),
    opts:PROFESI.filter(p=>!p.khusus||p.khusus===lt.k).map(p=>({t:p.n,sub:p.d+' · '+(p.vari?'±':'')+rp(p.gaji)+'/bln',e:()=>{
      setProfesi(p.k,p.gaji,true);
      for(const k in p.st)P.st[k]=clamp(P.st[k]+p.st[k],0,100);
      P.skill=p.skill; if(p.motor)P.motor=true;
      if(p.k==='outsourcing')P.kontrakSisa=12;
      addLog('Kamu bekerja sebagai <b>'+p.n.toLowerCase()+'</b>. '+p.d,'sys');
    }}))});
  render();
}
function setProfesi(k,gaji,awal){
  const p=PROF[k];
  P.profesi=k; P.profesiN=p.n; P.gaji=Math.round(gaji); P.bulanKerja=0;
  if(k==='outsourcing')P.kontrakSisa=12;
  if(!awal)milestone('Kerja baru: '+p.n+' ('+rp(P.gaji)+'/bln)');
}
function arahanWni(){
  try{ if(localStorage.getItem('arsip_arahan_wni_v1'))return; localStorage.setItem('arsip_arahan_wni_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Selamat datang, warga +62. Tugasmu sederhana: <b>bertahan hidup 36 bulan</b> tanpa bangkrut, tanpa gila, dan kalau bisa tanpa pinjol.<br><br>'+
    '<b>1.</b> Tiap bulan gajimu masuk, lalu numpang lewat ke kos, makan, bensin, kuota, dan cicilan.<br>'+
    '<b>2.</b> Pilih aksi di Meja (Diri, Kerja & Cuan, Sosial, Uang & Utang, Urusan Warga), lalu tekan <b>"Jalani Bulan +1"</b>.<br>'+
    '<b>3.</b> Hadapi kejadian sehari-hari: token listrik bunyi, ditilang, ditanya "kapan nikah", harga cabai naik, bos chat jam 10 malam.<br>'+
    '<b>4.</b> Jaga <b>Kewarasan</b>: kalau habis, kamu pulang kampung dijemput orang tua. Jaga <b>Saldo</b>: kalau utang menggunung, debt collector datang.<br><br>'+
    'Di akhir kamu dinilai dua sisi: <b>Dompet</b> dan <b>Kewarasan</b>. Semoga beruntung. Kamu akan butuh itu.',
    opts:[{t:'Siap, bismillah »',e:()=>{}}]});
}

/* ================= LOG ================= */
function monthHeader(){
  const h=BULAN[N.bulan-1].toUpperCase()+' '+N.tahun+' — BULAN KE-'+N.ke;
  G.feed.push({yr:h});
  if(hasDoc){ const d=document.createElement('div'); d.className='yr'; d.textContent=h; $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight; }
}
function addLog(html,cls){
  G.feed.push({html,cls});
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='e'+(cls?' '+cls:''); d.innerHTML=html;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function stamp(t,kind){
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='stamp'+(kind?' '+kind:''); d.textContent=t;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function milestone(t){ P.riwayat.push({th:BULAN[N.bulan-1].slice(0,3)+' '+N.tahun,t}); }
function ach(k){
  if(P.ach[k])return;
  P.ach[k]=true;
  addLog('TANDA JASA TERBUKA: <b>'+ACH_DEF[k]+'</b>','good');
  stamp(ACH_DEF[k].toUpperCase(),'gold');
}
const LBL={waras:'Kewarasan',sehat:'Kesehatan',gengsi:'Gengsi',nrimo:'Nrimo',relasi:'Relasi'};
function fx(o){
  const parts=[];
  for(const k in o){
    const v=o[k];
    if(k==='saldo'){ P.saldo+=v; parts.push('Saldo '+(v>=0?'+':'')+rp(v).replace('Rp ','')); }
    else if(k==='utang'){ P.utang=Math.max(0,P.utang+v); parts.push('Utang '+(v>=0?'+':'')+rp(v).replace('Rp ','')); }
    else if(k==='tabungan'){ P.tabungan=Math.max(0,P.tabungan+v); parts.push('Tabungan '+(v>=0?'+':'')+rp(v).replace('Rp ','')); }
    else if(k==='skill'){ P.skill=clamp(P.skill+v,0,100); parts.push('Skill '+(v>=0?'+':'')+v); }
    else if(k==='waras'&&v<0){ const d=Math.min(-1,Math.round(v*(1-P.st.nrimo/250))); P.st.waras=clamp(P.st.waras+d,0,100); parts.push(LBL[k]+' '+d); }   /* nrimo meredam pukulan mental */
    else { P.st[k]=clamp(P.st[k]+v,0,100); parts.push(LBL[k]+' '+(v>=0?'+':'')+v); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}
/* sekali-sekali saja: event berkunci cooldown (dalam bulan) */
function siap(k,cd){ return !P.cd[k]||N.ke-P.cd[k]>=cd; }
function pakai(k){ P.cd[k]=N.ke; }

/* ================= KARTU ================= */
function ask(d){
  d.opts=d.opts.filter(o=>!o.cond||o.cond());
  if(!d.opts.length)d.opts=[{t:'Lanjut',e:()=>{}}];
  if(G.current)G.queue.push(d); else {G.current=d; renderKartu();}
}
function choose(i){
  if(!G.current||G.over)return;
  const cur=G.current; G.current=null;
  if(hasDoc)$('kartu').innerHTML='';
  (cur.opts[i]||cur.opts[0]).e();
  endCheck();
  if(!G.current && G.queue.length && !G.over){G.current=G.queue.shift(); renderKartu();}
  render();
}

/* ================= KEUANGAN BULANAN ================= */
function cicilanBulan(){ return P.cicilan.reduce((a,c)=>a+c.per,0); }
function biayaPokok(){
  const idx=P.kotaIdx*N.harga;
  const kos=P.rumah?0:1.3e6*idx;
  const makan=1.9e6*idx*(P.masakBulan?0.78:1)*(1-(P.makanDiskon||0));
  const transport=(P.motor?0.45e6:0.8e6)*idx;
  const lain=(0.6e6)*idx + (P.menikah?1.4e6*idx:0);
  const gaya=P.gaya==='hemat'?0.85:P.gaya==='gengsi'?1.35:1;
  return Math.round((kos+makan+transport+lain)*gaya);
}
function netWorth(){
  const sisaCicilan=P.cicilan.reduce((a,c)=>a+(c.utang?c.per*c.sisa:0),0);
  return Math.round(P.saldo+P.tabungan+P.emas-P.utang-sisaCicilan+(P.rumah?150e6*N.harga*0.25:0));
}
function pendapatan(){
  if(!P.profesi)return 0;
  const p=PROF[P.profesi];
  let g=P.gaji*(1+(r()*2-1)*p.vari);
  if(P.profesi==='ojol'&&P.st.sehat<45)g*=0.75;            /* badan remuk, narik berkurang */
  if(P.profesi==='ojol'&&!P.motor)g*=0.35;
  return Math.round(g);
}
function bulanan(){
  /* gajian */
  const masuk=pendapatan();
  P.saldo+=masuk;
  if(P.profesi)P.bulanKerja++;
  /* arisan */
  let arisanTxt='';
  if(P.arisan){ P.saldo-=300e3; if(N.ke===P.arisanDapat){ P.saldo+=3.6e6; arisanTxt=' Kocokan arisan keluar namamu: <b>+'+rp(3.6e6)+'</b>! Rasanya seperti menang undian padahal uang sendiri.'; } }
  /* kiriman keluarga: dari ortu (+) atau ke ortu (−) */
  let kirimTxt='';
  if(P.kiriman){
    P.saldo+=P.kiriman; P.kirimanTotal+=P.kiriman;
    kirimTxt=P.kiriman>0?' Transfer dari ortu masuk: <b>+'+rp(P.kiriman)+'</b>.':' Kirim ke orang tua & adik: <b>'+rp(P.kiriman)+'</b>.';
    if(P.kiriman<0&&-P.kirimanTotal>=15e6)ach('tulangPunggung');
  }
  /* biaya hidup */
  const biaya=biayaPokok();
  P.saldo-=biaya;
  /* cicilan */
  const cic=cicilanBulan();
  P.saldo-=cic;
  for(const c of P.cicilan)c.sisa--;
  const lunas=P.cicilan.filter(c=>c.sisa<=0);
  P.cicilan=P.cicilan.filter(c=>c.sisa>0);
  for(const c of lunas)addLog('Cicilan <b>'+c.n+'</b> akhirnya LUNAS. Rasanya seperti merdeka kecil-kecilan.','good');
  /* bunga pinjol: berbunga-bunga, dan bukan dalam arti romantis */
  if(P.utang>0){ const b=Math.round(P.utang*0.05); P.utang+=b; }
  /* tabungan & emas */
  if(P.tabungan>0)P.tabungan=Math.round(P.tabungan*1.002);
  if(P.emas>0)P.emas=Math.round(P.emas*(1+(r()*0.07-0.025)));
  const txt=masuk>0
    ?'Gajian '+rp(masuk)+' masuk, lalu numpang lewat: biaya hidup '+rp(biaya)+(cic?' + cicilan '+rp(cic):'')+'.'
    :'Tidak ada pemasukan bulan ini. Biaya hidup '+rp(biaya)+(cic?' + cicilan '+rp(cic):'')+' tetap jalan.';
  addLog(txt+kirimTxt+arisanTxt,'sys');
  P.masakBulan=false;
}
/* ================= DRIFT MENTAL & FISIK ================= */
function drift(){
  const s=P.st;
  P.bulanHidup++;
  let dw=-2;
  const biaya=biayaPokok();
  if(P.saldo<biaya*0.25)dw-=3;                       /* tanggal tua permanen */
  if(P.utang>0)dw-=1+Math.min(4,Math.round(P.utang/Math.max(P.gaji,2e6)));
  if(s.gengsi>70&&P.saldo<biaya)dw-=2;                /* FOMO tapi bokek */
  if(!P.profesi)dw-=3;
  if(P.saldo>=biaya*3)dw+=2;
  if(P.pasangan)dw+=1;
  if(dw<0)dw=Math.min(-1,Math.round(dw*(1-s.nrimo/250)));
  s.waras=clamp(s.waras+dw,0,100);
  s.sehat=clamp(s.sehat-(r()<0.35?1:0)-(s.waras<30?1:0)+(s.sehat<50&&s.waras>=50&&r()<0.5?1:0),0,100);   /* badan pulih pelan kalau pikiran tenang */
  s.gengsi=clamp(s.gengsi-(r()<0.3?1:0),0,100);
  s.nrimo=clamp(s.nrimo-(r()<0.5?1:0),0,100);          /* sabar juga ada batasnya */
  if(s.relasi>20&&r()<0.25)s.relasi--;
  P.sumWaras+=s.waras;
  if(P.saldo<P.minSaldo)P.minSaldo=P.saldo;
  const nw=netWorth(); if(nw>P.maxNet)P.maxNet=nw;
  /* inflasi pelan tapi pasti */
  N.harga=+(N.harga*(1+ri(2,6)/1000)).toFixed(4);
}
