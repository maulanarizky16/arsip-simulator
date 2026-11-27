'use strict';
/* ================= EVENT TAHUNAN ================= */
function events(){
  const s=P.st;
  razia();
  if(P.penjara>0||G.over)return;
  cekBangkrut();
  if(G.over)return;

  /* === MILESTONE KEKAYAAN === */
  const nw=netWorth();
  if(nw>=1e9)ach('miliarder');
  if(nw>=1e12)ach('triliuner');
  if(nw>=5e12)ach('sultan');

  /* === KONDISI MAKRO MENGHAJAR/MENGANGKAT (event interaktif sesekali) === */
  if(N.ekonomi==='resesi'&&P.usaha.length&&r()<0.4){
    ask({title:'BADAI RESESI',text:'Penjualan anjlok di semua lini. Kas menipis, sebagian karyawan menganggur. Langkah Anda?',opts:[
      {t:'Rampingkan & efisiensi',sub:'PHK sebagian, tekan biaya',e:()=>{ for(const u of P.usaha)u.karyawan=Math.max(1,Math.round(u.karyawan*0.7));
        addLog('Anda merampingkan organisasi demi bertahan. Beban biaya turun, tapi sebagian keluarga kehilangan nafkah.'+fx({kas:+Math.round(nw*0.01),buruh:-8,stres:+6}),'bad'); leg(1,-3);}},
      {t:'Pertahankan semua karyawan',sub:'Tanggung rugi demi mereka',e:()=>{ const b=Math.round(P.usaha.reduce((a,u)=>a+u.karyawan,0)*15e6);
        addLog('Anda menolak PHK, menalangi gaji dari kas pribadi. Mereka takkan lupa.'+fx({kas:-b,buruh:+10,reputasi:+3,stres:+5}),'good'); leg(-1,4);}},
      {t:'Banting harga jor-joran',sub:'Rebut pasar pesaing',e:()=>{ for(const u of P.usaha)u.brand=clamp(u.brand+ri(2,6),0,100);
        addLog('Anda perang harga habis-habisan. Margin tipis, tapi pangsa pasar membesar saat pesaing tumbang.'+fx({stres:+4}),'sys'); leg(2,-1);}}
    ]});
  }
  /* === KRISIS MONETER (langka, dahsyat) === */
  if(!P.evKrisis98&&N.tahun>=2010&&r()<0.02){
    P.evKrisis98=true;
    addLog('<b>KRISIS MONETER!</b> Rupiah ambruk, bunga meroket, bank-bank limbung. Utang dolar jadi mimpi buruk.','bad');
    const rugi=Math.round(P.kas*0.3+P.utang*0.5);
    P.kas-=Math.round(P.kas*0.3); P.utang=Math.round(P.utang*1.4);
    for(const u of P.usaha)u.kinerja=clamp(u.kinerja-ri(8,18),0,100);
    addLog('Nilai usaha menyusut, utang membengkak. Kerugian ditaksir '+rp(rugi)+'.'+fx({stres:+12}),'bad'); leg(0,-2);
    if(P.usaha.length&&P.kas>0)ach('survivor');
  }
  /* === PESAING & PERANG HARGA === */
  if(P.usaha.length&&r()<0.18){
    const u=pick(P.usaha);
    u.share=clamp((u.share||5)-ri(2,5),1,100);   /* pesaing langsung menggerogoti pangsa pasar */
    addLog('Pesaing baru bermodal kuat masuk ke sektor '+SEKTOR_MAP[u.k].n+', merebut sebagian pangsa pasar '+u.n+'.','bad');
    ask({title:'SERANGAN PESAING',text:'Pemain baru membakar uang untuk merebut pelangganmu di '+u.n+' (pangsa pasar kini '+u.share+'%).',opts:[
      {t:'Tingkatkan kualitas & layanan',sub:'Modal '+rp(Math.round(u.modal*0.2)),cond:()=>P.kas>=u.modal*0.2,e:()=>{P.kas-=Math.round(u.modal*0.2);u.kinerja=clamp(u.kinerja+ri(8,15),0,100);u.brand=clamp(u.brand+ri(4,8),0,100);u.share=clamp(u.share+ri(3,7),1,100);addLog('Anda menjawab dengan mutu, bukan banting harga. Pelanggan setia bertahan dan pangsa pasar pulih.'+fx({reputasi:+2}),'good');leg(1,1);}},
      {t:'Ikut perang harga',e:()=>{u.brand=clamp(u.brand-ri(3,7),0,100);u.share=clamp(u.share+ri(1,4),1,100);addLog('Anda meladeni perang harga — pangsa pasar tertahan, tapi margin tergerus dan pasar jadi tidak sehat.'+fx({stres:+4}),'bad');leg(0,-1);}},
      {t:'Akuisisi saja pesaingnya',sub:'Kalau tak bisa dilawan, beli',cond:()=>P.kas>=u.modal*0.8,e:()=>{P.kas-=Math.round(u.modal*0.8);u.modal=Math.min(1e12,Math.round(u.modal*1.35));u.skala=Math.max(u.skala,skalaModal(u.modal));u.karyawan+=ri(3,8);u.share=clamp(u.share+ri(8,16),1,100);P.akuisisiKali++;addLog('Daripada perang, Anda caplok pesaingnya. '+u.n+' kini lebih besar dan menguasai pasar.','good');if(P.akuisisiKali>=3)ach('akuisitor');leg(2,0);cekSkalaAch();}}
    ]});
  }
  /* === VIRAL / SKANDAL MEREK === */
  if(P.usaha.length&&r()<0.16){
    const u=pick(P.usaha);
    if(r()<0.55){ u.brand=clamp(u.brand+ri(8,18),0,100); addLog('<b>VIRAL!</b> '+u.n+' mendadak ramai diperbincangkan di medsos. Antrean mengular, omzet meledak.'+fx({reputasi:+2}),'good'); leg(1,1); }
    else { u.brand=clamp(u.brand-ri(8,16),0,100); addLog('Ulasan buruk soal '+u.n+' viral — pelanggan kecewa membanjiri kolom komentar.'+fx({reputasi:-2,stres:+4}),'bad'); leg(0,-1); }
  }
  /* === BAHAN BAKU / SUPPLIER (dampak diredam relasi pemasok) === */
  if(P.usaha.length&&r()<0.16){
    const u=pick(P.usaha);
    const sr=(u.sRelasi!=null?u.sRelasi:50);
    const hit=Math.round(u.modal*0.08*(1.3-0.008*sr));   /* relasi pemasok bagus = guncangan lebih kecil */
    u.sRelasi=clamp(sr-ri(2,6),0,100);
    addLog('Harga bahan baku '+SEKTOR_MAP[u.k].n+' melonjak / pasokan '+u.n+' tersendat. '+(sr>=70?'Untung relasi pemasok kuat, dampaknya teredam.':sr<=35?'Relasi pemasok yang renggang memperparah keadaan.':'Margin tertekan.')+fx({kas:-hit,stres:+3}),'bad');
  }
  /* === DEMO BURUH (kalau pekerja ditelantarkan) === */
  if(P.buruh<40&&totalKaryawan()>=8&&r()<0.4){
    ask({title:'BURUH MOGOK',text:'Karyawan Anda mogok menuntut upah & kondisi kerja layak. Produksi lumpuh, spanduk terpasang di depan pabrik.',opts:[
      {t:'Penuhi tuntutan, naikkan upah',sub:'Biaya naik, tapi adil',e:()=>{const b=Math.round(totalKaryawan()*12e6);P.kas-=b;addLog('Anda berunding dan menaikkan kesejahteraan. Produktivitas pulih, hormat mereka kembali.'+fx({buruh:+25,reputasi:+3}),'good');leg(0,4);ach('adil');}},
      {t:'Bungkam pakai preman & PHK provokator',e:()=>{addLog('Pemimpin demo "dirumahkan", massa dibubarkan paksa. Tenang sesaat, dendam tertanam.'+fx({buruh:-10,reputasi:-6,heat:+4}),'bad');leg(1,-6);ach('pemerasBuruh');}},
      {t:'Tutup mata, anggap angin lalu',e:()=>{for(const u of P.usaha)u.kinerja=clamp(u.kinerja-ri(4,9),0,100);addLog('Anda abaikan. Mogok berlarut, kinerja semua lini anjlok.'+fx({stres:+6}),'bad');leg(0,-2);}}
    ]});
  }
  /* === BENCANA / KEBAKARAN === */
  if(P.usaha.length&&r()<0.07){
    const u=pick(P.usaha);
    const rugi=Math.round(nilaiUsaha(u)*ri(15,35)/100);
    addLog('<b>MUSIBAH:</b> '+pick(['kebakaran','banjir','gempa','ledakan'])+' melanda '+u.n+'. Kerugian '+rp(rugi)+'.','bad');
    u.kinerja=clamp(u.kinerja-ri(15,30),0,100);
    ask({title:'MUSIBAH MENIMPA USAHA',text:u.n+' luluh lantak. Asuransi menanggung sebagian — kalau Anda dulu mengasuransikan.',opts:[
      {t:'Bangun kembali lebih kokoh',sub:rp(rugi),cond:()=>P.kas>=rugi,e:()=>{P.kas-=rugi;u.kinerja=clamp(u.kinerja+ri(20,30),0,100);u.brand=clamp(u.brand+3,0,100);addLog('Anda membangun ulang, lebih tahan banting. Karyawan terharu Anda tak menyerah.'+fx({reputasi:+2,stres:+5}),'good');leg(1,2);}},
      {t:'Klaim seadanya & relakan',e:()=>{P.kas+=Math.round(rugi*0.3);addLog('Anda merelakan sebagian, ambil klaim seadanya. '+u.n+' jalan terpincang.'+fx({stres:+4}),'bad');leg(0,-1);}}
    ]});
  }
  /* === TAWARAN AKUISISI (exit) === */
  if(P.usaha.length&&r()<0.08){
    const u=P.usaha.slice().sort((a,b)=>nilaiUsaha(b)-nilaiUsaha(a))[0];
    const tawar=Math.round(nilaiUsaha(u)*u.milik*ri(150,260)/100);
    ask({title:'TAWARAN AKUISISI',text:'Sebuah grup besar ingin membeli <b>'+u.n+'</b> ('+SEKTOR_MAP[u.k].n+') seharga '+rp(tawar)+' — di atas nilai pasarnya. Jual?',opts:[
      {t:'Jual & cairkan cuan',e:()=>{P.kas+=tawar;P.usaha.splice(P.usaha.indexOf(u),1);P.usahaTutup++;addLog('Anda melepas '+u.n+' di puncak harga. '+rp(tawar)+' masuk ke kas.'+fx({reputasi:+1}),'good');ach('exit');milestone('Exit: jual '+u.n);leg(3,0);}},
      {t:'Tahan, ini baru permulaan',e:()=>addLog('Anda menolak. "Belum dijual, masih mau dibesarkan." Keyakinan seorang pendiri.'+fx({reputasi:+1}),'sys')}
    ]});
  }
  /* === PEMERASAN PREMAN/ORMAS === */
  if(P.usaha.length&&P.heat<60&&r()<0.08){
    const u=pick(P.usaha);
    const jatah=Math.round(nilaiUsaha(u)*ri(2,6)/100);
    ask({title:'"UANG KEAMANAN"',text:'Sekelompok ormas/preman datang ke '+u.n+', minta "uang keamanan" '+rp(jatah)+' per tahun. Kalau tidak, "jangan salahkan kami".',opts:[
      {t:'Bayar demi tenang',e:()=>{P.kas-=jatah;addLog('Anda membayar. Lapak aman, tapi setoran ini akan jadi langganan.'+fx({stres:+3}),'sys');leg(0,-1);}},
      {t:'Lapor polisi & lawan',e:()=>{ if(r()<0.55){addLog('Aparat menindak, sindikat kabur. Anda jadi contoh pengusaha yang berani.'+fx({reputasi:+3}),'good');leg(0,3);}
        else {u.kinerja=clamp(u.kinerja-ri(8,16),0,100);addLog('Mereka membalas: lapak dirusak, karyawan diintimidasi.'+fx({stres:+8}),'bad');leg(0,1);} }},
      {t:'Rekrut mereka jadi "keamanan"',e:()=>{P.kas-=Math.round(jatah*1.5);addLog('Anda rangkul mereka jadi tim keamanan resmi. Mahal, tapi kini di pihak Anda — area abu-abu.'+fx({heat:+3}),'sys');leg(1,-2);}}
    ]});
  }
  /* === DITIPU MITRA / KARYAWAN === */
  if(!P.evTipu&&P.usaha.length&&P.st.finansial<55&&r()<0.06){
    P.evTipu=true;
    const rugi=Math.round(Math.max(P.kas*0.15,nilaiUsaha(pick(P.usaha))*0.1));
    addLog('Tangan kanan kepercayaan Anda ternyata menggelapkan dana perusahaan bertahun-tahun. Kerugian '+rp(rugi)+' baru ketahuan sekarang.'+fx({kas:-rugi,stres:+10,finansial:+4}),'bad'); leg(0,-2); milestone('Digelapkan orang kepercayaan');
  }
  /* === GUGATAN HUKUM === */
  if(P.usaha.length&&r()<0.06){
    const denda=Math.round(nilaiUsaha(pick(P.usaha))*ri(3,9)/100);
    ask({title:'GUGATAN HUKUM',text:'Anda digugat (sengketa kontrak / hak cipta / konsumen). Potensi ganti rugi '+rp(denda)+'.',opts:[
      {t:'Hadapi di pengadilan',sub:'Sewa pengacara',cond:()=>P.kas>=denda*0.3,e:()=>{P.kas-=Math.round(denda*0.3); if(r()<0.55){addLog('Anda menang. Hanya biaya pengacara yang keluar.'+fx({reputasi:+1}),'good');}else{P.kas-=denda;addLog('Anda kalah dan membayar ganti rugi penuh.'+fx({reputasi:-2,stres:+6}),'bad');leg(0,-1);}}},
      {t:'Berdamai di luar pengadilan',e:()=>{P.kas-=Math.round(denda*0.6);addLog('Anda berdamai, bayar sebagian. Masalah selesai diam-diam.'+'','sys');}}
    ]});
  }
  /* === PANDEMI (guncangan menetap 2-3 tahun lewat N.pandemiSisa) === */
  if(!P.evPandemi&&r()<0.02){
    P.evPandemi=true; N.pandemiSisa=ri(2,3);
    addLog('<b>WABAH GLOBAL.</b> Pembatasan sosial melumpuhkan ekonomi selama beberapa tahun. Sebagian sektor babak belur (kuliner, fashion, otomotif, properti, media), sebagian malah panen (tek, farmasi, logistik, ekspor).','bad');
    for(const u of P.usaha){
      if(u.k==='kuliner'||u.k==='fashion'||u.k==='otomotif'||u.k==='media'||u.k==='properti')u.kinerja=clamp(u.kinerja-ri(10,20),0,100);
      else if(u.k==='tek'||u.k==='farmasi'||u.k==='logistik'||u.k==='ekspor'){u.kinerja=clamp(u.kinerja+ri(5,12),0,100);u.brand=clamp(u.brand+ri(3,8),0,100);}
    }
    addLog('Anda harus memutar otak: pindahkan modal ke sektor yang bertahan, atau bertahan menunggu badai lewat.'+fx({stres:+8}),'sys');
  }
  /* === SUKSESI / WARISAN (kalau punya anak & tua) === */
  if(P.keluarga&&P.anak>0&&P.age>=55&&!P.evWarisan&&jumlahSektor()>=2&&r()<0.12){
    P.evWarisan=true;
    ask({title:'SUKSESI IMPERIUM',text:'Usia merambat, dan anak Anda sudah dewasa. Siapa yang akan melanjutkan kerajaan bisnis ini?',opts:[
      {t:'Didik anak jadi penerus',sub:'Wariskan & bimbing',e:()=>{addLog('Anda menyiapkan anak sebagai penerus, mengajarinya seluk-beluk usaha. Imperium punya masa depan.'+fx({reputasi:+3,stres:-4}),'good');ach('warisan');leg(2,3);milestone('Menyiapkan penerus');}},
      {t:'Rekrut CEO profesional',sub:'Serahkan ke ahlinya',e:()=>{for(const u of P.usaha)u.kinerja=clamp(u.kinerja+ri(4,9),0,100);addLog('Anda menyerahkan operasional ke manajemen profesional. Lebih rapi, meski kurang "rasa keluarga".'+fx({stres:-6}),'good');leg(1,1);}},
      {t:'Pegang sendiri sampai akhir',e:()=>addLog('Anda enggan melepas kendali. "Belum ada yang sehebat saya." Beban di pundak terus bertambah.'+fx({stres:+6}),'sys')}
    ]});
  }
  /* === KELUARGA & KESEHATAN === */
  if(!P.keluarga&&P.age>=28&&r()<0.2){ P.keluarga=true; addLog('Anda menikah. Ada pelabuhan untuk pulang setelah hari-hari penuh angka.'+fx({stres:-5,kesehatan:+2}),'good'); milestone('Menikah'); }
  if(P.keluarga&&P.anak<3&&P.age<48&&r()<0.18){ P.anak++; addLog('Anak ke-'+P.anak+' lahir. Satu alasan lagi membesarkan usaha.'+fx({stres:-2}),'good'); }
  if(P.age>=48&&s.kesehatan<58&&r()<0.25){ const b=ri(20,60)*1e6; addLog('Tekanan bertahun-tahun menagih — Anda sempat dirawat. Biaya '+rp(b)+'.'+fx({kas:-b,kesehatan:+6,stres:+3}),'bad'); }
  /* === LAPORAN TAHUNAN === */
  if(r()<0.5){
    addLog('Neraca tahunan: kekayaan bersih '+rp(nw)+', '+P.usaha.length+' usaha di '+jumlahSektor()+' sektor, '+totalKaryawan()+' karyawan. Tren pasar: <b>'+SEKTOR_MAP[N.tren].n+'</b>.','sys');
  }
  /* === PENSIUN === */
  if(!P.retired&&P.age>=62&&r()<0.3){
    P.retired=true;
    addLog('Di usia '+P.age+', Anda mundur dari hiruk-pikuk harian, menyerahkan tongkat estafet. Cukup sudah.'+fx({stres:-15}),'sys');
    stamp('PENSIUN'); milestone('Pensiun dari dunia usaha');
  }
}

