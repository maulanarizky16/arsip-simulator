# ARSIP — Koleksi Simulator Hidup

> **Konteks singkat untuk melanjutkan project ini di sesi baru.**
> Disusun oleh: Maulana (Balikpapan, IoT/fleet monitoring).
> Bahasa default: Bahasa Indonesia kasual. Hindari over-formatting & emoji yang gak perlu.
> Terakhir diperbarui: Juni 2026 (5 game lengkap: kehidupan, negara, hakim, it, niaga; polish mobile/a11y; ekspansi konten hakim).

---

## 1. Apa Project Ini

Koleksi single-page HTML game berbahasa Indonesia bergaya estetika "berkas/arsip rahasia" (paper/dossier aesthetic). Setiap game adalah simulator hidup yang dimainkan dari titik nol sampai berkas ditutup, dengan banyak pilihan & konsekuensi.

Sudah ada **5 game lengkap** (kehidupan, negara, hakim, it, niaga) + **1 dokumen panduan** + **1 hub website** (landing, leaderboard, halaman donasi). Semuanya bisa di-deploy ke VPS sebagai static files (nginx/Caddy) — **tanpa build step**.

**Penting — sejak refactor:** tiap game punya satu file shell HTML tipis (`kehidupan.html`, `negara.html`, `hakim.html`, `it.html`, `niaga.html`), tapi CSS & JS-nya **dipecah ke folder per-game** (`kehidupan/`, `negara/`, `hakim/`, `it/`, `niaga/`) jadi modul per-bagian bernomor `00-` … `09-`. Tujuannya: gampang revisi per bagian tanpa baca seluruh kode. Kelima game pakai pola yang sama persis (lihat bagian 3 & 5), jadi paham satu = paham semua.

---

## 2. Game yang Sudah Selesai

### A. ARSIP KEHIDUPAN (`kehidupan.html` + folder `kehidupan/`)
Simulator hidup pribadi, BitLife-style versi Indonesia. State global di object `P`.

**Fitur utama:**
- 6 tab: Diri & Sosial, Asmara, Karier, Usaha, Uang & Aset, Hobi
- Generasi lanjut (lanjut bermain sebagai anak sendiri)
- 16 jenis usaha paralel dengan karyawan tanpa batas (diminishing returns)
- 4 instrumen investasi + properti + tanah + KPR 15 tahun
- Sistem keluarga, anak, kedekatan dengan anak
- Asuransi kesehatan, penyakit kronis, antrean haji
- 13 achievement & julukan akhir

**Fitur hasil revisi terakhir:**
- **Pasangan dibedakan gender.** Pemain cowok yang melamar (aksi "Lamar"). Pemain cewek tidak punya aksi lamar; pasangan cowok yang datang melamar lewat event otomatis (rel ≥60, jalan ≥1 th), tinggal terima/tolak.
- **Profil calon pasangan ditampilkan** sebelum jadian: umur, pekerjaan + tempat kerja, gaji/bln, pendidikan, status (lajang/janda/duda), sifat. Gaji pasangan jadi penghasilan keluarga kalau menikah.
- **Gaji karyawan ikut skala usaha** (`gajiKary(b)` dari modal & level) — bukan flat lagi.
- **Hobi dibedakan gender** (tag `g` di array `HOBI`): mayoritas untuk semua, sebagian condong (mancing/otomotif/futsal/gym = cowok; baking/craft/dance = cewek).
- **Save/resume**: auto-save tiap maju tahun; saat buka/refresh kalau ada hidup belum tamat muncul prompt "Lanjutkan / Mulai Baru".

**Fitur sosial & kehidupan (batch terakhir):**
- **Teman bernama** (`P.teman[]`, `buatTeman`): cari teman, nongkrong, minta bantuan (referral/pinjam/curhat). Sifat (`SIFAT_TEMAN`) menentukan untung-ruginya. Kedekatan meluruh tiap tahun; ada event teman & ach `sahabat`.
- **Parenting → generasi**: tiap anak punya `didik` (dinaikkan aksi `didikAnak`, `anakTime`, biayai kuliah). `contAsChild` membaca `kids[0].didik` untuk menentukan stat awal generasi berikut.
- **Sisi gelap judi** (`P.judi` adiksi): aksi `judi`, compulsion di drift, event rock-bottom (jerat pinjol), pemulihan via `detoxJudi`. Ach `comeback`.
- **Merantau** (`merantau`, `KOTA_METRO`): pindah kota; metro = biaya hidup +30% tapi peluang kerja lebih besar. Ach `perantau`.
- **Kesehatan mental**: aksi `terapi`; event burnout, krisis paruh baya (`P.midlife`). Ach `waras`.

**Skor akhir:** `skor` (0–180+), grade D–S, julukan kontekstual.

