'use strict';
/* ================= TEKNIS, KANTOR & SATIR (Simulator IT) =================
   Memakai Kuis.lembar (assets/kuis.js): form pilihan ganda maks. 5 soal.
   1. Mini-game teknis: belajar (6 fokus, tingkat soal ikut skill), sertifikasi berjenjang
      Grade 0 Fundamental → 3 Expert, CTF, wawancara teknis
   2. Kejadian satir khas orang IT Indonesia
   3. Latar belakang acak (kampus top, bootcamp, otodidak, SMK TKJ, career switcher)
   4. Jalur baru: remote luar negeri, freelance global, mengajar bootcamp, tech content creator
   5. Kehidupan kantor: penilaian kinerja, PIP, 1-on-1
   6. Postmortem insiden & budaya tim */

/* ---------- bank soal teknis ----------
   Opsi benar ditulis pertama (diacak saat tampil). d = tingkat kesulitan: 1 dasar (default), 2 menengah, 3 lanjut.
   Ujian sertifikasi mengambil soal sesuai grade (lihat GRADE.mix di 01-data.js).
   Jaringan (net) dan IoT (iot) sengaja dipisah: masing-masing punya latihan & jalur sertifikasi sendiri. */
const SOAL_IT={
net:[
  {q:'Subnet /24 punya berapa alamat host yang bisa dipakai?',o:['254','256','255','252'],x:'256 alamat dikurangi alamat network & broadcast.'},
  {q:'Protokol yang menerjemahkan nama domain menjadi alamat IP adalah...',o:['DNS','DHCP','ARP','NTP'],x:'"It\'s always DNS."'},
  {q:'Port default HTTPS adalah...',o:['443','80','22','8080'],x:'80 untuk HTTP, 22 untuk SSH.'},
  {q:'Perangkat yang bekerja di Layer 3 (network) model OSI adalah...',o:['router','switch','hub','repeater'],x:'Switch umumnya bekerja di Layer 2.'},
  {q:'Protokol yang memberikan alamat IP otomatis ke klien adalah...',o:['DHCP','DNS','SNMP','FTP'],x:'Dynamic Host Configuration Protocol.'},
  {q:'Perintah Windows untuk melacak rute paket ke tujuan adalah...',o:['tracert','ping','ipconfig','netstat'],x:'Di Linux namanya traceroute.'},
  {d:2,q:'Alamat 192.168.10.130/26 berada di subnet dengan network address...',o:['192.168.10.128','192.168.10.64','192.168.10.0','192.168.10.192'],x:'/26 = blok 64 alamat: .0, .64, .128, .192.'},
  {d:2,q:'Protokol yang mencegah loop di jaringan switch Layer 2 adalah...',o:['STP (Spanning Tree Protocol)','OSPF','VRRP','BGP'],x:'STP memblokir jalur cadangan supaya broadcast tidak berputar-putar.'},
  {d:2,q:'Teknologi untuk membagi satu switch fisik menjadi beberapa domain broadcast adalah...',o:['VLAN','NAT','VPN','DHCP relay'],x:'Komunikasi antar-VLAN butuh router atau switch Layer 3.'},
  {d:2,q:'Standar penandaan (tagging) frame VLAN pada link trunk adalah...',o:['IEEE 802.1Q','IEEE 802.11ac','IEEE 802.3af','IEEE 802.1X'],x:'802.3af = PoE, 802.1X = autentikasi port, 802.11ac = Wi-Fi.'},
  {d:2,q:'NAT yang memetakan banyak IP privat ke satu IP publik memakai nomor port disebut...',o:['PAT (NAT overload)','NAT statis','NAT dinamis (pool)','Proxy ARP'],x:'Inilah yang dipakai hampir semua router rumahan.'},
  {d:2,q:'Protokol routing link-state yang memakai algoritma Dijkstra adalah...',o:['OSPF','RIP','EIGRP','BGP'],x:'RIP distance-vector, BGP path-vector.'},
  {d:3,q:'Di router Cisco, atribut BGP yang PALING AWAL dibandingkan saat memilih rute terbaik adalah...',o:['Weight','AS-PATH','MED','Origin'],x:'Urutan Cisco: Weight → Local Preference → rute lokal → AS-PATH → Origin → MED.'},
  {d:3,q:'Administrative distance default OSPF di perangkat Cisco adalah...',o:['110','90','120','20'],x:'EIGRP internal 90, RIP 120, eBGP 20.'},
  {d:3,q:'Dua router OSPF macet di state EXSTART/EXCHANGE. Penyebab paling umum adalah...',o:['MTU interface tidak sama','Area ID berbeda','Hello timer berbeda','Subnet mask berbeda'],x:'Area/hello/subnet yang beda membuat tetangga tak terbentuk sama sekali; MTU beda membuat pertukaran DBD macet.'},
  {d:3,q:'Di OSPF, LSA Type 3 (summary) dibuat oleh...',o:['ABR (Area Border Router)','ASBR','DR','setiap router internal'],x:'ASBR membuat LSA Type 5 untuk rute eksternal.'},
  {d:3,q:'Mekanisme yang mencegah router mengiklankan rute kembali ke interface asal ia mempelajarinya adalah...',o:['split horizon','route poisoning','hold-down timer','route summarization'],x:'Senjata klasik melawan routing loop di protokol distance-vector.'},
  {d:3,q:'Di jaringan MPLS, label dipertukarkan antar-router terutama memakai protokol...',o:['LDP','ARP','STP','LACP'],x:'Label Distribution Protocol (selain RSVP-TE untuk traffic engineering).'}
],
iot:[
  {q:'Protokol publish/subscribe ringan yang populer untuk IoT adalah...',o:['MQTT','FTP','SMTP','POP3'],x:'Hemat bandwidth, cocok untuk perangkat kecil.'},
  {q:'Dalam MQTT, perangkat mengirim pesan ke...',o:['broker','server DNS','database secara langsung','printer'],x:'Broker meneruskan pesan ke subscriber topik.'},
  {q:'Modul yang menentukan posisi perangkat lewat sinyal satelit adalah...',o:['GPS','LiDAR','termokopel','akselerometer'],x:'Dasar pelacakan armada kendaraan.'},
  {q:'Memperbarui firmware perangkat dari jarak jauh disebut...',o:['OTA (over-the-air)','SSH tunneling','hot swap','bootstrapping'],x:'OTA yang gagal bisa membuat perangkat "brick".'},
  {q:'Jaringan berdaya rendah dan jarak jauh untuk sensor di lapangan adalah...',o:['LoRaWAN','Bluetooth Classic','Wi-Fi 6','NFC'],x:'Cocok untuk perkebunan atau tambang.'},
  {d:2,q:'Level QoS MQTT yang menjamin pesan terkirim TEPAT satu kali adalah...',o:['QoS 2','QoS 0','QoS 1','QoS 3'],x:'QoS 0 = paling banyak sekali, QoS 1 = minimal sekali (bisa dobel). QoS 3 tidak ada.'},
  {d:2,q:'Protokol IoT berbasis UDP dengan gaya REST (GET/POST) untuk perangkat terbatas adalah...',o:['CoAP','MQTT','AMQP','SNMP'],x:'Constrained Application Protocol. MQTT berjalan di atas TCP.'},
  {d:2,q:'Fitur MQTT yang otomatis mengirim pesan saat perangkat terputus secara tidak normal adalah...',o:['Last Will and Testament','Retained message','Keep alive','Clean session'],x:'Dashboard jadi tahu perangkat mana yang mati mendadak.'},
  {d:2,q:'Wildcard MQTT yang mencocokkan banyak level topik sekaligus, misalnya pabrik/#, adalah...',o:['# (multi-level)','+ (single-level)','* (bintang)','$ (dolar)'],x:'+ hanya satu level, contoh: pabrik/+/suhu.'},
  {d:2,q:'Mikrokontroler murah dengan Wi-Fi & Bluetooth bawaan yang populer untuk prototipe IoT adalah...',o:['ESP32','ATmega328 (Arduino Uno)','Raspberry Pi 4','Intel Core i5'],x:'Arduino Uno tak punya Wi-Fi bawaan; Raspberry Pi adalah komputer papan tunggal, bukan mikrokontroler.'},
  {d:2,q:'Memproses data sensor di dekat sumbernya (di gateway) sebelum dikirim ke cloud disebut...',o:['edge computing','cloud bursting','sharding','load balancing'],x:'Hemat bandwidth dan tetap jalan saat internet putus.'},
  {d:3,q:'Cara terbaik mengamankan koneksi ribuan perangkat ke broker MQTT adalah...',o:['Mutual TLS dengan sertifikat klien unik per perangkat','Satu username & password untuk semua perangkat','MQTT tanpa enkripsi di port 1883','Menyembunyikan alamat broker'],x:'Kalau satu perangkat bocor, cukup cabut sertifikat perangkat itu saja.'},
  {d:3,q:'Spreading Factor (SF) LoRa yang lebih tinggi menghasilkan...',o:['jangkauan lebih jauh, tapi data rate lebih rendah & airtime lebih lama','jangkauan lebih pendek dan data rate lebih tinggi','konsumsi daya per paket lebih rendah','tidak berpengaruh apa pun'],x:'SF12 menjangkau terjauh, tapi tiap paket memakan airtime jauh lebih lama.'},
  {d:3,q:'Fitur NB-IoT/LTE-M agar baterai sensor bisa bertahan bertahun-tahun adalah...',o:['PSM (Power Saving Mode) dan eDRX','Wake-on-LAN','Hibernate Windows','Turbo boost'],x:'Perangkat tidur panjang dan hanya bangun sesuai jadwal.'},
  {d:3,q:'Desain OTA firmware yang aman supaya perangkat tidak "brick" saat update gagal di tengah jalan adalah...',o:['Partisi A/B + verifikasi tanda tangan + rollback otomatis','Timpa firmware langsung di satu partisi','Update hanya lewat kabel','Matikan watchdog selama update'],x:'Kalau versi baru gagal boot, perangkat kembali ke partisi lama.'},
  {d:3,q:'Setelah broker pulih, ribuan perangkat reconnect serentak dan membuatnya tumbang lagi. Mitigasinya...',o:['Exponential backoff dengan jitter acak di perangkat','Retry setiap 1 detik serentak','Naikkan semua pesan ke QoS 2','Matikan keep alive'],x:'Masalah "thundering herd": sebar waktu reconnect secara acak.'},
  {d:3,q:'Di LoRaWAN, metode aktivasi yang membuat kunci sesi baru secara dinamis saat join adalah...',o:['OTAA','ABP','WPS','PSK statis'],x:'ABP memakai kunci sesi tetap yang ditanam di perangkat (kurang aman).'}
],
linux:[
  {q:'Perintah Linux untuk memantau proses secara real-time adalah...',o:['top','ls','cd','chmod'],x:'Alternatif populer: htop.'},
  {q:'chmod 755 memberi pemilik file izin...',o:['baca, tulis, dan eksekusi (rwx)','baca saja','tulis saja','tidak ada izin'],x:'7 = 4 (r) + 2 (w) + 1 (x).'},
  {q:'File konfigurasi mount otomatis saat boot di Linux adalah...',o:['/etc/fstab','/etc/passwd','/etc/hosts','/var/log/syslog'],x:'Salah tulis fstab bisa bikin server gagal boot.'},
  {q:'Perintah untuk melihat sisa ruang disk per filesystem adalah...',o:['df -h','du -sh','free -m','ps aux'],x:'du menghitung ukuran folder, free untuk memori.'},
  {q:'Log sistem pada distro berbasis systemd dibaca dengan...',o:['journalctl','crontab','systemctl enable','uname'],x:'Contoh: journalctl -u nginx.'},
  {d:2,q:'Perintah untuk mencari baris berisi kata "error" di file app.log adalah...',o:['grep error app.log','find error app.log','cat -error app.log','ls error app.log'],x:'find mencari file, bukan isi file.'},
  {d:2,q:'Di crontab, jadwal <code>0 2 * * *</code> berarti...',o:['setiap hari pukul 02.00','setiap 2 menit','setiap 2 jam','tanggal 2 setiap bulan'],x:'Urutan kolom: menit, jam, tanggal, bulan, hari.'},
  {d:2,q:'Perintah agar service nginx otomatis berjalan saat boot (systemd) adalah...',o:['systemctl enable nginx','systemctl start nginx','service nginx status','systemctl mask nginx'],x:'start hanya menjalankan sekarang; mask malah memblokirnya.'},
  {d:2,q:'Simbol untuk mengalirkan output satu perintah menjadi input perintah lain adalah...',o:['| (pipe)','> (redirect)','>> (append)','& (background)'],x:'Contoh: ps aux | grep java.'},
  {d:2,q:'File /etc/passwd terutama berisi...',o:['informasi akun pengguna (tanpa hash password)','hash password pengguna','daftar host lokal','konfigurasi DNS'],x:'Hash password disimpan di /etc/shadow.'},
  {d:2,q:'Load average 8.0 di server 4 core artinya...',o:['antrean proses sekitar 2× kapasitas CPU','CPU baru terpakai 8%','RAM tersisa 8 GB','ada 8 pengguna yang login'],x:'Patokan kasar: load ideal ≤ jumlah core.'},
  {d:3,q:'Proses berstatus "Z" (zombie) di output ps artinya...',o:['proses sudah selesai tapi belum di-wait oleh parent-nya','proses tidur menunggu I/O','proses dihentikan dengan SIGSTOP','proses memakan CPU 100%'],x:'Zombie tak bisa di-kill; perbaiki atau restart parent-nya.'},
  {d:3,q:'Sinyal yang TIDAK bisa ditangkap atau diabaikan oleh proses adalah...',o:['SIGKILL (9)','SIGTERM (15)','SIGHUP (1)','SIGINT (2)'],x:'SIGSTOP juga tidak bisa ditangkap.'},
  {d:3,q:'Di SELinux, perintah untuk mengembalikan konteks keamanan default sebuah file adalah...',o:['restorecon','chmod','setenforce 0','chown'],x:'setenforce 0 justru mematikan proteksi. Jangan dijadikan kebiasaan.'},
  {d:3,q:'Disk tetap penuh walau file log raksasa sudah dihapus. Penyebab paling mungkin...',o:['file masih dibuka oleh proses yang berjalan','inode rusak','swap penuh','bug pada perintah rm'],x:'Cek dengan lsof +L1, lalu reload/restart proses itu.'},
  {d:3,q:'Memperbesar logical volume LVM sekaligus filesystem ext4-nya dilakukan dengan...',o:['lvextend -r','fdisk -l','mkfs.ext4','pvdisplay'],x:'-r menjalankan resize filesystem otomatis; mkfs justru memformat ulang.'},
  {d:3,q:'Error "Too many open files" di server sibuk biasanya diatasi dengan...',o:['menaikkan batas nofile (ulimit / LimitNOFILE)','menambah RAM','menghapus isi /tmp','mengganti kernel'],x:'Batas file descriptor per proses terlalu kecil untuk koneksi sebanyak itu.'}
],
code:[
  {q:'Kode status HTTP 404 berarti...',o:['Not Found','Internal Server Error','Unauthorized','OK'],x:'500 = error di server, 401 = belum terautentikasi.'},
  {q:'Perintah git untuk mengambil perubahan dari remote sekaligus menggabungkannya adalah...',o:['git pull','git fetch','git commit','git stash'],x:'git fetch hanya mengambil tanpa menggabungkan.'},
  {q:'Kompleksitas mengakses elemen array berdasarkan indeks adalah...',o:['O(1)','O(n)','O(log n)','O(n²)'],x:'Akses langsung ke alamat memori.'},
  {q:'Kode status HTTP 500 menandakan...',o:['kesalahan di sisi server','data tidak ditemukan','permintaan berhasil','harus login dulu'],x:'Saatnya membuka log aplikasi.'},
  {q:'Prinsip "Don\'t Repeat Yourself" disingkat...',o:['DRY','KISS','YAGNI','SOLID'],x:'KISS = Keep It Simple, YAGNI = You Aren\'t Gonna Need It.'},
  {q:'Struktur data untuk antrean FIFO (first in, first out) adalah...',o:['queue','stack','tree','graph'],x:'Stack memakai LIFO.'},
  {d:2,q:'Di Python, hasil <code>7 // 2</code> adalah...',o:['3','3.5','4','1'],x:'// adalah pembagian bulat ke bawah; 7 % 2 = 1.'},
  {d:2,q:'Di Python, tipe data yang tidak bisa diubah (immutable) adalah...',o:['tuple','list','dict','set'],x:'list, dict, dan set bisa diubah isinya.'},
  {d:2,q:'Hasil Python <code>len("halo dunia")</code> adalah...',o:['10','9','2','11'],x:'Spasi juga dihitung sebagai karakter.'},
  {d:2,q:'List comprehension <code>[x*2 for x in range(3)]</code> menghasilkan...',o:['[0, 2, 4]','[2, 4, 6]','[0, 1, 2]','[1, 2, 3]'],x:'range(3) = 0, 1, 2.'},
  {d:2,q:'Konsep OOP di mana kelas anak mewarisi atribut & method kelas induk disebut...',o:['inheritance','encapsulation','polymorphism','abstraction'],x:'Encapsulation = menyembunyikan detail internal.'},
  {d:2,q:'Kode status HTTP untuk "terlalu banyak request" (kena rate limit) adalah...',o:['429','403','503','418'],x:'418 "I\'m a teapot" hanya lelucon RFC.'},
  {d:3,q:'Fungsi <code>def tambah(x, daftar=[]): daftar.append(x); return daftar</code> dipanggil tambah(1) lalu tambah(2). Hasil panggilan kedua...',o:['[1, 2]','[2]','[1]','error'],x:'Default argument mutable dibuat sekali saat fungsi didefinisikan. Pakai daftar=None.'},
  {d:3,q:'GIL (Global Interpreter Lock) di CPython membuat...',o:['hanya satu thread yang mengeksekusi bytecode Python pada satu waktu','program tidak bisa memakai thread sama sekali','memori otomatis terbagi ke semua core','kode CPU-bound otomatis cepat di banyak core'],x:'Untuk kerja CPU-bound, pakai multiprocessing.'},
  {d:3,q:'Decorator di Python pada dasarnya adalah...',o:['fungsi yang menerima fungsi lain dan mengembalikan fungsi baru','komentar khusus untuk dokumentasi','tipe data baru','modul bawaan untuk logging'],x:'Contoh: @lru_cache, @app.route.'},
  {d:3,q:'Kompleksitas waktu rata-rata mencari kunci di dict / hash table adalah...',o:['O(1)','O(log n)','O(n)','O(n log n)'],x:'Kasus terburuk (banyak tabrakan hash) bisa O(n).'},
  {d:3,q:'Generator Python (memakai yield) unggul karena...',o:['menghasilkan nilai satu per satu tanpa memuat semuanya ke memori','selalu lebih cepat dari list','bisa diakses dengan indeks acak','otomatis berjalan paralel'],x:'Cocok untuk membaca file raksasa baris per baris.'},
  {d:3,q:'Masalah "N+1 query" pada ORM terjadi ketika...',o:['satu query mengambil daftar, lalu satu query tambahan untuk setiap baris','query memakai JOIN','database memakai index','hasil query di-cache'],x:'Solusinya eager loading / JOIN / select_related.'}
],
sec:[
  {q:'Serangan yang menyisipkan perintah SQL lewat input pengguna disebut...',o:['SQL injection','XSS','CSRF','DDoS'],x:'Cegah dengan parameterized query.'},
  {q:'Cara yang benar menyimpan password pengguna adalah...',o:['hash + salt (misalnya bcrypt)','teks biasa','encode Base64','enkripsi XOR sederhana'],x:'Base64 bukan enkripsi, apalagi hashing.'},
  {q:'Serangan yang menyisipkan skrip berbahaya ke halaman yang dibuka pengguna lain disebut...',o:['XSS','SQL injection','brute force','MITM'],x:'Cross-Site Scripting.'},
  {q:'Prinsip memberi akses seminimal mungkin sesuai kebutuhan disebut...',o:['least privilege','defense in depth','zero day','security by obscurity'],x:'Batasi dampak kalau akun dibobol.'},
  {q:'Autentikasi dua faktor (2FA) menggabungkan...',o:['sesuatu yang diketahui dan sesuatu yang dimiliki','dua password berbeda','username dan email','captcha dan password'],x:'Misalnya password + kode OTP di HP.'},
  {d:2,q:'Serangan yang membuat browser korban (yang sedang login) mengirim request tanpa sadar disebut...',o:['CSRF','XSS','SQL injection','path traversal'],x:'Cegah dengan token CSRF dan cookie SameSite.'},
  {d:2,q:'Header HTTP yang memaksa browser selalu memakai HTTPS adalah...',o:['Strict-Transport-Security (HSTS)','X-Powered-By','Content-Length','Cache-Control'],x:'X-Powered-By malah sebaiknya disembunyikan.'},
  {d:2,q:'Daftar 10 risiko keamanan aplikasi web paling kritis diterbitkan oleh...',o:['OWASP','IEEE','W3C','ICANN'],x:'OWASP Top 10.'},
  {d:2,q:'Alat yang umum dipakai untuk memindai port terbuka pada sebuah host adalah...',o:['nmap','Wireshark','John the Ripper','Burp Repeater'],x:'Wireshark menangkap paket, John untuk cracking password.'},
  {d:2,q:'Sistem yang mengumpulkan & mengorelasikan log keamanan dari banyak sumber adalah...',o:['SIEM','VPN','WAF','DHCP'],x:'Security Information and Event Management.'},
  {d:2,q:'Model keamanan "never trust, always verify" disebut...',o:['Zero Trust','perimeter security','security by obscurity','trust on first use'],x:'Setiap akses diverifikasi, termasuk dari dalam jaringan kantor.'},
  {d:3,q:'Saat pentest, menaikkan hak akses dari user biasa menjadi root/administrator disebut...',o:['privilege escalation','lateral movement','reconnaissance','exfiltration'],x:'Lateral movement = berpindah ke host lain.'},
  {d:3,q:'Serangan yang menyalahgunakan server untuk me-request layanan internal (misalnya 169.254.169.254 metadata cloud) adalah...',o:['SSRF','CSRF','XSS','IDOR'],x:'Server-Side Request Forgery; bisa membocorkan kredensial cloud.'},
  {d:3,q:'Mengganti /invoice/1001 menjadi /invoice/1002 lalu bisa melihat data orang lain adalah celah...',o:['IDOR (Broken Access Control)','XSS tersimpan','race condition','open redirect'],x:'Server lupa mengecek apakah data itu milik pengguna yang meminta.'},
  {d:3,q:'Teknik Kerberoasting di Active Directory menargetkan...',o:['tiket layanan (TGS) akun ber-SPN untuk di-crack offline','password Wi-Fi kantor','sertifikat TLS situs web','cookie browser'],x:'Mitigasi: password akun layanan yang panjang/acak atau gMSA.'},
  {d:3,q:'Buffer overflow klasik di stack dieksploitasi dengan menimpa...',o:['return address agar eksekusi melompat ke kode penyerang','header HTTP','tabel DNS','file /etc/hosts'],x:'Mitigasi modern: stack canary, NX/DEP, dan ASLR.'},
  {d:3,q:'Mitigasi yang mengacak alamat memori stack, heap, dan library setiap program dijalankan adalah...',o:['ASLR','DEP/NX','stack canary','sandboxing'],x:'Penyerang jadi sulit menebak alamat tujuan lompatan.'}
],
cloud:[
  {q:'File yang mendefinisikan cara membangun image Docker adalah...',o:['Dockerfile','docker-compose.yml','Makefile','package.json'],x:'docker-compose mengatur banyak service, bukan membangun image.'},
  {q:'Mengelola infrastruktur lewat kode (misalnya Terraform) disebut...',o:['Infrastructure as Code','Serverless','Microservices','Monolith'],x:'Infrastruktur jadi bisa di-review dan di-versioning.'},
  {q:'Tujuan utama CI/CD adalah...',o:['mengotomasi build, tes, dan rilis perangkat lunak','mendesain antarmuka','mengelola anggaran proyek','menulis dokumentasi manual'],x:'Continuous Integration / Continuous Delivery.'},
  {q:'Model layanan di mana penyedia mengelola server, OS, & runtime sehingga kamu cukup men-deploy kode adalah...',o:['PaaS','IaaS','on-premise','colocation'],x:'IaaS = sewa VM; SaaS = memakai aplikasi jadi.'},
  {q:'Dalam shared responsibility model, yang menjadi tanggung jawab PELANGGAN cloud adalah...',o:['konfigurasi akses & data milik pelanggan','keamanan fisik data center','perawatan hardware server','pendingin ruang server'],x:'Bucket yang terbuka untuk publik adalah salah pelanggan, bukan penyedia.'},
  {q:'Object storage (misalnya Amazon S3) paling cocok untuk...',o:['file statis, backup, dan media','database transaksi berlatensi rendah','RAM server','menjalankan kode backend'],x:'Murah, awet, dan bisa diakses lewat HTTP.'},
  {d:2,q:'Menempatkan aplikasi di beberapa Availability Zone bertujuan agar...',o:['tetap tersedia bila satu data center gangguan','biaya transfer data turun','build lebih cepat','kuota CPU bertambah'],x:'Satu AZ bisa padam; multi-AZ menjaga layanan tetap hidup.'},
  {d:2,q:'Penskalaan dengan menambah jumlah instance (bukan memperbesar satu instance) disebut...',o:['horizontal scaling (scale out)','vertical scaling (scale up)','sharding','caching'],x:'Scale up = ganti ke mesin yang lebih besar.'},
  {d:2,q:'Komponen yang membagi traffic ke banyak server di belakangnya adalah...',o:['load balancer','NAT gateway','bastion host','DNS resolver lokal'],x:'Sekaligus melakukan health check ke tiap server.'},
  {d:2,q:'Cara paling aman memberi aplikasi di VM akses ke storage cloud adalah...',o:['IAM role yang terpasang di instance','menaruh access key di kode','memakai akun root','membagikan password admin lewat chat'],x:'Kredensial sementara dirotasi otomatis, tidak pernah tertulis di repo.'},
  {d:2,q:'Jenis instance murah yang bisa ditarik kembali sewaktu-waktu oleh penyedia adalah...',o:['spot / preemptible instance','reserved instance','dedicated host','on-demand instance'],x:'Cocok untuk batch job yang tahan diinterupsi.'},
  {d:2,q:'Subnet tanpa rute langsung dari internet, biasanya untuk database, disebut...',o:['private subnet','public subnet','edge location','CDN'],x:'Akses keluar biasanya lewat NAT gateway.'},
  {d:3,q:'RPO (Recovery Point Objective) 15 menit artinya...',o:['data yang boleh hilang maksimal 15 menit terakhir','sistem harus pulih dalam 15 menit','backup disimpan 15 hari','downtime maksimal 15 menit per bulan'],x:'Target lama waktu pemulihan disebut RTO.'},
  {d:3,q:'Strategi disaster recovery dengan biaya PALING rendah tapi waktu pulih PALING lama adalah...',o:['backup & restore','pilot light','warm standby','multi-site active-active'],x:'Urutan dari termurah: backup & restore → pilot light → warm standby → active-active.'},
  {d:3,q:'Tantangan terbesar arsitektur multi-region active-active biasanya ada di...',o:['konsistensi & replikasi data antar-region','jumlah availability zone','ukuran instance','warna dashboard'],x:'Menulis data di dua region sekaligus memunculkan konflik.'},
  {d:3,q:'Pola deploy dua lingkungan identik, traffic dipindah sekaligus dan bisa rollback instan, adalah...',o:['blue-green deployment','canary release','recreate','rolling update tanpa health check'],x:'Canary memindahkan traffic sedikit demi sedikit.'},
  {d:3,q:'Untuk workload stabil 24/7 selama 3 tahun, opsi biaya paling hemat adalah...',o:['reserved instance / savings plan','on-demand','spot untuk database utama','menambah instance cadangan'],x:'Komitmen jangka panjang ditukar diskon besar.'},
  {d:3,q:'Menghubungkan dua VPC secara privat tanpa lewat internet publik dilakukan dengan...',o:['VPC peering / transit gateway','IP publik + firewall dibuka lebar','port forwarding di router rumah','FTP'],x:'Traffic tetap di jaringan internal penyedia cloud.'}
],
k8s:[
  {q:'Unit terkecil yang bisa di-deploy di Kubernetes adalah...',o:['Pod','Node','Cluster','Namespace'],x:'Satu Pod bisa berisi satu atau beberapa container.'},
  {q:'Objek Kubernetes untuk mengekspos aplikasi ke jaringan adalah...',o:['Service','ConfigMap','Secret','PersistentVolume'],x:'Service memberi alamat stabil untuk sekumpulan Pod.'},
  {q:'Perintah untuk melihat daftar Pod adalah...',o:['kubectl get pods','docker ps -a','kubectl run','helm list'],x:'Tambahkan -A untuk semua namespace.'},
  {q:'Objek yang menjaga sejumlah replika Pod tetap hidup dan mendukung rolling update adalah...',o:['Deployment','ConfigMap','Ingress','Namespace'],x:'Deployment mengelola ReplicaSet di belakang layar.'},
  {q:'Objek untuk menyimpan konfigurasi non-rahasia sebagai pasangan key-value adalah...',o:['ConfigMap','Secret','Volume','Node'],x:'Data sensitif (password, token) disimpan di Secret.'},
  {q:'Pemisah logis sumber daya cluster per tim atau lingkungan adalah...',o:['Namespace','Pod','ReplicaSet','kubelet'],x:'Misalnya namespace dev, staging, prod.'},
  {d:2,q:'Status Pod CrashLoopBackOff berarti...',o:['container terus crash dan Kubernetes menunda restart berikutnya','image tidak ditemukan','Pod menunggu dijadwalkan ke node','Pod selesai dengan sukses'],x:'Image tak ditemukan = ImagePullBackOff; belum dapat node = Pending.'},
  {d:2,q:'Probe yang menentukan apakah Pod siap menerima traffic dari Service adalah...',o:['readinessProbe','livenessProbe','startupProbe','HEALTHCHECK Docker'],x:'Kalau livenessProbe gagal, container di-restart.'},
  {d:2,q:'Objek untuk menjalankan tepat satu Pod di SETIAP node (misalnya agen log) adalah...',o:['DaemonSet','StatefulSet','Job','Deployment'],x:'Node baru otomatis kebagian Pod-nya.'},
  {d:2,q:'Objek untuk aplikasi stateful yang butuh identitas & storage tetap per replika adalah...',o:['StatefulSet','DaemonSet','ReplicaSet','CronJob'],x:'Pod-nya bernama stabil: db-0, db-1, db-2.'},
  {d:2,q:'Perintah untuk membaca log container di sebuah Pod adalah...',o:['kubectl logs <nama-pod>','kubectl describe node','kubectl top node','kubectl get ns'],x:'Tambahkan --previous untuk log container yang sudah crash.'},
  {d:2,q:'Objek untuk merutekan HTTP dari luar cluster berdasarkan host/path adalah...',o:['Ingress','ClusterIP','ConfigMap','PersistentVolumeClaim'],x:'Butuh ingress controller, misalnya NGINX.'},
  {d:3,q:'Komponen control plane yang menyimpan seluruh state cluster adalah...',o:['etcd','kube-proxy','kubelet','CoreDNS'],x:'Backup etcd = backup "otak" cluster.'},
  {d:3,q:'Membatasi Pod mana yang boleh berkomunikasi dengan Pod lain dilakukan dengan...',o:['NetworkPolicy','ResourceQuota','PodDisruptionBudget','LimitRange'],x:'Butuh CNI yang mendukung NetworkPolicy.'},
  {d:3,q:'Memberi ServiceAccount izin minimum (misalnya hanya baca Pod di satu namespace) dilakukan dengan...',o:['Role + RoleBinding (RBAC)','ClusterRole cluster-admin','hostNetwork: true','privileged: true'],x:'Least privilege juga berlaku di cluster.'},
  {d:3,q:'Agar Pod tidak dijadwalkan ke node tertentu kecuali Pod itu "tahan", dipakai...',o:['taint pada node + toleration pada Pod','label pada Pod saja','ConfigMap','HorizontalPodAutoscaler'],x:'Contoh: node GPU hanya untuk workload GPU.'},
  {d:3,q:'Menjaga minimal sejumlah replika tetap hidup saat node di-drain untuk maintenance memakai...',o:['PodDisruptionBudget','HorizontalPodAutoscaler','NetworkPolicy','ResourceQuota'],x:'Drain akan menunggu sampai aman.'},
  {d:3,q:'Container dengan privileged: true berbahaya karena...',o:['membuka jalan keluar ke host (container escape)','membuat image lebih besar','memperlambat DNS','menghapus log otomatis'],x:'Hampir setara akses root di node.'}
],
data:[
  {q:'Perintah SQL untuk menggabungkan dua tabel berdasarkan kolom yang berelasi adalah...',o:['JOIN','UNION','GROUP BY','ORDER BY'],x:'UNION menumpuk hasil dua query, bukan menghubungkan kolom.'},
  {q:'Fungsi SQL untuk menghitung jumlah baris adalah...',o:['COUNT()','SUM()','AVG()','MAX()'],x:'SUM menjumlahkan nilai, bukan baris.'},
  {q:'Normalisasi basis data bertujuan untuk...',o:['mengurangi redundansi data','mempercepat koneksi internet','menambah duplikasi data','mengenkripsi data'],x:'Biasanya sampai bentuk normal ketiga (3NF).'},
  {q:'ETL adalah singkatan dari...',o:['Extract, Transform, Load','Encrypt, Transfer, Log','Edit, Test, Launch','Export, Track, Link'],x:'Alur memindahkan data ke data warehouse.'},
  {q:'Kolom yang mengidentifikasi setiap baris tabel secara unik disebut...',o:['primary key','foreign key','index biasa','view'],x:'Foreign key merujuk ke primary key tabel lain.'},
  {d:2,q:'Klausa SQL untuk menyaring hasil SETELAH GROUP BY adalah...',o:['HAVING','WHERE','ORDER BY','LIMIT'],x:'WHERE menyaring baris sebelum dikelompokkan.'},
  {d:2,q:'LEFT JOIN mengembalikan...',o:['semua baris tabel kiri, plus yang cocok dari tabel kanan','hanya baris yang cocok di kedua tabel','semua baris tabel kanan saja','perkalian kartesius kedua tabel'],x:'Yang tak punya pasangan di kanan diisi NULL.'},
  {d:2,q:'Dalam prinsip ACID, huruf "A" adalah...',o:['Atomicity','Availability','Accuracy','Authorization'],x:'Transaksi terjadi seluruhnya atau tidak sama sekali.'},
  {d:2,q:'Format file kolumnar yang efisien untuk analitik big data adalah...',o:['Parquet','CSV','TXT','DOCX'],x:'Hanya kolom yang dibutuhkan yang dibaca, dan terkompresi baik.'},
  {d:2,q:'Di skema bintang data warehouse, tabel pusat berisi angka transaksi disebut...',o:['tabel fakta','tabel dimensi','tabel staging','tabel log'],x:'Tabel dimensi berisi konteks: pelanggan, produk, tanggal.'},
  {d:2,q:'Fungsi SQL untuk mengganti NULL dengan nilai pengganti adalah...',o:['COALESCE()','COUNT()','CONCAT()','ROUND()'],x:'Contoh: COALESCE(diskon, 0).'},
  {d:3,q:'Menurut teorema CAP, saat terjadi network partition sistem terdistribusi harus memilih antara...',o:['konsistensi dan ketersediaan','kecepatan dan biaya','keamanan dan kenyamanan','CPU dan memori'],x:'Partition tolerance tidak bisa ditawar di jaringan nyata.'},
  {d:3,q:'<code>ROW_NUMBER() OVER (PARTITION BY pelanggan ORDER BY tanggal DESC)</code> cocok untuk...',o:['mengambil transaksi terbaru per pelanggan','menghapus duplikat secara permanen','menjumlah seluruh tabel','membuat index'],x:'Ambil baris dengan nomor 1 di tiap partisi.'},
  {d:3,q:'Slowly Changing Dimension Type 2 menyimpan perubahan dengan cara...',o:['menambah baris baru beserta periode berlaku, baris lama ditandai tidak aktif','menimpa nilai lama','menghapus baris lama','menyimpan di kolom komentar'],x:'Riwayat tetap utuh untuk analisis historis.'},
  {d:3,q:'Pipeline data yang aman dijalankan ulang tanpa menggandakan data disebut...',o:['idempoten','atomik','stateless','real-time'],x:'Biasanya memakai upsert/MERGE atau overwrite per partisi.'},
  {d:3,q:'Arsitektur yang memuat data mentah dulu ke warehouse, lalu mengolahnya di sana (misalnya dengan dbt), disebut...',o:['ELT','ETL klasik','OLTP','MapReduce'],x:'Warehouse modern cukup kuat untuk transformasi di tempat.'},
  {d:3,q:'Level isolasi transaksi yang mencegah dirty read, non-repeatable read, DAN phantom read adalah...',o:['SERIALIZABLE','READ UNCOMMITTED','READ COMMITTED','REPEATABLE READ'],x:'Paling aman, tapi paling mahal untuk konkurensi.'}
],
support:[
  {q:'Pengguna lapor "internet mati". Langkah pertama yang paling tepat?',o:['Cek apakah dialami satu orang atau semua orang','Langsung ganti router','Install ulang Windows','Eskalasi ke vendor'],x:'Persempit cakupan masalah dulu.'},
  {q:'Perintah Windows untuk melihat konfigurasi IP adalah...',o:['ipconfig','ifconfig','ls','chkdsk'],x:'ifconfig dipakai di Linux/macOS lama.'},
  {q:'Tiket helpdesk sebaiknya diprioritaskan berdasarkan...',o:['dampak dan urgensi','siapa yang paling keras komplain','urutan alfabet nama','jabatan pelapor saja'],x:'Matriks prioritas dampak × urgensi.'},
  {q:'"Sudah dicoba restart?" termasuk langkah troubleshooting untuk...',o:['membersihkan status sementara yang bermasalah','mengganti perangkat keras','menulis ulang aplikasi','mengubah topologi jaringan'],x:'Klasik karena memang sering berhasil.'},
  {q:'Supaya data tidak hilang saat laptop rusak, sebaiknya...',o:['backup rutin ke lokasi terpisah','simpan semua di desktop','matikan antivirus','pakai satu flashdisk untuk semua'],x:'Aturan 3-2-1: 3 salinan, 2 media, 1 di luar lokasi.'},
  {d:2,q:'Dalam ITIL, beda incident dan problem adalah...',o:['incident = gangguan yang harus segera dipulihkan; problem = akar penyebab satu/lebih incident','keduanya sama saja','problem selalu lebih ringan dari incident','incident hanya untuk hardware'],x:'Incident memulihkan layanan, problem mencegah terulang.'},
  {d:2,q:'Kesepakatan tertulis target layanan antara penyedia TI dan pelanggan disebut...',o:['SLA','NDA','SOP','BAST'],x:'Service Level Agreement, misalnya "respons maks. 15 menit".'},
  {d:2,q:'Basis data yang mencatat aset TI beserta hubungan antar-komponennya adalah...',o:['CMDB','CRM','ERP','DNS'],x:'Configuration Management Database; isinya Configuration Item (CI).'},
  {d:2,q:'Permintaan rutin seperti reset password atau akses aplikasi baru dalam ITIL disebut...',o:['service request','major incident','problem','emergency change'],x:'Bukan gangguan, jadi ditangani lewat alur permintaan standar.'},
  {d:2,q:'Meneruskan tiket ke tim yang lebih ahli (L1 → L2 → L3) disebut eskalasi...',o:['fungsional','hierarkis','geografis','finansial'],x:'Eskalasi hierarkis = melibatkan manajemen.'},
  {d:2,q:'Artikel berisi langkah solusi untuk masalah yang sudah dikenal (agar L1 bisa menyelesaikan sendiri) disimpan di...',o:['knowledge base','log server','kontrak vendor','laporan keuangan'],x:'Menurunkan jumlah eskalasi yang tidak perlu.'},
  {d:3,q:'Dalam ITIL 4, Service Value System (SVS) menjelaskan...',o:['bagaimana semua komponen & aktivitas organisasi bekerja sama menciptakan nilai','daftar harga layanan TI','topologi jaringan kantor','cara menghitung gaji teknisi'],x:'Intinya ada Service Value Chain, guiding principles, governance, dan practices.'},
  {d:3,q:'Perubahan berisiko rendah, sudah teruji, dan disetujui di muka (pre-authorized) disebut...',o:['standard change','normal change','emergency change','major change'],x:'Tidak perlu rapat persetujuan setiap kali dijalankan.'},
  {d:3,q:'Forum yang menilai dan menyetujui perubahan besar (dalam praktik ITIL klasik) adalah...',o:['CAB (Change Advisory Board)','NOC','SOC','HRD'],x:'ITIL 4 menyebutnya change authority, bisa berbentuk apa saja.'},
  {d:3,q:'Workaround dalam problem management adalah...',o:['solusi sementara untuk mengurangi dampak sebelum akar masalah diperbaiki','perbaikan permanen','penutupan tiket tanpa solusi','penggantian vendor'],x:'Problem dengan workaround terdokumentasi disebut known error.'},
  {d:3,q:'Metrik MTTR mengukur...',o:['rata-rata waktu memulihkan layanan setelah gangguan','rata-rata waktu antar-kegagalan','jumlah tiket per bulan','waktu respons pertama'],x:'Waktu antar-kegagalan disebut MTBF.'},
  {d:3,q:'Prinsip panduan ITIL 4 "Focus on value" berarti...',o:['setiap aktivitas harus terhubung dengan nilai bagi pelanggan & pemangku kepentingan','menekan biaya apa pun dampaknya','mengutamakan tools terbaru','mengutamakan permintaan atasan'],x:'Prinsip lain: start where you are, keep it simple and practical, dsb.'}
],
pm:[
  {q:'Dalam Scrum, periode kerja tetap untuk menyelesaikan sekumpulan pekerjaan disebut...',o:['sprint','backlog','epic','retro'],x:'Biasanya 1–4 minggu.'},
  {q:'Rangkaian aktivitas terpanjang yang menentukan durasi proyek disebut...',o:['critical path','scope creep','milestone','baseline'],x:'Terlambat di jalur ini berarti proyek terlambat.'},
  {q:'Bertambahnya lingkup proyek tanpa kendali disebut...',o:['scope creep','burn down','sprint review','kickoff'],x:'"Sekalian tambahin fitur ini ya..."'},
  {q:'Peran yang memprioritaskan product backlog dalam Scrum adalah...',o:['Product Owner','Scrum Master','Stakeholder','QA'],x:'Scrum Master menjaga proses, bukan isi backlog.'},
  {q:'Pertemuan di akhir sprint untuk membahas apa yang bisa diperbaiki disebut...',o:['sprint retrospective','daily standup','sprint planning','demo day'],x:'Fokus pada proses tim, bukan menyalahkan orang.'},
  {d:2,q:'Dalam Scrum Guide, durasi Daily Scrum maksimal...',o:['15 menit','1 jam','30 menit','tanpa batas'],x:'Kalau rapat harian 1 jam, ada yang salah.'},
  {d:2,q:'Diagram batang yang menampilkan jadwal tiap tugas proyek terhadap waktu adalah...',o:['Gantt chart','diagram Ishikawa','pie chart','diagram Venn'],x:'Ishikawa (tulang ikan) untuk analisis akar masalah.'},
  {d:2,q:'Matriks yang memetakan siapa Responsible, Accountable, Consulted, dan Informed adalah...',o:['RACI','WBS','risk register','project charter'],x:'Hanya boleh ada satu Accountable per tugas.'},
  {d:2,q:'Memecah lingkup proyek menjadi paket kerja yang lebih kecil disebut...',o:['WBS (Work Breakdown Structure)','critical path','kanban','MoSCoW'],x:'Dasar untuk estimasi biaya dan jadwal.'},
  {d:2,q:'Teknik prioritas Must have, Should have, Could have, Won\'t have disebut...',o:['MoSCoW','SWOT','PDCA','SMART'],x:'Cara cepat memangkas daftar keinginan klien.'},
  {d:2,q:'Batas jumlah pekerjaan yang sedang dikerjakan bersamaan di papan Kanban disebut...',o:['WIP limit','velocity','story point','sprint goal'],x:'Membatasi WIP mempercepat aliran kerja.'},
  {d:3,q:'Dalam Earned Value Management, CPI = EV / AC. CPI 0,8 artinya...',o:['proyek boros: tiap Rp1 yang dikeluarkan hanya menghasilkan nilai Rp0,8','proyek hemat 20%','proyek lebih cepat dari jadwal','proyek terlambat 20%'],x:'Kinerja jadwal diukur dengan SPI = EV / PV.'},
  {d:3,q:'SPI (Schedule Performance Index) = 1,2 menunjukkan proyek...',o:['lebih cepat dari jadwal','terlambat dari jadwal','melebihi anggaran','di bawah anggaran'],x:'SPI > 1 = mendahului jadwal.'},
  {d:3,q:'Float (slack) aktivitas yang berada di critical path bernilai...',o:['nol','selalu positif','sama dengan durasi proyek','tak terbatas'],x:'Itu sebabnya terlambat sehari di sana = proyek terlambat sehari.'},
  {d:3,q:'Strategi risiko negatif dengan memindahkan dampaknya ke pihak ketiga (asuransi/kontrak) disebut...',o:['transfer','avoid','mitigate','accept'],x:'Avoid = menghilangkan penyebab; mitigate = mengurangi peluang/dampak.'},
  {d:3,q:'Mempercepat jadwal dengan mengerjakan paralel aktivitas yang semestinya berurutan disebut...',o:['fast tracking','crashing','gold plating','scope creep'],x:'Crashing = menambah sumber daya (dan biaya).'},
  {d:3,q:'Estimasi PERT = (O + 4M + P) / 6. Jika O = 4, M = 6, P = 14 hari, estimasinya...',o:['7 hari','6 hari','8 hari','24 hari'],x:'(4 + 24 + 14) / 6 = 42 / 6 = 7.'}
],
ctf:[
  {q:'String Base64 <code>aGFsbw==</code> jika di-decode menjadi...',o:['halo','hello','hola','hallo'],x:'Base64 hanya encoding, siapa pun bisa membalikkannya.'},
  {q:'ROT13 dari <code>SYNT</code> adalah...',o:['FLAG','SYNC','GLAD','FLAT'],x:'Setiap huruf digeser 13 posisi.'},
  {q:'Hash <code>5f4dcc3b5aa765d61d8327deb882cf99</code> (32 karakter heksadesimal) paling cocok dengan algoritma...',o:['MD5','SHA-256','bcrypt','SHA-512'],x:'Itu MD5 dari kata "password". MD5 sudah tidak aman.'},
  {q:'Input login <code>\' OR \'1\'=\'1</code> adalah percobaan serangan...',o:['SQL injection','XSS','path traversal','buffer overflow'],x:'Kondisi selalu benar, login bisa terlewati.'},
  {q:'File di root situs yang sering "membocorkan" path tersembunyi adalah...',o:['robots.txt','favicon.ico','index.html','style.css'],x:'Isinya daftar path yang tidak boleh diindeks mesin pencari.'},
  {q:'Nilai heksadesimal <code>0x41</code> dalam tabel ASCII adalah huruf...',o:['A','B','Z','a'],x:'0x41 = 65 desimal = "A".'}
],
sd:[
  {q:'"Aplikasi melambat saat traffic naik 10×. Langkah pertama Anda?"',o:['Ukur dulu: cek metrik & profil bottleneck','Tambah cache di bagian yang terbukti lambat','Langsung tambah server','Tulis ulang semuanya pakai bahasa lain'],w:[5,4,3,1]},
  {q:'"Bug kritis muncul di produksi tengah malam. Apa yang Anda lakukan?"',o:['Mitigasi dulu (rollback/feature flag), lalu cari akar masalah','Hotfix langsung di server produksi','Tunggu pagi sambil berharap','Salahkan deploy rekan'],w:[5,2,1,1]},
  {q:'"Kapan memilih microservices dibanding monolith?"',o:['Saat tim & domain sudah besar dan butuh deploy independen','Selalu, karena lebih modern','Tidak pernah','Kalau sedang tren di LinkedIn'],w:[5,2,2,1]},
  {q:'"Rekan satu tim menolak code review Anda. Bagaimana?"',o:['Diskusikan alasan teknisnya dengan kepala dingin','Minta pendapat orang ketiga','Merge diam-diam','Balas menolak semua PR-nya'],w:[5,4,1,1]},
  {q:'"Desain layanan pemendek URL (seperti bit.ly). Hal terpenting?"',o:['ID unik, penyimpanan key-value, dan cache untuk baca yang dominan','Satu file teks di server','Pakai blockchain','Warna logonya'],w:[5,2,1,1]}
]
};
/* kategori soal per spesialisasi (wawancara teknis) */
const KAT_SPES={support:['support','net'],sysadmin:['linux','net'],devops:['cloud','k8s','linux'],network:['net'],iot:['iot','net'],security:['sec','net'],backend:['code','data'],data:['data','code']};
/* fokus belajar: kategori soal + ke mana kenaikan skill dibagi (jaringan & IoT terpisah) */
const FOKUS_IT=[
  {k:'ngoding',  n:'Coding & scripting',              kat:['code','data'],          stat:{ngoding:1}},
  {k:'sistem',   n:'Linux, server, cloud & Kubernetes', kat:['linux','cloud','k8s'], stat:{sistem:1}},
  {k:'jaringan', n:'Jaringan komputer',               kat:['net'],                  stat:{jaringan:1}},
  {k:'iot',      n:'Internet of Things (IoT)',        kat:['iot'],                  stat:{jaringan:0.6,ngoding:0.4}},
  {k:'keamanan', n:'Keamanan siber',                  kat:['sec'],                  stat:{keamanan:1}},
  {k:'manajemen',n:'Manajemen proyek & layanan TI',   kat:['pm','support'],         stat:{soft:1}}
];
const TINGKAT_LBL=['','dasar','menengah','lanjut'];
/* ambil soal sesuai daftar tingkat kesulitan (mix), utamakan soal yang belum lama keluar */
function soalTingkat(kats,mix){
  const semua=[]; for(const k of kats)for(const s of (SOAL_IT[k]||[]))semua.push(s);
  const lihat=(P&&P.soalLihat)||[];
  const acak=Kuis.acak(semua);
  const pool=acak.filter(s=>lihat.indexOf(s.q)<0).concat(acak.filter(s=>lihat.indexOf(s.q)>=0));
  const out=[];
  for(const d of mix.slice(0,5)){
    if(!pool.length)break;
    let i=pool.findIndex(s=>(s.d||1)===d);
    if(i<0)i=pool.findIndex(s=>Math.abs((s.d||1)-d)===1);   /* cadangan: tingkat terdekat */
    if(i<0)i=0;
    out.push(pool.splice(i,1)[0]);
  }
  if(P){ P.soalLihat=lihat.concat(out.map(s=>s.q)).slice(-60); }
  return out;
}
function soalIT(kats,n,d){ const m=[]; for(let i=0;i<Math.min(n,5);i++)m.push(d||1); return soalTingkat(kats,m); }
/* tingkat soal latihan menyesuaikan skill saat ini */
function mixBelajar(nilai){ return nilai<45?[1,1,1]:nilai<65?[1,2,2]:nilai<80?[2,2,3]:[2,3,3]; }
function skillFokus(st){ let v=0,w=0; for(const k in st){ v+=(P.st[k]||0)*st[k]; w+=st[k]; } return w?v/w:0; }
function bagiStat(st,total){ const o={}; for(const k in st)o[k]=Math.max(1,Math.round(total*st[k])); return o; }

