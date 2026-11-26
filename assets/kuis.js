/* ARSIP Kuis — mini-game bersama untuk Simulator WNI & Kehidupan.
   Butuh fungsi global dari game: ask(), addLog(), rp(), r(); hasDoc (true di browser).
   Semua form maks. 5 soal pilihan ganda, dikumpulkan sekaligus.
   Jenis soal:
     biasa   {q, o:[...], a?:indeks benar (default 0), x?:pembahasan, fix?:urutan opsi tetap}
     berbobot{q, o:[...], w:[poin tiap opsi]}          → TKP, wawancara, calon mertua (tak ada benar/salah mutlak)
   API: Kuis.lembar, Kuis.skd, Kuis.wawancara, Kuis.hoax, Kuis.sim, Kuis.mertua, Kuis.tawar */
(function(){
'use strict';
const MAKS=5;
const BANK={
twk:[
  {q:'Dasar negara Republik Indonesia adalah...',o:['Pancasila','UUD 1945','Bhinneka Tunggal Ika','Teks Proklamasi'],x:'UUD 1945 adalah konstitusi; dasar negaranya Pancasila.'},
  {q:'Pembukaan UUD 1945 terdiri dari berapa alinea?',o:['4','3','5','6'],x:'Alinea keempat memuat rumusan Pancasila.'},
  {q:'Lembaga yang berwenang mengubah dan menetapkan UUD adalah...',o:['MPR','DPR','Presiden','Mahkamah Konstitusi'],x:'Pasal 3 dan Pasal 37 UUD 1945.'},
  {q:'Sumpah Pemuda menegaskan satu nusa, satu bangsa, dan menjunjung bahasa persatuan, yaitu...',o:['bahasa Indonesia','bahasa Melayu','bahasa Jawa','bahasa daerah masing-masing'],x:'Ikrar ketiga Sumpah Pemuda 1928.'},
  {q:'Bentuk negara Indonesia menurut UUD 1945 adalah...',o:['negara kesatuan berbentuk republik','negara federasi','monarki konstitusional','negara serikat'],x:'Pasal 1 ayat (1) UUD 1945.'},
  {q:'Hari Kesaktian Pancasila diperingati setiap tanggal...',o:['1 Oktober','1 Juni','30 September','17 Agustus'],x:'1 Juni adalah Hari Lahir Pancasila.'},
  {q:'Pasal 33 UUD 1945 terutama mengatur tentang...',o:['perekonomian nasional dan kesejahteraan sosial','pertahanan dan keamanan','pendidikan dan kebudayaan','agama'],x:'"Bumi dan air dan kekayaan alam... dikuasai oleh negara."'}
],
tiu:[
  {q:'Lanjutkan deret: 3, 6, 12, 24, ...',o:['48','36','30','42'],x:'Setiap suku dikali 2.'},
  {q:'25% dari 480 adalah...',o:['120','100','96','140'],x:'480 ÷ 4 = 120.'},
  {q:'Sinonim kata "efisien" adalah...',o:['hemat dan berdaya guna','boros','lamban','rumit'],x:'Efisien = tepat guna tanpa membuang sumber daya.'},
  {q:'KAKI : SEPATU = KEPALA : ...',o:['topi','rambut','leher','otak'],x:'Sesuatu yang dipakai pada bagian tubuh itu.'},
  {q:'Semua A adalah B. Sebagian B adalah C. Kesimpulan yang tepat...',o:['tidak dapat dipastikan apakah A adalah C','semua A adalah C','semua C adalah A','tidak ada A yang C'],x:'Informasinya tidak cukup untuk menghubungkan A dan C.'},
  {q:'Sebuah pekerjaan selesai oleh 6 orang dalam 10 hari. Jika dikerjakan 5 orang, selesai dalam...',o:['12 hari','8 hari','11 hari','15 hari'],x:'6 × 10 = 60 orang-hari; 60 ÷ 5 = 12.'},
  {q:'Antonim kata "absurd" adalah...',o:['masuk akal','aneh','mustahil','ganjil'],x:'Absurd = tidak masuk akal.'}
],
tkp:[
  {q:'Atasan memberi tugas mendadak di luar tugas pokok saat pekerjaan Anda sedang menumpuk. Anda...',o:['Menerima, menyusun prioritas, dan menyampaikan tenggat yang realistis','Menerima dan mengerjakan semuanya sekaligus','Menerima tapi mengerjakan seadanya','Meminta rekan lain yang mengerjakan','Menolak karena bukan tugas Anda'],w:[5,4,3,2,1]},
  {q:'Rekan kerja melakukan kesalahan yang berdampak pada tim. Anda...',o:['Membantu memperbaiki, lalu mengajak evaluasi bersama','Membantu memperbaiki','Melaporkannya ke atasan','Membiarkan, itu bukan urusan Anda','Menegurnya keras di depan tim'],w:[5,4,3,2,1]},
  {q:'Warga yang Anda layani memberi "uang terima kasih". Anda...',o:['Menolak dengan sopan dan menjelaskan aturannya','Menolak','Menerima lalu menyerahkannya ke kantor','Menerima kalau nilainya kecil','Menerima karena sudah biasa'],w:[5,4,3,2,1]},
  {q:'Anda ditempatkan di daerah terpencil. Anda...',o:['Menerima, beradaptasi, dan berusaha berkontribusi','Menerima walau terasa berat','Menerima sambil segera mengajukan mutasi','Mencari cara agar penempatan dibatalkan','Mengundurkan diri'],w:[5,4,3,2,1]},
  {q:'Kantor menerapkan aplikasi baru yang belum Anda kuasai. Anda...',o:['Mempelajarinya aktif dan membantu rekan yang kesulitan','Mempelajarinya sendiri','Menunggu pelatihan resmi','Meminta rekan mengerjakan bagian itu','Tetap memakai cara lama'],w:[5,4,3,2,1]},
  {q:'Ada pelatihan pengembangan diri di akhir pekan tanpa uang lembur. Anda...',o:['Ikut karena bermanfaat untuk kinerja','Ikut kalau tidak ada acara lain','Ikut setengah hari saja','Ikut hanya karena diwajibkan','Tidak ikut'],w:[5,4,3,2,1]}
],
sim:[
  {q:'Usia minimal untuk membuat SIM C adalah...',o:['17 tahun','16 tahun','18 tahun','21 tahun'],x:'Sama dengan SIM A.'},
  {q:'Rambu berbentuk lingkaran dengan tepi merah umumnya berarti...',o:['larangan','perintah','peringatan','petunjuk arah'],x:'Contoh: dilarang parkir, dilarang masuk.'},
  {q:'Rambu belah ketupat berwarna kuning umumnya berarti...',o:['peringatan','larangan','perintah','petunjuk wisata'],x:'Contoh: tikungan tajam, jalan licin.'},
  {q:'Rambu bulat berwarna biru umumnya berarti...',o:['perintah','larangan','peringatan','informasi wisata'],x:'Contoh: wajib lurus, wajib belok kiri.'},
  {q:'Marka garis putih utuh (tidak putus-putus) di tengah jalan artinya...',o:['dilarang melintasi garis tersebut','boleh mendahului','jalur khusus bus','batas area parkir'],x:'Garis putus-putus boleh dilintasi dengan hati-hati.'},
  {q:'Saat lampu lalu lintas berubah kuning, pengemudi sebaiknya...',o:['bersiap berhenti','mempercepat laju kendaraan','membunyikan klakson','berhenti mendadak di mana pun'],x:'Kuning = hati-hati, bersiap berhenti.'},
  {q:'Di Indonesia, mendahului kendaraan lain dilakukan dari sisi...',o:['kanan','kiri','mana saja yang kosong','bahu jalan'],x:'Karena kita berkendara di lajur kiri.'},
  {q:'Pengendara sepeda motor wajib menyalakan lampu utama pada...',o:['siang dan malam hari','malam hari saja','saat hujan saja','di jalan tol saja'],x:'Diatur dalam UU No. 22 Tahun 2009 Pasal 107.'},
  {q:'Helm yang wajib dipakai pengendara motor adalah helm berstandar...',o:['SNI','ISO','SKCK','SIUP'],x:'Standar Nasional Indonesia.'}
],
hoax:[
  {h:'Minum air rebusan sandal jepit bisa menyembuhkan kolesterol.',fakta:false,x:'Tidak ada dasar medisnya. Konsultasikan ke tenaga kesehatan.'},
  {h:'Mulai bulan depan WhatsApp berbayar Rp 5.000 per pesan. Sebarkan ke 10 grup agar akunmu tetap gratis!',fakta:false,x:'Pesan berantai klasik, sudah beredar sejak bertahun-tahun lalu.'},
  {h:'Koin Rp 1.000 bergambar kelapa sawit dibeli kolektor Rp 100 juta. Hubungi nomor ini sekarang!',fakta:false,x:'Modus penipuan: korban diminta transfer "biaya administrasi".'},
  {h:'Bank membagikan hadiah Rp 5 juta: klik tautan ini lalu masukkan PIN dan kode OTP-mu.',fakta:false,x:'Phishing. Bank tidak pernah meminta PIN atau OTP.'},
  {h:'Memasukkan HP ke dalam beras bisa mengisi ulang baterainya.',fakta:false,x:'Beras kadang dipakai mengeringkan HP basah, bukan mengisi baterai.'},
  {h:'Legalitas aplikasi pinjaman online bisa dicek di situs resmi OJK.',fakta:true,x:'OJK rutin memperbarui daftar pinjol berizin.'},
  {h:'Bank tidak pernah meminta kode OTP lewat telepon atau chat.',fakta:true,x:'Siapa pun yang meminta OTP hampir pasti penipu.'},
  {h:'Kartu BPJS Kesehatan bisa dipakai berobat di faskes tingkat pertama tempat kita terdaftar.',fakta:true,x:'Rujukan ke rumah sakit lewat faskes pertama, kecuali gawat darurat.'},
  {h:'Pemungutan suara Pemilu serentak 2024 dilaksanakan pada 14 Februari 2024.',fakta:true,x:'Sesuai jadwal resmi KPU.'},
  {h:'Mencuci tangan dengan sabun membantu mencegah penularan diare dan infeksi saluran napas.',fakta:true,x:'Salah satu cara pencegahan paling murah dan efektif.'}
],
wawancara:[
  {q:'"Apa kelemahan terbesar Anda?"',o:['Menyebut kelemahan nyata, lalu cara Anda memperbaikinya','"Kadang terlalu detail, tapi saya sedang belajar lebih efisien"','"Saya terlalu perfeksionis"','"Saya tidak punya kelemahan"'],w:[5,4,2,1]},
  {q:'"Kenapa Anda ingin bekerja di sini?"',o:['Bidangnya cocok dengan keahlian & rencana karier saya','Ingin pengalaman baru','Gajinya lebih besar','"Bos saya yang lama menyebalkan"'],w:[5,4,2,1]},
  {q:'"Berapa ekspektasi gaji Anda?"',o:['Menyebut kisaran wajar sesuai riset pasar','"Sesuai standar perusahaan saja"','Menyebut angka dua kali lipat pasar','"Terserah, yang penting kerja"'],w:[5,3,2,2]},
  {q:'"Ceritakan tentang diri Anda."',o:['Ringkas: pendidikan, pengalaman relevan, kekuatan','Riwayat hidup lengkap sejak TK','Hobi, makanan favorit, dan zodiak','"Semua sudah ada di CV, Pak"'],w:[5,2,1,1]},
  {q:'"Lima tahun lagi Anda melihat diri Anda di mana?"',o:['Berkembang di bidang ini dengan tanggung jawab lebih besar','Masih terus belajar banyak hal','"Duduk di kursi Bapak"','"Belum kepikiran"'],w:[5,3,2,1]},
  {q:'"Anda bisa bekerja di bawah tekanan?"',o:['Bisa, sambil memberi contoh nyata cara mengatur prioritas','"Bisa, Pak" tanpa contoh','"Tergantung tekanannya"','"Kalau bisa jangan"'],w:[5,3,2,1]}
],
mertua:[
  {q:'"Kerjamu apa sekarang?"',o:['Jujur menjelaskan pekerjaan & rencana ke depan','"Masih merintis, Om" dengan percaya diri','Melebih-lebihkan jabatan','Mengalihkan pembicaraan ke cuaca'],w:[5,3,2,1]},
  {q:'"Nanti setelah menikah mau tinggal di mana?"',o:['Sudah ada rencana: kontrak dulu sambil menabung DP','"Ikut di rumah Om dulu, boleh?"','"Di hati anak Om"','"Belum dipikirkan"'],w:[5,2,2,1]},
  {q:'"Kamu bisa masak dan beres-beres rumah?"',o:['Bisa, dan mau berbagi tugas rumah tangga','Bisa sedikit, mau terus belajar','"Nanti beli makan di luar saja"','"Itu bukan tugas saya"'],w:[5,4,2,1]},
  {q:'"Orang tuamu kerja apa?"',o:['Menjawab jujur dengan sopan','Menjawab singkat lalu diam','Balik menanyakan hal yang sama','Mengarang supaya terdengar keren'],w:[5,3,2,1]},
  {q:'Calon mertua menawarimu makan masakan rumah. Kamu...',o:['Makan secukupnya dan memuji masakannya','Nambah tiga piring','Menolak karena sedang diet','Makan sambil main HP'],w:[5,3,2,1]}
]
};

function acak(a){ const b=a.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const t=b[i]; b[i]=b[j]; b[j]=t; } return b; }
function ambil(kat,n){ return acak(BANK[kat]||[]).slice(0,Math.min(n,MAKS)); }
let uid=0;
/* form pilihan ganda. done({benar, jumlah, poin, poinMaks, rasio}) */
function lembar(judul,intro,soal,done,o){
  o=o||{}; soal=soal.slice(0,MAKS);
  const id='kq'+(++uid);
  const urut=soal.map(s=>s.fix?s.o.map((_,i)=>i):acak(s.o.map((_,i)=>i)));
  let html=(intro?'<div class="kz-intro">'+intro+'</div>':'')+'<div class="kz">';
  soal.forEach((s,qi)=>{
    html+='<div class="kz-q"><div class="kz-t"><b>'+(qi+1)+'.</b> '+s.q+'</div>'+
      urut[qi].map(oi=>'<label class="kz-o"><input type="radio" name="'+id+'_'+qi+'" value="'+oi+'"><span>'+s.o[oi]+'</span></label>').join('')+'</div>';
  });
  html+='</div>';
  ask({title:judul,text:html,opts:[{t:o.tombol||'Kumpulkan jawaban »',sub:soal.length+' soal pilihan ganda',e:()=>{
    let benar=0,jumlah=0,poin=0,poinMaks=0; const cat=[];
    soal.forEach((s,qi)=>{
      let p=-1;
      if(typeof hasDoc!=='undefined'&&hasDoc){ const el=document.querySelector('input[name="'+id+'_'+qi+'"]:checked'); if(el)p=+el.value; }
      else if(typeof globalThis!=='undefined'&&globalThis.__KUIS_PINTAR)p=s.w?s.w.indexOf(Math.max.apply(null,s.w)):(s.a||0);   /* khusus tes: pemain yang selalu menjawab terbaik */
      else p=urut[qi][Math.floor(r()*urut[qi].length)];
      if(s.w){ poinMaks+=Math.max.apply(null,s.w); poin+=p>=0?s.w[p]:0; return; }
      jumlah++; const a=s.a||0;
      if(p===a)benar++;
      else if(!o.diam)cat.push('No. '+(qi+1)+': '+(p<0?'tidak dijawab':'kurang tepat')+' — jawabannya <b>'+s.o[a]+'</b>. '+(s.x||''));
    });
    const rasio=jumlah?benar/jumlah:(poinMaks?poin/poinMaks:0);
    if(!o.diam)addLog('Hasil '+judul.toLowerCase()+': '+(jumlah?'<b>'+benar+' dari '+jumlah+' benar</b>.':'<b>'+poin+' dari '+poinMaks+' poin</b>.')+(cat.length?'<br>'+cat.join('<br>'):''),
      rasio>=0.7?'good':rasio<0.4?'bad':'');
    done({benar,jumlah,poin,poinMaks,rasio});
  }}]});
}

/* ---------- 1. CPNS: SKD (TWK, TIU, TKP), ambang batas tiap subtes ---------- */
function skd(done){
  const hasil={};
  lembar('SKD CPNS — TWK','Seleksi Kompetensi Dasar dimulai. Bagian 1 dari 3: <b>Tes Wawasan Kebangsaan</b> (ambang batas 3 dari 5 benar).',ambil('twk',5),h1=>{
    hasil.twk=h1.benar;
    lembar('SKD CPNS — TIU','Bagian 2 dari 3: <b>Tes Intelegensia Umum</b> (ambang batas 3 dari 5 benar).',ambil('tiu',5),h2=>{
      hasil.tiu=h2.benar;
      lembar('SKD CPNS — TKP','Bagian 3 dari 3: <b>Tes Karakteristik Pribadi</b>. Tidak ada jawaban salah, tiap pilihan bernilai 1–5 (ambang batas 18 dari 25 poin).',ambil('tkp',5),h3=>{
        hasil.tkp=h3.poin;
        hasil.lolos=hasil.twk>=3&&hasil.tiu>=3&&hasil.tkp>=18;
        const gagalDi=[hasil.twk<3?'TWK':'',hasil.tiu<3?'TIU':'',hasil.tkp<18?'TKP':''].filter(Boolean);
        addLog('Skor SKD: TWK '+hasil.twk+'/5 · TIU '+hasil.tiu+'/5 · TKP '+hasil.tkp+'/25. '+(hasil.lolos?'<b>Lolos ambang batas!</b>':'Tidak lolos ambang batas '+gagalDi.join(' & ')+'.'),hasil.lolos?'good':'bad');
        done(hasil);
      },{diam:true});
    });
  });
}
/* ---------- 2. Wawancara kerja: done(rasio 0..1) ---------- */
function wawancara(posisi,done){
  lembar('WAWANCARA KERJA','Ruang HRD ber-AC dingin. Pewawancara membuka CV-mu: "Jadi Anda melamar posisi <b>'+posisi+'</b>, ya?"',ambil('wawancara',3),h=>done(h.rasio),{diam:true,tombol:'Selesai wawancara »'});
}
/* ---------- 3. Cek fakta: hoax atau fakta ---------- */
function hoax(done){
  const soal=ambil('hoax',4).map(b=>({q:'<i>"'+b.h+'"</i>',o:['Hoax','Fakta'],a:b.fakta?1:0,fix:true,x:b.x}));
  lembar('CEK FAKTA GRUP WA','Grup WA keluarga sedang ramai. Tandai mana yang <b>hoax</b> dan mana yang <b>fakta</b> sebelum ada yang menyebarkannya lagi:',soal,h=>done(h.benar,h.jumlah),{tombol:'Kirim hasil cek fakta »'});
}
/* ---------- 5. SIM: teori 5 soal, lulus jika ≥ 4 benar ---------- */
function sim(done){
  lembar('UJIAN TEORI SIM','Satpas ramai. Komputer ujian teori menyala dengan font kecil. Lulus jika minimal 4 dari 5 benar:',ambil('sim',5),h=>done(h.benar>=4,h.benar));
}
/* SIM lengkap: teori → praktik → (kalau gagal) tawaran "jalur nembak". done('resmi' | 'nembak' | 'gagal') */
function simLengkap(sehat,done){
  sim(lulus=>{
    if(!lulus){ gagal('teori'); return; }
    ask({title:'UJIAN PRAKTIK SIM',text:'Lintasan zig-zag, angka 8, dan putar balik. Kaki tidak boleh menyentuh tanah, cone tidak boleh jatuh. Penguji memegang papan klip dengan wajah datar.',opts:[
      {t:'Pelan, fokus, tarik napas',e:()=>{ if(r()<0.45+sehat/300)resmi(); else gagal('praktik'); }},
      {t:'Ngebut biar cepat selesai',e:()=>{ if(r()<0.22)resmi(); else gagal('praktik'); }}
    ]});
  });
  function resmi(){ addLog('<b>LULUS ujian SIM!</b> Foto di kartunya jelek seperti biasa, tapi didapat dengan jujur.','good'); done('resmi'); }
  function gagal(tahap){
    ask({title:'GAGAL UJIAN SIM',text:'Kamu gagal di ujian '+tahap+'. Seorang "biro jasa" mendekat sambil berbisik: "Mau dibantu? Pasti jadi hari ini."',opts:[
      {t:'Ulang lain waktu, ikut prosedur',e:()=>{ addLog('Kamu pulang dengan tangan kosong, tapi kepala tegak. Coba lagi lain waktu.'); done('gagal'); }},
      {t:'Pakai "jalur nembak"',sub:'Bayar di luar tarif resmi',e:()=>{ addLog('SIM jadi dalam dua jam tanpa ujian ulang. Cepat, mahal, dan sedikit memalukan.','bad'); done('nembak'); }}
    ]});
  }
}
/* ---------- 7. Calon mertua: done(rasio restu 0..1) ---------- */
function mertua(nama,done){
  lembar('BERTEMU CALON MERTUA','Ruang tamu rumah '+nama+'. Calon mertua duduk tegak, teh manis di meja, toples nastar belum dibuka. Pertanyaan bibit-bebet-bobot dimulai:',ambil('mertua',3),h=>done(h.rasio),{diam:true,tombol:'Pamit dengan sopan »'});
}
/* ---------- 6. Tawar-menawar: done(hargaDeal | null) ----------
   penjual punya harga terendah tersembunyi & kesabaran; tawaran terlalu rendah bikin tersinggung */
function tawar(barang,buka,done){
  const batas=Math.round(buka*(0.72+r()*0.16));
  let minta=buka, sabar=2+Math.floor(r()*2), ronde=0;
  const bulat=x=>Math.round(x/50e3)*50e3;
  function putar(pesan){
    ronde++;
    const opsi=[0.6,0.75,0.88].map(f=>bulat(minta*f)).filter((v,i,a)=>a.indexOf(v)===i&&v<minta);
    ask({title:'TAWAR-MENAWAR '+barang.toUpperCase(),text:pesan+'<br><br>Harga yang diminta penjual: <b>'+rp(minta)+'</b>. Mau tawar berapa?',
      opts:opsi.map(v=>({t:'Tawar '+rp(v),sub:Math.round(v/minta*100)+'% dari harga minta',e:()=>coba(v)}))
        .concat([{t:'Ambil di '+rp(minta),e:()=>selesai(minta)},{t:'Tidak jadi beli',e:()=>{ addLog('Kamu pamit. Penjual berteriak "boleh kurang, Mas/Mbak!" saat kamu sudah jauh.'); done(null); }}])});
  }
  function coba(v){
    if(v>=batas){ selesai(v); return; }
    if(v<batas*0.8)sabar-=2; else sabar--;
    if(sabar<=0){ addLog('Penjual tersinggung: "Wah, segitu mah modalnya juga nggak dapat!" Dia menutup lapak, eh, menutup chat.','bad'); done(null); return; }
    minta=Math.max(batas,bulat((minta+v)/2+(minta-v)*0.15));
    putar(v<batas*0.8?'Penjual menghela napas panjang: "Jangan sadis-sadis lah..."':'Penjual menggaruk kepala: "Naik dikit lagi lah, buat beli bensin."');
  }
  function selesai(h){ addLog('Deal! '+barang+' kamu dapatkan seharga <b>'+rp(h)+'</b>'+(h<buka?' (hemat '+rp(buka-h)+' dari harga awal).':'.'),'good'); done(h); }
  putar('Penjual membuka harga dengan senyum lebar penuh strategi.');
}
const api={lembar,ambil,skd,wawancara,hoax,sim,simLengkap,mertua,tawar,BANK};
if(typeof window!=="undefined")window.Kuis=api;
if(typeof globalThis!=="undefined")globalThis.Kuis=api;   /* harness tes (vm) memakai globalThis */
})();