**Sekolah & kuliah (`03b-soal.js` + `03c-sekolah.js`):** bank soal `SOAL` per jenjang/jurusan + soal lucu (opsi benar ditulis pertama, diacak saat tampil; soal lucu punya tanggapan per opsi). `lembarSoal()` = pembungkus `Kuis.lembar` (form pilihan ganda **maks. 5 soal** dikumpulkan sekaligus; opsi "Semua …" dikunci urutannya) (belajar ekstra 3, UAS 3, sidang 2, ujian akhir/tes masuk/beasiswa 5). Nama ujian & jalur sesuai era (`namaUjianAkhir`, `namaSeleksi`, `namaBeasiswa`, `namaKurikulum`; UN 2020 batal). Kuliah: `masukKuliah()` (rapor/tes/luar negeri/PTS/D3) → `pilihJurusan(prog)` (13 jurusan, `PROGRAM`) → `kuliahTahunan(a)` = dua `semesterKuliah()` per tahun (fokus + `uas`), KKN semester 6, skripsi semester akhir−1, `sidang` → `wisuda()` (IPK, predikat, peluang kerja). Tes: `tests/test-sekolah.js`.

### B. ARSIP NEGARA (`negara.html` + folder `negara/`)
Simulator karier politik dari aktivis sampai presiden. State global di `P` (tokoh) + `N` (negara).

**Fitur utama:**
- 5 jenjang jabatan: DPRD → DPR → Wali Kota → Gubernur → Presiden (+ Menteri lewat tawaran istana)
- 17 indikator negara (kas, utang, pajak, inflasi, pengangguran, kemiskinan, ekonomi, mood, infra, pendidikan, keswa, lingkungan, kebebasan, demokrasi, keamanan, militer, diplomasi, korupsi)
- Status khusus: MBG, IKN 3 fase, perang, separatis, sanksi internasional
- Partai, koalisi, pemilu serentak (tiap 5 tahun)
- **Wawancara TV prime-time** (6 topik acak, ~54 cabang), **janji kampanye** (16 pool, dievaluasi di akhir periode)
- Hubungan luar negeri (blok Barat/Timur/non-blok), korupsi (uang gelap, mark-up, OTT, suap, sistem `heat`)
- 4 jenis rezim NPC saat tidak menjabat

**Fitur hasil revisi terakhir:**
- **Pemilu bisa kalah.** `peluang(k,tier,fajar)` hitung peluang dari popularitas, partai, dana, petahana, heat, level jabatan, kekuatan lawan acak (`P._lawanKuat`), dan bonus debat (`P._debatBonus`). Persentase ditampilkan ke pemain sebelum & saat pemilu.
- **Calon lawan + sesi debat.** Tiap maju pemilu, `buatLawan(k)` membuat rival (`P._lawan`: nama, partai, latar, pop/integritas/kompetensi, `kuat`) yang ditampilkan di tahap dana & debat (`lawanProfilHtml`). `debat(k,tier)`/`debatRonde(...)` = 3 ronde (pool `DEBAT_TOPIK`); skor vs skor lawan jadi `P._debatBonus` (±) yang memengaruhi `peluang()`. Alur pemilu: kursi → dana → janji → debat → serangan fajar → hasil. Variabel transient di-reset di `hasilPemilu`.
- **Card "JABATAN AKTIF"** (aside, `#jabCard`) tampil saat menjabat: periode X/2, sisa masa, gaji, plus data per posisi (Komisi+Fraksi+RUU untuk DPR, Wilayah untuk kepda, Portofolio untuk menteri, koalisi untuk presiden) + baris Kewenangan. Data disimpan di `P.jabData`, di-set di `setJab()`.
- **Jobdesk sinkron posisi:** program Menteri otomatis sesuai portofolio (`KEMENTERIAN`), anggota DPR punya aksi "Dorong agenda komisi" sesuai `KOMISI`. Politik luar negeri tetap khusus Presiden.
- **Pendidikan S2/S3 berdurasi** (S2 = 2 th, S3 = 3 th) via `P.study`, progres di `drift()`; `P.edu` tampil di profil.
- **Korupsi & hukum:** aksi "Bersihkan institusi" (berantas korupsi, semua pejabat); di penjara ada "Suap untuk bebas cepat" (berisiko) & "Berkelakuan baik / remisi resmi".
- **Batas 2 periode** Walikota/Gubernur/Presiden (Presiden 3 hanya via amandemen) — terlihat di card jabatan.
- **Summary akhir** menampilkan dua kolom POSITIF/NEGATIF selama menjabat (`ringkasanKepemimpinan()`).
- **Screenshot satu card penuh:** epilog dibungkus `.arsip-sharecard`; `platform.js` menangkap card itu, bukan seluruh panel.
- **Save/resume** sama seperti kehidupan (auto-save P+N, prompt lanjut/baru saat refresh).

