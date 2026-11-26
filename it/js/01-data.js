'use strict';
/* ================= DATA ================= */
const SEBAB_TUA=['serangan jantung','komplikasi penyakit','usia senja, wafat dengan tenang','stroke'];

/* ===== SPESIALISASI ===== */
const SPES=[
  {k:'support', n:'IT Support / Helpdesk',  short:'IT Support',          boost:{sistem:6,soft:9,jaringan:3},  d:'Garda depan: benahi laptop, jaringan kantor, dan keluhan user tanpa habis.'},
  {k:'sysadmin',n:'System Administrator',   short:'Sysadmin',            boost:{sistem:13,jaringan:6,keamanan:3}, d:'Penjaga server: uptime, backup, dan patch tengah malam adalah napas.'},
  {k:'devops',  n:'DevOps / SRE',           short:'DevOps Engineer',     boost:{sistem:10,ngoding:9,jaringan:3},  d:'CI/CD, container, observability. Otomatiskan apa pun yang bergerak dua kali.'},
  {k:'network', n:'Network Engineer',       short:'Network Engineer',    boost:{jaringan:15,sistem:4,keamanan:3}, d:'Router, switch, BGP, fiber. Kalau internet mati, semua menatap Anda.'},
  {k:'iot',     n:'IoT Engineer',           short:'IoT Engineer',        boost:{jaringan:9,ngoding:7,sistem:5},   d:'Sensor, gateway, telemetry, armada perangkat di lapangan yang harus tetap online.'},
  {k:'security',n:'Security Engineer / Pentester', short:'Security Engineer', boost:{keamanan:15,jaringan:5,ngoding:4}, d:'Bobol untuk menambal. Topi putih hari ini, godaan topi hitam selalu ada.'},
  {k:'backend', n:'Backend Developer',      short:'Backend Dev',         boost:{ngoding:15,sistem:4},   d:'API, database, throughput. Bug-mu jalan di produksi jutaan kali sehari.'},
  {k:'data',    n:'Data Engineer',          short:'Data Engineer',       boost:{ngoding:9,sistem:7,jaringan:3}, d:'Pipeline, warehouse, ETL. Data kotor masuk, keputusan salah keluar.'}
];

/* ===== TEMPAT KERJA ===== */
const TEMPAT=[
  {k:'startup', n:'Startup',                  gajiX:0.85, sahamX:1, d:'Gaji pas-pasan, tapi ada saham. Chaos, ronde pendanaan, dan kemungkinan exit besar.'},
  {k:'korporat',n:'Korporat / Enterprise',    gajiX:1.2,  sahamX:0, d:'Gaji tebal, birokrasi tebal. Sistem warisan dan rapat tak berujung.'},
  {k:'bumn',    n:'BUMN / Instansi Pemerintah',gajiX:0.95, sahamX:0, d:'Stabil dan aman, gerak lambat. Tender, vendor, dan sistem yang takut diubah.'},
  {k:'agency',  n:'Software House / Agensi',   gajiX:0.85, sahamX:0, d:'Banyak proyek klien sekaligus. Deadline ketat, ganti-ganti teknologi.'},
  {k:'remote',  n:'Remote untuk Perusahaan Luar', gajiX:1.9, sahamX:0.3, d:'Gaji dolar, kerja beda zona waktu. Bayaran besar, jam tidur kacau.'}
];

/* ===== JENJANG ===== */
const JAB={
  junior:    {n:'Junior',                lv:1, gaji:96e6},
  medior:    {n:'Medior',                lv:2, gaji:168e6},
  senior:    {n:'Senior',                lv:3, gaji:300e6},
  lead:      {n:'Lead / Tech Lead',      lv:4, gaji:456e6},
  principal: {n:'Principal / Architect', lv:5, gaji:660e6},
  cto:       {n:'CTO / VP Engineering',  lv:6, gaji:1.02e9}
};
const JAB_NEXT={junior:'medior',medior:'senior',senior:'lead',lead:'principal',principal:'cto'};

/* ===== ASET / INFRA ===== */
const INFRA_DEF={
  server:  {n:'Server / VPS Produksi'},
  cloud:   {n:'Cluster Cloud (K8s)'},
  iotfleet:{n:'Armada Perangkat IoT'},
  jaringan:{n:'Jaringan & Konektivitas'},
  db:      {n:'Basis Data Utama'},
  app:     {n:'Aplikasi / API Produksi'}
};
/* infra awal per spesialisasi */
const INFRA_AWAL={
  support:['jaringan','server','app'],
  sysadmin:['server','db','jaringan'],
  devops:['cloud','server','app'],
  network:['jaringan','server','iotfleet'],
  iot:['iotfleet','jaringan','server'],
  security:['server','app','jaringan'],
  backend:['app','db','cloud'],
  data:['db','cloud','app']
};

