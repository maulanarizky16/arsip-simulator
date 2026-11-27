'use strict';
/* ================= SEKOLAH & KULIAH =================
   - Lembar soal (form pilihan ganda, maks. 5 soal) untuk belajar ekstra, ujian akhir, tes masuk PTN, UAS, sidang.
   - Nama ujian & jalur masuk menyesuaikan tahun (EBTANAS → UN → AN; UMPTN → SPMB → SNMPTN/SBMPTN → SNBP/SNBT).
   - Kuliah: program (PTN/PTS/D3/luar negeri), jurusan, pop-up tiap semester, KKN, skripsi, sidang, wisuda. */
const MAX_SOAL=5;
const D3_JUR=['teknik','informatika','akuntansi','farmasi','pertanian','komunikasi'];
const PROGRAM={
  ptn:{n:'S1 PTN',biaya:0.7,job:0.06},
  pts:{n:'S1 PTS',biaya:1.3,job:0},
  d3:{n:'D3 Politeknik',biaya:0.6,job:-0.04},
  ln:{n:'S1 Luar Negeri (beasiswa)',biaya:0,job:0.25}
};

/* ---------- era (nama ujian, jalur masuk, beasiswa, kurikulum) ---------- */
function tahunIni(){ return P.lahir+P.age; }
function namaUjianAkhir(level,y){
  if(y===2020)return null;                                   /* dibatalkan karena pandemi */
  if(y>=2021)return 'Asesmen Nasional';
  if(y<=2002)return 'EBTANAS';
  if(level==='SD'){ if(y<=2007)return 'Ujian Akhir Sekolah'; if(y<=2015)return 'UASBN'; return 'USBN'; }
  if(y<=2004)return 'UAN';
  return y>=2015?'UNBK':'Ujian Nasional';
}
function namaSeleksi(y){
  if(y<=2001)return {tes:'UMPTN',rapor:'PMDK'};
  if(y<=2007)return {tes:'SPMB',rapor:'PMDK'};
  if(y<=2012)return {tes:'SNMPTN Tertulis',rapor:'Jalur Undangan'};
  if(y<=2018)return {tes:'SBMPTN',rapor:'SNMPTN'};
  if(y<=2022)return {tes:'UTBK-SBMPTN',rapor:'SNMPTN'};
  return {tes:'UTBK-SNBT',rapor:'SNBP'};
}
function namaBeasiswa(y){ return y<=2009?'Beasiswa PPA':y<=2019?'Bidikmisi':'KIP Kuliah'; }
function namaKurikulum(y){ return y<2004?'Kurikulum 1994':y<2006?'KBK':y<2013?'KTSP':y<2022?'Kurikulum 2013':'Kurikulum Merdeka'; }

/* ---------- pilih soal ---------- */
function kategoriSoal(){
  if(P.kuliah)return 'k_'+P.kuliah.jur;
  if(P.age<12)return 'sd';
  if(P.age<15)return 'smp';
  if(P.age<18)return !P.track?'smp':P.track==='ips'?'sma_ips':P.track==='smk'?'smk':'sma_ipa';
  return 'umum';
}
function kategoriLucu(){ return P.kuliah?'lucu_kuliah':P.age<18?'lucu_sekolah':'lucu_kerja'; }
function ambilSoal(cat,n,lucu){
  const bank=(SOAL[cat]||SOAL.umum).slice();
  P.soalBaru=P.soalBaru||[];
  /* hindari soal yang baru saja keluar */
  const segar=bank.filter(s=>P.soalBaru.indexOf(s.q)<0);
  const pool=(segar.length>=n?segar:bank).sort(()=>r()-0.5);
  const out=pool.slice(0,Math.min(n,MAX_SOAL));
  if(lucu&&out.length>1){ const l=SOAL[kategoriLucu()]; if(l&&l.length)out[out.length-1]=pick(l); }
  for(const s of out){ P.soalBaru.push(s.q); }
  if(P.soalBaru.length>40)P.soalBaru=P.soalBaru.slice(-40);
  return out;
}

