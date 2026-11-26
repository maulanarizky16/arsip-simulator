'use strict';
/* ================= DATA ================= */
const NAMA_L=['Bagas','Rangga','Pramono','Surya','Wibowo','Hasan','Tirta','Jaka','Mahesa','Karta','Sapta','Wira'];
const NAMA_P=['Larasati','Kirana','Sekar','Anindya','Ratri','Maharani','Padma','Saraswati','Dewanti','Arumi'];
const BLK=['Wicaksono','Mangkubumi','Sastrawijaya','Kertanegara','Prawiro','Danuarta','Atmaja','Kusumo','Brata','Nayaka'];
const KOTA=['Kotaraja','Bandar Selat','Tepian Mahakam','Wanagiri','Tanjung Perak','Mentaya','Argapura','Sriwedari'];
const PARTAI=[
  {n:'Partai Garuda Perkasa',w:'nasionalis'},
  {n:'Partai Beringin Rakyat',w:'birokrat'},
  {n:'Partai Nurani Bangsa',w:'religius'},
  {n:'Partai Marhaen Bersatu',w:'wong cilik'},
  {n:'Partai Gerakan Muda',w:'anak muda'}
];
const LATAR=[
  {k:'aktivis',n:'Aktivis kampus',d:'Toa di tangan, idealisme di dada',st:{integritas:78,popularitas:30,pengaruh:8,kompetensi:55},money:5e6},
  {k:'dinasti',n:'Anak pejabat',d:'Nama besar ayah membuka semua pintu',st:{integritas:48,popularitas:25,pengaruh:50,kompetensi:45},money:800e6},
  {k:'jurnalis',n:'Jurnalis investigasi',d:'Tahu di mana mayat-mayat dikubur',st:{integritas:68,popularitas:28,pengaruh:20,kompetensi:72},money:15e6},
  {k:'pengusaha',n:'Pengusaha muda',d:'Logistik dan beton, modal kuat',st:{integritas:45,popularitas:18,pengaruh:32,kompetensi:62},money:3e9},
  {k:'guru',n:'Guru honorer',d:'Gaji kecil, nurani besar, dikenal sekampung',st:{integritas:84,popularitas:22,pengaruh:6,kompetensi:58},money:2e6}
];
const JAB={
  dprd:{n:'Anggota DPRD',lv:1,gaji:300e6,leg:true},
  walikota:{n:'Wali Kota',lv:2,gaji:450e6,eks:true,max2:true},
  dpr:{n:'Anggota DPR RI',lv:2,gaji:1.1e9,leg:true},
  gubernur:{n:'Gubernur',lv:3,gaji:700e6,eks:true,max2:true},
  menteri:{n:'Menteri',lv:4,gaji:1.4e9},
  presiden:{n:'Presiden',lv:5,gaji:2e9,eks:true,max2:true}
};
/* komisi DPR/DPRD — tiap komisi mengikat satu sektor kebijakan */
const KOMISI=[
  {k:'hukum',     n:'Komisi III — Hukum, HAM & Keamanan', sektor:'korupsi'},
  {k:'keuangan',  n:'Komisi XI — Keuangan & Perbankan',   sektor:'kas'},
  {k:'infra',     n:'Komisi V — Infrastruktur & Transportasi', sektor:'infra'},
  {k:'pendidikan',n:'Komisi X — Pendidikan & Olahraga',   sektor:'pendidikan'},
  {k:'kesehatan', n:'Komisi IX — Kesehatan & Ketenagakerjaan', sektor:'keswa'},
  {k:'energi',    n:'Komisi VII — Energi & Lingkungan',   sektor:'lingkungan'},
  {k:'hankam',    n:'Komisi I — Pertahanan & Luar Negeri',sektor:'militer'}
];
/* kementerian — saat jadi menteri, portofolio menentukan program */
const KEMENTERIAN=[
  {k:'pendidikan',n:'Menteri Pendidikan',      sektor:'pendidikan'},
  {k:'kesehatan', n:'Menteri Kesehatan',        sektor:'keswa'},
  {k:'pu',        n:'Menteri PUPR',             sektor:'infra'},
  {k:'sosial',    n:'Menteri Sosial',           sektor:'kemiskinan'},
  {k:'keuangan',  n:'Menteri Keuangan',         sektor:'kas'},
  {k:'lingkungan',n:'Menteri Lingkungan Hidup', sektor:'lingkungan'}
];
/* ===== PROYEK PEMBANGUNAN ===== */
/* APBN (nasional, biaya dalam T dari kas negara, efek pakai nx). kat = kategori. */
const KAT_NAS=[['infra','Infrastruktur'],['ekonomi','Ekonomi & Pariwisata'],['sdm','SDM, Kesehatan & Sosial'],['energi','Energi & Lingkungan']];
const PROYEK_NAS=[
  {k:'tolTrans',kat:'infra',n:'Jalan Tol Trans-Nusantara',biaya:200,pop:5,efek:{infra:+8,ekonomi:+3,utang:+100,lingkungan:-2}},
  {k:'keretaCepat',kat:'infra',n:'Kereta Cepat Antarkota',biaya:130,pop:4,efek:{infra:+5,ekonomi:+2,mood:+3,utang:+80}},
  {k:'bandara',kat:'infra',n:'Bandara Internasional Baru',biaya:80,pop:3,efek:{infra:+4,ekonomi:+2,diplomasi:+2}},
  {k:'pelabuhan',kat:'infra',n:'Pelabuhan Hub Internasional',biaya:90,pop:2,efek:{infra:+4,ekonomi:+3}},
  {k:'bendungan',kat:'infra',n:'Bendungan & Irigasi Nasional',biaya:60,pop:2,efek:{infra:+3,ekonomi:+1,kemiskinan:-0.5}},
  {k:'pariwisata',kat:'ekonomi',n:'10 Destinasi Wisata Super Prioritas',biaya:70,pop:5,efek:{ekonomi:+4,mood:+4,pengangguran:-1,lingkungan:-2}},
  {k:'smelter',kat:'ekonomi',n:'Smelter & Hilirisasi Tambang',biaya:110,pop:3,efek:{ekonomi:+5,pengangguran:-1.5,lingkungan:-3,utang:+50}},
  {k:'foodEstate',kat:'ekonomi',n:'Food Estate (Lumbung Pangan)',biaya:90,pop:2,efek:{kemiskinan:-1,inflasi:-1,lingkungan:-4}},
  {k:'kawasanInd',kat:'ekonomi',n:'Kawasan Industri Terpadu',biaya:100,pop:4,efek:{pengangguran:-2.5,ekonomi:+3,lingkungan:-2}},
  {k:'digital',kat:'ekonomi',n:'Jaringan Internet & Digitalisasi',biaya:50,pop:3,efek:{pendidikan:+3,ekonomi:+2}},
  {k:'rsNas',kat:'sdm',n:'Rumah Sakit & Faskes Nasional',biaya:80,pop:4,efek:{keswa:+6}},
  {k:'univNas',kat:'sdm',n:'Universitas & Pusat Riset',biaya:60,pop:2,efek:{pendidikan:+5}},
  {k:'perumahan',kat:'sdm',n:'Sejuta Rumah Rakyat',biaya:70,pop:5,efek:{kemiskinan:-1,mood:+4,infra:+2}},
  {k:'airNas',kat:'sdm',n:'Air Bersih & Sanitasi Nasional',biaya:55,pop:3,efek:{keswa:+4,kemiskinan:-0.5}},
  {k:'ebt',kat:'energi',n:'Pembangkit Energi Hijau (EBT)',biaya:90,pop:3,efek:{lingkungan:+5,infra:+2,ekonomi:+1}},
  {k:'kilang',kat:'energi',n:'Kilang Minyak & Ketahanan Energi',biaya:130,pop:2,efek:{ekonomi:+3,inflasi:-1,utang:+60}},
  {k:'reboisasi',kat:'energi',n:'Reboisasi & Restorasi Hutan',biaya:40,pop:2,efek:{lingkungan:+6}},
  {k:'plta',kat:'energi',n:'PLTA & Listrik Masuk Desa',biaya:70,pop:3,efek:{infra:+3,lingkungan:+2,kemiskinan:-0.4}}
];
/* APBD (daerah, biaya dalam T dari pagu daerah, efek pakai dx) */
const PROYEK_DA=[
  {k:'wisataDa',n:'Destinasi Wisata Daerah',biaya:3,pop:4,efek:{ekonomi:+6,kepuasan:+4}},
  {k:'jalanDa',n:'Jalan & Jembatan Daerah',biaya:2.5,pop:3,efek:{infra:+6,kepuasan:+2}},
  {k:'pasarDa',n:'Revitalisasi Pasar Rakyat',biaya:2,pop:3,efek:{ekonomi:+5,kepuasan:+3}},
  {k:'rsudDa',n:'RSUD & Puskesmas Baru',biaya:4,pop:4,efek:{layanan:+7}},
  {k:'sekolahDa',n:'Sekolah & Beasiswa Daerah',biaya:3,pop:3,efek:{layanan:+5,sejahtera:+2}},
  {k:'airDa',n:'Sistem Air Bersih (PDAM)',biaya:2.5,pop:3,efek:{sejahtera:+5,kepuasan:+3}},
  {k:'irigasiDa',n:'Irigasi & Pertanian Daerah',biaya:2,pop:2,efek:{ekonomi:+4,sejahtera:+3}},
  {k:'tamanDa',n:'Taman Kota & Ruang Publik',biaya:1.5,pop:3,efek:{kepuasan:+6}},
  {k:'terminalDa',n:'Terminal & Transportasi Daerah',biaya:3,pop:2,efek:{infra:+5,kepuasan:+2}},
  {k:'internetDa',n:'Internet Desa & Digitalisasi',biaya:2,pop:3,efek:{layanan:+5,ekonomi:+2}}
];
const REZIM=['reformis','pembangunan','korup','populis'];
const SEBAB_TUA=['serangan jantung','komplikasi penyakit','usia senja, wafat dengan tenang','stroke'];
/* ===== JANJI KAMPANYE ===== */
const JANJI=[
  {k:'mbg',           n:'Makan Bergizi Gratis untuk Semua',          pop:8, ev:s=>N.mbg, ok:'MBG terbukti jalan', no:'MBG tinggal slogan kosong'},
  {k:'antikorupsi',   n:'Berantas Korupsi Sampai Akar',              pop:6, ev:s=>N.korupsi<=s.korupsi-5, ok:'Korupsi turun signifikan', no:'Korupsi justru bertambah'},
  {k:'kerja',         n:'Buka Jutaan Lapangan Kerja Baru',           pop:7, ev:s=>N.pengangguran<=s.pengangguran-1.5, ok:'Pengangguran turun', no:'Pengangguran tetap tinggi'},
  {k:'pendidikan',    n:'Pendidikan Berkualitas 12 Tahun Gratis',    pop:6, ev:s=>N.pendidikan>=s.pendidikan+6, ok:'Mutu pendidikan naik', no:'Sekolah masih mahal & rusak'},
  {k:'keswa',         n:'BPJS untuk Semua Lapisan',                  pop:6, ev:s=>N.keswa>=s.keswa+6, ok:'Layanan kesehatan membaik', no:'Antrean BPJS makin panjang'},
  {k:'infra',         n:'Bangun Jalan, Tol & Bandara di Seluruh Negeri', pop:5, ev:s=>N.infra>=s.infra+6, ok:'Infrastruktur menjulang', no:'Jalan masih bolong di mana-mana'},
  {k:'damai',         n:'Politik Luar Negeri yang Damai',            pop:4, ev:s=>!P._perangBaru, ok:'Tidak ada perang sepanjang masa jabatan', no:'Anda justru memulai perang'},
  {k:'lingkungan',    n:'Lindungi Hutan & Lingkungan Indonesia',     pop:4, ev:s=>N.lingkungan>=s.lingkungan-2, ok:'Lingkungan terjaga', no:'Hutan habis dibabat'},
  {k:'pajakTurun',    n:'Turunkan Pajak Rakyat Kecil',               pop:7, ev:s=>N.pajak<=s.pajak, ok:'Pajak tidak naik', no:'Pajak malah dinaikkan'},
  {k:'iknLanjut',     n:'Tuntaskan Ibu Kota Baru Sampai Berfungsi',  pop:3, ev:s=>N.iknFase>=3, ok:'IKN berfungsi penuh', no:'IKN tetap mangkrak'},
  {k:'iknBatal',      n:'Batalkan IKN — Dana untuk Rakyat',          pop:6, ev:s=>N.iknFase===s.iknFase||N.iknFase===0, ok:'IKN tidak dilanjutkan', no:'IKN justru dibangun lebih lanjut'},
  {k:'transparan',    n:'Pemerintahan Bersih & Transparan',          pop:5, ev:s=>P.st.integritas>=68, ok:'Integritas Anda terjaga', no:'Skandal mengiringi masa jabatan'},
  {k:'merakyat',      n:'Selalu Dekat & Mendengar Rakyat',           pop:6, ev:s=>P.st.popularitas>=55, ok:'Tetap dekat dengan rakyat', no:'Menjauh sejak hari pertama'},
  {k:'tdkAmandemen',  n:'Tidak Akan Utak-atik Konstitusi',           pop:4, ev:s=>!P.tigaOk, ok:'Konstitusi tetap dijaga', no:'Anda meloloskan amandemen 3 periode'},
  {k:'antiBuzzer',    n:'Lawan Buzzer & Misinformasi',               pop:3, ev:s=>P.buzzed===0, ok:'Tidak ada pasukan buzzer', no:'Ketahuan memakai buzzer bayaran'},
  {k:'subsidiBBM',    n:'Tidak Akan Mencabut Subsidi BBM',           pop:7, ev:s=>!P._cabutBBM, ok:'Subsidi BBM tidak dicabut', no:'Subsidi BBM Anda cabut sendiri'}
];
function snapJanji(){
  return {korupsi:N.korupsi,kemiskinan:N.kemiskinan,pengangguran:N.pengangguran,pendidikan:N.pendidikan,keswa:N.keswa,infra:N.infra,lingkungan:N.lingkungan,pajak:N.pajak,iknFase:N.iknFase};
}
function pilihJanji(k,tier){
  const pool=[...JANJI].sort(()=>r()-0.5).slice(0,6);
  const picked=[];
  function step(i){
    if(i>=2||pool.length===0){
      ask({title:'JANJI EKSTRA?',text:'Mau menambah satu janji lagi untuk gas pol?',opts:[
        ...(pool.length?[{t:'Ya, tambah satu janji',e:()=>{
          ask({title:'JANJI KE-3 (BONUS)',text:'Janji terakhir sebelum hari pencoblosan:',opts:pool.map((j,idx)=>({t:j.n,sub:'Popularitas +'+j.pop,e:()=>{
            picked.push(j.k);P.st.popularitas=clamp(P.st.popularitas+j.pop,0,100);
            addLog('Anda menambah janji: "<i>'+j.n+'</i>". Tepuk tangan makin riuh.','sys');
            P.pendingJanji=picked;debat(k,tier);
          }}))});
        }}]:[]),
        {t:'Cukup, dua janji saja',e:()=>{P.pendingJanji=picked;debat(k,tier);}}
      ]});
      return;
    }
    ask({title:'JANJI KAMPANYE '+(i+1)+'/2',text:'Di panggung kampanye, pilih satu janji yang akan Anda gembar-gemborkan. Janji ini akan dinilai saat masa jabatan berakhir:',
      opts:pool.map((j,idx)=>({t:j.n,sub:'Popularitas +'+j.pop,e:()=>{
        picked.push(j.k);
        pool.splice(idx,1);
        P.st.popularitas=clamp(P.st.popularitas+j.pop,0,100);
        addLog('Anda berjanji di mimbar: "<i>'+j.n+'</i>". Ribuan tangan terangkat di lapangan.','sys');
        step(i+1);
      }}))
    });
  }
  step(0);
}
function evalJanji(){
  if(!P.janji||!P.janji.length){P.janji=null;P.janjiSnap=null;return;}
  const snap=P.janjiSnap||snapJanji();
  let ok=0,no=0;
  addLog('<b>EVALUASI JANJI KAMPANYE</b> — rakyat menagih.','sys');
  for(const code of P.janji){
    const def=JANJI.find(x=>x.k===code);
    if(!def)continue;
    if(def.ev(snap)){ok++;addLog('✓ '+def.n+' — '+def.ok+'.','good');}
    else {no++;addLog('✗ '+def.n+' — '+def.no+'.','bad');}
  }
  const dpop=ok*5-no*6;
  P.st.popularitas=clamp(P.st.popularitas+dpop,0,100);
  leg(ok*3-no*4,0);
  if(ok>=2&&no===0)ach('konsisten');
  if(no>=3)ach('ingkar');
  P.janji=null;P.janjiSnap=null;P._perangBaru=false;P._cabutBBM=false;
}