/* ================= 3. LATAR BELAKANG ACAK ================= */
const LATAR_IT=[
  {k:'kampus',n:'Lulusan Informatika kampus top',w:22,age:22,st:{ngoding:+8,sistem:+5,soft:+3},rep:+6,money:5e6,
    d:'Kamu lulus dari jurusan Informatika kampus negeri ternama. Grup alumni penuh senior di unicorn dan perusahaan luar negeri.'},
  {k:'bootcamp',n:'Lulusan bootcamp',w:22,age:24,st:{ngoding:+6,soft:+6},rep:+2,money:-15e6,
    d:'Kuliahmu jurusan lain. Kamu banting setir lewat bootcamp coding 3 bulan dengan skema bayar belakangan (ISA): biaya dipotong dari gaji nanti.'},
  {k:'otodidak',n:'Otodidak dari YouTube & forum',w:20,age:21,st:{ngoding:+4,keamanan:+5,sistem:+3},rep:-2,money:2e6,
    d:'Semua ilmu dari tutorial YouTube, dokumentasi, dan forum tengah malam. Tanpa ijazah IT, modal portofolio GitHub.'},
  {k:'smk',n:'Lulusan SMK TKJ',w:20,age:19,st:{jaringan:+10,sistem:+6},rep:0,money:1e6,
    d:'Lulusan SMK Teknik Komputer & Jaringan. Jago crimping kabel dan setting router sejak umur 16, tapi banyak lowongan menulis "minimal S1".'},
  {k:'switcher',n:'Career switcher',w:16,age:27,st:{soft:+10,ngoding:-4,sistem:-4},rep:+1,money:40e6,
    d:'Lima tahun kerja di bidang lain (akuntansi), lalu memutuskan pindah ke IT. Lebih tua dari rekan seangkatan, tapi lebih paham bisnis dan komunikasi.'}
];
function acakLatarIT(){ const t=LATAR_IT.reduce((a,l)=>a+l.w,0); let x=r()*t; for(const l of LATAR_IT){ x-=l.w; if(x<=0)return l; } return LATAR_IT[0]; }
function terapkanLatarIT(){
  const l=acakLatarIT();
  P.latar=l.k; P.latarN=l.n;
  P.age=l.age; P.lahir=N.tahun-l.age;
  for(const k in l.st)P.st[k]=clamp(P.st[k]+l.st[k],0,100);
  P.reputasi=clamp(P.reputasi+l.rep,0,100); P.money+=l.money;
  if(l.k==='bootcamp')P.isa=24;              /* cicilan ISA 2 tahun */
  addLog('Latar belakang: <b>'+l.n+'</b>. '+l.d,'sys');
  milestone('Latar: '+l.n);
  ask({title:'LATAR BELAKANG',text:'<b>'+l.n.toUpperCase()+'</b><br><br>'+l.d+'<br><br>Usia mulai: <b>'+l.age+' tahun</b>'+(l.money?' · Uang awal: <b>'+rp(l.money)+'</b>':'')+'.',opts:[{t:'Lanjut »',e:()=>{}}]});
}