/* ---------- LEMBAR SOAL: form pilihan ganda (maks. 5), dikumpulkan sekaligus ----------
   Memakai mesin bersama Kuis.lembar (assets/kuis.js) supaya jawaban terbaca benar & soal kosong ditahan.
   Soal "lucu" tidak dinilai; opsi seperti "Semua di atas" urutannya dikunci agar tetap di bawah.
   done(benar, jumlahSoalNonLucu) */
function lembarSoal(judul,intro,soal,done){
  const siap=soal.slice(0,MAX_SOAL).map(s=>s.o.some(x=>/^Semua/i.test(x))?Object.assign({fix:true},s):s);
  Kuis.lembar(judul,intro,siap,h=>done(h.benar,h.jumlah));
}

/* ---------- BELAJAR EKSTRA (aksi di meja) ---------- */
function belajarSoal(){
  const cat=kategoriSoal();
  const lbl=SOAL_LBL[cat]||'Umum';
  lembarSoal('LATIHAN SOAL '+lbl.toUpperCase(),'Kamu duduk di meja belajar dengan buku '+lbl+'. Kerjakan soal latihan ini:',ambilSoal(cat,3,r()<0.4),(b,n)=>{
    const rasio=n?b/n:0.5;
    if(rasio>=0.99)addLog('Latihan sempurna! Otakmu terasa encer.'+fx({smart:+6,happy:+2}),'good');
    else if(rasio>=0.5)addLog('Lumayan, ada yang masih perlu diulang.'+fx({smart:+4,stress:+1}));
    else addLog('Banyak yang salah, tapi justru dari situ kamu belajar.'+fx({smart:+2,stress:+2}));
    if(P.kuliah){ P.kuliah.bonus=(P.kuliah.bonus||0)+rasio*0.12; }
  });
}

/* ---------- UJIAN AKHIR SD / SMP / SMA ---------- */
function ujianAkhir(level){
  const y=tahunIni(), nama=namaUjianAkhir(level,y);
  P.nilai=P.nilai||{};
  if(!nama){
    P.nilai[level]=0.6;
    addLog('Tahun '+y+': ujian akhir dibatalkan karena pandemi. Kamu lulus lewat nilai rapor, Zoom yang putus-putus, dan doa orang tua.','sys');
    return;
  }
  const cat=level==='SD'?'sd':level==='SMP'?'smp':(P.track==='ips'?'sma_ips':P.track==='smk'?'smk':'sma_ipa');
  const intro='<b>'+nama+' '+y+'</b> ('+namaKurikulum(y)+').'+(nama==='Asesmen Nasional'?' Katanya tidak menentukan kelulusan, tapi tetap deg-degan.':' Pensil 2B sudah diraut, penghapus sudah dicium untuk keberuntungan.');
  lembarSoal(nama.toUpperCase()+' '+level,intro,ambilSoal(cat,5,false),(b,n)=>{
    const rasio=n?b/n:0; P.nilai[level]=rasio;
    if(rasio>=1){ addLog('Nilai sempurna! Namamu diumumkan sebagai lulusan terbaik.'+fx({smart:+6,happy:+6,charm:+3}),'good'); stamp('NILAI TERBAIK','gold'); ach('nilaiSempurna'); }
    else if(rasio>=0.6)addLog('Nilaimu bagus. Orang tua memamerkannya di grup keluarga.'+fx({smart:+3,happy:+3}),'good');
    else addLog('Nilaimu pas-pasan. "Yang penting lulus," kata bapak sambil menghela napas.'+fx({happy:-3,stress:+3}));
  });
}

