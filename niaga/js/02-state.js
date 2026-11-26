'use strict';
/* ================= STATE ================= */
let P=null, N=null;
const G={current:null, queue:[], over:false, feed:[], tab:'usaha', acted:0};

function newGame(){
  const g=r()<0.6?'L':'P';
  N={ tahun:2008, ekonomi:'normal', inflasi:6, suku:9, daya:55, tren:pick(SEKTOR).k, harga:{}, pandemiSisa:0 };
  SEKTOR.forEach(s=>N.harga[s.k]=+(0.85+r()*0.3).toFixed(2));
  P={
    nama:namaOrang(g), gender:g, kota:pick(KOTA),
    age:24, lahir:1984, alive:true, sebab:null,
    latar:null, latarN:'—',
    st:{bisnis:ri(28,42),operasi:ri(26,40),pemasaran:ri(26,40),finansial:ri(26,40),relasi:ri(24,38),kesehatan:ri(80,95),stres:ri(8,20)},
    reputasi:20,
    kas:0, utang:0, gelap:0, gelapTotal:0, investasi:0, maxNet:0,
    usaha:[],
    modusPajak:'patuh', pajakNunggak:0, buruh:60,
    usahaDibuka:0, usahaTutup:0, usahaBangkrut:0, akuisisiKali:0, ipoKali:0, franchiseKali:0, eksporKali:0,
    dealAmbil:0, dealBagus:0, dealJebakan:0, dealLewat:0, ddKali:0,
    suapKali:0, csrTotal:0, gaya:'normal',
    legH:0, legN:0, sumNet:0, years:0,
    heat:0, vonis:false, penjara:0, retired:false, bangkrutTotal:0,
    keluarga:false, anak:0, hajiDone:false,
    evWarisan:false, evPandemi:false, evKrisis98:false, evPreman:false, evTawarAkuisisi:false, evTipu:false,
    riwayat:[], ach:{}, used:{}
  };
  P.arsipNo='Berkas No. '+ri(10000,99999)+'/NIAGA/'+N.tahun;
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='usaha'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  yearHeader();
  addLog('Tahun '+N.tahun+', di '+P.kota+'. <b>'+P.nama+'</b> ('+P.age+' th) memutuskan berhenti jadi orang gajian dan membangun usaha sendiri. Modal seadanya, mimpi setinggi langit.');
  milestone('Memutuskan jadi pengusaha');
  arahanNiaga();
  ask({title:'LATAR BELAKANG',text:'Dari mana modal & bakat awal Anda? Pilihan ini menentukan titik start:',
    opts:LATAR.map(l=>({t:l.n,sub:l.d+' · Kas '+rp(l.kas),e:()=>{
      P.latar=l.k; P.latarN=l.n; P.kas=l.kas; P.reputasi=l.rep;
      for(const k in l.st)P.st[k]=clamp(P.st[k]+l.st[k],0,100);
      addLog('Anda memulai sebagai <b>'+l.n.toLowerCase()+'</b>. '+l.d,'sys');
      milestone('Latar: '+l.n);
      if(l.usahaAwal){ const u=bukaUsahaObj(l.usahaAwal,SEKTOR_MAP[l.usahaAwal].modalMin); P.usaha.push(u); P.usahaDibuka++; ach('pertama');
        addLog('Anda mewarisi <b>'+u.n+'</b> ('+SEKTOR_MAP[u.k].n+', '+SKALA_LBL[u.skala]+') yang sudah berjalan.','good'); }
    }}))});
  render();
}
function arahanNiaga(){
  try{ if(localStorage.getItem('arsip_arahan_niaga_v1'))return; localStorage.setItem('arsip_arahan_niaga_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Selamat datang. Kamu membangun kerajaan bisnis dari nol — dari kaki lima sampai (mungkin) konglomerasi yang IPO.<br><br>'+
    '<b>1.</b> Buka usaha di salah satu dari 18 sektor (kuliner, ritel, properti, tambang, tek, dll). Tiap tahun usahamu menghasilkan untung/rugi tergantung skala, kinerja, merek, dan kondisi ekonomi.<br>'+
    '<b>2.</b> Tiap tahun muncul <b>PELUANG</b> bisnis. Lakukan <b>due diligence</b> (riset pasar, audit keuangan, cek legalitas) untuk membedakan emas dari jebakan, lalu putuskan ambil atau lewatkan.<br>'+
    '<b>3.</b> Pilih aksi di Meja (Diri, Usaha, Ekspansi, Modal & Siasat, Pribadi), lalu tekan <b>"Jalani Tahun +1"</b>.<br>'+
    '<b>4.</b> Di akhir kamu dinilai dua sisi: <b>Harta & Imperium</b> (sebesar apa kerajaanmu) dan <b>Nama & Warisan</b> (sebersih apa cara membangunnya). Bisa jadi taipan dermawan yang dikenang harum, atau bos kaya bertangan kotor yang berakhir di penjara.',
    opts:[{t:'Mengerti, mulai »',e:()=>{}}]});
}