/* ================= 1. MINI-GAME TEKNIS ================= */
/* belajar: pilih fokus → 3 soal dari fokus itu saja; tingkat soal mengikuti skill */
function belajarTeknis(){
  ask({title:'FOKUS BELAJAR TAHUN INI',text:'Teknologi bergerak cepat. Mau perdalam yang mana? Kamu akan mengerjakan 3 soal latihan. Tingkat soalnya menyesuaikan skill-mu sekarang (dasar → menengah → lanjut).',
    opts:FOKUS_IT.map(f=>{
      const mix=mixBelajar(skillFokus(f.stat));
      return {t:f.n,sub:'Soal '+TINGKAT_LBL[mix[0]]+(mix[2]!==mix[0]?'–'+TINGKAT_LBL[mix[2]]:''),e:()=>{
        for(const k in f.stat)if(k!=='soft')P.usedSkill[k]=true;
        Kuis.lembar('LATIHAN '+f.n.toUpperCase(),'Kopi sachet, terminal terbuka, dokumentasi di tab sebelah. Kerjakan soal latihan ini:',soalTingkat(f.kat,mix),h=>{
          const naik=2+h.benar*2+(mix[2]>=3&&h.benar?1:0);
          const o=bagiStat(f.stat,naik); o.stres=+2;
          if(h.benar===h.jumlah&&h.jumlah){ o.reputasi=+1; addLog('Semua soal benar. Konsepnya benar-benar nempel.'+fx(o),'good'); }
          else addLog('Kamu mempelajari ulang bagian yang salah.'+fx(o),'good');
        });
      }};
    })});
}