**Fitur politik mendalam (batch terakhir):**
- **Parlemen & koalisi** (`N.koalisi`, `voteParlemen`): kebijakan presiden bertanda `parlemen:true` (kpk, pers, lingk, cabutSubsidi, pajakNaik) **bisa ditolak DPR** kalau koalisi lemah — gate di `doAct`. Aksi `koalisiLobi`; event pembelotan koalisi; drift mengikat koalisi ke mood.
- **Kabinet** (`N.kabinet`, `N.kabinetMutu`, `buatKabinet`): aksi `reshuffle` pilih gaya (profesional/akomodatif/campuran) — tukar mutu sektor vs dukungan koalisi. Mutu tinggi mengangkat sektor di drift.
- **Rival persisten** (`P.rival`, `buatRival`/`lawanDariRival`): musuh bebuyutan yang muncul berulang di pemilu & menguat (`jejak`/`menang`/`kalah`). Aksi `rival` (aliansi/jatuhkan), event serangan rival.
- **Cawapres** (`P.wapres`, `_cawapres`/`_cawElekt`, `buatCawapres`): saat maju presiden, pilih running mate (magnet suara/loyalis/teknokrat) — bonus `peluang`, tapi wapres ambisius bisa menggerogoti koalisi (event).
- **Standing pers** (`N.pers`): media bersahabat memperlambat OTT (`kasusCheck`) & mempercepat decay heat; media galak sebaliknya. Aksi `persBina` (jujur) & `persTekan` (gerus kebebasan).
- Indikator koalisi/pers tampil di kartu negara; wapres/kabinet/rival di kartu jabatan & riwayat.
- **Indikator daerah** (`P.jabData.daerah`, helper `dx()`/`daerahRata()`/`initDaerah()`): Wali Kota & Gubernur punya 5 indikator wilayah sendiri (infra, ekonomi, sejahtera, layanan, kepuasan) yang ditampilkan di kartu jabatan dan jadi **acuan capaian** (sorotan/`kebutuhan()` & ach `kepdaSukses` pakai indikator daerah, bukan nasional). Aksi kepala daerah (`bangunDa`, `ekonomiDa`, `bansosDa`, `layananDa`, dll) menggerakkan indikator daerah.
- **Aksi realisasi janji** (Presiden): `industri` (kawasan industri → pengangguran turun, untuk janji "kerja") & `bpjs` (perluas BPJS → keswa naik). Melengkapi `infraNas`/`sosialNas`/`mbgStart`/`pajakTurun` agar janji kampanye bisa benar-benar direalisasikan.
- **Syarat Presiden dipermudah** (`syaratMaju`: pop≥50, pengaruh≥45, dukungan≥55) + `syaratPresKurang()` menampilkan apa yang masih kurang di kartu MAJU PEMILU.
- **Politik uang** (`tawarFajar`): selalu ada opsi "iya". Kalau dana kurang, ditalangi cukong (`P.cukong`) yang nanti menagih lewat event.
- **Proyek pembangunan APBN/APBD** (`PROYEK_NAS` 18 proyek dlm 4 kategori, `PROYEK_DA` 10 proyek): Presiden `apbnProyek` (pilih kategori → proyek; tiap proyek lewat `voteParlemen`, bayar dari `N.kas`, efek `nx`) — tol, kereta cepat, bandara, pariwisata, smelter, food estate, RS, universitas, EBT, dll. Kepala daerah punya pagu `P.jabData.apbd` (init di setJab, top-up DAU tiap tahun di drift): `apbdProyek` (bayar dari pagu, efek `dx`) + `mintaTransfer` (lobi tambahan DAU/DAK). Pagu APBD tampil di kartu jabatan. Helper: `pilihProyekNas`/`bangunProyekNas`/`bangunProyekDa`/`efekRingkas`.

**Skor akhir GANDA:** `legR` (Mata Rakyat) + `legN` (Catatan Negara), rumus terpisah. 27+ achievement.

### C. ARSIP HAKIM (`hakim.html` + folder `hakim/`)
Simulator karier hakim, dari Pengadilan Negeri sampai (mungkin) Ketua Mahkamah Agung. State `P` (tokoh) + `N` (`{tahun, kepercayaan}` = kepercayaan publik pada peradilan).

**Fitur utama:**
- 4 jenjang (`JAB`): Hakim PN → PT → Agung (MA) → Ketua MA; plus penugasan khusus **Hakim Tipikor**.
- **Inti loop = persidangan** (`buatKasus`/`gelarPerkara`/`periksa`/`putusanCard`/`putus` di `03-kasus.js`): tiap tahun memimpin sidang. **11 jenis perkara** (`JENIS`: pidana, perdata, narkoba, korupsi, tanah, ITE, lingkungan, HAM, pemilu, asusila, siber), `TERDAKWA` berprofil (kuasa = tekanan politik, duit = kemampuan menyuap), `KAIDAH` (asas hukum penuntun putusan adil), `bukti` internal yang TIDAK ditampilkan — pemain memeriksa saksi/dokumen/ahli (`PERIKSA`/`KLU`) lalu menimbang sendiri.
- Putusan: BERSALAH / BEBAS / terima **uang ketok** (suap). Adil-tidaknya dibanding `c.adil`; ketahuan lewat **OTT KPK** (`kasusCheck`/`resolveOTT`/`diadili`) kalau `heat` tinggi.
- **Mediasi** (`mediasi`/`bisaMediasi`): perkara perdata/tanah/rakyat kecil bisa didamaikan tanpa vonis (restoratif) → ach `mediator`.
- **Dissenting opinion**: memutus adil melawan tekanan di level Hakim Tinggi+ → ach `dissenting`.
- **S3/Doktor** (`P.study`, aksi `s3`): 3 tahun studi, progres di `drift()`, gelar dapat prefiks "Dr." → ach `doktor`.
- Aksi (`06-actions.js`, 4 tab Diri/Karier/Integritas-Siasat/Uang): diklat, jurnal, seminar, bimbing hakim muda, buku, pembinaan etik (pemulihan integritas), lapor rekan korup, makelar kasus, bina koneksi, lobi jabatan, cuci uang, dll.
- **Skor akhir GANDA:** `keadilanLeg` → **Keadilan** + `kuasaLeg` → **Karier & Kuasa** (`nilaiAkhir`). Bisa adil tapi miskin, atau berkuasa tapi tercatat mafia peradilan. 24 achievement. `handleResult` key `hakim`, fields `skorAdil`+`skorKarier`.

