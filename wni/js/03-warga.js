'use strict';
/* ================= KALENDER KHAS +62 ================= */
function kalender(){
  const b=N.bulan;
  /* UMR naik tiap Januari (kecuali bulan pertama permainan) */
  if(b===1&&N.ke>1){
    if(P.profesi==='karyawan'||P.profesi==='outsourcing'){ const naik=Math.round(P.gaji*0.065); P.gaji+=naik;
      addLog('UMR naik 6,5%: gajimu naik '+rp(naik)+'. Harga-harga sudah naik duluan sejak Desember, tapi ya sudahlah.','sys'); }
    else if(P.profesi==='guru')addLog('Tahun baru, gaji honorer tetap. Katanya "sedang diperjuangkan". Sejak kapan? Sejak dulu.','sys');
    addLog('Resolusi tahun ini: hemat, olahraga, berhenti scroll sampai subuh. Bertahan sampai tanggal 7.','sys');
  }
  if(RAMADAN[N.tahun]===b)ramadan();
  if(LEBARAN[N.tahun]===b)lebaran();
  if(b===3&&(P.profesi==='karyawan'||P.profesi==='outsourcing'||P.profesi==='guru'))spt();
  if(b===8)agustusan();
  if((b===11||b===12)&&siap('harbolnas',3))harbolnas(b);
}
function ramadan(){
  addLog('Ramadan tiba. Harga takjil naik, jadwal bukber penuh, dan semua grup alumni mendadak aktif lagi.','sys');
  ask({title:'MUSIM BUKBER',text:'Undangan bukber datang bertubi-tubi: alumni SD, SMP, SMA, kantor, komunitas, sampai mantan pacar yang "cuma mau silaturahmi".',opts:[
    {t:'Datang semua',sub:'±Rp 750 rb · relasi & gengsi naik',e:()=>addLog('Kamu hadir di semua bukber. Relasi terjaga, dompet terluka, perut kembung.'+fx({saldo:-750e3,relasi:+8,gengsi:+4,sehat:-2}),'good')},
    {t:'Pilih yang penting saja',sub:'±Rp 250 rb',e:()=>addLog('Kamu datang ke dua bukber yang paling penting. Sisanya cukup "insyaallah ya".'+fx({saldo:-250e3,relasi:+3}))},
    {t:'Bukber di kos aja',sub:'Hemat, tapi dicap sombong',e:()=>addLog('Kamu buka puasa dengan gorengan di kos. Hemat, tenang, tapi grup alumni mulai berbisik "sombong sekarang".'+fx({relasi:-5,nrimo:+3}))}
  ]});
}
function lebaran(){
  const p=P.profesi?PROF[P.profesi]:null;
  if(p&&p.thr){
    const thr=P.profesi==='guru'?ri(4,8)*100e3:P.gaji;
    P.saldo+=thr; P.thrKali++; ach('thr');
    addLog(P.profesi==='guru'?'THR honorer cair: <b>'+rp(thr)+'</b>. Kamu tersenyum sopan. Dalam hati menangis sopan.':'THR cair <b>'+rp(thr)+'</b>! Untuk 3 hari kamu merasa jadi sultan.','good');
  } else if(P.profesi){
    addLog('THR? Kamu kan "mitra", bukan karyawan. Selamat Hari Raya dari aplikasi, berupa stiker ketupat.','bad');
  }
  if(P.latar==='yatim'){
    ask({title:'LEBARAN DI PERANTAUAN',text:'Kota mendadak sepi. Semua orang pulang kampung, dan kamu tidak punya kampung untuk dituju.',opts:[
      {t:'Ikut lebaran di rumah teman kantor',e:()=>addLog('Keluarga temanmu menyambut hangat. Ibunya memaksamu nambah opor tiga kali. Kamu pulang dengan perut penuh dan mata basah.'+fx({relasi:+10,waras:+6}),'good')},
      {t:'Lebaran sendiri di kos',e:()=>addLog('Kamu salat id, lalu makan ketupat instan sendirian sambil video call teman. Sepi, tapi kamu baik-baik saja. Sebagian besar.'+fx({waras:-5,nrimo:+4}))}]});
    return;
  }
  ask({title:'MUDIK LEBARAN',text:'Lebaran sudah di depan mata. Keluarga di kampung sudah tanya-tanya. Mau mudik naik apa?',opts:[
    {t:'Naik motor',sub:'Murah, tapi 14 jam & pegal',cond:()=>P.motor,e:()=>{ const bensin=Math.round(400e3*N.harga);
      addLog('Kamu mudik naik motor bawa tas ransel dan kardus mi instan. Macet di Brebes, pantat mati rasa, tapi sampai juga.'+fx({saldo:-bensin,sehat:-6,relasi:+8}),'good'); mudikDone(); }},
    {t:'Bus / kereta',sub:'±Rp 1,2 jt pulang-pergi',e:()=>{ const t=Math.round(1.2e6*N.harga);
      addLog('Kamu dapat tiket kereta setelah perang klik di jam 00.00. Duduk tegak 9 jam, tapi aman.'+fx({saldo:-t,relasi:+8,sehat:-2}),'good'); mudikDone(); }},
    {t:'Pesawat',sub:'±Rp 3,5 jt · gengsi naik',e:()=>{ const t=Math.round(3.5e6*N.harga);
      addLog('Kamu pulang naik pesawat. Tetangga di kampung bisik-bisik "wah sukses dia sekarang". Rekening bisik-bisik balik.'+fx({saldo:-t,relasi:+8,gengsi:+8}),'good'); mudikDone(); }},
    {t:'Tidak mudik tahun ini',sub:'Hemat, tapi ibu sedih',e:()=>addLog('Kamu lebaran lewat video call. Ibu bilang "nggak apa-apa", dengan nada yang jelas apa-apa.'+fx({relasi:-8,waras:-3}),'bad')}
  ]});
}
function mudikDone(){
  P.mudikKali=(P.mudikKali||0)+1; ach('mudik');
  const tempel=Math.round((P.st.gengsi>=60?1.5e6:600e3)*N.harga);
  addLog('Salam tempel untuk para ponakan: '+rp(tempel)+'. Mereka menerimanya sambil langsung menghitung di depanmu.'+fx({saldo:-tempel}),'sys');
  const tanya=P.menikah?'Kapan punya momongan?':'Kapan nikah?';
  ask({title:'PERTANYAAN WAJIB LEBARAN',text:'Di tengah opor dan nastar, seorang tante menatapmu lekat-lekat: <b>"'+tanya+'"</b>',opts:[
    {t:'Senyum: "Doain aja, Tante"',e:()=>addLog('Jawaban diplomatis level menteri. Tante puas, kamu lelah.'+fx({waras:-3,nrimo:+3,relasi:+2}))},
    {t:'Balik tanya: "Kapan Tante kurus?"',e:()=>addLog('Hening sejenak. Satu ruangan menahan napas. Ibumu mencubit pinggangmu. Tapi jujur, rasanya lega.'+fx({waras:+5,relasi:-7}),'bad')},
    {t:'Pura-pura ditelepon bos',e:()=>addLog('Kamu kabur ke teras sambil bilang "iya Pak, iya Pak" ke HP yang tidak menyala.'+fx({waras:-1,gengsi:+2}))}
  ]});
}
function spt(){
  ask({title:'LAPOR SPT TAHUNAN',text:'Bulan Maret: saatnya lapor SPT. Situs pajak sedang ramai, kadang error, kadang minta verifikasi ulang, kadang dua-duanya.',opts:[
    {t:'Lapor sekarang, sabar menghadapi error',e:()=>addLog('Setelah tiga kali login ulang dan satu kali hampir banting laptop, SPT terkirim. Warga negara yang baik.'+fx({waras:-3,nrimo:+2}),'good')},
    {t:'Nanti saja, mepet deadline',e:()=>{ if(r()<0.4)addLog('Kamu lupa. Denda keterlambatan menanti.'+fx({saldo:-100e3,waras:-2}),'bad'); else addLog('Kamu lapor H-1 jam 23.40. Jantung berdebar, tapi lolos.'+fx({waras:-2})); }}
  ]});
}
function agustusan(){
  addLog('Agustusan! Iuran 17-an RT ditarik '+rp(50e3)+'. Umbul-umbul terpasang, sound system tetangga sudah dites sejak subuh.'+fx({saldo:-50e3}),'sys');
  ask({title:'LOMBA 17-AN',text:'Panitia RT mencari peserta lomba. "Ayo dong, yang muda-muda!"',opts:[
    {t:'Ikut panjat pinang',e:()=>{ if(r()<0.3)addLog('Kamu jadi tumpuan paling bawah dan... tim kamu menang! Hadiah: kipas angin dan rasa bangga.'+fx({relasi:+8,sehat:-3,waras:+5}),'good');
      else addLog('Kamu berlumur oli, jatuh tiga kali, dan cuma dapat sabun colek. Tapi warga ketawa bahagia.'+fx({relasi:+6,sehat:-4,waras:+3})); }},
    {t:'Ikut lomba makan kerupuk',e:()=>addLog('Tangan di belakang, kerupuk bergoyang ditiup angin. Kamu kalah dari anak SD. Ikhlas.'+fx({relasi:+4,waras:+3}))},
    {t:'Rebahan saja',e:()=>addLog('Kamu mendengar sorak-sorai dari balik jendela kos. Merdeka dengan caramu sendiri.'+fx({waras:+2,relasi:-3}))}
  ]});
}
function harbolnas(b){
  pakai('harbolnas');
  const tgl=b===11?'11.11':'12.12';
  ask({title:'HARBOLNAS '+tgl,text:'Notifikasi marketplace meledak: "FLASH SALE! Diskon 90%! Gratis ongkir! Paylater 0%!" Keranjangmu sudah penuh sejak 3 bulan lalu.',opts:[
    {t:'Checkout semua (paylater)',sub:'Gengsi & bahagia sesaat',e:()=>{ const x=Math.round(ri(15,30)*100e3*N.harga); tambahCicilan('Paylater '+tgl,x,6,true);
      addLog('Kamu checkout '+rp(x)+' pakai paylater 6 bulan. Paket datang satu per satu seperti hadiah dari diri sendiri, untuk diri sendiri, dibayar diri sendiri nanti.'+fx({gengsi:+8,waras:+4}),'bad'); }},
    {t:'Beli yang perlu saja',sub:'±Rp 300 rb',e:()=>addLog('Kamu beli sabun, sampo, dan kaus kaki. Dewasa sekali. Membosankan sekali.'+fx({saldo:-300e3,nrimo:+2}))},
    {t:'Hapus aplikasi sementara',e:()=>{ addLog('Kamu uninstall semua marketplace. Hari-hari terasa sunyi tapi saldo utuh.'+fx({nrimo:+4,gengsi:-2}),'good'); P.hematKali=(P.hematKali||0)+1; if(P.hematKali>=2)ach('hemat'); }}
  ]});
}