/* ---------- SERTIFIKASI BERJENJANG: Grade 0 Fundamental → 3 Expert ---------- */
function sertGrade(k){ let g=-1; for(const id of (P.sertifikat||[]))if(id.slice(0,-1)===k)g=Math.max(g,+id.slice(-1)); return g; }
function sertJalur(k){ return SERT_JALUR.find(j=>j.k===k); }
function sertNama(j,g){ return j.gelar[g]+' ('+GRADE[g].n+')'; }
/* sertifikat dari save lama → id baru; buang yang tak dikenal */
function migrasiSertifikat(){
  if(!P||!Array.isArray(P.sertifikat))return;
  const baru=[];
  for(const id of P.sertifikat){
    const v=SERT_LAMA[id]||id;
    if(/^[a-z0-9]+[0-3]$/.test(v)&&sertJalur(v.slice(0,-1))&&baru.indexOf(v)<0)baru.push(v);
  }
  P.sertifikat=baru;
}
/* bisa ikut ujian grade berikutnya? {ok, g, why} */
function sertBisa(j){
  const g=sertGrade(j.k)+1;
  if(g>3)return {ok:false,g,max:true,why:'Sudah grade tertinggi'};
  const gr=GRADE[g], biaya=j.biaya[g];
  if(P.st[j.skill]<gr.skill)return {ok:false,g,why:'butuh skill '+LBL[j.skill]+' ≥ '+gr.skill};
  if(lvNow()<gr.lv)return {ok:false,g,why:'butuh jenjang '+Object.values(JAB).find(x=>x.lv===gr.lv).n};
  if(P.money<biaya)return {ok:false,g,why:'uang kurang ('+rp(biaya)+')'};
  return {ok:true,g};
}
function sertPips(g){ let s='<span class="sg-pips" aria-label="grade '+Math.max(g,0)+' dari 3">'; for(let i=0;i<4;i++)s+='<i class="'+(i<=g?'on':'')+(i===3&&g>=3?' g3':'')+'"></i>'; return s+'</span>'; }
/* menu sertifikasi (ringkas untuk layar HP): satu tombol per jalur yang bisa diambil,
   sertifikat yang dimiliki dalam satu baris, jalur terkunci dilipat di <details> */