/* ---------- MASUK KULIAH: jalur sesuai era ---------- */
function masukKuliah(ulang){
  const y=tahunIni(), sel=namaSeleksi(y);
  const nilaiSMA=(P.nilai&&P.nilai.SMA!=null)?P.nilai.SMA:0.5;
  const opts=[];
  if(!ulang||!ulang.rapor)opts.push({t:'Jalur rapor/prestasi ('+sel.rapor+')',sub:'Tanpa tes, dinilai dari rapor & prestasi',cond:()=>P.st.smart>=60,e:()=>{
    const p=0.15+(P.st.smart-60)/80+nilaiSMA*0.25;
    if(r()<p){ addLog('Pengumuman '+sel.rapor+': <b>DITERIMA</b> di PTN! Kamu teriak sampai tetangga ikut keluar rumah.','good'); stamp('LOLOS '+sel.rapor.toUpperCase(),'green'); pilihJurusan('ptn'); }
    else { addLog('Pengumuman '+sel.rapor+': belum berhasil. Layar merah itu akan kamu ingat seumur hidup.'+fx({happy:-5,stress:+4}),'bad'); masukKuliah(Object.assign({},ulang,{rapor:true})); }
  }});
  if(!ulang||!ulang.tes)opts.push({t:'Tes tulis ('+sel.tes+')',sub:'5 soal penalaran, nilai menentukan',e:()=>{
    lembarSoal(sel.tes.toUpperCase(),'Ruang ujian dingin, pengawas berjalan pelan. Kerjakan dengan tenang:',ambilSoal('utbk',5,false),(b,n)=>{
      const rasio=n?b/n:0;
      if(rasio>=0.6||(rasio>=0.4&&r()<0.4+P.st.smart/250)){ addLog('Hasil '+sel.tes+': <b>LOLOS PTN!</b>','good'); stamp('LOLOS PTN','green'); pilihJurusan('ptn'); }
      else { addLog('Hasil '+sel.tes+': belum lolos. Saingannya ratusan ribu orang.'+fx({happy:-5,stress:+5}),'bad'); masukKuliah(Object.assign({},ulang,{tes:true})); }
    });
  }});
  if(!ulang||!ulang.ln)opts.push({t:'Beasiswa kuliah ke luar negeri',sub:'5 soal bahasa Inggris, harus nyaris sempurna',cond:()=>P.st.smart>=80,e:()=>{
    lembarSoal('TES BEASISWA LUAR NEGERI','Wawancara selesai. Tinggal tes bahasa Inggris tertulis:',ambilSoal('inggris',5,false),(b,n)=>{
      if(n&&b>=n-1){ addLog('<b>Kamu lolos beasiswa kuliah ke luar negeri!</b> Paspor, koper, dan air mata keluarga di bandara.','good'); stamp('BEASISWA LUAR NEGERI','gold'); ach('kuliahLN'); pilihJurusan('ln'); }
      else { addLog('Skor bahasa Inggrismu belum cukup untuk beasiswa itu.'+fx({happy:-3}),'bad'); masukKuliah(Object.assign({},ulang,{ln:true})); }
    });
  }});
  opts.push({t:'Kuliah di PTS',sub:'Pasti diterima, biaya lebih mahal',cond:()=>P.kelas!=='miskin'||P.st.smart>=75,e:()=>pilihJurusan('pts')});
  opts.push({t:'Politeknik D3 (vokasi)',sub:'3 tahun, murah, siap kerja',e:()=>pilihJurusan('d3')});
  if(ulang)opts.push({t:'Gap year, coba lagi tahun depan',e:()=>{ P.gapKuliah=true; addLog('Kamu mengambil gap year untuk belajar lagi. Tetangga mulai bertanya "sekarang kerja di mana?"'+fx({stress:+4,smart:+2})); }});
  if(ulang)opts.push({t:'Sudahlah, langsung kerja',e:()=>jobOffers(P.track==='smk'?POOL_SMK:POOL_UMUM,3)});
  ask({title:ulang?'COBA JALUR LAIN':'JALUR MASUK KULIAH',text:(ulang?'Masih ada jalan lain.':'Tahun '+y+'. Seleksi masuk perguruan tinggi dibuka.')+' Mau lewat jalur mana?',opts});
}
function pilihJurusan(prog){
  const pr=PROGRAM[prog], y=tahunIni();
  const miskin=P.kelas==='miskin';
  const beaPrestasi=P.st.smart>=85&&prog==='ptn';
  const beaMiskin=miskin&&prog!=='pts'&&P.st.smart>=60;
  const list=JURUSAN.filter(j=>prog!=='d3'||D3_JUR.indexOf(j.k)>=0);
  ask({title:'PILIH JURUSAN — '+pr.n.toUpperCase(),text:prog==='ln'?'Beasiswa penuh: biaya kuliah & hidup ditanggung. Pilih jurusan:':
      (beaPrestasi?'Nilaimu tinggi: beasiswa prestasi tersedia untuk semua jurusan!':beaMiskin?'Kamu memenuhi syarat <b>'+namaBeasiswa(y)+'</b>. Pilih jurusan:':'Pilih sesuai kemampuan otak dan dompet keluarga:'),
    opts:list.map(j=>{
      const biaya=Math.round(j.biaya*pr.biaya);
      const gratis=prog==='ln'||beaPrestasi||beaMiskin;
      const minS=j.min-(prog==='pts'||prog==='d3'?10:0);
      return {t:j.n,sub:'Min. kecerdasan '+minS+' · '+(prog==='d3'?3:j.lama)+' tahun · '+(gratis?'GRATIS (beasiswa)':rp(biaya)+'/thn'),
        cond:()=>P.st.smart>=minS&&(gratis||P.kelas==='kaya'||(P.kelas==='menengah'&&biaya<=45e6)||(miskin&&biaya<=12e6)),
        e:()=>{
          P.kuliah={jur:j.k,n:j.n,program:prog,mulai:P.age,lama:prog==='d3'?3:j.lama,biaya:gratis?0:biaya,beasiswa:gratis,
            sem:0,ips:[],bonus:0,org:0,magang:0,kerja:0,lomba:0,asdos:0,kkn:false,skripsi:0,joki:false,molor:0};
          P.edu='Mahasiswa '+j.n+' ('+pr.n+')';
          if(prog==='ptn')ach('anakPTN');
          addLog('Kamu resmi mahasiswa <b>'+j.n+'</b> di '+pr.n+(gratis?' dengan beasiswa'+(beaMiskin?' '+namaBeasiswa(y):'')+'. Orang tua menangis bangga.':'.'),'good');
          milestone('Kuliah '+j.n+' ('+pr.n+')'+(gratis?' — beasiswa':''));
          ospek();
        }};
    })});
}
function ospek(){
  const ln=P.kuliah&&P.kuliah.program==='ln';
  ask({title:ln?'MINGGU ORIENTASI KAMPUS':'OSPEK',text:ln?'Hari pertama di negeri orang: cuaca dingin, makanan hambar, semua orang bicara terlalu cepat.':'Kamu diminta memakai papan nama dari kardus, kaus kaki beda warna, dan membawa "air mineral merek yang mengandung huruf R".',opts:[
    {t:ln?'Cari komunitas mahasiswa Indonesia':'Ikuti saja dengan lapang dada',e:()=>addLog(ln?'Komunitas pelajar Indonesia menyambutmu dengan rendang kiriman dan grup WA yang ramai.'+fx({happy:+5,charm:+3}):'Kamu menjalani semuanya. Ternyata dari sini kamu dapat teman-teman pertama di kampus.'+fx({charm:+4,happy:+2}),'good')},
    {t:ln?'Mengurung diri di asrama':'Protes ke senior',e:()=>addLog(ln?'Kamu homesick berat seminggu penuh.'+fx({happy:-5,stress:+5}):'Senior mencatat namamu dengan tatapan dingin. Kamu terkenal di angkatan, entah baik atau buruk.'+fx({charm:+2,stress:+3}))}
  ]});
}