/* ================= CICILAN & UTANG ================= */
/* utang:true → sisa cicilan dihitung sebagai kewajiban di kekayaan bersih */
function tambahCicilan(n,pokok,tenor,utang){
  const per=Math.round(pokok*(1+0.025*tenor)/tenor);
  P.cicilan.push({n,per,sisa:tenor,utang:!!utang});
}
function ambilPinjol(jml,alasan){
  P.saldo+=jml; P.utang+=Math.round(jml*1.1);       /* potong "biaya admin" di depan */
  P.pinjolKali++; ach('pinjol');
  addLog('Pinjol cair '+rp(jml)+' dalam 5 menit'+(alasan?' untuk '+alasan:'')+'. Prosesnya cepat sekali. Penagihannya nanti juga akan cepat sekali.','bad');
}

/* ================= PEKERJAAN: PHK & KONTRAK ================= */
function kerjaCek(){
  if(!P.profesi)return;
  const p=PROF[P.profesi];
  if(P.profesi==='outsourcing'){
    P.kontrakSisa--;
    if(P.kontrakSisa<=0){
      if(r()<0.68){ P.kontrakSisa=12; addLog('Kontrak outsourcing diperpanjang setahun lagi. Status: tetap tidak tetap.','sys'); }
      else { kehilanganKerja('Kontrak outsourcing tidak diperpanjang. "Terima kasih atas kontribusinya."'); return; }
    }
  }
  if(p.phk&&r()<p.phk*(N.ke>18?1.4:1)){
    const pesangon=P.profesi==='karyawan'?Math.round(P.gaji*Math.max(1,Math.floor(P.bulanKerja/12)+1)):0;
    if(pesangon)P.saldo+=pesangon;
    kehilanganKerja('Perusahaan melakukan "efisiensi". Kamu termasuk yang diefisiensikan.'+(pesangon?' Pesangon '+rp(pesangon)+' masuk.':''));
  }
}
function kehilanganKerja(txt){
  addLog('<b>'+txt+'</b>'+fx({waras:-12,gengsi:-6}),'bad');
  stamp('KENA PHK'); milestone('Kehilangan pekerjaan ('+P.profesiN+')');
  P.profesi=null; P.profesiN='Pencari kerja'; P.gaji=0; P.pernahPHK=true;
}

