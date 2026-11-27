'use strict';
/* ================= DATA ================= */
const POOL_UMUM=[['Pegawai minimarket',30e6],['Kurir paket',34e6],['Penjaga toko HP',28e6],['Buruh pelabuhan',38e6],['Admin gudang',36e6],['Driver ojek online',32e6]];
const POOL_SMK=[['Mekanik bengkel',46e6],['Operator alat berat',72e6],['Teknisi listrik',54e6],['Welder',62e6],['Teknisi AC',48e6]];
const KARIER={
  kedokteran:[['Dokter umum klinik',135e6],['Dokter RS daerah',155e6]],
  teknik:[['Site engineer tambang',115e6],['Engineer pabrik',95e6],['Engineer EPC',105e6]],
  informatika:[['Programmer startup',105e6],['Data analyst',95e6],['IT support korporat',70e6]],
  ekonomi:[['Analis bank',90e6],['Akuntan',80e6],['Staf keuangan tambang',92e6]],
  hukum:[['Pengacara junior',88e6],['Legal officer',76e6]],
  pendidikan:[['Guru SMA',56e6],['Dosen muda',66e6]],
  seni:[['Desainer grafis',66e6],['Ilustrator lepas',56e6],['Videografer agensi',62e6]],
  akuntansi:[['Akuntan publik junior',85e6],['Staf pajak perusahaan',78e6],['Auditor internal',88e6]],
  psikologi:[['HRD rekrutmen',72e6],['Konselor sekolah',58e6],['Asesor psikologi',70e6]],
  komunikasi:[['Social media specialist',70e6],['Reporter TV',68e6],['Staf humas perusahaan',80e6]],
  farmasi:[['Apoteker',90e6],['Medical representative',95e6],['Staf QC pabrik obat',82e6]],
  pertanian:[['Penyuluh pertanian',60e6],['Agronom perkebunan sawit',88e6],['Staf riset benih',75e6]],
  sastra:[['Penerjemah',62e6],['Content writer',58e6],['Editor penerbitan',64e6]]
};
const LV=['','Senior ','Spesialis ','Kepala ','Direktur '];
/* profesi negara/khusus dengan tugas dinas sendiri */
const PROFESI=[
  {k:'polisi', n:'Polisi (Polri)',        g:62e6,  minH:65, minS:45, maxU:25, desc:'tes kesamaptaan & akademik'},
  {k:'tentara',n:'Tentara (TNI)',         g:60e6,  minH:70, minS:42, maxU:25, desc:'tes fisik berat'},
  {k:'intel',  n:'Intelijen (mata-mata)', g:80e6,  minH:65, minS:70, maxU:30, desc:'seleksi rahasia & ketat'},
  {k:'pns',    n:'PNS / ASN',             g:50e6,  minH:40, minS:60, maxU:35, desc:'tes CPNS sengit'},
  {k:'pilot',  n:'Pilot maskapai',        g:190e6, minH:75, minS:65, maxU:32, desc:'sekolah terbang mahal', biaya:300e6},
  {k:'pelaut', n:'Pelaut / ABK kapal',    g:95e6,  minH:70, minS:40, maxU:35, desc:'berlayar berbulan-bulan'},
  {k:'damkar', n:'Pemadam kebakaran',     g:52e6,  minH:70, minS:40, maxU:30, desc:'berani & sigap'}
];
/* profesi aparatur negara: tidak kena PHK/dibajak, pensiun bulanan penuh, wajib mundur bila maju jabatan politik */
const NEGERI=['polisi','tentara','intel','pns','damkar'];
const PANGKAT={
  polisi:['Bripda','Brigadir','Inspektur','Komisaris','Komjen'],
  tentara:['Prajurit','Sersan','Letnan','Mayor','Jenderal'],
  intel:['Agen','Agen Senior','Penyelia','Deputi','Kepala Badan'],
  pns:['Staf','Kasi','Kabag','Kepala Dinas','Sekda'],
  pilot:['First Officer','Senior FO','Kapten','Kapten Senior','Chief Pilot'],
  pelaut:['Kelasi','Bosun','Mualim','Nakhoda','Kapten Senior'],
  damkar:['Anggota','Komandan Regu','Komandan Pleton','Kepala Pos','Kadis Damkar']
};
/* jenjang jabatan publik / politik lokal — tiap naik perlu pemilihan & modal kampanye */
const PJAB=[
  {k:'rt',    n:'Ketua RT',           tunj:6e6,   minRelasi:48, minCharm:42, biaya:0},
  {k:'rw',    n:'Ketua RW',           tunj:14e6,  minRelasi:55, minCharm:50, biaya:5e6},
  {k:'lurah', n:'Lurah / Kepala Desa', tunj:70e6,  minRelasi:60, minCharm:55, biaya:60e6},
  {k:'dprd',  n:'Anggota DPRD',       tunj:260e6, minRelasi:65, minCharm:60, biaya:400e6},
  {k:'bupati',n:'Bupati / Wali Kota', tunj:600e6, minRelasi:72, minCharm:68, biaya:2e9}
];
const JURUSAN=[
  {k:'kedokteran',n:'Kedokteran',min:80,lama:6,biaya:60e6},
  {k:'teknik',n:'Teknik',min:60,lama:4,biaya:25e6},
  {k:'informatika',n:'Informatika',min:60,lama:4,biaya:25e6},
  {k:'ekonomi',n:'Ekonomi',min:50,lama:4,biaya:22e6},
  {k:'hukum',n:'Hukum',min:55,lama:4,biaya:22e6},
  {k:'pendidikan',n:'Pendidikan',min:45,lama:4,biaya:18e6},
  {k:'seni',n:'Seni & Desain',min:40,lama:4,biaya:20e6},
  {k:'akuntansi',n:'Akuntansi',min:50,lama:4,biaya:22e6},
  {k:'psikologi',n:'Psikologi',min:55,lama:4,biaya:24e6},
  {k:'komunikasi',n:'Ilmu Komunikasi',min:45,lama:4,biaya:22e6},
  {k:'farmasi',n:'Farmasi',min:65,lama:4,biaya:30e6},
  {k:'pertanian',n:'Pertanian',min:40,lama:4,biaya:15e6},
  {k:'sastra',n:'Sastra',min:40,lama:4,biaya:16e6}
];
/* usaha: [nama, modal, risk] — risk besar = untung & rugi makin liar */
const USAHA=[
  ['Olshop fashion',10e6,1.6],['Catering rumahan',12e6,1.2],['Ternak lele',15e6,1.3],
  ['Laundry kiloan',18e6,0.9],['Warmindo',20e6,1.1],['Barbershop',22e6,1.0],
  ['Warung kopi',25e6,1.2],['Ternak ayam',25e6,1.4],['Toko sembako',30e6,0.8],
  ['Bengkel motor',35e6,1.0],['Startup aplikasi',60e6,2.2],['Ekspedisi lokal',80e6,1.2],
  ['Kafe kekinian',90e6,1.5],['Rental mobil',150e6,1.1],['Kebun sawit',250e6,0.9],['Kos-kosan',400e6,0.6]
];
/* hobi: g = 'L'/'P' kalau condong ke satu gender, kosong/'all' = untuk semua */
const HOBI=[
  {k:'musik',n:'Main musik',mulai:2.5e6,b:1e6,fx:{charm:2,happy:3}},
  {k:'mancing',n:'Memancing',mulai:1.5e6,b:1e6,fx:{stress:-6,happy:3},g:'L'},
  {k:'foto',n:'Fotografi',mulai:8e6,b:2e6,fx:{charm:1,happy:3,smart:1}},
  {k:'gaming',n:'Gaming',mulai:5e6,b:1e6,fx:{happy:4,stress:-4,health:-1}},
  {k:'kebun',n:'Berkebun',mulai:1e6,b:0.5e6,fx:{health:2,stress:-5,happy:2}},
  {k:'masak',n:'Memasak',mulai:1.5e6,b:1e6,fx:{happy:3,charm:1}},
  {k:'nulis',n:'Menulis',mulai:0.5e6,b:0,fx:{smart:2,happy:2,stress:-2}},
  {k:'otomotif',n:'Otomotif / modifikasi',mulai:6e6,b:3e6,fx:{happy:3,charm:1},g:'L'},
  {k:'badminton',n:'Badminton',mulai:1e6,b:0.5e6,fx:{health:4,happy:2,stress:-3}},
  {k:'konten',n:'Bikin konten',mulai:3e6,b:1e6,fx:{charm:2,happy:2,stress:1},sejak:2010},
  {k:'travel',n:'Traveling',mulai:0,b:8e6,fx:{happy:8,stress:-10,charm:1}},
  {k:'ikan',n:'Ikan hias',mulai:2e6,b:1e6,fx:{happy:3,stress:-4}},
  /* khusus cowok */
  {k:'futsal',n:'Futsal',mulai:1e6,b:0.5e6,fx:{health:4,happy:3,stress:-3},g:'L'},
  {k:'gym',n:'Nge-gym / fitness',mulai:2e6,b:1.5e6,fx:{health:5,charm:3,stress:-2},g:'L'},
  /* khusus cewek */
  {k:'baking',n:'Baking / bikin kue',mulai:2e6,b:1.5e6,fx:{happy:3,charm:1,smart:1},g:'P'},
  {k:'craft',n:'Kerajinan tangan',mulai:1.5e6,b:1e6,fx:{happy:3,smart:1,stress:-3},g:'P'},
  {k:'dance',n:'Menari / dance',mulai:1e6,b:0.5e6,fx:{health:3,charm:3,happy:2},g:'P'}
];
const SIFAT=[
  {k:'penyayang',n:'penyayang'},{k:'humoris',n:'humoris'},{k:'suportif',n:'suportif'},
  {k:'mapan',n:'mapan'},{k:'cuek',n:'agak cuek'},{k:'boros',n:'boros'},{k:'posesif',n:'posesif'}
];
/* sifat teman — memengaruhi cara mereka membantu/menyusahkan */
const SIFAT_TEMAN=[
  {k:'setia',n:'setia'},{k:'asik',n:'asik diajak'},{k:'sukses',n:'orang sukses'},
  {k:'koneksian',n:'banyak koneksi'},{k:'tukangutang',n:'tukang ngutang'},{k:'drama',n:'penuh drama'}
];
/* pekerjaan calon pasangan: [jabatan, [gaji min, max] dalam jt/bln] */
const KERJA_CALON=[
  ['kasir minimarket',[2.5,4]],['guru honorer',[2,4]],['barista',[3,5]],['sales',[3,8]],
  ['perawat',[4,7]],['admin kantor',[4,6]],['PNS',[4,8]],['karyawan bank',[5,10]],
  ['akuntan',[6,11]],['dosen',[6,12]],['desainer grafis',[5,10]],['programmer',[8,18]],
  ['wiraswasta',[4,15]],['pengacara',[9,20]],['dokter',[12,25]],['belum bekerja',[0,0]]
];
const TEMPAT_CALON=['perusahaan swasta','kantor pemerintah','BUMN','sebuah startup','UMKM sendiri','rumah sakit','sekolah swasta','bank lokal','pabrik'];
const INV=[
  {k:'depo',n:'Deposito',desc:'Aman, ±4% per tahun'},
  {k:'emas',n:'Emas',desc:'Stabil, −4% s.d. +14% per tahun'},
  {k:'saham',n:'Saham',desc:'Naik-turun, −22% s.d. +38%'},
  {k:'kripto',n:'Kripto',desc:'Liar, −70% s.d. +110%',sejak:2014}
];
/* katalog aset yang bisa dibeli & dikoleksi tanpa batas. sewa = pendapatan sewa/thn saat terisi penuh (imbal 4,5–7,5%), tumbuh = perubahan nilai/thn
   (kendaraan menyusut, properti naik), kpr = bisa dicicil */