/* ===== TREN TEKNOLOGI (skena tahunan) ===== */
const TREN=['Cloud Migration','Big Data','Mobile First','Microservices','Blockchain & Web3','Hype AI/LLM','Edge & IoT','Zero Trust Security','Serverless','Platform Engineering','Cost Optimization','AI Agents'];

/* ===== DIAGNOSA (pemeriksaan insiden) ===== */
const DIAG=[
  {k:'log',     n:'Baca log & stack trace'},
  {k:'monitor', n:'Cek dashboard monitoring & metrik'},
  {k:'config',  n:'Telusuri perubahan konfigurasi terakhir'},
  {k:'repro',   n:'Reproduksi & isolasi masalah'},
  {k:'jaringan',n:'Uji konektivitas & jalur jaringan'}
];
/* teks petunjuk per arah temuan */
const KLU={
  tepat:['Jejak di {d} mengarah jelas ke akar masalah.','{d}: polanya konsisten, akar masalah mulai kelihatan.','Dari {d}, dugaan menguat ke satu titik.'],
  sesat:['{d} malah menyesatkan ke arah yang keliru.','{d} memberi sinyal palsu — bukan di situ sumbernya.','Temuan {d} membuat Anda hampir salah simpul.'],
  ambigu:['{d} tidak konklusif, datanya berisik.','{d}: terlalu banyak noise, belum jelas.','Hasil {d} bisa ditafsir dua arah.']
};

/* ===== INSIDEN (use-case operasional) =====
   tiap insiden: opsi perbaikan; tepat satu ok:true = akar masalah benar.
   petunjuk = label fix benar (fallback teks 'tepat'). sec = insiden keamanan.
   spesAff = spesialisasi yang lebih sering kena insiden ini (bobot di buatInsiden).
   probes = langkah diagnosa KHAS insiden ini (anti-flat); tiap probe {k,n,tepat}
            -> 'tepat' = temuan spesifik yang ditampilkan saat diagnosa kena sasaran.
   Tiap k WAJIB punya entri di SKILL_INSIDEN (03-insiden.js). */