/* ================= SALDO MINUS & DEBT COLLECTOR ================= */
function saldoCek(){
  if(P.saldo>=0)return;
  const kurang=-P.saldo;
  ask({title:'SALDO MINUS',text:'Saldo rekeningmu minus <b>'+rp(kurang)+'</b>. Tagihan menunggu, perut menunggu. Bagaimana menambalnya?',opts:[
    {t:'Minta transfer tambahan ke papa',sub:'Malu sedikit, beres seketika',cond:()=>P.kiriman>0,e:()=>{ P.saldo+=kurang+1e6; P.kirimanTotal+=kurang+1e6; addLog('Papa transfer tanpa banyak tanya, ditambah sejuta "buat jajan". Masalah selesai dalam 2 menit.'+fx({gengsi:-2,nrimo:-2})); }},
    {t:'Pinjam ke keluarga',sub:'Relasi turun, harga diri ikut',cond:()=>P.st.relasi>=25&&P.latar!=='yatim'&&P.kiriman<=0,e:()=>{ P.saldo+=kurang; addLog('Ibu transfer diam-diam, tanpa tanya. Justru itu yang paling menyakitkan.'+fx({relasi:-6,waras:-4,gengsi:-4}),'bad'); }},
    {t:'Ajukan pinjol',sub:'Cair 5 menit, bunga 5%/bulan',e:()=>ambilPinjol(Math.round(kurang+500e3),'menambal saldo')},
    {t:'Jual barang (HP lama, jaket)',sub:'Gengsi turun',e:()=>{ const x=Math.min(kurang+200e3,Math.round(ri(8,20)*100e3)); P.saldo+=x; addLog('Kamu jual barang di marketplace. Pembeli menawar sampai harga diri.'+fx({gengsi:-6,waras:-2}),'bad'); }},
    {t:'Puasa senin-kamis (dan selasa-rabu)',sub:'Kesehatan & kewarasan turun',cond:()=>kurang<1.5e6,e:()=>{ P.saldo+=Math.round(kurang*0.6); addLog('Kamu bertahan dengan mi instan dan air galon. Hemat, tapi badan protes.'+fx({sehat:-7,waras:-5,nrimo:+3}),'bad'); }}
  ]});
}
function utangCek(){
  if(P.utang<=0)return;
  const batas=Math.max(60e6,12*Math.max(P.gaji,3e6));
  if(P.utang>=batas){ akhir('dc'); return; }
  if(siap('dc',2)&&r()<0.22+P.utang/40e6){
    pakai('dc');
    ask({title:'DEBT COLLECTOR MENELEPON',text:'Nomor tak dikenal menelepon 14 kali. Lalu atasan, ibumu, dan mantanmu dapat WhatsApp: "Tolong ingatkan '+P.nama.split(' ')[0]+' bayar utangnya." Total utang: <b>'+rp(P.utang)+'</b>.',opts:[
      {t:'Bayar sebagian',sub:'Separuh saldo',cond:()=>P.saldo>=500e3,e:()=>{ const x=Math.min(P.utang,Math.round(P.saldo*0.5)); P.saldo-=x; P.utang-=x; addLog('Kamu bayar '+rp(x)+'. Teror mereda sebentar.'+fx({waras:-2}),'sys'); if(P.utang<=0)lunasSemua(); }},
      {t:'Ganti nomor HP',sub:'Masalah tidak hilang, cuma pindah',e:()=>addLog('Nomor baru, hidup baru? Tidak juga. Mereka menghubungi kontak darurat yang kamu isi dulu.'+fx({waras:-6,relasi:-6}),'bad')},
      {t:'Lapor ke OJK & minta restrukturisasi',e:()=>{ if(r()<0.45){ const pot=Math.round(P.utang*0.3); P.utang-=pot; addLog('Pinjolnya ternyata terdaftar dan mau restrukturisasi: bunga dihentikan, utang dipotong '+rp(pot)+'.'+fx({waras:+4}),'good'); }
        else addLog('Laporan diterima, "akan ditindaklanjuti". Teleponnya belum berhenti.'+fx({waras:-3,nrimo:+2})); }}
    ]});
  }
}
function lunasSemua(){ addLog('Semua utang pinjol <b>LUNAS</b>. Kamu menghapus aplikasinya dengan tangan gemetar.','good'); stamp('BEBAS UTANG','green'); milestone('Lunas utang pinjol'); ach('lunas'); }