### D. ARSIP IT (`it.html` + folder `it/`)
Simulator karier orang IT/engineer, dari fresh graduate sampai CTO. State `P` + `N` (`{tahun, pasar, tren, ancaman}` = iklim industri).

**Fitur utama:**
- **Spesialisasi** (`SPES`, 8: support, sysadmin, devops, network, iot, security, backend, data) dipilih di awal — menentukan skill awal & jenis masalah harian. 6 jenjang (`JAB`): Junior → Medior → Senior → Lead → Principal → CTO.
- **Inti loop = insiden** (`INSIDEN`, **24 jenis**, `03-insiden.js`): outage, DB lambat, disk penuh, deploy gagal, latensi API/N+1, antrean menumpuk, pipeline/data kotor, DNS, load balancer, VPN, IoT brick/sensor drift, DDoS, breach, ransomware, phishing, secret bocor, supply-chain, dll. Tiap insiden punya `infra`, `sec?` (keamanan), `petunjuk`, `spesAff` (spesialisasi yang lebih sering kena → bobot di `buatInsiden`), `opsi` (tepat satu `ok:true`), dan **`probes` KHAS insiden** — langkah diagnosa spesifik dgn temuan `tepat` bespoke (anti-flat: diagnosa DDoS beda dari diagnosa DB). Engine: `probesFor(c)` pilih probes insiden (fallback `DIAG` generik), `ambilPetunjuk` pakai `probe.tepat`. **Tiap `k` WAJIB ada di `SKILL_INSIDEN`** (peta insiden→skill domain). Hasil: `uptime`, `beres`/`gagal`. Jalur gelap: bayar tebusan ransom, tutup-tutupi kebocoran.
- **Infra** (`INFRA_DEF`/`INFRA_AWAL`) yang dijaga; **tren teknologi** tahunan (`TREN`, 12) yang bikin skill usang kalau tak ikut; **sertifikasi berjenjang** (`GRADE` + `SERT_JALUR`, lihat di bawah); jalur **topi putih/hitam** (white/black hat — bug bounty vs jual exploit, `heat`, bisa jadi buronan/dipenjara); side income (open source, SaaS MRR, startup saham); burnout & job hopping.
- ~29 aksi, 25 achievement. **Skor GANDA:** `legK` → **Karya & Integritas** + `legC` → **Cuan & Karier** (`nilaiAkhir`). `handleResult` key `it`, fields `skorKarya`+`skorCuan`.

**Tambahan IT (`03b-teknis.js`, memakai `assets/kuis.js`):** bank soal teknis `SOAL_IT` (net, iot, linux, code, sec, cloud, k8s, data, support, pm, ctf, sd berbobot); tiap soal punya tingkat `d` 1 dasar / 2 menengah / 3 lanjut, diambil lewat `soalTingkat(kats, mix)` (utamakan soal yang belum lama keluar, `P.soalLihat`). Jaringan (`net`) & IoT (`iot`) terpisah. Belajar = 3 soal dari salah satu 6 fokus `FOKUS_IT` (coding, sistem, jaringan, IoT, keamanan, manajemen), tingkat soal ikut skill (`mixBelajar`). **Sertifikasi berjenjang:** 10 jalur `SERT_JALUR` (jaringan CCST→CCNA→CCNP→CCIE, IoT, Linux RHCSA/RHCE/RHCA, cloud, Kubernetes KCNA→CKAD→CKA→CKS, keamanan Security+→eJPT→OSCP→OSCE³, Python PCEP→PCPP2, data, PM CAPM→PMP→PgMP, ITSM A+→ITIL Master) × 4 `GRADE` (0 Fundamental, 1 Associate, 2 Professional, 3 Expert): grade berikutnya butuh grade sebelumnya + skill minimum + jenjang karier; 5 soal sesuai tingkat grade, lulus ≥3/≥4/≥4/≥4, gagal biaya hangus (`menuSertifikasi` → `ujianSertifikasi(j, g)`). Disimpan sebagai id `P.sertifikat=["net0","net1",…]`, dibaca `sertGrade(k)`; save lama dimigrasi `migrasiSertifikat()`. Efek: bonus fix insiden sedomain (`sertBonusDomain`), gaji +2%/+5% per Professional/Expert (maks. 12%, `sertBonusGaji`), PM/ITSM melonggarkan syarat soft skill promosi. CTF = 3 tantangan (`ctfMain`), `wawancaraTeknis` (2 teknis + 1 system design) dipakai headhunt, mencari kerja, remote LN. Latar acak `LATAR_IT` (kampus top, bootcamp + ISA, otodidak, SMK TKJ + "minimal S1", career switcher). Jalur baru: remote LN, freelance global, mengajar bootcamp, konten tech, 1-on-1. Kantor: `penilaianKinerja` → `hasilKinerja` (Exceeds/Meets/Below, PIP setelah 2× Below). `postmortem()` setelah insiden besar → `P.budaya` (Budaya tim) yang ikut menaikkan peluang fix. `eventsIT()` dipanggil di `events()`: kantor + satu kejadian satir/latar per tahun (`EV_IT`). **Aset kantor (`ASET_KANTOR` di `06-actions.js`):** monitoring (`P.obsv`) & backup (`P.backupKuat`) dibiayai perusahaan. Karyawan memilih: ajukan anggaran (`ajukanAnggaran` → peluang `peluangAnggaran`: jenis kantor, reputasi, soft skill, jenjang, pasar, +15% setelah insiden besar) atau bangun open-source sendiri (gratis, butuh skill ≥50, menambah lembur). Hanya founder (`P.founder`, diset di "Rintis startup sendiri") yang membayar dari uang sendiri. Pindah kantor memanggil `kondisiKantorBaru()` (status monitoring/backup diacak ulang per jenis kantor). `sub` aksi boleh berupa fungsi. Tes: `tests/test-it-baru.js`.