function menuSertifikasi(){
  const opts=[], kunci=[], punya=[];
  for(const j of SERT_JALUR){
    const g=sertGrade(j.k), b=sertBisa(j);
    if(g>=0)punya.push(j.gelar[g]+' <small>('+GRADE[g].n+')</small>');
    if(b.ok){ const gr=GRADE[b.g];
      opts.push({t:j.n+' '+sertPips(g),sub:'Grade '+b.g+' '+GRADE[b.g].n+': '+j.gelar[b.g]+' · '+rp(j.biaya[b.g])+' · lulus ≥'+gr.lulus+'/5',e:()=>ujianSertifikasi(j,b.g)}); }
    else kunci.push('<div class="sg-k"><b>'+j.n+'</b> — '+(b.max?'sudah Expert 🏆':GRADE[b.g].n+': '+b.why)+'</div>');
  }
  let teks='<div class="sg-legend">Grade <b>0</b> Fundamental › <b>1</b> Associate › <b>2</b> Professional › <b>3</b> Expert. Tiap grade butuh grade sebelumnya; gagal ujian = biaya hangus.</div>'+
    '<div class="sg-punya">Sertifikatmu: '+(punya.length?punya.join(' · '):'<i>belum ada</i>')+'</div>';
  if(kunci.length)teks+='<details class="sg-kunci"><summary>🔒 '+kunci.length+' jalur belum bisa diambil</summary>'+kunci.join('')+'</details>';
  if(!opts.length)teks+='<div class="sg-legend">Belum ada ujian yang bisa diambil. Naikkan skill, jenjang, atau tabungan dulu.</div>';
  opts.push({t:opts.length?'Nanti saja':'Tutup',e:()=>{ delete P.used.sertifikasi; G.acted=Math.max(0,G.acted-1); }});
  ask({title:'AMBIL SERTIFIKASI',text:teks,opts});
}
/* ujian sertifikasi: 5 soal sesuai grade; lulus jika benar ≥ GRADE.lulus; gagal = biaya hangus */
function ujianSertifikasi(j,g){
  const gr=GRADE[g], biaya=j.biaya[g], nama=sertNama(j,g);
  P.money-=biaya;
  const intro='<b>'+nama+'</b> — Grade '+g+' jalur '+j.n+'. '+gr.d+'<br>Biaya ujian '+rp(biaya)+' sudah dibayar. Ruang ujian sunyi, webcam pengawas menyala. '+
    '5 soal ('+gr.mix.map(d=>TINGKAT_LBL[d]).join(', ')+'). <b>Lulus jika minimal '+gr.lulus+' dari 5 benar.</b>';
  Kuis.lembar('UJIAN '+j.gelar[g].toUpperCase()+' · GRADE '+g,intro,soalTingkat([j.soal],gr.mix),h=>{
    if(h.benar>=gr.lulus){
      const id=j.k+g; if(P.sertifikat.indexOf(id)<0)P.sertifikat.push(id);
      const o=bagiStat(j.stat,gr.st); if(gr.rep)o.reputasi=gr.rep;
      addLog('<b>LULUS '+nama+'</b> dengan '+h.benar+'/5 benar! '+(g===3?'Gelar Expert: hanya segelintir orang di Indonesia yang memegangnya.':g===2?'Level Professional: recruiter mulai rajin menyapa di LinkedIn.':'Satu baris baru di LinkedIn, satu lonjakan kemampuan.')+fx(o),'good');
      milestone('Sertifikasi '+nama); stamp(GRADE[g].n.toUpperCase()+' · '+j.gelar[g].toUpperCase(),g===3?'gold':'green');
      ach('lulusSertif'); if(g===3)ach('sertExpert');
      if(P.sertifikat.filter(x=>+x.slice(-1)>=1).length>=4)ach('sertifikat');
    } else addLog('Nilaimu '+h.benar+'/5, batas lulus '+nama+' adalah '+gr.lulus+'. Biaya '+rp(biaya)+' hangus, tapi kamu tahu bagian mana yang harus diulang.'+fx({stres:3+g*2,reputasi:g>=2?-1:0}),'bad');
  },{lulus:gr.lulus});
}
/* bonus sertifikasi: peluang fix insiden di domainnya & nilai jual (gaji) */
function sertBonusDomain(dom){ let b=0; for(const j of SERT_JALUR){ if(j.dom!==dom)continue; const g=sertGrade(j.k); if(g>=0)b=Math.max(b,GRADE[g].bonus); } return b; }
function sertBonusGaji(){ let b=0; for(const j of SERT_JALUR){ const g=sertGrade(j.k); if(g>=0)b+=GRADE[g].gaji; } return Math.min(0.12,b); }
function sertTertinggi(){ let best=null; for(const j of SERT_JALUR){ const g=sertGrade(j.k); if(g>=0&&(!best||g>best.g))best={j,g}; } return best; }