/* ---------- KULIAH TAHUNAN: dua semester per tahun ---------- */
function kuliahTahunan(a){
  const k=P.kuliah; if(!k||a<=k.mulai)return;
  if(k.ips==null){ k.ips=[]; k.sem=k.sem||0; k.bonus=0; }        /* simpanan lama */
  semesterKuliah(k.sem+1);
  semesterKuliah(k.sem+2);
}
const FOKUS=[
  {k:'ipk',t:'Kejar IPK (kuliah-pulang)',sub:'IP naik, sosial kurang',ip:+0.35,fx:{smart:+3,charm:-2,happy:-2}},
  {k:'org',t:'Organisasi / BEM / himpunan',sub:'Relasi & karisma, IP agak turun',ip:-0.1,fx:{charm:+6,relasi:+5,stress:+4}},
  {k:'magang',t:'Magang',sub:'Pengalaman kerja & uang saku',ip:-0.05,min:5,fx:{smart:+3,money:+4e6,stress:+3}},
  {k:'kerja',t:'Kerja part-time',sub:'Uang tambahan, IP turun',ip:-0.2,fx:{money:+8e6,stress:+5,health:-2}},
  {k:'lomba',t:'Ikut lomba / PKM',sub:'Peluang prestasi',ip:+0.05,fx:{smart:+4,stress:+3}},
  {k:'asdos',t:'Jadi asisten dosen',sub:'Butuh otak encer',ip:+0.15,min:3,need:70,fx:{smart:+3,money:+2e6,charm:+2}},
  {k:'santai',t:'Santai, nikmati masa muda',sub:'Bahagia, IP anjlok',ip:-0.3,fx:{happy:+8,stress:-6}}
];
function semesterKuliah(no){
  const k=P.kuliah; if(!k)return;
  const total=k.lama*2;
  const s1=k.program!=='d3'&&k.program!=='ln';
  /* semester khusus */
  if(s1&&no===6&&!k.kkn){ kkn(no); return; }
  if(no===total-1&&!k.skripsi){ skripsi(no); return; }
  if(no>=total){ sidang(no); return; }
  ask({title:'SEMESTER '+no+' — '+k.n.toUpperCase(),text:'Semester '+no+' dimulai. IPK sementara: <b>'+ipk(k).toFixed(2)+'</b>. Semester ini mau fokus ke mana?',
    opts:FOKUS.filter(f=>(!f.min||no>=f.min)&&(!f.need||P.st.smart>=f.need)).map(f=>({t:f.t,sub:f.sub,e:()=>{
      k[f.k]=(k[f.k]||0)+1;
      const teks={ipk:'Kamu jadi mahasiswa kupu-kupu: kuliah-pulang, kuliah-pulang.',org:'Rapat sampai larut, proker di mana-mana, namamu dikenal satu fakultas.',magang:'Kamu magang di perusahaan. Kerjaannya fotokopi, tapi CV-mu bersinar.',
        kerja:'Kamu kerja part-time demi uang tambahan. Tugas dikerjakan di sela shift.',lomba:'Kamu ikut lomba dan program kreativitas mahasiswa.',asdos:'Kamu jadi asisten dosen. Adik tingkat memanggilmu "Kak" dengan hormat.',santai:'Nongkrong, nonton, tidur siang. IPK? Urusan nanti.'}[f.k];
      addLog('Semester '+no+': '+teks+fx(f.fx));
      if(f.k==='lomba'&&r()<0.35+P.st.smart/300){ addLog('Timmu <b>juara lomba tingkat nasional!</b> Fotomu dipajang di spanduk kampus.'+fx({charm:+5,happy:+6}),'good'); stamp('JUARA LOMBA','gold'); ach('juaraLomba'); k.juara=true; }
      if(f.k==='org'&&k.org>=3)ach('aktivisKampus');
      uas(no,f.ip);
    }})).concat(P.st.stress>=75||P.money<-5e6?[{t:'Berhenti kuliah',sub:'Sudah tidak sanggup',e:()=>berhentiKuliah()}]:[])});
}
function ipk(k){ return k.ips.length?k.ips.reduce((a,b)=>a+b,0)/k.ips.length:0; }
function uas(no,modFokus){
  const k=P.kuliah; if(!k)return;
  lembarSoal('UAS SEMESTER '+no,'Minggu UAS. Kopi sachet, fotokopi catatan teman, dan sistem kebut semalam:',ambilSoal('k_'+k.jur,3,r()<0.3),(b,n)=>{
    const rasio=n?b/n:0.5;
    let ip=1.6+P.st.smart/100*1.8+modFokus+(rasio-0.5)*0.6+(k.bonus||0)+(r()*0.24-0.12);
    ip=+clamp(ip,0.5,4).toFixed(2); k.bonus=0;
    k.ips.push(ip); k.sem=no;
    addLog('IP semester '+no+': <b>'+ip.toFixed(2)+'</b> · IPK '+ipk(k).toFixed(2)+'.',ip>=3.5?'good':ip<2.5?'bad':'');
    if(ip<2)addLog('Dosen wali memanggilmu. "Kalau begini terus, kamu bisa kena DO."'+fx({stress:+6}),'bad');
  });
}
function kkn(no){
  const k=P.kuliah; k.kkn=true;
  ask({title:'KKN DI DESA',text:'Semester '+no+': saatnya KKN. Kamu dikirim ke desa terpencil bersama 9 orang yang baru kamu kenal. Program kerja utamamu?',opts:[
    {t:'Pasang plang nama jalan',e:()=>addLog('Plang nama jalan terpasang rapi. Setahun kemudian dipakai warga untuk jemuran.'+fx({happy:+3,charm:+2}))},
    {t:'Pelatihan UMKM jualan online',e:()=>addLog('Ibu-ibu desa kini punya toko online. Salah satunya laku keras jualan keripik pisang.'+fx({charm:+4,smart:+3,happy:+4}),'good')},
    {t:'Mengajar anak-anak desa',e:()=>addLog('Anak-anak desa menangis waktu kamu pamit. Kamu juga.'+fx({happy:+8,charm:+3}),'good')},
    {t:'Cinta lokasi',e:()=>{ if(!P.love&&r()<0.5)addLog('Ada yang berdebar di posko KKN. Tapi seperti kata pepatah: cinlok berakhir saat KKN berakhir.'+fx({happy:+8})); else addLog('Kamu menyaksikan cinlok teman-temanmu dari kursi penonton. Drama terbaik semester ini.'+fx({happy:+4})); }}
  ]});
  uas(no,0);
}
function skripsi(no){
  const k=P.kuliah;
  ask({title:'SKRIPSI: JUDUL DITOLAK',text:'Semester '+no+'. Judul skripsimu ditolak dosen pembimbing untuk ketiga kalinya: "Kurang novelty." Apa langkahmu?',opts:[
    {t:'Revisi & bimbingan rutin',sub:'Melelahkan tapi pasti',e:()=>{ k.skripsi=2; addLog('Kamu menunggu dosen di depan ruangannya berjam-jam tiap minggu. Pelan-pelan, bab demi bab disetujui.'+fx({stress:+6,smart:+4})); }},
    {t:'Ganti topik yang "aman"',e:()=>{ k.skripsi=1; addLog('Kamu mengambil topik yang sudah diteliti 200 kakak tingkat. Disetujui dalam sehari.'+fx({happy:+2,smart:+1})); }},
    {t:'Pakai jasa joki skripsi',sub:'Rp 5 jt, cepat, berisiko',e:()=>{ k.skripsi=1; k.joki=true; P.integritas=clamp((P.integritas||60)-15,0,100); addLog('Skripsimu "selesai" dalam sebulan. Kamu belum membacanya sama sekali.'+fx({money:-5e6,stress:-3}),'bad'); }},
    {t:'Tunda dulu, fokus hal lain',e:()=>{ k.skripsi=0; addLog('Skripsi kamu tinggalkan sementara. Grup angkatan mulai sepi karena satu per satu wisuda.'+fx({happy:+3,stress:+3})); }}
  ]});
  uas(no,0);
}
/* sidang dinilai saat pemain masuk ruangan (setelah pilihan skripsi diambil di pop-up sebelumnya) */
function sidang(no){
  ask({title:'JADWAL SIDANG SKRIPSI',text:'Semester '+no+'. Jadwal sidang sudah keluar. Kemeja putih disetrika, slide presentasi dicek untuk ke-20 kalinya.',
    opts:[{t:'Masuk ruang sidang »',e:()=>sidangMulai(no)}]});
}
function sidangMulai(no){
  const k=P.kuliah; if(!k)return;
  if(!k.skripsi){
    if(k.molor<2){ k.molor++; k.lama++; addLog('Skripsimu belum rampung. Masa kuliah <b>molor</b> setahun. Kamu resmi jadi mahasiswa tingkat akhir yang "masih berjuang".'+fx({stress:+6,happy:-4}),'bad'); if(k.molor>=2)ach('mahasiswaAbadi'); k.skripsi=1; uas(no,0); return; }
    k.skripsi=1;
  }
  lembarSoal('SIDANG SKRIPSI','Tiga dosen penguji menatapmu. "Silakan jelaskan, lalu jawab pertanyaan kami:"',ambilSoal('k_'+k.jur,2,false),(b,n)=>{
    if(k.joki&&r()<0.35){ addLog('Penguji bertanya hal dasar dari skripsimu sendiri, dan kamu tidak bisa menjawab. Wajah pembimbingmu memerah. Kamu lulus dengan revisi besar dan reputasi tercoreng.'+fx({stress:+10,charm:-4}),'bad'); }
    else if(n&&b===n)addLog('Sidang lancar! Penguji mengangguk puas: "Lulus tanpa revisi."'+fx({happy:+8,smart:+3}),'good');
    else addLog('Sidang lumayan tegang. Kamu lulus dengan "revisi minor" sebanyak 34 halaman.'+fx({stress:+4,happy:+3}));
    wisuda();
  });
}
function predikat(i,d3){ return i>=3.51?'Cumlaude':i>=3.01?'Sangat Memuaskan':i>=2.76?'Memuaskan':'Lulus'; }
function wisuda(){
  const k=P.kuliah; if(!k)return;
  const nilai=+clamp(ipk(k)||2.5,2,4).toFixed(2), pr=PROGRAM[k.program]||PROGRAM.pts, pred=predikat(nilai);
  P.ipk=nilai; P.eduLevel=4; P.jur=k.jur;
  P.edu=(k.program==='d3'?'D3 ':'S1 ')+k.n+' (IPK '+nilai.toFixed(2)+')';
  stamp('WISUDA'); milestone('Wisuda '+(k.program==='d3'?'D3 ':'S1 ')+k.n+' — IPK '+nilai.toFixed(2)+' ('+pred+')');
  if(pred==='Cumlaude'){ ach('cumlaude'); stamp('CUMLAUDE','gold'); }
  addLog('Toga dipakai, foto keluarga di depan baliho kampus. Kamu resmi '+(k.program==='d3'?'Ahli Madya':'sarjana')+' dengan predikat <b>'+pred+'</b>!','good');
  const mult=1+(nilai-3)*0.12+(k.magang?0.05:0)+(k.org?0.03:0)+(k.juara?0.04:0)+pr.job;
  const jur=k.jur; P.kuliah=null;
  jobOffers((KARIER[jur]||KARIER.ekonomi).concat([['Staf admin kantor',48e6]]),3,mult);
}
function berhentiKuliah(){
  const k=P.kuliah; if(!k)return;
  milestone('Berhenti kuliah ('+k.n+', semester '+(k.sem||0)+')');
  addLog('Kamu memutuskan berhenti kuliah. Berat, tapi kamu tahu batasmu. Ijazah SMA kembali jadi andalan.'+fx({stress:-10,happy:-4}),'bad');
  P.kuliah=null; P.edu='Kuliah tidak selesai';
  jobOffers(P.track==='smk'?POOL_SMK:POOL_UMUM,2);
}
