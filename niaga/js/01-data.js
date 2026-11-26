'use strict';
/* ================= DATA ================= */
const SEBAB_TUA=['serangan jantung','komplikasi penyakit','usia senja, wafat dengan tenang','stroke'];

/* ===== SEKTOR USAHA =====
   margin = imbal hasil kotor tahunan atas modal · risk = volatilitas · tumbuh = potensi naik kelas
   padat = padat karya · regulasi = paparan hukum/izin · sens = sensitivitas ke ekonomi makro · musiman = panen/lebaran */
const SEKTOR=[
  {k:'kuliner',  n:'Kuliner & F&B',           pfx:'Warung',     modalMin:30e6,  margin:0.34, risk:0.35, tumbuh:0.28, padat:0.7, regulasi:0.15, sens:0.6, musiman:false},
  {k:'ritel',    n:'Ritel & Minimarket',      pfx:'Toko',       modalMin:80e6,  margin:0.20, risk:0.18, tumbuh:0.22, padat:0.5, regulasi:0.10, sens:0.8, musiman:false},
  {k:'fashion',  n:'Fashion & Konveksi',      pfx:'Distro',     modalMin:60e6,  margin:0.30, risk:0.35, tumbuh:0.30, padat:0.8, regulasi:0.10, sens:1.0, musiman:true},
  {k:'agro',     n:'Agribisnis & Perkebunan', pfx:'Kebun',      modalMin:120e6, margin:0.28, risk:0.45, tumbuh:0.26, padat:0.6, regulasi:0.20, sens:1.1, musiman:true},
  {k:'ternak',   n:'Peternakan & Perikanan',  pfx:'Peternakan', modalMin:100e6, margin:0.27, risk:0.45, tumbuh:0.25, padat:0.6, regulasi:0.15, sens:1.0, musiman:true},
  {k:'properti', n:'Properti & Konstruksi',   pfx:'CV Properti',modalMin:800e6, margin:0.42, risk:0.40, tumbuh:0.36, padat:0.3, regulasi:0.30, sens:1.4, musiman:false},
  {k:'otomotif', n:'Otomotif & Bengkel',      pfx:'Bengkel',    modalMin:180e6, margin:0.24, risk:0.25, tumbuh:0.22, padat:0.5, regulasi:0.15, sens:1.2, musiman:false},
  {k:'tek',      n:'Startup Teknologi',       pfx:'Startup',    modalMin:150e6, margin:0.26, risk:0.55, tumbuh:0.62, padat:0.4, regulasi:0.15, sens:1.3, musiman:false},
  {k:'jasa',     n:'Jasa (Laundry/Salon/EO)', pfx:'Jasa',       modalMin:40e6,  margin:0.33, risk:0.25, tumbuh:0.26, padat:0.7, regulasi:0.10, sens:0.8, musiman:false},
  {k:'manufaktur',n:'Manufaktur & Pabrik',    pfx:'Pabrik',     modalMin:500e6, margin:0.22, risk:0.30, tumbuh:0.24, padat:0.8, regulasi:0.25, sens:1.1, musiman:false},
  {k:'tambang',  n:'Tambang & Energi',        pfx:'Tambang',    modalMin:2e9,   margin:0.50, risk:0.60, tumbuh:0.32, padat:0.5, regulasi:0.55, sens:1.6, musiman:false},
  {k:'logistik', n:'Logistik & Ekspedisi',    pfx:'Ekspedisi',  modalMin:300e6, margin:0.24, risk:0.30, tumbuh:0.32, padat:0.6, regulasi:0.20, sens:1.1, musiman:false},
  {k:'farmasi',  n:'Kesehatan & Apotek',      pfx:'Apotek',     modalMin:250e6, margin:0.30, risk:0.20, tumbuh:0.26, padat:0.5, regulasi:0.35, sens:0.5, musiman:false},
  {k:'pendidikan',n:'Pendidikan & Bimbel',    pfx:'Bimbel',     modalMin:100e6, margin:0.30, risk:0.20, tumbuh:0.24, padat:0.6, regulasi:0.20, sens:0.5, musiman:false},
  {k:'media',    n:'Media & Hiburan',         pfx:'Studio',     modalMin:120e6, margin:0.28, risk:0.45, tumbuh:0.42, padat:0.5, regulasi:0.15, sens:1.1, musiman:false},
  {k:'ekspor',   n:'Ekspor-Impor & Trading',  pfx:'Trading',    modalMin:400e6, margin:0.26, risk:0.40, tumbuh:0.36, padat:0.3, regulasi:0.25, sens:1.3, musiman:false},
  {k:'waralaba', n:'Waralaba / Franchise',    pfx:'Gerai',      modalMin:200e6, margin:0.27, risk:0.20, tumbuh:0.32, padat:0.6, regulasi:0.10, sens:0.8, musiman:false},
  {k:'keuangan', n:'Fintech & Pembiayaan',    pfx:'Koperasi',   modalMin:500e6, margin:0.32, risk:0.35, tumbuh:0.38, padat:0.3, regulasi:0.45, sens:1.2, musiman:false}
];
const SEKTOR_MAP={}; SEKTOR.forEach(s=>SEKTOR_MAP[s.k]=s);
const SKALA_LBL=['','Mikro','Kecil','Menengah (UKM)','Besar','Korporasi','Konglomerasi'];

