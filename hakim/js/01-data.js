'use strict';
/* ================= DATA ================= */
const NAMA_L=['Bagus','Hartono','Surya','Wibawa','Gunawan','Prasetya','Halim','Tirta','Darma','Kusnadi','Wisnu','Ardi'];
const NAMA_P=['Sri','Maryati','Hartini','Widya','Kusuma','Retno','Sulastri','Damayanti','Pertiwi','Larasati'];
const BLK=['Wicaksono','Hadiprojo','Sastrowardoyo','Notonegoro','Prawirohardjo','Atmadja','Suryaputra','Mangunkusumo','Cakrawijaya','Danuningrat'];
const KOTA=['Kotaraja','Bandar Selat','Tepian Mahakam','Wanagiri','Tanjung Perak','Mentaya','Argapura','Sriwedari'];
const SEBAB_TUA=['serangan jantung','komplikasi penyakit','usia senja, wafat dengan tenang','stroke'];

/* jenjang karier hakim */
const JAB={
  pn:{n:'Hakim Pengadilan Negeri',sing:'Hakim PN',lv:1,gaji:300e6},
  pt:{n:'Hakim Pengadilan Tinggi',sing:'Hakim PT',lv:2,gaji:520e6},
  agung:{n:'Hakim Agung (MA)',sing:'Hakim Agung',lv:3,gaji:900e6},
  ketua:{n:'Ketua Mahkamah Agung',sing:'Ketua MA',lv:4,gaji:1.4e9}
};