### E. ARSIP NIAGA (`niaga.html` + folder `niaga/`)
Simulator pengusaha, bangun imperium bisnis dari nol. State `P` + `N` (`{tahun, ekonomi, inflasi, suku, daya, tren, harga{}}` = makroekonomi; tiap sektor punya harga relatif yang berfluktuasi).

**Fitur utama:**
- **Latar belakang** (`LATAR`, 5) dipilih di awal → kas & bakat awal. **18 sektor usaha** (`SEKTOR`, tiap satu punya margin/risiko/sensitivitas) yang bisa dijalankan paralel; tiap usaha punya skala (`SKALA_LBL`), pangsa pasar, karyawan, kepemilikan.
- **Peluang usaha** (`PELUANG`, 9; `03-peluang.js`): tawaran masuk berkala, di-**due diligence** (`DD`) dulu — bisa bagus, biasa, atau jebakan.
- P&L realistis (`labaUsaha` ikut kondisi ekonomi, musim, infrastruktur); **investor & utang/KUR**, **IPO**, **franchise**, **ekspor**, **akuisisi**; pajak (patuh/akali → `heat`/risiko); event makro (krisis 98, pandemi, preman, warisan).
- ~30 aksi, 22 achievement. **Skor GANDA:** `legH` → **Harta & Imperium** + `legN` → **Nama & Warisan** (`nilaiAkhir`). `handleResult` key `niaga`, fields `skorHarta`+`skorNama`.

### E2. ARSIP WNI (`wni.html` + folder `wni/`)
Simulator warga +62 bertahan hidup **per bulan** (36 bulan, Jan 2026–Des 2028), nada satir lucu. State `P` + `N` (`{tahun, bulan, ke, harga}` = kalender & indeks harga). Layout modul identik dengan game lain (03 = `03-warga.js`).