const ASET=[
  {k:'motor',    n:'Motor',         harga:18e6,  kelas:'kendaraan', tumbuh:-0.10},
  {k:'mobil',    n:'Mobil',         harga:160e6, kelas:'kendaraan', tumbuh:-0.08},
  {k:'moge',     n:'Moge',          harga:280e6, kelas:'kendaraan', tumbuh:-0.08},
  {k:'mewah',    n:'Mobil mewah',   harga:850e6, kelas:'kendaraan', tumbuh:-0.10},
  {k:'tanah',    n:'Tanah kavling', harga:100e6, kelas:'properti', tumbuh:0.08},
  {k:'rumah',    n:'Rumah',         harga:400e6, kelas:'properti', tumbuh:0.05, kpr:true},
  {k:'apartemen',n:'Apartemen',     harga:550e6, kelas:'properti', tumbuh:0.04, sewa:25e6, kpr:true},
  {k:'ruko',     n:'Ruko',          harga:650e6, kelas:'properti', tumbuh:0.05, sewa:39e6, kpr:true},
  {k:'kos',      n:'Kos-kosan',     harga:800e6, kelas:'properti', tumbuh:0.04, sewa:60e6, kpr:true},
  {k:'vila',     n:'Vila',          harga:1.2e9, kelas:'properti', tumbuh:0.05, sewa:65e6, kpr:true}
];
/* nama yang mengikuti zaman: hal yang belum ada di tahun itu diganti padanannya (lihat tahunIni() di 03c-sekolah.js) */
const ERA_NAMA=[
  ['Driver ojek online',2015,'Tukang ojek pangkalan'],['Programmer startup',2010,'Programmer software house'],
  ['Social media specialist',2011,'Staf periklanan'],['Content writer',2009,'Penulis lepas'],
  ['Olshop fashion',2010,'Distro / butik kecil'],['Startup aplikasi',2010,'Warnet & rental komputer'],['Kafe kekinian',2012,'Kafe']
];
function eraNama(n){ const y=P?P.lahir+P.age:2020; for(const e of ERA_NAMA)if(e[0]===n&&y<e[1])return e[2]; return n; }
function adaPinjol(){ return !P||P.lahir+P.age>=2016; }
function namaUtangCepat(){ return adaPinjol()?'pinjol':'rentenir'; }
function adaJudol(){ return !P||P.lahir+P.age>=2012; }
const SEBAB_TUA=['sakit jantung','komplikasi penyakit','usia tua, wafat dengan tenang dalam tidur','stroke'];
const ACH_DEF={
  sarjana:'Sarjana', magister:'Magister', direktur:'Pucuk Karier', miliarder:'Miliarder',
  sultan:'Sultan', juragan:'Juragan Besar', properti:'Raja Properti', keluarga:'Keluarga Hangat',
  kakek:'Punya Cucu', sepuh:'Panjang Umur (85+)', bugar:'Tua tapi Bugar', hobiis:'Hobiis Sejati', viral:'Pernah Viral',
  mabrur:'Haji Mabrur', bos:'Bos Besar (20+ karyawan)', dinasti:'Dinasti 3 Generasi',
  supel:'Jaringan Luas', teladan:'Orang Tua Teladan',
  sahabat:'Sahabat Sejati', perantau:'Perantau Sukses', comeback:'Bangkit dari Jurang', waras:'Jiwa yang Tenang',
  pejabat:'Wakil Rakyat', penguasa:'Orang Nomor Satu', negarawan:'Politikus Bersih', pengasuh:'Tangan Pengasuh',
  nilaiSempurna:'Nilai Ujian Sempurna', anakPTN:'Anak PTN', kuliahLN:'Kuliah di Luar Negeri', juaraLomba:'Juara Lomba Nasional',
  aktivisKampus:'Aktivis Kampus', mahasiswaAbadi:'Mahasiswa Abadi', cumlaude:'Cumlaude', simResmi:'SIM Jalur Resmi', restuMertua:'Restu Mertua'
};