/* ================= KEBANGKRUTAN ================= */
function cekBangkrut(){
  if(P.retired||P.penjara>0)return;
  const nw=netWorth();
  if(P.kas<0&&P.kas< -(Math.max(P.investasi+ (nw>0?nw*0.4:0),100e6))){
    /* kas minus dalam & tak tertutup aset likuid → harus jual atau bangkrut */
    if(P.usaha.length){
      const u=P.usaha.slice().sort((a,b)=>nilaiUsaha(b)-nilaiUsaha(a))[0];
      const cair=Math.round(nilaiUsaha(u)*u.milik*0.6);
      ask({title:'TERANCAM BANGKRUT',text:'Kas Anda minus dalam ('+rp(P.kas)+') dan kreditor menagih. Harus ada yang dikorbankan.',opts:[
        {t:'Jual usaha terbaik untuk tutup utang',sub:u.n+' → '+rp(cair),e:()=>{P.kas+=cair;P.usaha.splice(P.usaha.indexOf(u),1);P.usahaTutup++;addLog('Dengan berat hati Anda menjual '+u.n+' obral demi menambal kas.'+fx({stres:+8,reputasi:-2}),'bad');leg(-1,-1);}},
        {t:'Restrukturisasi utang dengan bank',sub:'Perpanjang tenor, tetap menanggung',e:()=>{P.utang+=Math.abs(Math.round(P.kas*0.5));P.kas=Math.round(P.kas*0.4);addLog('Anda berunding ulang dengan bank. Napas sedikit lega, beban utang membesar.'+fx({stres:+6}),'sys');}},
        {t:'Nyatakan pailit',sub:'Lepas semua, mulai dari nol',e:()=>pailit()}
      ]});
    } else if(P.kas< -300e6){ pailit(); }
  }
}
function pailit(){
  P.bangkrutTotal++;
  const hangus=P.usaha.length;
  P.usahaBangkrut+=hangus;
  P.usaha=[]; P.utang=0; P.kas=Math.max(P.kas,Math.round(ri(20,80)*1e6));
  addLog('<b>PAILIT.</b> '+hangus+' usaha dilelang, utang dihapus lewat kepailitan, nama Anda tercoreng di kalangan bisnis. Anda kembali ke titik nol — dengan luka dan pengalaman.'+fx({reputasi:-15,stres:+12}),'bad');
  stamp('BANGKRUT'); milestone('Dinyatakan pailit'); leg(-4,-3);
}