/* ===== LATAR BELAKANG (modal & bakat awal) ===== */
const LATAR=[
  {k:'nekat',   n:'Modal Nekat',           d:'Kas tipis, tekad baja. Mulai dari kaki lima.',           kas:40e6,   st:{bisnis:8,operasi:4},        rep:18},
  {k:'pro',     n:'Eks-Karyawan',          d:'Resign dari korporat bawa tabungan & ilmu manajemen.',   kas:200e6,  st:{operasi:8,finansial:8},     rep:25},
  {k:'warisan', n:'Anak Juragan',          d:'Modal & koneksi keluarga, tapi bayangan ayah berat.',     kas:1.2e9,  st:{relasi:12,finansial:5},     rep:35},
  {k:'online',  n:'Pejuang Jualan Online',  d:'Jago jualan di medsos, modal pas-pasan.',                kas:60e6,   st:{pemasaran:12,bisnis:4},     rep:22},
  {k:'warung',  n:'Pewaris Warung Keluarga',d:'Warisi satu warung kuliner mikro yang sudah jalan.',     kas:50e6,   st:{operasi:6,bisnis:4},        rep:24, usahaAwal:'kuliner'}
];

/* ===== DUE DILIGENCE (pemeriksaan peluang) ===== */
const DD=[
  {k:'pasar',    n:'Riset pasar & permintaan'},
  {k:'keuangan', n:'Audit pembukuan & arus kas'},
  {k:'legal',    n:'Cek legalitas, izin & sertifikat'},
  {k:'mitra',    n:'Telusuri rekam jejak mitra/penjual'},
  {k:'proyeksi', n:'Hitung proyeksi & titik impas'}
];
const KLU={
  tepat:['Dari {d}, gambarannya jelas.','{d} menunjukkan sinyal yang konsisten.','{d}: datanya solid dan terbaca.'],
  sesat:['{d} sempat menyesatkan penilaian Anda.','{d} memberi kesan keliru di awal.','Hasil {d} membuat Anda hampir salah baca.'],
  ambigu:['{d} tidak konklusif — angkanya kabur.','{d} bercampur sinyal baik dan buruk.','{d}: belum cukup untuk menyimpulkan.']
};
const MUTU_LBL={bagus:'PELUANG EMAS',biasa:'biasa saja',jebakan:'BERPOTENSI JEBAKAN'};

/* ===== JENIS PELUANG ===== */
const PELUANG=[
  {k:'lokasi',     n:'Lokasi Emas Tersedia',         tipe:'buka'},
  {k:'akuisisi',   n:'Pesaing Dijual Murah',         tipe:'buka'},
  {k:'waralabaBeli',n:'Tawaran Membeli Waralaba',    tipe:'buka'},
  {k:'kontrak',    n:'Kontrak Klien Besar',          tipe:'kontrak'},
  {k:'danaMasuk',  n:'Investor Menawarkan Suntikan Dana', tipe:'dana'},
  {k:'kemitraan',  n:'Ajakan Kemitraan / Joint Venture', tipe:'mitra'},
  {k:'propertiMurah',n:'Aset Properti Dijual Cepat',  tipe:'flip'},
  {k:'borongan',   n:'Borongan Stok Harga Miring',    tipe:'flip'},
  {k:'impor',      n:'Peluang Impor Barang',          tipe:'flip'}
];

const ACH_DEF={
  pertama:'Membuka Usaha Pertama', ukm:'Naik Kelas Jadi UKM', besar:'Perusahaan Besar', korporasi:'Membangun Korporasi', konglomerat:'Sang Konglomerat',
  miliarder:'Miliarder', triliuner:'Triliuner', sultan:'Sultan Niaga',
  diversifikasi:'Gurita Bisnis (5+ Sektor)', semuaSektor:'Penakluk Segala Sektor',
  ipo:'Membawa Perusahaan IPO', exit:'Cuan dari Exit', waralabaRaja:'Raja Waralaba', ekspor:'Menembus Pasar Ekspor', akuisitor:'Sang Akuisitor',
  dealmaker:'Negosiator Ulung', dueDiligence:'Detektif Bisnis',
  dermawan:'Dermawan Sejati', berkah:'Pengusaha Berkah', adil:'Bos yang Mengayomi', mabrur:'Naik Haji dari Hasil Halal',
  taipanHitam:'Taipan Bertangan Kotor', mafiaTender:'Mafia Tender', penghindarPajak:'Penghindar Pajak Ulung', pemerasBuruh:'Pemeras Buruh',
  jeruji:'Di Balik Jeruji', bangkrutBangkit:'Bangkrut lalu Bangkit', survivor:'Selamat dari Krisis',
  warisan:'Mewariskan Imperium', legend:'Taipan Legendaris'
};