- **Nasib lahir acak** (`LATAR`, `acakLatar()`, berbobot): generasi sandwich, anak petani, keluarga menengah, anak PNS, anak pengusaha, anak pejabat, anak sultan, merantau sendirian. Menentukan modal awal, `P.kiriman` bulanan (+ dari ortu / − ke keluarga), `orangDalam` (lamar & naik gaji lebih mudah), stat awal, profesi khusus (`khusus:` staf titipan, penerus usaha, kreator; `pns` lewat event CPNS), dan kejadian khusus (OTT KPK, spill netizen, terusin usaha, usaha ortu bangkrut, adik sekolah, gagal panen, CPNS, lebaran di perantauan). **Skor Dompet adil-privilege:** `nilaiAkhir` mengurangi modal awal & kiriman ortu, uang yang dikirim ke keluarga dihargai 80%.
- **6 profesi** (`PROFESI`): karyawan UMR, ojol, guru honorer (bisa lolos PPPK), outsourcing (kontrak 12 bulan), freelancer, seller olshop — beda gaji, variasi, THR, risiko PHK.
- **Keuangan bulanan** (`bulanan()`): gajian → biaya hidup per kota (`KOTA.idx` × `N.harga` × gaya hidup) → cicilan (`P.cicilan`, `tambahCicilan`) → bunga pinjol 5%/bln (`P.utang`, `ambilPinjol`). Tabungan, emas, KPR subsidi, arisan.
- **Kalender** (`kalender()`): UMR naik Januari, Ramadan/bukber, Lebaran (THR, mudik, salam tempel, "kapan nikah?") via `RAMADAN`/`LEBARAN`, SPT Maret, Agustusan, Harbolnas. **~40 kejadian acak** di `EVENTS` (`04-events.js`, tiap event punya bobot `w` & jeda `cd`).
- **Stat:** Kewarasan, Kesehatan, Gengsi, Nrimo (meredam pukulan mental di `fx`), Relasi + Skill. **Akhir cerita** (`akhir(kind)`, `ENDING`): tahan 36 bulan, pulang (kewarasan 0), tumbang (kesehatan 0), dc (utang ≥ batas), diaspora (#KaburAjaDulu), tutup.
- **Skor GANDA:** **Dompet** + **Kewarasan** (`nilaiAkhir`). `handleResult` key `wni`, fields `skorDompet`+`skorWaras`, `julukanDompet`/`gelarWaras`, `meta` (baris info kartu hasil). Tes: `tests/test-wni.js`.

### E3. Mini-game bersama (`assets/kuis.js`)
Dipakai WNI, Kehidupan & IT (dimuat setelah `art.js`; di tes ikut dimuat lewat `tests/_seed.js`). Butuh global game `ask/addLog/rp/r/hasDoc`. `Kuis.lembar()` = form pilihan ganda maks. 5 soal (soal biasa `a`=indeks benar, soal berbobot `w`=poin per opsi, soal `lucu` tidak dinilai). **Penting:** `choose()` tiap game mengosongkan `#kartu` sebelum handler tombol jalan, jadi jawaban dicatat saat dipilih (event `change` → `JAWAB`), bukan dibaca dari DOM saat dikumpulkan. Form wajib dijawab semua: klik tombol/angka 1–9 ditahan (fase capture) dan soal kosong ditandai `.kz-miss` + `.kz-warn`. `renderKartu()` tidak me-render ulang kartu yang sama (centang tak hilang saat pindah laci). Tes DOM: `tests/test-kuis-dom.js`. Di browser, form bernilai (bukan `diam`) diikuti **kartu hasil** (`kartuHasil`: skor, LULUS/BELUM bila ada `o.lulus`, tiap soal ✓/✗ + jawaban benar + pembahasan); akibat (`done`) baru jalan setelah "Lanjut". Di tes vm tanpa DOM kartu hasil dilewati. `keAtas()` menggulung pop-up form ke atas & melepas sorotan tombol Kumpulkan.

**Tampilan HP (≤940px, `assets/theme.css` + `assets/art.js`):** strip statistik ringkas `#aaHud` (uang + 3 stat per game di `HUD`, ketuk → profil), log hanya 6 catatan terakhir tanpa scroll ganda + tombol `#aaFeedMore`, bilah bawah (`.bar`) berlatar solid, angka melayang selalu berlabel, pop-up kartu selalu mulai dari atas, kolom nama pop-up karakter tidak auto-fokus di layar sentuh. `moneyOf` juga membaca `P.saldo` (WNI). Beranda di HP: hero/pembaruan/kartu game diringkas.

**Tampilan desktop (>940px):** kolom kiri (`section.doc`: log + meja aksi + tombol maju) `position:sticky` dengan `z-index:20` (wajib: sticky membuat konteks tumpukan, pop-up `#kartu` ada di dalamnya), tinggi log `max(240px, 100vh − 490px)` (angka 490 supaya Negara tetap muat di layar 768px). Pop-up form soal/hasil/sertifikasi selebar 680px, opsi jawaban 2 kolom, tombol jalur sertifikasi 2 kolom. Beranda: panel **Lanjutkan permainanmu** (`renderLanjut()` di `index.html`) membaca `arsip_<game>_save_v1`, menampilkan maks. 3 berkas yang belum ditutup di sisi kanan hero (desktop) / di bawah teks pembuka (HP). Ikon kartu: aturan `perang` (dulu "perangkat" memicu ikon helm); `titleCase` menjaga singkatan sertifikasi (CCNA, PgMP, IoT, …). Mini-game: `skd` (TWK/TIU/TKP, ambang 3/5, 3/5, 18/25), `wawancara` (rasio → diterima/ditolak & gaji ×0,9–1,15), `hoax` (hoax/fakta), `simLengkap` (teori ≥4/5 → praktik → opsi "nembak"), `mertua` (rasio restu), `tawar` (harga batas tersembunyi + kesabaran penjual). WNI: CPNS, wawancara, cek fakta, atur anggaran (`P.anggaran`, slider), SIM, motor bekas, calon mertua. Kehidupan: PNS lewat SKD, wawancara (`wawancaraKerja`), SIM, calon mertua saat melamar. Tes: `tests/test-minigame.js` (`globalThis.__KUIS_PINTAR` = pemain yang selalu menjawab terbaik).

### F. Dokumen Panduan (`ARSIP_NEGARA_Panduan.docx`)
Word document strategi negara (variabel, rumus skor ganda, janji kampanye, jalur strategi, achievement). **Catatan:** dibuat sebelum revisi negara terakhir — sebagian detail (pemilu bisa kalah, card jabatan, pendidikan, dll) belum tercakup; update kalau perlu.

### G. Hub Website (file di root)
- `index.html` — landing: card simulator, 3 skor teratas, **sambutan identitas** (isi username IG/Threads atau main anonim, dengan catatan privasi), link **Donasi/Sedekah**.
- `leaderboard.html` — tabel top 100 per game, tab antar game, export JSON, hapus data.
- `donasi.html` — halaman donasi: kotak GoPay (nomor + salin + slot QR), form request simulasi (WhatsApp/IG/salin), papan "Donatur Sultan" (kurasi manual).
- `platform.js` / `platform.css` — modul & style bersama (identitas, leaderboard, share, capture, dialog, donasi).

---

## 3. Struktur File Lengkap

```
arsip/                         # = folder "game simulasi"
├── index.html                 # hub landing (+ sambutan identitas, link donasi)
├── leaderboard.html
├── donasi.html                # halaman donasi
├── platform.js                # modul bersama (identitas/anonim, leaderboard, share, capture)
├── platform.css               # style bersama (modal, dialog, share, privasi, donasi)
├── kehidupan.html             # SHELL tipis (HTML + link modul)
├── kehidupan/
│   ├── style.css
│   └── js/
│       ├── 00-core.js         # helper: $, r, ri, pick, clamp, rp
│       ├── 01-data.js         # tabel data (NAMA, USAHA, HOBI, calon pasangan, ACH_DEF, dll)
│       ├── 02-state.js        # P/G, newGame, log, fx, ask/choose, drift, advance
│       ├── 03-interactions.js # karier/usaha/asmara/hobi helpers (newCandidate, gajiKary, dll)
│       ├── 04-epilog.js       # die, deathCheck, checkAch, showEpilog
│       ├── 05-save.js         # save/load/resume + showResumePrompt
│       ├── 06-events.js       # event tahunan otomatis
│       ├── 07-actions.js      # array ACTS + doAct
│       ├── 08-render.js       # render, renderKartu, bar
│       └── 09-boot.js         # listener + boot (resume prompt)
├── negara.html                # SHELL tipis
├── negara/
│   ├── style.css
│   └── js/
│       ├── 00-core.js         # helper + rp/rpT
│       ├── 01-data.js         # data (PARTAI, JAB, KOMISI, KEMENTERIAN, JANJI, WAWANCARA, ACH_DEF)
│       ├── 02-state.js        # P/N/G, newGame, log, fx/nx, ask/choose
│       ├── 03-politik.js      # pemilu (peluang/kampanye/hasilPemilu), setJab/endJab, ekonomi negara, drift, kasus hukum
│       ├── 04-events.js       # event tahunan (perang, sanksi, pemakzulan, dll)
│       ├── 05-epilog.js       # die, nilaiAkhir, ringkasanKepemimpinan, showEpilog
│       ├── 06-actions.js      # array ACTS + doAct
│       ├── 07-render.js       # advance, render, renderJabCard
│       ├── 08-save.js         # save/load/resume
│       └── 09-boot.js         # listener + boot (resume prompt)
├── hakim.html                 # SHELL tipis
├── hakim/  js/                # 00-core 01-data 02-state 03-kasus 04-events 05-epilog 06-actions 07-render 08-save 09-boot (+ style.css)
├── it.html                    # SHELL tipis
├── it/     js/                # 00-core 01-data 02-state 03-insiden 04-events 05-epilog 06-actions 07-render 08-save 09-boot (+ style.css)
├── niaga.html                 # SHELL tipis
├── niaga/  js/                # 00-core 01-data 02-state 03-peluang 04-events 05-epilog 06-actions 07-render 08-save 09-boot (+ style.css)
├── donasi/
│   └── data.js                # config GoPay + daftar DONATUR (kurasi manual)
└── ARSIP_NEGARA_Panduan.docx  # panduan strategi negara (terpisah)
```

**Penomoran modul — penting:** `negara`, `hakim`, `it`, `niaga` pakai layout IDENTIK (00 core, 01 data, 02 state, **03 = domain inti** dgn nama beda per game [politik/kasus/insiden/peluang], 04 events, 05 epilog, 06 actions, 07 render, 08 save, 09 boot). **`kehidupan` beda sendiri** (lebih dulu dibuat): di situ 04=epilog, 05=save, 06=events, 07=actions, 08=render, 09=boot. Jadi jangan asumsikan "05 = epilog" di semua game — **cek urutan `<script>` di shell HTML sebagai sumber kebenaran.**

**Cara modul dimuat:** tiap file JS dimuat lewat `<script src>` berurutan di shell. Semua classic script berbagi global scope, jadi `const`/`function` di satu modul kelihatan di modul lain (selama urutan load benar). Tiap modul diawali `'use strict';`. `platform.js` dimuat paling akhir.

---

## 4. Stack Teknis

- **Pure static HTML/CSS/JS** — no build step, no framework, no bundler
- **Vanilla JS** — game state di plain objects (`P`, `N`, `G`), manual DOM manipulation
- **Multi-file per game** (dimuat via banyak `<script>`) — gampang revisi per bagian; bisa digabung jadi 1 file lagi kalau mau dishare
- **localStorage** untuk leaderboard, identitas, dan save game (auto-save)
- **html2canvas via CDN** untuk image capture (lazy load); capture target `.arsip-sharecard` kalau ada, fallback ke `#epilog`
- **Web Share API → Clipboard API → Download** fallback chain
- **Font:** Staatliches (display), Special Elite (typewriter), IBM Plex Sans (UI)
- **Palette:** desk #1d1a16, paper #ece5d4, ink #2a2622, red #8e1f1f, gold #a87b1f

---

## 5. Konvensi Coding

- State global: `P` (player) + `G` (loop). Negara juga punya `N` (negara).
- Helper umum: `$()` getElementById, `ask({title,text,opts})` modal pilihan, `addLog(html,cls)` feed, `fx({stat:+5})` badge perubahan stat tokoh, (negara) `nx({...})` perubahan indikator negara, `leg(rk,ng)` legasi ganda.
- Achievement defs di `ACH_DEF`, helper `ach('key')`.
- Tiap aksi di array `ACTS`: `k` (key unik), `tab`, `lbl`, `sub`, `cond` (function), `e` (handler), `multi:true` kalau bisa diulang/tahun. Negara juga pakai `lapas:true` untuk aksi khusus di penjara.
- `ask({title,text,opts:[{t,sub,cond,e}]})` backbone semua interaksi. Drain queue via `choose(idx)`.
- `advance()` maju 1 tahun, `die()` akhir hidup, (negara) `endJab()` akhir jabatan, `setJab(k)` mulai jabatan (set `P.jabData`).
- **Save:** `saveGame()` dipanggil di akhir `render()`; `loadSave()`/`resumeGame()`/`showResumePrompt()` di modul `*-save.js`. Boot menawarkan resume kalau ada save belum tamat. Field penting yang diserialisasi harus JSON-able (jangan simpan function di `P`/`N`).
- **`sub` di array `ACTS` harus string statis** (di-render apa adanya di tombol meja aksi) — detail dinamis taruh di teks `ask`/`addLog`, bukan di `sub` ACTS. **Tapi `sub` di dalam `opts` milik `ask()` BOLEH dinamis** — opts dibangun ulang tiap panggilan (mis. `sub:rp(harga)+' · '+lama+' th'`), jadi memang dihitung saat itu juga. Keduanya valid; bedakan konteksnya.
- **A11y modal:** overlay (epilog/resume/konfirmasi) sudah keyboard-friendly di tiap game lewat handler `keydown` di `09-boot.js` — `Esc` menutup (klik tombol `data-go="cancel"`), `Tab` terjebak di dalam overlay (focus trap sederhana). Kartu keputusan auto-fokus tombol pertama via `G._kartuFocus` di `renderKartu()`. Kalau nambah game baru, ikut pola ini.

---

## 6. Workflow Edit & Tes yang Sudah Terbukti

1. **Baca modul yang relevan saja** (bukan seluruh game). Petakan dulu via grep section marker / nama fungsi.
2. **Edit minimal & terarah.** Hindari refactor yang gak diminta.
3. **Tes via harness Node (tanpa jsdom):** gabung modul satu game secara berurutan, kasih mock `globalThis.window={}` + `localStorage`, lalu jalankan banyak kehidupan/karier acak. Driver: kalau `G.current` → `choose(acak)`; kalau tidak → klik beberapa aksi acak (`ACTS.filter(a=>actAvail(a).ok)` → `doAct`) lalu `advance()`. Target: **0 error**.
4. **Tes bertarget** tiap fitur baru dengan force state (mis. `setJab('presiden')`, `P.penjara=6`, dll), cek perubahan state.
5. **Saat memecah file**: pastikan `gabungan modul === script asli` (byte-identik) sebelum percaya hasilnya — itu jaminan perilaku tidak berubah.
6. **Hindari `<style>`/`<script>` inline baru di game** — taruh di modul/CSS folder masing-masing.

Catatan harness: `showEpilog`/`render` early-return saat `hasDoc` false, jadi path DOM tidak diuji harness — uji logikanya langsung (panggil fungsi murni seperti `ringkasanKepemimpinan()`, `peluang()`, `gajiKary()`).

---

## 7. Identitas, Privasi & Donasi (hub)

- **Identitas (`platform.js`):** `getIdentity()` → `''`/`'set'`/`'anon'`, `markIdentity()`. Dialog `showHandleDialog(onDone, {welcome:true})` menampilkan opsi isi username atau "Main anonim" + catatan privasi. Sambutan muncul sekali saat pertama buka landing.
- **Privasi:** semua data (handle, skor, save) hanya di localStorage browser — tanpa akun/password/server. Ini ditegaskan di dialog & footer.
- **Donasi (`donasi.html` + `donasi/data.js`):** edit `donasi/data.js` untuk nomor GoPay, nama, WA, IG, dan daftar `DONATUR`. Ranking "Donatur Sultan" **dikurasi manual** (hanya yang sudah konfirmasi transfer) — jujur, tanpa verifikasi otomatis. **Belum diisi:** `gopayNomor` masih placeholder `0812-XXXX-XXXX`.

---

## 8. Backlog & Ide Ekspansi

### Game baru ("coming soon" di landing):
- **Simulator Startup** — bangun startup dari kost, cari co-founder, kejar pendanaan, lewati death valley
- **Simulator Petani** — tanah, musim, harga gabah, kebijakan, hutang KUR

### Ide lain yang cocok tone:
Wartawan investigasi, buruh migran (TKW/TKI), warung kopi/UMKM, dosen PTN, influencer/content creator, nelayan, anak band indie.

### Backend (kalau leaderboard/donasi mau global):
- Node + SQLite + Fastify; ganti `localStorage.setItem` jadi `fetch('/api/score', POST)`
- Anti-cheat: server-side score recalc atau hash signature
- Donasi terverifikasi: payment gateway (Midtrans/QRIS) → auto-update ranking donatur
- User profile page, daily challenge (seed RNG harian), OAuth IG/Threads

### Polish UI:
Logo proper, Open Graph meta tags, PWA (offline + add to home screen), sound effects.

---

## 9. Hal-hal Penting yang Sering Dilupakan

- **Player prefers Bahasa Indonesia kasual.** Bukan formal. Pakai "kamu" / direct.
- **Hindari emoji & over-formatting yang gak perlu.**
- **Hindari over-engineering.** Solusi langsung & to-the-point.
- **Konfirmasi keputusan subjektif/arah** sebelum eksekusi task besar; tapi player sudah kasih akses penuh untuk bash command & eksekusi otonom di project ini.
- **Game files sudah established & modular.** Jangan rewrite arsitekturnya — tambah fitur dengan injeksi minimal di modul yang tepat.
- Player background: IoT/fleet monitoring, Balikpapan. Paham teknis.

---

**Catatan akhir:** semua kode milik kamu, pakai/modify sebebasnya.
— Disusun di Balikpapan untuk Maulana.