/* perkara yang bukan pidana: pihaknya tergugat (bukan terdakwa), putusannya gugatan dikabulkan / ditolak */
const PERDATA=['perdata','tanah','pemilu'];
/* jenis perkara + daftar terdakwa yang masuk akal untuk tiap jenis. sejak = tahun aturan/jenis perkaranya mulai ada */
const JENIS=[
  {k:'pidana',n:'Pidana Umum',        td:['rakyat','preman','pengusaha']},
  {k:'perdata',n:'Perdata',           td:['pengusaha','rakyat','pejabat']},
  {k:'narkoba',n:'Narkoba',           td:['bandar','preman','rakyat']},
  {k:'korupsi',n:'Tindak Pidana Korupsi', td:['pejabat','pengusaha','korporasi']},
  {k:'tanah',n:'Sengketa Tanah',      td:['korporasi','pengusaha','pejabat']},
  {k:'ite',n:'Pencemaran Nama / UU ITE', td:['rakyat','aktivis'], sejak:2008},
  {k:'lingkungan',n:'Kejahatan Lingkungan', td:['korporasi','pengusaha']},
  {k:'ham',n:'Pelanggaran HAM',       td:['aparat','pejabat']},
  {k:'pemilu',n:'Sengketa Pemilu',    td:['politisi','pejabat']},
  {k:'asusila',n:'Kekerasan Seksual & KDRT', td:['pejabat','pengusaha','rakyat','aparat']},
  {k:'siber',n:'Kejahatan Siber',     td:['bandar','pengusaha','rakyat'], sejak:2008}
];
const TUDUHAN={
  pidana:['pembunuhan berencana','penganiayaan berat hingga korban cacat','pencurian dengan kekerasan','penipuan investasi berantai','pemalsuan dokumen negara','pembunuhan dengan dalih pembelaan diri','penembakan yang direkayasa seolah perampokan'],
  perdata:['wanprestasi kontrak ratusan miliar','sengketa warisan antarkeluarga','gugatan utang-piutang','sengketa hak cipta','gugatan cerai dengan harta gono-gini besar','gugatan konsumen atas apartemen yang tak kunjung dibangun'],
  narkoba:['kepemilikan sabu di bawah ambang pemakai','jaringan peredaran lintas provinsi','kurir yang dijebak oknum','bandar yang mengendalikan dari lapas','artis yang tertangkap dengan ganja untuk pengobatan'],
  korupsi:['korupsi dana proyek jalan','suap pengadaan alat kesehatan','gratifikasi & pencucian uang','mark-up anggaran bansos','korupsi dana bencana','suap kepada hakim oleh pengacara kondang'],
  tanah:['penyerobotan lahan warga oleh korporasi','sertifikat ganda yang dimainkan mafia tanah','penggusuran tanpa ganti rugi layak','sengketa tanah adat','warga melawan klaim sepihak instansi negara'],
  ite:['kritik pedas ke pejabat yang dipidanakan','unggahan satire yang dianggap pencemaran','laporan dugaan korupsi yang berbalik jadi tersangka','ulasan jujur pelanggan yang digugat pemilik usaha'],
  lingkungan:['pembuangan limbah beracun ke sungai warga','pembakaran hutan untuk perkebunan sawit','tambang ilegal yang merusak desa','tumpahan minyak korporasi yang mencemari pesisir'],
  ham:['kekerasan aparat terhadap demonstran damai','perampasan tanah adat dengan kekerasan','kriminalisasi petani yang mempertahankan lahan','penghilangan paksa aktivis yang berkasnya dibuka kembali'],
  pemilu:['penggelembungan suara di tingkat kecamatan','politik uang menjelang hari pencoblosan','kampanye hitam yang terstruktur dan masif','penyalahgunaan bansos untuk mendongkrak suara'],
  asusila:['kekerasan seksual oleh atasan terhadap bawahannya','KDRT bertahun-tahun yang akhirnya dilaporkan','pelecehan dengan relasi kuasa di kampus','kekerasan seksual yang korbannya justru diintimidasi'],
  siber:['penipuan investasi kripto berkedok trading','jaringan judi online yang dikendalikan dari luar negeri','pembobolan data nasabah bank','peretasan situs pemerintah oleh remaja otodidak']
};
/* tuduhan yang baru masuk akal mulai tahun tertentu */
const TUDUHAN_SEJAK={'penipuan investasi kripto berkedok trading':2017,'jaringan judi online yang dikendalikan dari luar negeri':2012,'ulasan jujur pelanggan yang digugat pemilik usaha':2012};
/* hukuman mati hanya untuk kejahatan paling berat */
const TUDUHAN_MATI=['pembunuhan berencana','penembakan yang direkayasa seolah perampokan','jaringan peredaran lintas provinsi','bandar yang mengendalikan dari lapas'];
/* kaidah/asas hukum: penuntun putusan yang adil. Sebagian MENGALAHKAN sekadar "kekuatan bukti". */
const KAIDAH=[
  {k:'tegas',   n:'Bukti yang terang benderang',          d:'Bila bukti kuat dan sah, hukum ditegakkan tanpa pandang bulu.', applies:c=>c.bukti==='kuat', adil:'bersalah'},
  {k:'equality',n:'Equality before the law',              d:'Semua sama di hadapan hukum, sekuat apa pun terdakwa.',         applies:c=>c.bukti==='kuat'&&c.td.kuasa>=0.6, adil:'bersalah'},
  {k:'inDubio', n:'In dubio pro reo',                     d:'Bila ragu, putuskan untuk keuntungan terdakwa.',                applies:c=>(c.bukti==='lemah'||c.bukti==='berimbang')&&!PERDATA.includes(c.jenis.k), adil:'bebas'},
  {k:'praduga', n:'Praduga tak bersalah',                 d:'Tak bersalah sampai terbukti secara sah & meyakinkan.',          applies:c=>c.bukti!=='kuat'&&!PERDATA.includes(c.jenis.k), adil:'bebas'},
  {k:'legalitas',n:'Asas legalitas (nullum delictum)',    d:'Tiada pidana tanpa aturan yang lebih dulu mengaturnya.',         applies:c=>c.jenis.k==='ite', adil:'bebas'},
  {k:'ultimum', n:'Ultimum remedium',                     d:'Pidana adalah jalan terakhir, bukan alat membungkam kritik.',    applies:c=>c.jenis.k==='ite'||c.td.k==='aktivis', adil:'bebas'},
  {k:'restoratif',n:'Keadilan restoratif',               d:'Untuk pelaku kecil, pemulihan lebih utama dari pemenjaraan.',     applies:c=>c.td.k==='rakyat'&&c.jenis.k!=='korupsi', adil:null},
  {k:'korban',  n:'Perlindungan korban',                 d:'Hukum berdiri paling dekat dengan pihak yang paling rentan.',    applies:c=>c.jenis.k==='asusila'&&c.bukti!=='lemah', adil:'bersalah'},
  {k:'proporsional',n:'Asas proporsionalitas',            d:'Hukuman harus setimpal, tidak berlebihan atau terlalu ringan.',  applies:c=>true, adil:null}
];
/* profil terdakwa: kuasa = tekanan politik, duit = kemampuan menyuap */
const TERDAKWA=[
  {k:'rakyat',n:'rakyat kecil',kuasa:0.1,duit:0.1},
  {k:'preman',n:'preman pasar',kuasa:0.3,duit:0.3},
  {k:'pengusaha',n:'pengusaha kakap',kuasa:0.6,duit:0.95},
  {k:'pejabat',n:'pejabat tinggi',kuasa:0.95,duit:0.7},
  {k:'bandar',n:'bandar narkoba',kuasa:0.5,duit:0.95},
  {k:'korporasi',n:'bos korporasi tambang',kuasa:0.7,duit:0.95},
  {k:'aparat',n:'oknum aparat',kuasa:0.8,duit:0.3},
  {k:'aktivis',n:'aktivis & jurnalis',kuasa:0.2,duit:0.05},
  {k:'politisi',n:'politisi kawakan',kuasa:0.85,duit:0.8}
];
/* ===== GELAR PERKARA: jenis pemeriksaan & pool petunjuk ===== */
const PERIKSA=[
  {k:'saksi',   n:'Periksa keterangan saksi'},
  {k:'dokumen', n:'Teliti bukti dokumen & forensik'},
  {k:'terdakwa',n:'Dengarkan keterangan terdakwa'},
  {k:'ahli',    n:'Hadirkan saksi ahli'}
];
const KLU={
  memberatkan:{
    saksi:['Dua saksi konsisten menempatkan terdakwa di lokasi saat kejadian.','Saksi korban mengenali terdakwa dengan yakin.'],
    dokumen:['Rekaman CCTV dan jejak digital mengarah kuat ke terdakwa.','Aliran dana mencurigakan tercatat masuk ke rekening terdakwa.'],
    terdakwa:['Keterangan terdakwa berubah-ubah dan saling bertentangan.','Terdakwa gugup dan tak mampu menjelaskan alibinya.'],
    ahli:['Ahli forensik memastikan barang bukti cocok dengan terdakwa.','Ahli menilai modusnya khas pelaku berpengalaman.']
  },
  meringankan:{
    saksi:['Saksi kunci penuntut ternyata tak melihat langsung kejadian.','Beberapa saksi justru memberi alibi untuk terdakwa.'],
    dokumen:['CCTV menunjukkan terdakwa berada di tempat lain saat kejadian.','Keaslian dokumen yang dijadikan bukti diragukan.'],
    terdakwa:['Keterangan terdakwa runtut, masuk akal, dan didukung bukti.','Terdakwa kooperatif dan alibinya terverifikasi.'],
    ahli:['Ahli menilai bukti penuntut lemah dan multitafsir.','Ahli menemukan kejanggalan dalam proses penyidikan.']
  },
  ambigu:{
    saksi:['Keterangan antar-saksi simpang siur.','Saksi ragu-ragu saat dikonfirmasi ulang.'],
    dokumen:['Bukti dokumen ada, tapi rantai penyimpanannya tidak jelas.','Barang bukti tidak utuh, sebagian hilang.'],
    terdakwa:['Terdakwa memilih diam, menggunakan hak ingkar.','Keterangan terdakwa sebagian benar, sebagian janggal.'],
    ahli:['Dua ahli memberi pendapat yang bertolak belakang.','Ahli menyatakan butuh uji lanjutan untuk menyimpulkan.']
  }
};

const ACH_DEF={
  pn:'Mengetuk Palu Pertama', pt:'Naik ke Pengadilan Tinggi', agung:'Hakim Agung', ketua:'Pucuk Peradilan',
  bersih:'Tangan yang Bersih', wakilTuhan:'Wakil Tuhan di Bumi', adilSejati:'Sang Adil Sejati',
  makelar:'Makelar Kasus', mafia:'Mafia Peradilan', ott:'Pernah Kena OTT',
  pembela:'Pembela Wong Cilik', berani:'Hakim Pemberani', guru:'Guru Besar Hukum',
  tahanan:'Hakim di Balik Jeruji', produktif:'Hakim Produktif', konsisten:'Tak Tergoyahkan',
  kaya:'Harta Tujuh Turunan', dissenting:'Pemilik Dissenting Opinion', vonisMati:'Menjatuhkan Vonis Mati',
  licin:'Licin Bagai Belut', taatAsas:'Penjaga Kaidah Hukum',
  doktor:'Doktor Ilmu Hukum', teladan:'Hakim Teladan', mediator:'Juru Damai'
};