/* ================= PENEGAKAN HUKUM (pajak/korupsi) ================= */
function razia(){
  if(P.penjara>0||G.over)return;
  const pelu=(P.heat-30)/130;
  if(P.heat>=34&&r()<pelu){
    stamp('PEMERIKSAAN APARAT');
    ask({title:'DITJEN PAJAK & APH MENGETUK',text:'Pemeriksaan pajak dan dugaan suap/penggelapan menyeruak. Rekening diperiksa, faktur ditelusuri. <span class="d">(Sorotan: '+P.heat+'/100, tunggakan pajak: '+rp(P.pajakNunggak)+')</span>',opts:[
      {t:'Sewa konsultan & pengacara pajak top',sub:'Rp 2 M · perlemah temuan',cond:()=>P.kas>=2e9,e:()=>{P.kas-=2e9;resolveRazia(0.28);}},
      {t:'Lobi & "selesaikan" dengan pemeriksa',sub:'Rp 3 M (boleh gelap) · berisiko',cond:()=>P.kas+P.gelap>=3e9,e:()=>{const c=3e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.kas-=(c-dg);resolveRazia(0.34);}},
      {t:'Andalkan koneksi pejabat',sub:'Butuh Relasi tinggi (≥65)',cond:()=>P.st.relasi>=65,e:()=>resolveRazia(0.12+P.st.relasi/260)},
      {t:'Bayar tunggakan & denda, kooperatif',sub:'Bersihkan, jujur',cond:()=>P.kas>=P.pajakNunggak,e:()=>{P.kas-=Math.round(P.pajakNunggak*1.5);P.pajakNunggak=0;P.modusPajak='patuh';addLog('Anda melunasi tunggakan plus denda dan berbenah. Mahal, tapi tidur nyenyak.'+fx({heat:-30,reputasi:+2}),'good');leg(-1,2);}},
      {t:'Pasrah, hadapi apa adanya',e:()=>resolveRazia(0)}
    ]});
  }
}
function resolveRazia(bonus){
  const selamat=clamp(0.12+bonus+P.st.relasi/350+P.reputasi/500,0.05,0.9);
  const x=r();
  if(x<selamat){
    addLog('Temuan "tidak cukup kuat", kasus diendapkan. Anda <b>LOLOS</b> — pelumas dan koneksi bekerja.'+fx({heat:-32,stres:+5}),'sys');
    leg(-3,0); milestone('Lolos dari pemeriksaan'); P.pajakNunggak=Math.round(P.pajakNunggak*0.4);
  } else if(x<selamat+0.3){
    const denda=Math.round(P.pajakNunggak*2+netWorth()*0.05);
    P.kas-=denda; P.pajakNunggak=0; P.modusPajak='patuh';
    addLog('Anda lolos dari pidana tapi dijatuhi <b>denda besar</b> '+rp(denda)+' dan namamu jadi sorotan media.'+fx({heat:-16,reputasi:-12,stres:+8}),'bad');
    leg(-2,-3); milestone('Kena denda pajak besar');
  } else {
    ditangkap();
  }
}
function ditangkap(){
  let th=ri(2,6);
  const sita=P.gelap+Math.round(netWorth()*0.2); P.gelap=0; P.kas-=Math.round(netWorth()*0.2);
  P.vonis=true; P.penjara=th;
  addLog('Palu hakim mengetuk untukmu: <b>vonis '+th+' tahun penjara</b> atas penggelapan pajak & suap, aset '+rp(sita)+' disita. Kerajaan yang dibangun puluhan tahun runtuh seketika.'+fx({reputasi:-30,stres:+15}),'bad');
  stamp('VONIS '+th+' TAHUN'); ach('jeruji'); milestone('Divonis '+th+' tahun (kasus pajak/korupsi)');
  leg(-15,-15);
}