/* ===== DEBAT KANDIDAT (saat pemilu) ===== */
const DEBAT_TOPIK=[
  {t:'"Apa solusi konkret Anda untuk harga kebutuhan pokok yang melonjak?"',a:[
    {t:'Paparkan program stabilisasi harga yang terukur',sub:'Substantif',d:2,fx:{kompetensi:+1}},
    {t:'Janjikan bansos besar untuk rakyat kecil',sub:'Populis',d:1,fx:{popularitas:+2,integritas:-1}},
    {t:'"Itu warisan masalah dari rezim sebelumnya"',sub:'Mengelak',d:-2,fx:{integritas:-1}}
  ]},
  {t:'"Bagaimana Anda memberantas korupsi yang mengakar?"',a:[
    {t:'Komitmen transparansi anggaran & pengawasan',d:2,fx:{integritas:+2}},
    {t:'"Hukum mati koruptor!" — lantang ke kamera',d:1,fx:{popularitas:+2}},
    {t:'Jawaban normatif tanpa rincian',d:-2}
  ]},
  {t:'"Lawan menyebut Anda tidak berpengalaman. Tanggapan?"',a:[
    {t:'Balas tenang dengan data kerja nyata',d:2,fx:{kompetensi:+1,popularitas:+1}},
    {t:'Serang balik titik lemah lawan',d:1,fx:{popularitas:+1,integritas:-1}},
    {t:'Terpancing emosi & meninggikan suara',d:-2,fx:{stres:+5,popularitas:-2}}
  ]},
  {t:'"Apa prioritas pertama Anda jika terpilih?"',a:[
    {t:'Satu program unggulan yang jelas & realistis',d:2,fx:{kompetensi:+1}},
    {t:'Sepuluh janji sekaligus, ambisius',d:-1,fx:{popularitas:+1}},
    {t:'"Akan saya kaji dulu setelah dilantik"',d:-2}
  ]},
  {t:'"Lingkungan dikorbankan demi investasi. Di mana posisi Anda?"',a:[
    {t:'Pembangunan hijau — tegas batasi izin perusak',d:2,fx:{integritas:+1}},
    {t:'"Ekonomi dulu, lingkungan menyusul"',d:0,fx:{popularitas:-1}},
    {t:'Menghindar dengan jawaban berputar',d:-1}
  ]},
  {t:'Closing statement: "Kenapa rakyat harus memilih Anda?"',a:[
    {t:'Pidato visioner yang menyentuh & membumi',d:2,fx:{popularitas:+3}},
    {t:'Bagi-bagi janji manis tanpa rincian',d:0,fx:{integritas:-1}},
    {t:'Membaca teks kaku dan datar',d:-1}
  ]}
];