const INSIDEN=[
/* ---------- SISTEM / SERVER / DB ---------- */
  {k:'outage', n:'Server Produksi Tumbang', infra:'server', petunjuk:'service mati / memory leak', spesAff:['sysadmin','devops','backend'],
    opsi:[
      {t:'Restart service & perbaiki memory leak',sub:'Kelola ulang resource & batasi memori',ok:true},
      {t:'Tambah RAM/scale up server',sub:'Lempar hardware ke masalah',ok:false},
      {t:'Rollback ke rilis kemarin',sub:'Kalau ini regresi rilis',ok:false}
    ],
    probes:[
      {k:'oom',n:'Periksa dmesg & OOM-killer',tepat:'dmesg penuh jejak OOM-killer membantai proses: memori habis perlahan — ciri khas <b>memory leak</b>, bukan beban wajar.'},
      {k:'mem',n:'Plot grafik pemakaian memori',tepat:'Grafik memori menanjak lurus tanpa pernah turun sejak service hidup — kebocoran, menambah RAM cuma menunda jatuh.'},
      {k:'svc',n:'Cek restart-count service',tepat:'Supervisor sudah me-restart paksa service berkali-kali; akar di aplikasi, bukan di kapasitas mesin.'},
      {k:'rel',n:'Bandingkan dengan rilis sebelumnya',tepat:'Pola kebocoran sudah muncul sebelum rilis terbaru — ini bukan regresi rilis, rollback takkan menolong.'}
    ]},
  {k:'db', n:'Database Lambat / Nyaris Korup', infra:'db', petunjuk:'index & query lambat', spesAff:['sysadmin','data','backend'],
    opsi:[
      {t:'Optimasi query & tambah index',sub:'Full table scan membunuh DB',ok:true},
      {t:'Restart database paksa',sub:'Berisiko korupsi data',ok:false},
      {t:'Pulihkan dari backup semalam',sub:'Kehilangan data beberapa jam',ok:false}
    ],
    probes:[
      {k:'slow',n:'Baca slow query log',tepat:'Slow log dipenuhi satu query tanpa index yang full table scan jutaan baris — <b>index & query</b> akar lambatnya.'},
      {k:'lock',n:'Cek lock & transaksi menggantung',tepat:'Transaksi panjang menahan lock dan query lain antre — optimasi melepas kemacetan; restart paksa malah berisiko korup.'},
      {k:'plan',n:'Analisis query plan (EXPLAIN)',tepat:'EXPLAIN menunjukkan seq scan raksasa; satu index memangkasnya drastis — sama sekali tak perlu restart.'}
    ]},
  {k:'diskfull', n:'Disk Penuh di Server Produksi', infra:'server', petunjuk:'log meledak tanpa rotasi', spesAff:['sysadmin','devops'],
    opsi:[
      {t:'Bersihkan log lama, pasang rotasi & alert kapasitas',sub:'Cegah berulang',ok:true},
      {t:'Pasang disk baru lalu lupakan',sub:'Beli waktu, bukan solusi',ok:false},
      {t:'Hapus file besar sembarangan',sub:'Bisa hapus data penting',ok:false}
    ],
    probes:[
      {k:'du',n:'Telusuri pemakaian disk (du/df)',tepat:'Satu direktori log membengkak puluhan GB tanpa rotasi — penyumbat utama partisi, bukan data produksi.'},
      {k:'open',n:'Cek file terbuka & inode',tepat:'File log raksasa masih dipegang proses (deleted-but-open); rotasi lalu reload service akan melegakan ruang.'},
      {k:'growth',n:'Plot laju pertumbuhan disk',tepat:'Disk tumbuh konstan tiap hari — tanpa rotasi & alert, menambah disk hanya menunda jatuh berikutnya.'}
    ]},
  {k:'cloudbill', n:'Tagihan Cloud Membengkak Mendadak', infra:'cloud', petunjuk:'resource nganggur & autoscale liar',
    opsi:[
      {t:'Audit resource, matikan yang nganggur, pasang budget alert',sub:'Tambal kebocoran biaya',ok:true},
      {t:'Pindah semua ke server on-prem',sub:'Migrasi besar, berisiko',ok:false},
      {t:'Naikkan harga produk ke user',sub:'Lempar biaya ke pelanggan',ok:false}
    ],
    probes:[
      {k:'cost',n:'Bedah cost explorer per layanan',tepat:'Satu layanan melonjak berkali lipat semalam — <b>resource nganggur / autoscale liar</b>, bukan harga yang naik.'},
      {k:'idle',n:'Audit resource menganggur',tepat:'Puluhan instance & disk sisa eksperimen lama tetap menyala — mematikannya menghentikan kebocoran biaya.'},
      {k:'scale',n:'Periksa kebijakan autoscaling',tepat:'Autoscaler salah ambang sehingga menambah node tanpa henti — perlu budget alert & batas skala.'}
    ]},
  {k:'k8scrash', n:'Pod Kubernetes CrashLoopBackOff', infra:'cloud', petunjuk:'config / resource limit / probe', spesAff:['devops'],
    opsi:[
      {t:'Perbaiki config & resource limit, sehatkan readiness probe',sub:'Pod gagal start berulang',ok:true},
      {t:'Scale replica sebanyak mungkin',sub:'Semua ikut crashloop',ok:false},
      {t:'Restart seluruh node',sub:'Masalah di manifest, bukan node',ok:false}
    ],
    probes:[
      {k:'desc',n:'kubectl describe & events pod',tepat:'Events menampakkan pod OOMKilled lalu restart terus — <b>resource limit</b> kekecilan / config salah, bukan node bermasalah.'},
      {k:'plog',n:'Baca log container yang crash',tepat:'Container mati saat memuat config yang hilang; perbaikannya ada di manifest, bukan di node.'},
      {k:'probe',n:'Cek readiness/liveness probe',tepat:'Liveness probe terlalu agresif membunuh pod sebelum siap — menyetel probe & limit menghentikan crashloop.'}
    ]},
/* ---------- NGODING / APP / DATA ---------- */
  {k:'deploy', n:'Deploy Gagal di Produksi', infra:'app', petunjuk:'migrasi DB / config rilis',
    opsi:[
      {t:'Rollback rilis & perbaiki migrasi DB',sub:'Migrasi setengah jalan menggantung',ok:true},
      {t:'Hotfix langsung di server produksi',sub:'Tambal cepat, hutang teknis',ok:false},
      {t:'Matikan fitur lewat feature flag',sub:'Tutup fitur bermasalah',ok:false}
    ],
    probes:[
      {k:'pipe',n:'Baca log pipeline CI/CD',tepat:'Pipeline berhenti tepat di langkah migrasi DB yang setengah jalan — rilis menggantung, perlu rollback + perbaiki migrasi.'},
      {k:'cfg',n:'Bandingkan config rilis lama vs baru',tepat:'Config rilis baru menunjuk variabel yang belum ada di produksi — sumber kegagalan deploy.'},
      {k:'mig',n:'Periksa status migrasi database',tepat:'Tabel migrasi tercatat partially-applied; aplikasi bicara dengan skema tak konsisten — harus dibereskan, bukan di-hotfix.'}
    ]},
  {k:'apilat', n:'Lonjakan Latensi API', infra:'app', petunjuk:'query N+1 & pool koneksi', spesAff:['backend','devops','data'],
    opsi:[
      {t:'Perbaiki query N+1 & perbesar pool koneksi DB',sub:'Akar di lapisan akses data',ok:true},
      {t:'Tambah replika server aplikasi',sub:'Skalakan horizontal',ok:false},
      {t:'Naikkan timeout klien',sub:'Sembunyikan gejala',ok:false}
    ],
    probes:[
      {k:'trace',n:'Buka distributed tracing per endpoint',tepat:'Tracing menunjukkan satu endpoint menembak ratusan query berurutan tiap request — pola <b>N+1</b> klasik di ORM.'},
      {k:'pool',n:'Cek saturasi pool koneksi DB',tepat:'Pool koneksi DB mentok 100% dan request antre menunggu koneksi — leher botol di akses data, bukan CPU app.'},
      {k:'apm',n:'Lihat breakdown latensi (APM)',tepat:'APM memecah waktu: 90% dihabiskan menunggu database — menambah server aplikasi sia-sia.'},
      {k:'cpu',n:'Pantau CPU & memori app',tepat:'CPU app adem; beban menumpuk di query — arah perbaikan jelas ke kode, bukan kapasitas.'}
    ]},
  {k:'mqbacklog', n:'Antrean Pesan Menumpuk Parah', infra:'app', petunjuk:'consumer lag & dead-letter', spesAff:['backend','devops','data'],
    opsi:[
      {t:'Skalakan consumer & proses ulang dead-letter',sub:'Konsumen tak sanggup mengejar',ok:true},
      {t:'Hapus antrean & mulai bersih',sub:'Buang antrean = buang data',ok:false},
      {t:'Perbesar kapasitas broker',sub:'Masalahnya bukan broker',ok:false}
    ],
    probes:[
      {k:'lag',n:'Ukur consumer lag per partisi',tepat:'Consumer lag meledak di semua partisi sejak sejam lalu — konsumen berhenti mengejar, bukan produser yang gila.'},
      {k:'dlq',n:'Periksa dead-letter queue',tepat:'Dead-letter penuh pesan gagal yang terus di-retry — racun antrean yang menyumbat throughput.'},
      {k:'cons',n:'Cek kesehatan & jumlah consumer',tepat:'Separuh consumer mati diam tanpa restart — menskalakan & menghidupkan ulang konsumen kuncinya.'}
    ]},
  {k:'pipeline', n:'Pipeline Data Putus, Laporan Kosong', infra:'db', petunjuk:'skema hulu berubah', spesAff:['data','backend'],
    opsi:[
      {t:'Perbaiki schema mapping & backfill data hilang',sub:'Kontrak skema patah',ok:true},
      {t:'Restart job berulang-ulang',sub:'Gagal lagi dengan error sama',ok:false},
      {t:'Hapus tabel tujuan & buat ulang',sub:'Menghilangkan histori',ok:false}
    ],
    probes:[
      {k:'err',n:'Baca log kegagalan job ETL',tepat:'Job gagal di langkah parsing dengan error kolom hilang — <b>skema sumber berubah</b>, mapping perlu diperbaiki.'},
      {k:'src',n:'Bandingkan skema sumber vs ekspektasi',tepat:'Tim hulu mengganti kolom tanpa kabar; pipeline menolak format baru — backfill diperlukan setelah mapping benar.'},
      {k:'fresh',n:'Cek kesegaran data di warehouse',tepat:'Data berhenti masuk sejak rilis hulu kemarin — bukan soal beban, tapi kontrak skema yang patah.'}
    ]},
  {k:'baddata', n:'Data Kotor Mengalir ke Dashboard', infra:'db', petunjuk:'validasi & dedup di hulu', spesAff:['data','backend'],
    opsi:[
      {t:'Pasang validasi & dedup di hulu, perbaiki transform',sub:'Hentikan sumber kotor',ok:true},
      {t:'Koreksi angka manual di dashboard',sub:'Besok kotor lagi',ok:false},
      {t:'Sembunyikan metrik yang aneh',sub:'Menutupi, bukan memperbaiki',ok:false}
    ],
    probes:[
      {k:'dup',n:'Hitung duplikasi & nilai null',tepat:'Baris duplikat & null meledak sejak integrasi sumber baru — perlu <b>dedup & validasi</b> di hulu.'},
      {k:'lin',n:'Telusuri lineage kolom bermasalah',tepat:'Lineage menunjuk satu transform yang salah menggabungkan unit/format — di situ data jadi kotor.'},
      {k:'feed',n:'Audit kualitas sumber masuk',tepat:'Satu feed mengirim format tak konsisten tanpa kontrak — validasi di gerbang masuk menahan racunnya.'}
    ]},
/* ---------- JARINGAN ---------- */
  {k:'jaringan', n:'Jaringan Down / Latensi Tinggi', infra:'jaringan', petunjuk:'routing/BGP/DNS',
    opsi:[
      {t:'Perbaiki konfigurasi routing & DNS',sub:'Salah propagasi rute',ok:true},
      {t:'Ganti perangkat switch/router',sub:'Asumsi hardware rusak',ok:false},
      {t:'Failover ke jalur ISP cadangan',sub:'Pindah uplink sementara',ok:false}
    ],
    probes:[
      {k:'trace',n:'Traceroute & cek tabel rute',tepat:'Traceroute putus di hop internal; rute baru salah propagasi — <b>konfigurasi routing</b> sumbernya, bukan hardware.'},
      {k:'bgp',n:'Periksa sesi BGP & announcement',tepat:'Satu sesi BGP flapping menarik-ulang prefix — penyebab latensi & blackhole, dibenahi di konfig.'},
      {k:'iface',n:'Cek error counter perangkat',tepat:'Counter switch bersih tanpa error fisik — perangkat sehat, masalah ada di logika routing/DNS.'}
    ]},
  {k:'dns', n:'Domain Tak Bisa Diakses (DNS)', infra:'jaringan', petunjuk:'record DNS & propagasi', spesAff:['network','sysadmin','backend'],
    opsi:[
      {t:'Perbaiki record DNS & turunkan TTL untuk propagasi',sub:'Zona/registrar bermasalah',ok:true},
      {t:'Ganti server aplikasi',sub:'Server sehat, ini resolusi nama',ok:false},
      {t:'Minta semua user ganti DNS publik',sub:'Tambal di sisi yang salah',ok:false}
    ],
    probes:[
      {k:'dig',n:'Query dig/nslookup dari banyak resolver',tepat:'dig mengembalikan NXDOMAIN dari resolver publik padahal server hidup — masalah di <b>record DNS</b>, bukan aplikasi.'},
      {k:'reg',n:'Cek status registrar & nameserver',tepat:'Nameserver di registrar baru berubah/kedaluwarsa; zona perlu diperbaiki dan dipropagasi ulang.'},
      {k:'ttl',n:'Periksa TTL & cache resolver',tepat:'TTL lama masih menyimpan record usang di cache global — menurunkan TTL mempercepat propagasi pemulihan.'}
    ]},
  {k:'lbconf', n:'Load Balancer Salah Konfig, 502 Massal', infra:'jaringan', petunjuk:'health check & upstream LB', spesAff:['devops','sysadmin','network'],
    opsi:[
      {t:'Perbaiki health check & daftar upstream LB',sub:'LB membuang backend sehat',ok:true},
      {t:'Restart semua backend',sub:'Backend sehat, LB yang salah',ok:false},
      {t:'Tambah jumlah backend',sub:'Tetap 502 kalau health check salah',ok:false}
    ],
    probes:[
      {k:'pool',n:'Cek status pool upstream di LB',tepat:'LB menandai hampir semua backend unhealthy padahal mereka melayani normal — <b>health check</b> keliru, bukan backend mati.'},
      {k:'hc',n:'Uji endpoint health check manual',tepat:'Path health check mengarah ke URL yang sudah dipindah; perbaiki konfigurasi cek kesehatan & daftar upstream.'},
      {k:'log',n:'Baca access log 502 di LB',tepat:'502 muncul karena LB tak punya upstream yang lolos cek — menambah backend percuma sebelum config dibenahi.'}
    ]},
  {k:'vpn', n:'VPN Tumbang, Tim WFH Lumpuh', infra:'jaringan', petunjuk:'kapasitas & sertifikat VPN', spesAff:['network','sysadmin','support'],
    opsi:[
      {t:'Skalakan konsentrator VPN & perbarui sertifikat',sub:'Kapasitas/sertifikat habis',ok:true},
      {t:'Suruh seluruh tim ke kantor',sub:'Menyerah, bukan solusi',ok:false},
      {t:'Matikan autentikasi VPN sementara',sub:'Membuka lubang keamanan',ok:false}
    ],
    probes:[
      {k:'cap',n:'Cek beban & sesi konsentrator VPN',tepat:'Konsentrator mentok batas lisensi sesi di jam sibuk — perlu <b>diskalakan</b>, bukan disuruh ngantor.'},
      {k:'cert',n:'Periksa masa berlaku sertifikat VPN',tepat:'Sertifikat gateway VPN baru kedaluwarsa pagi ini — pembaruan sertifikat memulihkan koneksi tepercaya.'},
      {k:'auth',n:'Telusuri log autentikasi gagal',tepat:'Auth gagal massal bukan karena salah password tapi handshake TLS putus — mengarah ke sertifikat & kapasitas.'}
    ]},
/* ---------- IoT ---------- */
  {k:'iotmati', n:'Armada IoT Offline Massal', infra:'iotfleet', petunjuk:'gateway/sertifikat MQTT',
    opsi:[
      {t:'Perbaiki gateway & rotasi sertifikat MQTT',sub:'Konektivitas broker putus massal',ok:true},
      {t:'Reboot semua perangkat dari jauh',sub:'Kalau cuma nyangkut firmware',ok:false},
      {t:'Kirim teknisi ke lapangan satu-satu',sub:'Mahal & lambat',ok:false}
    ],
    probes:[
      {k:'broker',n:'Cek koneksi ke broker MQTT',tepat:'Ribuan perangkat putus serempak di broker — <b>gateway/broker</b> yang jatuh, bukan firmware tiap unit.'},
      {k:'cert',n:'Periksa sertifikat & kredensial MQTT',tepat:'Sertifikat klien MQTT kedaluwarsa massal sehingga handshake ditolak — rotasi sertifikat memulihkan armada.'},
      {k:'ping',n:'Uji konektivitas gateway regional',tepat:'Gateway regional tak menjawab; perangkat di bawahnya ikut hilang — perbaiki gateway, jangan kirim teknisi satu-satu.'}
    ]},
  {k:'firmware', n:'OTA Firmware Bikin Perangkat Brick Massal', infra:'iotfleet', petunjuk:'hentikan rollout & rollback', spesAff:['iot','devops'],
    opsi:[
      {t:'Hentikan rollout & dorong firmware rollback bertahap',sub:'Selamatkan perangkat tersisa',ok:true},
      {t:'Paksa semua perangkat update ulang',sub:'Yang brick tak bisa terima update',ok:false},
      {t:'Tarik semua perangkat dari lapangan',sub:'Sangat mahal & lambat',ok:false}
    ],
    probes:[
      {k:'rollout',n:'Lihat status rollout per batch',tepat:'Perangkat mulai mati tepat di batch firmware baru — rollout-nya yang meracuni, harus <b>dihentikan segera</b>.'},
      {k:'boot',n:'Tarik boot-log perangkat yang masih hidup',tepat:'Boot-log menunjukkan image baru gagal verifikasi lalu hang — rollback bertahap menyelamatkan yang belum brick.'},
      {k:'ab',n:'Cek skema partisi A/B & rollback',tepat:'Perangkat punya partisi cadangan A/B yang masih sehat — rollback terkendali jauh lebih aman daripada update paksa.'}
    ]},
  {k:'sensordrift', n:'Data Sensor IoT Ngawur / Drift', infra:'iotfleet', petunjuk:'kalibrasi & sinkron waktu', spesAff:['iot','data'],
    opsi:[
      {t:'Kalibrasi ulang & sinkron waktu perangkat (NTP)',sub:'Akar di kalibrasi & clock',ok:true},
      {t:'Buang semua data sensor',sub:'Ikut membuang data sah',ok:false},
      {t:'Ganti semua sensor',sub:'Mahal, padahal cuma kalibrasi',ok:false}
    ],
    probes:[
      {k:'cmp',n:'Bandingkan dengan sensor referensi',tepat:'Pembacaan menyimpang konstan dari sensor referensi — gejala <b>drift kalibrasi</b>, bukan sensor rusak total.'},
      {k:'clock',n:'Cek sinkronisasi waktu perangkat',tepat:'Stempel waktu perangkat meleset jauh; data masuk dengan timestamp kacau — sinkron NTP memperbaiki separuh masalah.'},
      {k:'cal',n:'Telusuri perubahan koefisien kalibrasi',tepat:'Drift mulai persis setelah koefisien kalibrasi berubah — kalibrasi ulang mengembalikan akurasi.'}
    ]},
/* ---------- KEAMANAN (sec) ---------- */
  {k:'ddos', n:'Serangan DDoS Membanjiri Layanan', infra:'app', sec:true, petunjuk:'rate limit & WAF/CDN',
    opsi:[
      {t:'Aktifkan WAF, rate-limit & scrubbing CDN',sub:'Saring trafik jahat',ok:true},
      {t:'Blokir semua trafik luar negeri',sub:'Kasar, blokir user sah juga',ok:false},
      {t:'Tambah server sebanyak-banyaknya',sub:'Bakar biaya, ladeni banjir',ok:false}
    ],
    probes:[
      {k:'flow',n:'Analisis netflow & sumber trafik',tepat:'Jutaan request dari ribuan IP tersebar membanjiri endpoint — pola <b>DDoS</b>; rate-limit & scrubbing, bukan blokir satu negara.'},
      {k:'uplink',n:'Cek saturasi uplink & koneksi',tepat:'Uplink jenuh oleh trafik sampah berlapis; CDN scrubbing menyaringnya sebelum mencapai origin.'},
      {k:'pat',n:'Telusuri pola request mencurigakan',tepat:'Request identik tanpa sesi sah berulang ribuan kali per detik — WAF + rate limit menyaring tanpa memblok user asli.'}
    ]},
  {k:'breach', n:'Indikasi Peretasan & Kebocoran Data', infra:'server', sec:true, petunjuk:'isolasi & rotasi kredensial',
    opsi:[
      {t:'Isolasi sistem, rotasi semua kredensial, audit',sub:'Putus akses penyerang, telusuri',ok:true},
      {t:'Matikan total semua server',sub:'Panik, layanan ikut mati',ok:false},
      {t:'Tutup celah seadanya, lanjut operasi',sub:'Anggap insiden kecil',ok:false}
    ],
    probes:[
      {k:'ids',n:'Tinjau alert IDS & akses anomali',tepat:'IDS menandai lateral movement dari satu host ke beberapa server — penyerang di dalam, <b>isolasi & rotasi kredensial</b> mendesak.'},
      {k:'cred',n:'Audit akun & kredensial dipakai',tepat:'Kredensial admin dipakai dari sesi tak dikenal di luar jam kerja — harus dicabut & dirotasi total.'},
      {k:'exfil',n:'Cek transfer data keluar tak wajar',tepat:'Lonjakan transfer ke host asing — eksfiltrasi berjalan; mematikan semua server membabi buta justru menghapus jejak.'},
      {k:'persist',n:'Cari mekanisme persistence',tepat:'Ditemukan cron & akun siluman yang ditanam penyerang — menutup celah seadanya takkan mengusir mereka.'}
    ]},
  {k:'ransom', n:'Ransomware Mengunci Sistem', infra:'db', sec:true, petunjuk:'pulihkan dari backup bersih',
    opsi:[
      {t:'Pulihkan dari backup offline yang bersih',sub:'Kalau backup terjaga',ok:true},
      {t:'Bangun ulang sistem dari nol',sub:'Lama, tapi bersih total',ok:false}
    ],
    probes:[
      {k:'scope',n:'Petakan sistem yang terenkripsi',tepat:'Enkripsi menyebar dari satu share ke server file & DB — pemulihan dari <b>backup offline bersih</b> jadi taruhan utama.'},
      {k:'bak',n:'Verifikasi integritas & isolasi backup',tepat:'Backup offline terakhir terbukti utuh dan tak tersentuh enkripsi — restorasi darinya jalan paling waras.'},
      {k:'note',n:'Analisis catatan & varian ransomware',tepat:'Varian dikenal tanpa dekripsi gratis; membayar tebusan tak menjamin kunci — backup bersih satu-satunya jalan terhormat.'}
    ]},
  {k:'phish', n:'Pengambilalihan Akun (Phishing/MFA)', infra:'app', sec:true, petunjuk:'reset sesi & paksa MFA', spesAff:['security','support'],
    opsi:[
      {t:'Reset sesi, paksa MFA, blokir akun kompromi',sub:'Putus akses penyerang',ok:true},
      {t:'Imbau user ganti password lewat email',sub:'Lambat, penyerang sudah di dalam',ok:false},
      {t:'Abaikan, mungkin login sah',sub:'Menormalkan anomali',ok:false}
    ],
    probes:[
      {k:'geo',n:'Audit log login & geolokasi',tepat:'Login sukses dari negara asing tengah malam tanpa MFA — akun benar-benar <b>diambil alih</b>, bukan user biasa.'},
      {k:'mfa',n:'Cek status MFA akun terdampak',tepat:'Akun korban tak punya MFA aktif dan sesi lama masih hidup — mencabut sesi + memaksa MFA memutus penyerang.'},
      {k:'fwd',n:'Periksa aturan forwarding mailbox',tepat:'Penyerang diam-diam memasang auto-forward email keluar — jejak pengambilalihan, perlu reset menyeluruh.'}
    ]},
  {k:'secret', n:'Kunci API Bocor di Repo Publik', infra:'app', sec:true, petunjuk:'cabut & rotasi kunci', spesAff:['backend','security','devops'],
    opsi:[
      {t:'Cabut & rotasi kunci, scan riwayat, pasang secret-scanning',sub:'Anggap sudah bocor total',ok:true},
      {t:'Hapus commit-nya saja',sub:'Riwayat git & bot sudah menyalin',ok:false},
      {t:'Privatkan repo, kunci biarkan',sub:'Kunci terlanjur tersebar',ok:false}
    ],
    probes:[
      {k:'scan',n:'Scan riwayat git untuk secret',tepat:'Secret-scanner menemukan kunci produksi ter-commit berbulan lalu — sudah lama publik, wajib <b>dicabut & dirotasi</b>.'},
      {k:'usage',n:'Audit pemakaian kunci di log API',tepat:'Log API mencatat pemakaian kunci dari IP asing tak dikenal — kunci aktif disalahgunakan, bukan sekadar terekspos.'},
      {k:'bot',n:'Cek apakah sudah dipanen bot',tepat:'Akses muncul hanya menit setelah commit publik — bot pemanen secret sudah menyalinnya; menghapus commit percuma.'}
    ]},
  {k:'supplychain', n:'Dependensi Pihak Ketiga Disusupi', infra:'app', sec:true, petunjuk:'pin & audit dependensi', spesAff:['security','backend','devops'],
    opsi:[
      {t:'Pin versi bersih, audit dependensi, bangun SBOM',sub:'Putus paket beracun',ok:true},
      {t:'Update semua paket ke terbaru',sub:'Bisa menarik versi jahat lagi',ok:false},
      {t:'Abaikan, fungsinya jalan normal',sub:'Backdoor jalan diam-diam',ok:false}
    ],
    probes:[
      {k:'sum',n:'Bandingkan lockfile & checksum',tepat:'Checksum satu dependensi tak cocok dengan rilis resmi — versi yang ditarik sudah <b>disusupi</b>, perlu di-pin ke versi bersih.'},
      {k:'out',n:'Pantau koneksi keluar saat build',tepat:'Paket mencurigakan membuka koneksi ke domain asing saat build — perilaku backdoor klasik supply-chain.'},
      {k:'adv',n:'Cek threat-intel & advisory paket',tepat:'Advisory keamanan baru menandai versi paket ini sebagai malicious — audit & ganti versi adalah jalan benar.'}
    ]},
  {k:'cert', n:'Sertifikat SSL Kedaluwarsa', infra:'app', petunjuk:'perpanjang & otomasi renew', spesAff:['sysadmin','support','devops'],
    opsi:[
      {t:'Perpanjang sertifikat & otomatiskan renew',sub:'Pasang auto-renew biar tak terulang',ok:true},
      {t:'Suruh user klik "lanjutkan tidak aman"',sub:'Memalukan & berbahaya',ok:false}
    ],
    probes:[
      {k:'exp',n:'Cek tanggal kedaluwarsa sertifikat',tepat:'Sertifikat TLS lewat tanggal berlaku pagi ini sehingga browser menolak — cukup <b>perpanjang & otomasikan renew</b>.'},
      {k:'chain',n:'Validasi rantai & SAN sertifikat',tepat:'Rantai sertifikat valid, hanya kedaluwarsa — bukan salah domain; auto-renew mencegah terulang.'},
      {k:'auto',n:'Periksa job auto-renew',tepat:'Job pembaruan otomatis mati diam-diam berbulan lalu — menghidupkannya menutup celah selamanya.'}
    ]}
];