/* CTF: 3 tantangan; menang jika ≥ 2 flag */
function ctfMain(){
  P.usedSkill.keamanan=true;
  Kuis.lembar('KOMPETISI CTF','Papan skor menyala, timer berjalan. Rebut flag dari tantangan berikut:',soalIT(['ctf'],3),h=>{
    P.hackWhite++;
    if(h.benar>=2){ P.ctfMenang++; const u=ri(5,20)*1e6;
      addLog('Tim kamu naik podium CTF dengan '+h.benar+' flag!'+fx({keamanan:+4,reputasi:+4,money:+u}),'good'); ach('ctfJuara'); leg(2,1);
      if(h.benar===h.jumlah)ach('ctfSempurna'); }
    else { addLog('Belum naik podium, tapi teknik baru terserap dari soal-soalnya.'+fx({keamanan:+3,stres:+2}),'sys'); leg(1,0); }
  },{lulus:2});
}
/* wawancara teknis: 2 soal teknis (tingkat sesuai jenjang) + 1 system design → done(rasio 0..1) */
function wawancaraTeknis(konteks,done){
  const lv=P.jab?lvNow():1;
  const mix=lv<=1?[1,1]:lv===2?[1,2]:lv<=4?[2,3]:[3,3];
  const soal=soalTingkat(KAT_SPES[P.spes]||['code'],mix).concat(soalIT(['sd'],1));
  Kuis.lembar('WAWANCARA TEKNIS',konteks+' Dua engineer senior di layar Zoom membuka sesi teknis:',soal,h=>{
    const rasio=(h.jumlah?h.benar/h.jumlah:0.5)*0.6+(h.poinMaks?h.poin/h.poinMaks:0.5)*0.4;
    if(rasio>=0.95)ach('wawancaraAce');
    done(rasio);
  },{tombol:'Akhiri wawancara »'});
}