/* ===== WAWANCARA ===== */
const WAWANCARA=[
  {n:'Korupsi & Akuntabilitas',q:[
    {t:'"Bagaimana sikap Anda terhadap koruptor?"',a:[
      {t:'"Hukum mati saja!"',sub:'Tegas, populis',fx:{popularitas:+5,integritas:+1}},
      {t:'"Reformasi sistem, bukan hukuman ekstrem."',sub:'Bijak, lambat terasa',fx:{kompetensi:+3,popularitas:+1}},
      {t:'"Tergantung kontribusi mereka pada bangsa..."',sub:'Diplomatis, abu-abu',fx:{integritas:-5,popularitas:-3,heat:+2}}
    ]},
    {t:'"Soal anggaran negara yang bocor, salah siapa?"',a:[
      {t:'"Rezim sebelumnya yang menanam akarnya."',fx:{popularitas:+2,integritas:-2}},
      {t:'"Sistem pengawasan yang lemah."',fx:{kompetensi:+3}},
      {t:'"Termasuk saya. Kita semua harus introspeksi."',fx:{integritas:+5,popularitas:+2}}
    ]},
    {t:'"Apakah Anda siap diaudit harta secara terbuka?"',a:[
      {t:'"Audit sekarang juga — saya bersih!"',fx:{integritas:+5,popularitas:+5,heat:-3}},
      {t:'"Sesuai mekanisme LHKPN yang ada."',fx:{kompetensi:+1}},
      {t:'"Privasi keluarga juga harus dihormati."',fx:{integritas:-4,popularitas:-3,heat:+5}}
    ]}
  ]},
  {n:'Ekonomi Rakyat',q:[
    {t:'"Harga sembako terus naik. Solusi konkret Anda?"',a:[
      {t:'"Bansos langsung ke 40 juta rakyat miskin."',fx:{popularitas:+5,kompetensi:+1}},
      {t:'"Operasi pasar dan stabilisasi stok nasional."',fx:{kompetensi:+4,popularitas:+2}},
      {t:'"Itu kewajaran inflasi global, bukan salah pemerintah."',fx:{popularitas:-5,kompetensi:-1}}
    ]},
    {t:'"Berapa target kemiskinan yang Anda janjikan?"',a:[
      {t:'"Nol persen dalam lima tahun!"',sub:'Berani, mustahil',fx:{popularitas:+6,kompetensi:-3}},
      {t:'"Turun 3 persen — realistis dan terukur."',fx:{kompetensi:+4,popularitas:+1}},
      {t:'"Sulit dijawab dengan angka, intinya kerja keras."',fx:{kompetensi:-3,popularitas:-2}}
    ]},
    {t:'"UMP dianggap terlalu rendah. Pendapat?"',a:[
      {t:'"Naikkan signifikan tahun depan!"',fx:{popularitas:+4,integritas:+1}},
      {t:'"Kalibrasi dengan produktivitas dan inflasi."',fx:{kompetensi:+4}},
      {t:'"Investor harus dimanjakan dulu agar mau masuk."',fx:{popularitas:-5,pengaruh:+2}}
    ]}
  ]},
  {n:'Kebebasan & Demokrasi',q:[
    {t:'"Setuju revisi UU yang melemahkan lembaga antikorupsi?"',a:[
      {t:'"Tegas tolak — itu pengkhianatan reformasi."',fx:{integritas:+5,popularitas:+4,pengaruh:-3}},
      {t:'"Perlu kajian yang mendalam dulu."',fx:{kompetensi:+1}},
      {t:'"Demi efisiensi kelembagaan, perlu."',fx:{integritas:-6,pengaruh:+3,heat:+3}}
    ]},
    {t:'"UU ITE banyak dipakai membungkam kritik. Sikap Anda?"',a:[
      {t:'"Cabut pasal-pasal karetnya sekarang!"',fx:{popularitas:+4,integritas:+3,pengaruh:-2}},
      {t:'"Revisi seimbang antara kebebasan dan ketertiban."',fx:{kompetensi:+3}},
      {t:'"Kritik berlebihan memang harus diatur."',fx:{popularitas:-5,integritas:-3}}
    ]},
    {t:'"Demo besar terjadi pekan lalu. Tanggapan Anda?"',a:[
      {t:'"Hak konstitusional — harus didengar."',fx:{popularitas:+3,integritas:+2}},
      {t:'"Demo silakan, asal tidak anarkis."',fx:{kompetensi:+1,popularitas:+1}},
      {t:'"Aparat harus tegas. Stabilitas di atas segalanya."',fx:{popularitas:-4,pengaruh:+2}}
    ]}
  ]},
  {n:'Lingkungan & Megaproyek',q:[
    {t:'"Hutan terus dibabat untuk tambang. Pendapat?"',a:[
      {t:'"Moratorium total semua izin tambang baru!"',fx:{popularitas:+3,integritas:+3,pengaruh:-3}},
      {t:'"Investor butuh kepastian — ekonomi prioritas."',fx:{popularitas:-3,pengaruh:+3}},
      {t:'"Ekonomi dan lingkungan harus seimbang."',fx:{kompetensi:+3}}
    ]},
    {t:'"IKN: lanjutkan atau setop?"',a:[
      {t:'"Lanjutkan! Ini warisan untuk anak cucu."',fx:{pengaruh:+3,popularitas:-2}},
      {t:'"Setop! Dananya untuk rakyat saja."',fx:{popularitas:+5,integritas:+2}},
      {t:'"Skala bertahap saja — sesuai kemampuan fiskal."',fx:{kompetensi:+3,popularitas:+1}}
    ]},
    {t:'"Sampah plastik, banjir, polusi. Prioritas Anda?"',a:[
      {t:'"Larangan plastik sekali pakai nasional!"',fx:{popularitas:+3,kompetensi:+2}},
      {t:'"Sosialisasi dan edukasi panjang."',fx:{kompetensi:+1}},
      {t:'"Itu kewajiban warga, bukan pemerintah."',fx:{popularitas:-4,integritas:-2}}
    ]}
  ]},
  {n:'Politik Luar Negeri',q:[
    {t:'"Sengketa perbatasan laut, sikap Anda?"',a:[
      {t:'"Tindakan tegas — tidak boleh dilangkahi."',fx:{popularitas:+4,pengaruh:+2}},
      {t:'"Jalur diplomasi & arbitrase internasional."',fx:{kompetensi:+4}},
      {t:'"Mengalah demi perdamaian regional."',fx:{popularitas:-6,integritas:-2}}
    ]},
    {t:'"Indonesia berpihak ke blok mana?"',a:[
      {t:'"Bebas-aktif — tidak berpihak ke siapapun."',fx:{integritas:+3,kompetensi:+2}},
      {t:'"Blok yang paling menguntungkan saat ini."',fx:{pengaruh:+3,integritas:-2}},
      {t:'"Itu rahasia negara, tidak bisa saya jawab."',fx:{kompetensi:-2,popularitas:-1}}
    ]},
    {t:'"Investasi asing besar — manfaat atau penjajahan baru?"',a:[
      {t:'"Manfaat, asal dikawal ketat oleh negara."',fx:{kompetensi:+3}},
      {t:'"Bentuk neo-kolonialisme — perlu dibatasi."',fx:{popularitas:+3,pengaruh:-3}},
      {t:'"Sah-sah saja, tidak masalah."',fx:{integritas:-3,pengaruh:+2}}
    ]}
  ]},
  {n:'Skandal Pribadi',q:[
    {t:'"Foto-foto LHKPN Anda dengan koleksi mobil mewah viral. Komentar?"',a:[
      {t:'"Semua tercatat resmi & sah."',fx:{integritas:+1,heat:-2}},
      {t:'"Itu hadiah dari kawan-kawan lama."',fx:{integritas:-3,popularitas:-3,heat:+5}},
      {t:'"Tidak relevan untuk dibahas — privat."',fx:{popularitas:-5,heat:+6}}
    ]},
    {t:'"Anak Anda dicalonkan jadi kepala daerah. Dinasti politik?"',a:[
      {t:'"Itu pilihan rakyat, bukan saya."',fx:{popularitas:-2,integritas:-2}},
      {t:'"Saya akan minta dia tidak maju."',fx:{integritas:+5,popularitas:+3}},
      {t:'"Demokrasi kita memang berbasis trah."',fx:{integritas:-6,popularitas:-5,heat:+3}}
    ]},
    {t:'"Ada laporan dari mantan staf tentang dugaan kekerasan verbal..."',a:[
      {t:'"Hoaks. Saya tantang buktikan."',fx:{pengaruh:+2,integritas:-2,heat:+4}},
      {t:'"Mohon maaf bila ada yang tersinggung."',fx:{popularitas:+3,integritas:+3}},
      {t:'"Hak saya untuk tidak menjawab."',fx:{kompetensi:-2,heat:+3}}
    ]}
  ]}
];
function wawancara(){
  P.wawancaraCount++;
  if(P.wawancaraCount>=5)ach('wawancarawan');
  const topik=pick(WAWANCARA);
  const skor={};
  addLog('Anda menerima undangan wawancara di acara prime-time "'+topik.n+'". Lampu studio dinyalakan, kamera merah berkedip.','sys');
  function step(qi){
    if(qi>=topik.q.length){
      const total=(skor.popularitas||0)+(skor.integritas||0)+(skor.kompetensi||0);
      let kelas,nar;
      if(total>=10){kelas='good';nar='<b>Wawancara sukses besar.</b> Klipnya viral positif — warganet membuat highlight reel berjudul "Politisi yang Akhirnya Berbobot".';}
      else if(total>=4){kelas='sys';nar='Wawancara berjalan lumayan. Sebagian setuju, sebagian skeptis, sebagian sudah ganti channel ke sinetron.';}
      else if(total<=-6){kelas='bad';nar='<b>Wawancara blunder.</b> Potongan pendek Anda jadi meme dalam 12 jam. Tim media lembur semalaman membela diri.';}
      else if(total<=-1){kelas='bad';nar='Wawancara kurang meyakinkan. Beberapa jawaban Anda dianalisis ulang oleh pengamat di koran.';}
      else {kelas='sys';nar='Wawancara biasa saja. Pemirsa lebih ingat iklan jeda daripada substansi jawaban Anda.';}
      const final={};
      for(const fK in skor)if(skor[fK])final[fK]=skor[fK];
      if(kelas==='good'){final.popularitas=(final.popularitas||0)+3;final.stres=-3;leg(2,0);}
      else if(kelas==='bad'){final.popularitas=(final.popularitas||0)-4;final.stres=(final.stres||0)+5;final.heat=(final.heat||0)+2;leg(-3,0);}
      addLog(nar+fx(final),kelas);
      return;
    }
    const q=topik.q[qi];
    ask({title:'WAWANCARA — '+topik.n.toUpperCase()+' ('+(qi+1)+'/'+topik.q.length+')',text:q.t,
      opts:q.a.map(a=>({t:a.t,sub:a.sub,e:()=>{
        for(const fK in a.fx)skor[fK]=(skor[fK]||0)+a.fx[fK];
        step(qi+1);
      }}))
    });
  }
  step(0);
}

const ACH_DEF={
  senayan:'Masuk Senayan', kepda:'Kepala Daerah', gub:'Gubernur', menteri:'Kursi Kabinet',
  presiden:'Presiden RI', duaP:'Dua Periode', abadi:'Penguasa Abadi (3 Periode)',
  reformis:'Sang Reformis', bersih:'Tangan Bersih', kakap:'Kelas Kakap',
  licin:'Licin Bagai Belut', ott:'Pernah OTT', tapol:'Tahanan Politik',
  orator:'Singa Podium', lsm:'Pendiri LSM', penulis:'Penulis Buku',
  dinastiP:'Dinasti Politik', mercusuar:'Proyek Mercusuar', dermawan:'Filantropis',
  panglima:'Panglima Sukses', merpati:'Sang Merpati Damai', diplomat:'Diplomat Ulung',
  mbg:'Bapak MBG', iknJadi:'Penuntas IKN', kompromi:'Raja Kompromi',
  konsisten:'Memegang Janji', ingkar:'Raja Ingkar Janji', wawancarawan:'Singa Wawancara',
  kepdaSukses:'Kepala Daerah Teladan'
};