/* ===== SERTIFIKASI ===== */
const SERT=[
  {k:'cloud', n:'Sertifikasi Cloud (AWS/GCP)', biaya:15e6, st:{sistem:6,ngoding:2}},
  {k:'cka',   n:'CKA — Kubernetes',            biaya:12e6, st:{sistem:7}},
  {k:'ccnp',  n:'CCNP — Jaringan',             biaya:14e6, st:{jaringan:8}},
  {k:'oscp',  n:'OSCP — Offensive Security',   biaya:20e6, st:{keamanan:9}},
  {k:'pmp',   n:'PMP — Manajemen Proyek',      biaya:18e6, st:{soft:8}}
];

const ACH_DEF={
  junior:'Commit Pertama', medior:'Naik Medior', senior:'Engineer Senior', lead:'Memimpin Tim',
  principal:'Principal Engineer', cto:'Naik ke Kursi CTO',
  pemadam:'Pemadam Kebakaran Digital', rajaUptime:'Raja Uptime', otomasi:'Otomatiskan Segalanya',
  topiPutih:'Topi Putih', ctfJuara:'Juara CTF', bugHunter:'Pemburu Bug Bounty', pentester:'Pentester Bersertifikat',
  topiHitam:'Topi Hitam', malingData:'Pencuri Data', ransomware:'Dalang Ransomware',
  buronan:'Buronan Siber', jeruji:'Di Balik Jeruji Siber',
  sultanTech:'Sultan Tech', fire:'Pensiun Dini (FIRE)', exit:'Cuan dari Exit Startup',
  ossLegend:'Maintainer Open Source', mentor:'Mentor Para Junior', iotMaster:'Penjaga Armada',
  sertifikat:'Kolektor Sertifikat', burnoutSurvivor:'Selamat dari Burnout', polyglot:'Full-Stack Sejati',
  legend:'Engineer Legendaris', antiAI:'Bertahan dari Gelombang AI',
  lulusSertif:'Lulus Ujian Sertifikasi', ctfSempurna:'CTF Sempurna', wawancaraAce:'Wawancara Teknis Sempurna', gajiDolar:'Gaji Dolar',
  guruNgoding:'Guru Ngoding', techInfluencer:'Tech Influencer', blameless:'Budaya Blameless', exceeds:'Exceeds Expectations',
  lolosPIP:'Lolos PIP', tukangServis:'Teknisi Satu RT'
};