/* ================= 4. JALUR KARIER BARU ================= */
function lamarRemoteLN(){
  wawancaraTeknis('Perusahaan di Eropa membuka posisi remote. Wawancara dalam bahasa Inggris, jam 10 malam waktu Indonesia.',rs=>{
    if(rs>=0.65){ P.tempat='remote'; P.tempatN='Remote untuk Perusahaan Luar'; P.tenure=0; P.jobHops=(P.jobHops||0)+1; kondisiKantorBaru();
      addLog('<b>Diterima kerja remote untuk perusahaan luar negeri!</b> Gaji dolar, meeting jam 11 malam.'+fx({reputasi:+3,stres:+3}),'good'); stamp('GAJI DOLAR','gold'); ach('gajiDolar'); milestone('Kerja remote perusahaan luar negeri'); leg(0,4); }
    else addLog('Email penolakan datang dengan bahasa yang sangat sopan: "We decided to move forward with other candidates."'+fx({stres:+4}),'bad');
  });
}

/* ================= 6. POSTMORTEM & BUDAYA TIM ================= */
function postmortem(c,sukses){
  ask({title:'POSTMORTEM INSIDEN',text:'Insiden besar <b>'+c.jenis.n+'</b> '+(sukses?'berhasil dipulihkan':'sempat lepas kendali')+'. Manajemen minta rapat postmortem. Arah rapatnya?',opts:[
    {t:'Blameless: fokus memperbaiki sistem & proses',sub:'Tim belajar, kepercayaan tumbuh',e:()=>{ P.budaya=clamp((P.budaya||50)+8,0,100); P.pmBlameless=(P.pmBlameless||0)+1;
      addLog('Kalian menulis linimasa, akar masalah, dan action item tanpa menunjuk siapa pun. Tim merasa aman untuk jujur.'+fx({soft:+2,reputasi:+2}),'good'); if(P.pmBlameless>=3)ach('blameless'); leg(2,0); }},
    {t:'Cari siapa yang salah',sub:'Puas sesaat, tim jadi takut',e:()=>{ P.budaya=clamp((P.budaya||50)-10,0,100);
      addLog('Satu nama disebut berulang-ulang di rapat. Sejak hari itu, orang-orang mulai menyembunyikan kesalahan kecil.'+fx({reputasi:+1,soft:-2}),'bad'); leg(-2,1); }},
    {t:'Skip postmortem, lanjut kerja',e:()=>{ P.budaya=clamp((P.budaya||50)-3,0,100); addLog('Tidak ada yang mencatat pelajaran. Insiden serupa menunggu giliran.'+fx({stres:-1})); }}
  ]});
}

/* ================= 5. KEHIDUPAN KANTOR ================= */
function penilaianKinerja(){
  const dB=P.beres-(P.revBeres||0), dG=P.gagal-(P.revGagal||0);
  P.revBeres=P.beres; P.revGagal=P.gagal;
  let skor=50+dB*8-dG*10+(P.reputasi-40)/2+(P.st.soft-50)/3+((P.budaya||50)-50)/5+ri(-8,8)+(adaTim()?(timSkor()-50)/3:0);
  ask({title:'PENILAIAN KINERJA TAHUNAN',text:'Formulir self-assessment dibuka: tahun ini kamu menangani '+dB+' insiden dengan baik dan '+dG+' yang meleset. Cara mengisinya?',opts:[
    {t:'Jujur, lengkap dengan data & dampak',e:()=>hasilKinerja(skor+5)},
    {t:'Merendah: "biasa saja, Pak"',e:()=>hasilKinerja(skor-6)},
    {t:'Klaim semua keberhasilan tim',sub:'Bisa dipercaya, bisa juga ketahuan',e:()=>{ P.budaya=clamp((P.budaya||50)-5,0,100); hasilKinerja(r()<0.4?skor-12:skor+8); }}
  ]});
}
function hasilKinerja(skor){
  const g=gajiTahun();
  if(skor>=70){ const b=Math.round(g/6); addLog('Rating: <b>Exceeds Expectations</b>. Bonus '+rp(b)+' cair, manajer menyebut namamu di rapat besar.'+fx({money:+b,reputasi:+3}),'good'); ach('exceeds'); P.pip=0; leg(1,2); }
  else if(skor>=45){ const b=Math.round(g/12); addLog('Rating: <b>Meets Expectations</b>. Bonus '+rp(b)+'. Aman, standar, tidak ada yang istimewa.'+fx({money:+b}),'sys'); P.pip=0; }
  else { P.pip=(P.pip||0)+1; addLog('Rating: <b>Below Expectations</b>. "Kita perlu bicara soal performa."'+fx({stres:+8,reputasi:-2}),'bad');
    if(P.pip>=2)ask({title:'PERFORMANCE IMPROVEMENT PLAN',text:'Kamu resmi masuk <b>PIP</b> 90 hari: target mingguan, check-in setiap Jumat, dan semua orang tahu artinya.',opts:[
      {t:'Jalani PIP dengan serius',sub:'Lembur, tapi kesempatan bertahan',e:()=>{ if(r()<0.55+P.st.soft/300){ P.pip=0; addLog('Kamu lolos PIP. Manajer bilang "kerja bagus", tanpa senyum.'+fx({stres:+10,reputasi:+2}),'good'); ach('lolosPIP'); }
        else { addLog('PIP tidak terlewati. Undangan Zoom 5 menit dari HR tiba hari Senin pagi.'+fx({stres:+12,reputasi:-3}),'bad'); milestone('Diberhentikan setelah PIP'); cariKerja(); } }},
      {t:'Resign duluan dengan kepala tegak',e:()=>{ addLog('Kamu mengundurkan diri sebelum PIP selesai. Lega, sekaligus deg-degan.'+fx({stres:-5}),'sys'); milestone('Resign saat PIP'); cariKerja(); }}
    ]});
  }
}
function satuSatu(){
  ask({title:'1-ON-1 DENGAN MANAJER',text:'Manajer membuka kalender: "Gimana kabarnya? Ada yang mau dibahas?"',opts:[
    {t:'Minta naik gaji, bawa data pencapaian',e:()=>{ if(r()<0.25+P.reputasi/250+(P.pip?-0.2:0)){ const n=Math.round(gajiTahun()*0.1); addLog('Manajer setuju mengajukan penyesuaian gaji '+rp(n)+'/tahun.'+fx({money:+n,stres:-2}),'good'); }
      else addLog('"Budget tahun ini sudah dikunci. Nanti kita lihat di siklus berikutnya ya."'+fx({stres:+3}),'bad'); }},
    {t:'Curhat beban kerja & on-call',e:()=>{ P.lembur=clamp((P.lembur||0)-15,0,100); addLog('Manajer mengatur ulang rotasi on-call. Akhirnya ada yang mendengar.'+fx({stres:-6,soft:+1}),'good'); }},
    {t:'Minta jalur belajar & mentor',e:()=>addLog('Kamu dijadwalkan mentoring rutin dengan engineer senior.'+fx({ngoding:+2,sistem:+2,soft:+1}),'good')},
    {t:'"Aman, Pak. Nggak ada."',e:()=>addLog('Rapat selesai dalam 4 menit. Rekor.')}
  ]});
}