/* ================= MINI-GAME (assets/kuis.js) ================= */
/* 4. Atur gaji bulanan: geser persentase jajan & tabungan, sisanya untuk kebutuhan pokok */
let angId=0;
function aturAnggaran(awal){
  const id='ang'+(++angId), a=P.anggaran||{ingin:0,tabung:0};
  const gaji=P.gaji||0, biaya=biayaPokok();
  const pokokPct=gaji?Math.round(biaya/gaji*100):0;
  const slider=(k,lbl,v)=>'<label class="ang-row"><span>'+lbl+' <b id="'+id+k+'v">'+v+'%</b></span>'+
    '<input type="range" min="0" max="50" step="5" value="'+v+'" id="'+id+k+'" oninput="document.getElementById(\''+id+k+'v\').textContent=this.value+\'%\'"></label>';
  ask({title:awal?'ATUR GAJI PERTAMA':'ATUR ANGGARAN GAJI',text:'Gaji sekitar <b>'+(gaji?rp(gaji):'(belum ada)')+'</b>/bulan. Biaya pokok (kos, makan, transport) sekitar <b>'+rp(biaya)+'</b>'+(gaji?' = '+pokokPct+'% gaji':'')+'.<br>'+
      'Bagi sisanya: berapa persen gaji langsung <b>ditabung</b>, berapa untuk <b>jajan & senang-senang</b>? (Prinsip populer: 50% kebutuhan, 30% keinginan, 20% tabungan.)'+
      '<div class="ang">'+slider('t','Tabungan otomatis',a.tabung)+slider('i','Jajan & senang-senang',a.ingin)+'</div>',
    opts:[
      {t:'Simpan anggaran',e:()=>{
        let t=a.tabung,i=a.ingin;
        if(hasDoc){ const et=document.getElementById(id+'t'), ei=document.getElementById(id+'i'); if(et)t=+et.value; if(ei)i=+ei.value; }
        else { t=pick([0,10,20,30]); i=pick([0,10,20,30]); }
        simpanAnggaran(t,i); }},
      {t:'Pakai 50/30/20',sub:'Tabung 20%, jajan 30%',e:()=>simpanAnggaran(20,30)},
      {t:'Mode bertahan hidup',sub:'Tidak ada tabungan & jajan otomatis',e:()=>simpanAnggaran(0,0)}
    ]});
}
function simpanAnggaran(t,i){
  P.anggaran={tabung:t,ingin:i};
  const sisa=100-t-i;
  addLog('Anggaran diatur: tabungan '+t+'%, jajan '+i+'%, sisanya '+sisa+'% untuk kebutuhan pokok.'+(P.gaji&&sisa/100*P.gaji<biayaPokok()?' <b>Hati-hati:</b> porsi kebutuhan pokok lebih kecil dari biaya hidup.':''),'sys');
}
/* 1. Seleksi CPNS lewat SKD */
function ikutCPNS(){
  P.cpnsTerakhir=N.ke;
  addLog('Kamu mendaftar CPNS: unggah berkas, swafoto dengan KTP, dan begadang menunggu pengumuman administrasi. Lolos!','sys');
  Kuis.skd(h=>{
    if(!h.lolos){ addLog('Gagal di SKD. Tahun depan, kata semua orang, "pasti bisa".'+fx({waras:-5,skill:+2}),'bad'); return; }
    if(r()<0.45+P.skill/250){
      setProfesi('pns',4.8e6*N.harga); ach('asn'); stamp('LOLOS CPNS','green');
      addLog('<b>KAMU LOLOS CPNS!</b> Lolos SKD, lolos SKB, NIP keluar. Keluarga besar mengumumkannya di semua grup WA.'+fx({relasi:+12,gengsi:+10,waras:+8}),'good');
    } else addLog('Kamu lolos ambang batas SKD, tapi kalah peringkat di SKB. Rasanya seperti kalah adu penalti.'+fx({waras:-6,skill:+3}),'bad');
  });
}
/* 6. Beli motor bekas dengan tawar-menawar */
function beliMotorBekas(){
  const buka=Math.round(ri(10,14)*1e6*N.harga/50e3)*50e3;
  Kuis.tawar('motor bekas',buka,h=>{
    if(h==null)return;
    if(P.saldo<h){ addLog('Deal sudah di tangan, tapi saldomu ternyata kurang. Penjual memandangmu iba. Batal.'+fx({gengsi:-4}),'bad'); return; }
    P.saldo-=h; P.motor=true; milestone('Beli motor bekas '+rp(h));
    if(h<=buka*0.8)ach('jagoTawar');
    addLog('Motor bekas resmi jadi milikmu. Ongkos transport turun.'+(P.sim?'':' Tapi SIM-mu belum ada, jadi hati-hati kalau ada razia.')+fx({waras:+4}),'good');
  });
}
/* 5. Bikin SIM */
function bikinSIM(){
  Kuis.simLengkap(P.st.sehat,hasil=>{
    if(hasil==='resmi'){ P.sim=true; ach('simResmi'); milestone('Punya SIM (jalur resmi)'); addLog('SIM resmi di dompet. Razia tidak lagi menakutkan.'+fx({waras:+3,nrimo:+2}),'good'); }
    else if(hasil==='nembak'){ P.sim=true; ach('simNembak'); milestone('Punya SIM (jalur nembak)'); addLog('Biaya "jasa" '+rp(650e3)+'. SIM jadi, hati agak mengganjal.'+fx({saldo:-650e3,nrimo:-3}),'bad'); }
    else addLog('Belum dapat SIM bulan ini.'+fx({waras:-3}));
  });
}