/* ================= LOG ================= */
function yearHeader(){
  const h='TAHUN '+N.tahun+' — USIA '+P.age;
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
function milestone(t){ P.riwayat.push({th:N?N.tahun:'-',t}); }
function ach(k){
  if(P.ach[k])return;
  P.ach[k]=true;
  addLog('TANDA JASA TERBUKA: <b>'+ACH_DEF[k]+'</b>','good');
  stamp(ACH_DEF[k].toUpperCase(),'gold');
}
const LBL={bisnis:'Naluri Bisnis',operasi:'Operasional',pemasaran:'Pemasaran',finansial:'Finansial',relasi:'Relasi & Koneksi',kesehatan:'Kesehatan',stres:'Stres'};
function fx(o){
  const parts=[];
  for(const k in o){
    if(k==='kas'){ P.kas+=o[k]; parts.push('Kas '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='utang'){ P.utang=Math.max(0,P.utang+o[k]); parts.push('Utang '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='gelap'){ P.gelap+=o[k]; if(o[k]>0)P.gelapTotal+=o[k]; parts.push('Uang gelap '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='investasi'){ P.investasi=Math.max(0,P.investasi+o[k]); parts.push('Investasi '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='heat'){ P.heat=clamp(P.heat+o[k],0,100); parts.push('Sorotan hukum '+(o[k]>=0?'+':'')+o[k]); }
    else if(k==='reputasi'){ P.reputasi=clamp(P.reputasi+o[k],0,100); parts.push('Reputasi '+(o[k]>=0?'+':'')+o[k]); }
    else if(k==='buruh'){ P.buruh=clamp(P.buruh+o[k],0,100); parts.push('Kesejahteraan pekerja '+(o[k]>=0?'+':'')+o[k]); }
    else { P.st[k]=clamp(P.st[k]+o[k],0,100); parts.push(LBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}
/* legasi ganda: Harta & Imperium vs Nama & Warisan */
function leg(harta,nama){ P.legH=clamp(P.legH+harta,-80,80); P.legN=clamp(P.legN+nama,-80,80); }

/* ================= EKONOMI USAHA ================= */
/* skala memberi imbal-hasil menurun (bukan kelipatan linear) supaya pertumbuhan terkendali */
function skalaFaktor(u){ return 1+0.35*((u.skala||1)-1); }
function bukaUsahaObj(k,modal,opts){
  opts=opts||{};
  const s=SEKTOR_MAP[k];
  const sk=opts.skala||1;
  const u={k, n:opts.nama||namaUsaha(s,sk), skala:sk, modal:Math.round(modal),
    karyawan:opts.karyawan!=null?opts.karyawan:ri(1,3)+Math.round(sk*s.padat),
    kinerja:opts.kinerja||ri(55,72), brand:opts.brand||ri(8,22), milik:opts.milik!=null?opts.milik:1, umur:0,
    share:opts.share!=null?opts.share:ri(3,9), sRelasi:opts.sRelasi!=null?opts.sRelasi:ri(45,65),
    keyKaryawan:opts.keyKaryawan||0, waralaba:false, proyek:0};
  /* sektor padat modal: pipeline proyek (modal terikat dulu, cair belakangan) */
  if(k==='properti'||k==='manufaktur')u.proyek=ri(1,3);
  /* startup tek: bakar duit & runway sampai product-market fit */
  if(k==='tek'){ u.bakar=Math.round(u.modal*0.22); u.runway=opts.runway||ri(2,4); }
  return u;
}
function nilaiUsaha(u){ return Math.round(u.modal*skalaFaktor(u)*(0.6+u.kinerja/200+u.brand/300+(u.share||5)/500)); }
function labaUsaha(u){
  const s=SEKTOR_MAP[u.k];
  /* faktor pasar makro — dibatasi agar tak meledak */
  let mkt;
  if(N.ekonomi==='boom')mkt=1+0.22*s.sens;
  else if(N.ekonomi==='resesi')mkt=1-0.26*s.sens;
  else mkt=1+(r()*0.10-0.05);
  mkt*=(0.8+N.daya/250);
  mkt*=(N.harga&&N.harga[u.k]?N.harga[u.k]:1);     /* siklus harga per-sektor */
  if(N.tren===u.k)mkt*=1.18;
  if(N.pandemiSisa>0){
    if(u.k==='kuliner'||u.k==='fashion'||u.k==='otomotif'||u.k==='media'||u.k==='properti')mkt*=0.7;
    else if(u.k==='tek'||u.k==='farmasi'||u.k==='logistik'||u.k==='ekspor')mkt*=1.2;
  }
  mkt=clamp(mkt,0.25,2.3);
  const musim=s.musiman?(0.75+r()*0.5):1;
  const rng=clamp(1+(r()*2-1)*s.risk,0.3,1+s.risk*0.9);
  const perf=0.5+u.kinerja/200+u.brand/300+(u.share||5)/250+P.st.operasi/700+P.st.pemasaran/800;
  const key=1+(u.keyKaryawan||0)*0.04;
  let gross=u.modal*s.margin*skalaFaktor(u)*perf*mkt*musim*rng*key;
  /* startup tek: rugi (bakar) sebelum fit, lalu melonjak setelah fit */
  if(u.k==='tek'){ if((u.kinerja+u.brand)>=110)gross*=1.5; else gross-=(u.bakar||u.modal*0.2); }
  /* upah sebagai porsi dari pendapatan (skala otomatis) + diseconomy of scale (birokrasi) + overhead tetap */
  const laborShare=0.22+s.padat*0.33+0.025*Math.max(0,u.skala-1);   /* organisasi besar makin tak efisien — menahan ROIC agar tak meledak */
  const sFactor=1.12-0.0024*(u.sRelasi!=null?u.sRelasi:50);   /* relasi supplier menekan biaya */
  const opex=Math.max(0,gross)*laborShare*sFactor + u.modal*0.035*skalaFaktor(u)*skalaFaktor(u);
  return Math.round(gross-opex);
}
function netWorth(){
  let n=P.kas-P.utang+P.investasi;
  for(const u of P.usaha)n+=Math.round(nilaiUsaha(u)*u.milik);
  return Math.round(n);
}
function totalKaryawan(){ return P.usaha.reduce((a,u)=>a+u.karyawan,0); }
function jumlahSektor(){ return new Set(P.usaha.map(u=>u.k)).size; }
function cekSkalaAch(){
  const maxSk=P.usaha.reduce((m,u)=>Math.max(m,u.skala),0);
  if(maxSk>=3)ach('ukm'); if(maxSk>=4)ach('besar'); if(maxSk>=5)ach('korporasi'); if(maxSk>=6)ach('konglomerat');
  if(jumlahSektor()>=5)ach('diversifikasi');
  if(jumlahSektor()>=SEKTOR.length)ach('semuaSektor');
}

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
  if(!G.current && G.queue.length){G.current=G.queue.shift(); renderKartu();}
  render();
}

/* ================= EKONOMI MAKRO & DRIFT ================= */
function rollEkonomi(){
  const x=r();
  if(x<0.13){ N.ekonomi='resesi'; addLog('<b>RESESI.</b> Daya beli anjlok, pasar lesu, banyak usaha gulung tikar.','bad'); }
  else if(x<0.33){ N.ekonomi='boom'; addLog('Ekonomi tumbuh pesat — konsumsi naik, modal mengalir, peluang bertebaran.','good'); }
  else N.ekonomi='normal';
  N.inflasi=clamp(N.inflasi+ri(-2,3),1,40);
  N.suku=clamp(N.suku+ri(-2,3),3,22);
  N.daya=clamp(N.daya+(N.ekonomi==='boom'?ri(2,8):N.ekonomi==='resesi'?ri(-9,-2):ri(-3,3)),15,95);
  if(r()<0.5)N.tren=pick(SEKTOR).k;
  /* siklus harga/komoditas per-sektor: random walk, swing lebih besar utk sektor berisiko */
  if(!N.harga)N.harga={};
  for(const s of SEKTOR){
    if(N.harga[s.k]==null)N.harga[s.k]=1;
    const swing=(r()*2-1)*(0.08+s.risk*0.18) + (N.ekonomi==='boom'?0.05:N.ekonomi==='resesi'?-0.07:0);
    N.harga[s.k]=+clamp(N.harga[s.k]+swing,0.55,1.7).toFixed(2);
  }
  if(N.pandemiSisa>0)N.pandemiSisa--;
}
function drift(){
  const s=P.st;
  P.years++;
  /* di penjara */
  if(P.penjara>0){
    P.penjara--;
    addLog('Setahun berlalu di balik jeruji. Bisnis dijalankan seadanya oleh orang kepercayaan. Sisa masa tahanan: '+P.penjara+' tahun.','sys');
    /* usaha terbengkalai */
    for(const u of P.usaha)u.kinerja=clamp(u.kinerja-ri(6,12),0,100);
    if(P.penjara<=0){ addLog('<b>Anda bebas.</b> Reputasi tercoreng, tapi naluri dagang tak bisa dipenjara.','sys'); stamp('BEBAS','green'); milestone('Bebas dari lapas'); }
    return;
  }
  /* === P&L tiap usaha === */
  let labaTotal=0; const tutup=[];
  for(const u of P.usaha){
    u.umur++;
    let laba=Math.round(labaUsaha(u)*(u.milik!=null?u.milik:1));   /* hanya porsi kepemilikan yang masuk kantong */
    /* sektor padat modal: selama proyek jalan, kas terikat; cair saat rampung */
    if(u.proyek>0){
      u.proyek--;
      if(u.proyek<=0){ const lump=Math.round(nilaiUsaha(u)*(u.milik!=null?u.milik:1)*ri(15,28)/100); laba=Math.round(laba*0.3)+lump;
        addLog('Proyek <b>'+u.n+'</b> rampung — pencairan termin '+rp(lump)+' masuk.','good'); }
      else laba=Math.round(laba*0.18);
    }
    labaTotal+=laba; P.kas+=laba;
    if(Math.abs(laba)>=20e6)addLog('Usaha '+u.n+' ('+SEKTOR_MAP[u.k].n+') '+(laba>=0?'untung ':'rugi ')+rp(Math.abs(laba))+' tahun ini.',laba>=0?'good':'bad');
    /* royalti waralaba: pendapatan pasif modest dari mitra gerai */
    if(u.waralaba){ const roy=Math.round(nilaiUsaha(u)*0.022); P.kas+=roy; labaTotal+=roy; }
    /* pangsa pasar bergerak mengikuti kinerja tahun ini */
    u.share=clamp((u.share||5)+(laba>0?(r()<0.5?1:0):-(r()<0.6?1:0)),1,100);
    /* karyawan kunci bisa dibajak kalau kesejahteraan pekerja rendah */
    if(u.keyKaryawan>0&&P.buruh<45&&r()<0.12){ u.keyKaryawan=0; u.kinerja=clamp(u.kinerja-ri(5,12),0,100);
      addLog('Karyawan kunci di '+u.n+' dibajak kompetitor — kinerja merosot.','bad'); }
    /* relasi supplier meluruh pelan kalau tak dirawat */
    u.sRelasi=clamp((u.sRelasi!=null?u.sRelasi:50)-(r()<0.4?1:0),0,100);
    /* entropi kinerja & merek menua kalau tak dirawat */
    u.kinerja=clamp(u.kinerja-ri(1,4),0,100);
    u.brand=clamp(u.brand-(r()<0.5?1:0),0,100);
    /* startup tek: runway menipis; habis tanpa fit → tutup, kecuali sudah punya traksi */
    if(u.k==='tek'){
      const fit=(u.kinerja+u.brand)>=110;
      if(!fit&&u.runway>0){ u.runway--;
        if(u.runway<=0){
          if(u.kinerja+u.brand>=85&&(u.rescues||0)<2){ u.runway=1; u.rescues=(u.rescues||0)+1; addLog('Startup '+u.n+' nyaris kehabisan napas — Anda menambal runway dari kas operasional ('+(u.rescues)+'/2).'+fx({kas:-Math.round(u.modal*0.3)}),'bad'); }
          else { tutup.push(u); addLog('<b>'+u.n+'</b> kehabisan runway tanpa product-market fit — startup gulung tikar.','bad'); }
        }
      }
    }
  }
  if(tutup.length){ for(const u of tutup){ const i=P.usaha.indexOf(u); if(i>=0)P.usaha.splice(i,1); P.usahaBangkrut++; milestone('Startup tutup: '+u.n); } }
  /* === pajak === */
  if(labaTotal>0){
    const patuh=P.modusPajak==='patuh';
    const pajak=Math.round(labaTotal*0.11*(patuh?1:0.25));
    P.kas-=pajak;
    if(!patuh){ const luput=Math.round(labaTotal*0.11*0.75); P.pajakNunggak+=luput;
      P.heat=clamp(P.heat+clamp(Math.round(luput/200e6),3,16),0,100);   /* makin besar yang dikemplang, makin disorot */
      addLog('Pajak "dioptimasi" lewat celah & faktur kreatif — '+rp(luput)+' yang seharusnya disetor, tidak disetor.','bad'); }
    else if(pajak>=10e6)addLog('Anda menyetor pajak '+rp(pajak)+' ke negara. Patuh, meski terasa berat.','sys');
  }
  /* === bunga utang === */
  if(P.utang>0){
    const bunga=Math.round(P.utang*(N.suku/100+0.025));
    P.kas-=bunga;
    if(bunga>=5e6)addLog('Bunga utang menggerus '+rp(bunga)+' tahun ini.','sys');
  }
  /* === investasi pribadi tumbuh === */
  if(P.investasi>0){
    const pct=N.ekonomi==='boom'?ri(2,22):N.ekonomi==='resesi'?ri(-25,4):ri(-8,18);
    const d=Math.round(P.investasi*pct/100); P.investasi=Math.max(0,P.investasi+d);
  }
  /* === biaya hidup pribadi: menyesuaikan kekayaan (hemat saat miskin, lifestyle creep saat kaya) === */
  const baseHidup=clamp(Math.round(netWorth()*0.012),14e6,8e9);
  const hidup=Math.round(baseHidup*(P.gaya==='mewah'?2.4:P.gaya==='hemat'?0.7:1)*(1+P.anak*0.12)*(0.85+r()*0.3));
  P.kas-=hidup;
  /* === stres rentang kendali === */
  if(P.usaha.length>4)s.stres=clamp(s.stres+(P.usaha.length-4)*2,0,100);
  s.stres=clamp(s.stres-1,0,100);
  if(s.stres>74)s.kesehatan=clamp(s.kesehatan-3,0,100);
  if(P.age>52)s.kesehatan=clamp(s.kesehatan-1,0,100);
  if(P.age>64)s.kesehatan=clamp(s.kesehatan-1,0,100);
  /* tunggakan pajak besar memperlambat redanya sorotan */
  P.heat=clamp(P.heat-(P.modusPajak==='hindar'&&P.pajakNunggak>=2e9?1:2),0,100);
  P.reputasi=clamp(P.reputasi-(r()<0.4?1:0),0,100);
  if(P.kas<0&&r()<0.5)addLog('Kas minus — Anda menutup lubang dengan dana pribadi & menunda bayar supplier.'+fx({stres:+5}),'bad');
  const nw=netWorth(); P.sumNet+=nw; if(nw>P.maxNet)P.maxNet=nw;
}