/* ================= 2. KEJADIAN SATIR & KHUSUS LATAR ================= */
const kerjaAktif=()=>!P.retired&&!P.dipecat&&P.penjara<=0;
const EV_IT=[
{k:'printer',w:3,cd:3,run:()=>ask({title:'"KAMU ANAK IT, KAN?"',text:'Tetangga datang membawa printer macet, HP yang "kena virus", dan password WiFi yang lupa. "Kamu kan kerja di IT, pasti bisa."',opts:[
  {t:'Bantu semuanya',e:()=>{ P.servisKali=(P.servisKali||0)+1; addLog('Printer jalan lagi setelah dicabut-colok. Kamu dibayar pisang goreng dan reputasi "teknisi satu RT".'+fx({soft:+2,stres:+3}),'good'); if(P.servisKali>=3)ach('tukangServis'); }},
  {t:'"Itu bukan bidangku, Bu"',e:()=>addLog('Tetangga tidak percaya. "Masa anak IT nggak bisa benerin printer?"'+fx({soft:-1}))},
  {t:'Pura-pura sedang on-call',e:()=>addLog('Kamu kabur dengan alasan "server kantor down". Kali ini bohong, besok mungkin kenyataan.'+fx({stres:-1}))}]})},
{k:'jumat',w:3,cd:3,cond:kerjaAktif,run:()=>ask({title:'DEPLOY JUMAT SORE',text:'Jumat, 16.30. Atasan: "Fiturnya deploy sekarang aja ya, biar Senin klien bisa lihat."',opts:[
  {t:'Tolak sopan, jadwalkan Senin pagi',e:()=>{ if(r()<0.6)addLog('Atasan setuju setelah kamu jelaskan risikonya. Akhir pekan tetap damai.'+fx({soft:+2,stres:-2}),'good'); else addLog('Atasan kesal: "Kok susah banget sih?" Tapi akhir pekanmu aman.'+fx({reputasi:-1})); }},
  {t:'Deploy sekarang',e:()=>{ if(r()<0.4){ P.deployGagal++; addLog('Deploy gagal jam 18.00. Akhir pekanmu hilang di depan log error.'+fx({stres:+10,kesehatan:-2,reputasi:-1}),'bad'); } else addLog('Deploy lancar. Kamu tetap tidak bisa tidur nyenyak sampai Senin.'+fx({stres:+3})); }}]})},
{k:'kondangan',w:2,cd:4,cond:kerjaAktif,run:()=>ask({title:'PRODUCTION DOWN SAAT KONDANGAN',text:'Kamu sedang antre prasmanan di kondangan sepupu. HP bergetar: "SEV-1: checkout error 100%".',opts:[
  {t:'Buka laptop di parkiran',e:()=>addLog('Kamu memulihkan layanan dari jok motor, berbaju batik, ditemani suara organ tunggal.'+fx({reputasi:+2,stres:+5}),'good')},
  {t:'Serahkan ke rekan on-call',e:()=>{ if((P.budaya||50)>=50)addLog('Rekanmu sigap menangani. Kamu kembali ke antrean rendang.'+fx({stres:-1}),'good'); else addLog('Rekanmu panik dan menelepon balik 9 kali. Rendangnya keburu habis.'+fx({stres:+5})); }}]})},
{k:'lowongan',w:2,cd:6,run:()=>addLog('Lowongan di LinkedIn: "Dibutuhkan Senior Engineer, pengalaman 5 tahun di framework yang baru rilis 2 tahun lalu, menguasai 14 bahasa pemrograman, gaji UMR, suasana kekeluargaan." Kamu menutup tab dengan tenang.'+fx({stres:+1}),'sys')},
{k:'logo',w:3,cd:4,cond:()=>kerjaAktif()&&(P.tempat==='agency'||P.tempat==='remote'),run:()=>ask({title:'"LOGONYA DIBESARKAN, TAPI JANGAN TERLALU BESAR"',text:'Klien mengirim revisi ke-11: "Warnanya lebih ngejreng tapi elegan. Pokoknya yang wow tapi simpel."',opts:[
  {t:'Kerjakan dengan sabar',e:()=>addLog('Revisi ke-12 akhirnya disetujui. Isinya sama persis dengan versi pertama.'+fx({soft:+2,stres:+5}))},
  {t:'Ajak diskusi: tanya tujuan bisnisnya',e:()=>addLog('Setelah diskusi, klien sadar yang dia butuhkan bukan logo baru, tapi landing page yang cepat. Proyek berubah jadi lebih masuk akal.'+fx({soft:+3,reputasi:+2}),'good')}]})},
{k:'aiBos',w:2,cd:6,cond:kerjaAktif,run:()=>ask({title:'"PAKAI AI UNTUK SEMUA"',text:'Atasan baru pulang seminar: "Mulai besok semua kerjaan pakai AI ya. Kalau AI bisa, kenapa harus kita?"',opts:[
  {t:'Susun panduan pemakaian AI yang aman',e:()=>{ P.pelatihanAI=true; addLog('Kamu membuat panduan: kapan AI membantu, kapan berbahaya (data rahasia, kode tanpa review). Atasan menyebutnya "visioner".'+fx({reputasi:+3,soft:+2}),'good'); }},
  {t:'Copy-paste semua jawaban AI ke produksi',e:()=>addLog('Kode hasil AI jalan... sampai tidak. Ada fungsi yang memanggil library yang tidak pernah ada.'+fx({stres:+6,reputasi:-2}),'bad')}]})},
{k:'standup',w:2,cd:4,cond:kerjaAktif,run:()=>addLog('Stand-up meeting "15 menit" berlangsung 1 jam 10 menit. Separuhnya membahas siapa yang menghabiskan galon di pantry.'+fx({stres:+2}),'sys')},
{k:'winupdate',w:2,cd:6,cond:kerjaAktif,run:()=>addLog('Laptop kantor memaksa update Windows tepat 5 menit sebelum demo ke klien. "Jangan matikan komputer Anda. 3% selesai."'+fx({stres:+4}),'bad')},
{k:'legacy',w:2,cd:5,cond:kerjaAktif,run:()=>ask({title:'KODE WARISAN TANPA DOKUMENTASI',text:'Kamu mewarisi modul pembayaran berumur 9 tahun. Satu-satunya komentar: <code>// jangan diubah, nggak tahu kenapa bisa jalan</code>',opts:[
  {t:'Tulis tes dulu, refactor pelan-pelan',e:()=>{ const app=infraGet('app'); if(app)app.debt=clamp((app.debt||0)-10,0,100); addLog('Butuh berminggu-minggu, tapi sekarang modul itu punya tes dan dokumentasi.'+fx({ngoding:+3,stres:+3,reputasi:+1}),'good'); }},
  {t:'Ikuti petunjuk komentar: jangan diubah',e:()=>addLog('Modul itu tetap jalan. Entah sampai kapan.'+fx({stres:-1}))}]})},
{k:'hackIG',w:2,cd:8,run:()=>ask({title:'"BISA HACK IG MANTANKU?"',text:'Teman lama tiba-tiba chat: "Bro/Sis, kamu kan anak IT. Bisa bantu buka IG mantanku? Bayar deh."',opts:[
  {t:'Tolak, jelaskan itu melanggar hukum',e:()=>addLog('Kamu menolak dan menjelaskan soal UU ITE. Temanmu membalas "yaelah, serius amat".'+fx({soft:+1}),'good')},
  {t:'Ajari dia pasang 2FA di akunnya sendiri',e:()=>addLog('Topik beralih ke keamanan akunnya sendiri. Dia malah berterima kasih.'+fx({soft:+2,keamanan:+1}),'good')},
  {t:'Terima bayarannya',e:()=>{ P.hackBlack++; addLog('Kamu mengerjakannya diam-diam. Uangnya kecil, risikonya besar, nuraninya sedikit tercoreng.'+fx({money:+2e6,heat:+4}),'bad'); setTopi(); }}]})},
{k:'onCallLibur',w:2,cd:5,cond:kerjaAktif,run:()=>addLog('Liburan keluarga ke pantai. Kamu menghabiskan hari kedua di lobi hotel demi sinyal stabil, menangani alert yang ternyata false positive.'+fx({stres:+5,kesehatan:-1}),'bad')},
{k:'gojek',w:2,cd:8,run:()=>addLog('Om di arisan keluarga: "Kerja IT bertahun-tahun kok belum bikin aplikasi kayak Gojek sendiri?" Kamu tersenyum dan mengambil kue lagi.'+fx({stres:+1}),'sys')},
{k:'remoteMalam',w:3,cd:3,cond:()=>kerjaAktif()&&P.tempat==='remote',run:()=>addLog('Meeting sinkron tim global jam 23.00 WIB. Kamu presentasi dengan kopi ketiga sementara rekanmu di Eropa baru sarapan.'+fx({stres:+4,kesehatan:-1}),'sys')},
{k:'budayaBuruk',w:3,cd:6,cond:()=>kerjaAktif()&&(P.budaya||50)<35,run:()=>{ addLog('Engineer terbaik di timmu resign. Di exit interview dia bilang: "Di sini salah sedikit langsung disalahkan."'+fx({stres:+6,reputasi:-2}),'bad'); for(const a of P.infra)a.debt=clamp((a.debt||0)+4,0,100); }},
/* --- khusus latar --- */
{k:'minS1',w:4,cd:99,cond:()=>P.latar==='smk'&&kerjaAktif(),run:()=>ask({title:'"MINIMAL S1"',text:'Tawaran naik posisi tertahan: sistem HR menolak otomatis karena syarat "minimal S1".',opts:[
  {t:'Kuliah sambil kerja (kelas karyawan)',sub:'Rp 20 jt/tahun, lelah, tapi syarat terpenuhi',e:()=>{ P.money-=20e6; P.kuliahMalam=true; addLog('Kamu mendaftar kuliah kelas karyawan. Senin-Jumat kerja, Sabtu-Minggu kuliah.'+fx({stres:+8,soft:+3}),'sys'); milestone('Kuliah sambil kerja'); }},
  {t:'Buktikan lewat portofolio & sertifikasi',e:()=>addLog('Kamu menyusun portofolio proyek nyata. Beberapa perusahaan mulai melihat kemampuan, bukan ijazah.'+fx({reputasi:+3}),'good')}]})},
{k:'impostor',w:3,cd:12,cond:()=>(P.latar==='otodidak'||P.latar==='bootcamp')&&kerjaAktif(),run:()=>ask({title:'IMPOSTOR SYNDROME',text:'Di rapat teknis, rekan lulusan kampus top membahas istilah yang belum pernah kamu dengar. "Jangan-jangan aku memang tidak pantas di sini?"',opts:[
  {t:'Tanya, lalu pelajari malamnya',e:()=>addLog('Ternyata rekanmu juga baru membacanya minggu lalu. Semua orang sedang belajar.'+fx({soft:+2,ngoding:+2,stres:-2}),'good')},
  {t:'Diam & pura-pura paham',e:()=>addLog('Kamu mengangguk sepanjang rapat dan pulang dengan kepala penuh tanda tanya.'+fx({stres:+5}))}]})},
{k:'alumni',w:3,cd:12,cond:()=>P.latar==='kampus'&&kerjaAktif()&&P.reputasi>=30,run:()=>addLog('Grup alumni ramai: senior di perusahaan besar membagikan lowongan internal dan menawarkan referral. Jaringan kampus memang aset.'+fx({reputasi:+3}),'good')},
{k:'mantanAkuntan',w:3,cd:12,cond:()=>P.latar==='switcher'&&kerjaAktif(),run:()=>addLog('"Kamu kan dulu akuntan? Sekalian bantu cek laporan pajak tim ya." Pengalaman lamamu ternyata membuatmu jadi jembatan antara tim teknis dan bisnis.'+fx({soft:+3,reputasi:+2}),'good')}
];
function eventsIT(){
  P.cd=P.cd||{};
  if(P.budaya==null)P.budaya=50;
  /* cicilan ISA bootcamp */
  if(P.isa>0&&P.jab){ P.isa-=12; const pot=Math.round(gajiTahun()*0.12); P.money-=pot; addLog('Cicilan ISA bootcamp memotong '+rp(pot)+' dari gajimu tahun ini'+(P.isa<=0?'. Akhirnya lunas!':'.'),'sys'); }
  if(P.kuliahMalam&&!P.s1Malam&&r()<0.35){ P.s1Malam=true; P.kuliahMalam=false; addLog('Kamu diwisuda dari kelas karyawan. Syarat "minimal S1" bukan penghalang lagi.'+fx({reputasi:+4,stres:-5}),'good'); stamp('WISUDA S1','green'); milestone('Lulus S1 kelas karyawan'); }
  if(P.retired||P.dipecat||P.penjara>0)return;
  /* kehidupan kantor */
  timTahunan();   /* tim: tumbuh, moral, resign, arahan (03c-tim.js) */
  if(P.jab&&P.tempat!=='remote'&&r()<0.75)penilaianKinerja();
  else if(P.jab&&r()<0.5)penilaianKinerja();
  if(P.jab&&r()<0.22)satuSatu();
  if((P.budaya||50)>=75)ach('blameless');
  /* satu kejadian satir/latar per tahun */
  if(r()<0.85){
    const pool=EV_IT.filter(e=>(!P.cd[e.k]||P.years-P.cd[e.k]>=e.cd)&&(!e.cond||e.cond()));
    if(pool.length){ const t=pool.reduce((a,e)=>a+e.w,0); let x=r()*t; let ev=pool[pool.length-1]; for(const e of pool){ x-=e.w; if(x<=0){ ev=e; break; } } P.cd[ev.k]=P.years; ev.run(); }
  }
}
