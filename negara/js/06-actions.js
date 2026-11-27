'use strict';
/* ================= AKSI ================= */
const TABS=[['diri','DIRI'],['gerakan','GERAKAN'],['politik','POLITIK'],['kebijakan','KEBIJAKAN'],['siasat','SIASAT'],['uang','UANG']];
const ACTS=[
/* ---- DIRI ---- */
{k:'olahraga',tab:'diri',lbl:'Jaga kebugaran',sub:'Kesehatan +3',e:()=>addLog('Anda rutin lari pagi — sekalian sapa warga.'+fx({kesehatan:+3,popularitas:+1}))},
{k:'rehat',tab:'diri',lbl:'Rehat sejenak',sub:'Stres −8',e:()=>addLog('Anda menghilang sejenak dari sorotan, mengisi ulang tenaga.'+fx({stres:-8}))},
{k:'kuliah',tab:'diri',lbl:'Sekolah lagi (S2/S3)',sub:'Lanjut jenjang — butuh waktu & biaya',cond:()=>!P.study&&!P.penjara&&(P.edu==='S1'||P.edu==='S2'),e:()=>{
  const next=P.edu==='S1'?{t:'S2',lama:2,biaya:80e6,komp:8}:{t:'S3',lama:3,biaya:150e6,komp:12};
  ask({title:'SEKOLAH LAGI',text:'Lanjut studi <b>'+next.t+'</b>? Perlu <b>'+next.lama+' tahun</b> & '+rp(next.biaya)+'. Selama studi Anda tetap berpolitik; gelar baru cair saat lulus.',opts:[
    {t:'Daftar program '+next.t,sub:rp(next.biaya)+' · '+next.lama+' tahun',cond:()=>P.money>=next.biaya,e:()=>{
      P.money-=next.biaya; P.study={target:next.t,sisa:next.lama,komp:next.komp};
      addLog('Anda resmi mahasiswa <b>'+next.t+'</b> lagi. '+next.lama+' tahun ke depan dijalani sambil berpolitik.'+fx({stres:+3}),'sys');
      milestone('Mulai studi '+next.t);}},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'medsos',tab:'diri',get lbl(){ return N&&N.tahun<2010?'Rawat citra di media lokal':'Rawat media sosial'; },sub:'Popularitas +2',e:()=>addLog(N.tahun<2010?'Anda rajin mengirim rilis dan foto kegiatan ke koran & radio lokal.'+fx({popularitas:+2}):'Konten Anda hari ini: makan di warteg, dipotret 12 kamera.'+fx({popularitas:+2}))},
{k:'nikah',tab:'diri',lbl:'Menikah',sub:'Membangun keluarga',cond:()=>!P.keluarga&&P.age>=25,e:()=>{
  P.keluarga=true;
  addLog('Anda menikah. Pasangan Anda berjanji tabah mendampingi dunia yang keras ini.'+fx({stres:-5,popularitas:+3}),'good');
  milestone('Menikah');}},
{k:'wkeluarga',tab:'diri',lbl:'Waktu untuk keluarga',sub:'Stres −6',cond:()=>P.keluarga,e:()=>addLog('Sehari penuh tanpa rapat, tanpa wartawan. Hanya keluarga.'+fx({stres:-6,kesehatan:+1}))},
{k:'ibadah',tab:'diri',lbl:'Ziarah & ibadah',sub:'Menjernihkan hati',e:()=>addLog('Anda beribadah dan berziarah, jauh dari kamera. Hati terasa lebih ringan.'+fx({stres:-5,integritas:+1}))},
{k:'pensiun',tab:'diri',lbl:'Pensiun dari politik',sub:'Menepi selamanya',cond:()=>P.age>=55&&!P.retired&&!P.jab,e:()=>{
  ask({title:'GANTUNG JAS?',text:'Menepi dari gelanggang untuk selamanya. Yakin?',opts:[
    {t:'Ya, sudah cukup',e:()=>{P.retired=true;addLog('Anda menyatakan pensiun dari politik. Tinggal menulis memoar dan menyiram tanaman.'+fx({stres:-15}));milestone('Pensiun dari politik');}},
    {t:'Belum — darah politik masih mendidih',e:()=>{}}
  ]});}},
{k:'bukuLapas',tab:'diri',lbl:'Menulis dari balik jeruji',sub:'Buku dari lapas',lapas:true,cond:()=>P.penjara>0,e:()=>{
  addLog('Buku Anda dari dalam lapas terbit dan jadi perbincangan.'+fx({popularitas:+6,kompetensi:+2}),'good');ach('penulis');}},
{k:'tobat',tab:'diri',lbl:'Merenung & berbenah',sub:'Refleksi di lapas',lapas:true,cond:()=>P.penjara>0,e:()=>
  addLog('Di sel sempit, Anda menata ulang hidup.'+fx({integritas:+4,stres:-5}))},
{k:'remisi',tab:'diri',lbl:'Berkelakuan baik',sub:'Kejar remisi resmi',lapas:true,cond:()=>P.penjara>0,e:()=>{
  if(r()<0.4){P.penjara=Math.max(0,P.penjara-1);
    addLog('Catatan kelakuan baik Anda berbuah remisi resmi — masa tahanan berkurang setahun.'+fx({integritas:+2}),'good');
    if(P.penjara<=0){stamp('BEBAS','green');milestone('Bebas (remisi resmi)');}}
  else addLog('Anda menjalani hari-hari di sel dengan tertib. Belum ada remisi tahun ini.'+fx({stres:-2}));}},
{k:'suapBebas',tab:'diri',lbl:'Suap untuk bebas cepat',sub:'Rp 5 M gelap · berisiko ditambah hukuman',lapas:true,cond:()=>P.penjara>0&&P.money+P.gelap>=5e9,e:()=>{
  const c=5e9, dg=Math.min(P.gelap,c); P.gelap-=dg; P.money-=(c-dg);
  if(r()<0.55){
    const potong=Math.min(P.penjara, ri(2,4)); P.penjara=Math.max(0,P.penjara-potong);
    addLog('Lewat "jalur khusus", masa tahanan Anda dipangkas '+potong+' tahun — remisi yang tak tertulis di buku peraturan.'+fx({integritas:-6,heat:+4}),'bad');
    if(P.penjara<=0){addLog('<b>Anda bebas lebih cepat.</b> Mobil sudah menunggu di gerbang lapas.','good');stamp('BEBAS','green');milestone('Bebas via jalur khusus');}
  } else {
    P.penjara+=ri(1,3);
    addLog('Upaya suap Anda terbongkar — bukan diringankan, hukuman justru <b>ditambah</b>. Serakah berujung lebih lama di sel.'+fx({heat:+8,integritas:-4}),'bad');}}},
/* ---- GERAKAN ---- */
{k:'demo',tab:'gerakan',lbl:'Turun ke jalan',sub:'Suarakan kemarahan publik',cond:()=>lvNow()<=1&&!P.retired,e:()=>{
  P.cDemo++;
  const gain=Math.round(4*((100-N.mood)/60+0.5));
  addLog('Anda di barisan depan demonstrasi, toa di tangan.'+fx({popularitas:+gain,pengaruh:+2,stres:+5}),'good');
  leg(3,-2);
  if(N.kebebasan<42&&r()<0.35){
    addLog('Anda ditangkap aparat dan ditahan beberapa minggu dengan pasal karet.'+fx({stres:+8,popularitas:+5}),'bad');
    P.tapol=true; ach('tapol'); milestone('Ditahan karena demonstrasi'); leg(4,-6);
  }}},
{k:'ekspos',tab:'gerakan',lbl:'Investigasi korupsi',sub:'Bongkar permainan pejabat',cond:()=>!P.retired,e:()=>{
  P.cEkspos++;
  if(r()<0.3+P.st.kompetensi/250){
    addLog('Investigasi Anda membongkar permainan anggaran. Beberapa pejabat terseret.'+fx({popularitas:+8,heat:+4})+nx({korupsi:-2,mood:+2}),'good');
    leg(4,-3);
  } else addLog('Jejak dokumen menguap, saksi kunci bungkam. Investigasi mentok.'+fx({stres:+4}));}},
{k:'opini',tab:'gerakan',lbl:'Tulis opini media',sub:'Bangun wacana publik',e:()=>
  addLog('Opini Anda tayang di koran nasional dan dikutip ke mana-mana.'+fx({popularitas:+3,kompetensi:+1}))},
{k:'advokasi',tab:'gerakan',lbl:'Dampingi warga tergusur',sub:'Advokasi akar rumput',cond:()=>!P.retired,e:()=>{
  addLog('Anda mendampingi warga melawan penggusuran. Mereka mengingat siapa yang datang.'+fx({integritas:+2,popularitas:+4}),'good');leg(3,-1);}},
{k:'petisi',tab:'gerakan',lbl:'Galang petisi nasional',sub:'Tekanan publik terorganisir',cond:()=>!P.retired,e:()=>{
  if(r()<0.4){addLog('Petisi Anda tembus sejuta tanda tangan — pemerintah terpaksa merespons.'+fx({popularitas:+5})+nx({kebebasan:+2,mood:+2}),'good');leg(3,-1);}
  else addLog('Petisi Anda tenggelam di linimasa, kalah oleh gosip artis.'+fx({stres:+2}));}},
{k:'lsm',tab:'gerakan',lbl:'Dirikan LSM',sub:'Rp 50 jt · basis gerakan permanen',cond:()=>!P.lsm&&P.money>=50e6,e:()=>{
  P.lsm=true;P.money-=50e6;
  addLog('LSM Anda berdiri — kantor kecil, semangat besar. Nama Anda kian dikenal tiap tahun.','good');
  ach('lsm');milestone('Mendirikan LSM');}},
{k:'whistle',tab:'gerakan',lbl:'Bongkar skandal besar',sub:'Jadi peniup peluit · berisiko',cond:()=>(P.st.pengaruh>=35||P.maxLv>=1)&&!P.retired,e:()=>{
  P.cWhistle++;
  addLog('Anda membocorkan dokumen skandal kelas kakap ke publik. Negeri gempar.'+fx({popularitas:+12,heat:+10,stres:+8})+nx({korupsi:-4,mood:+3}),'good');
  leg(6,-6); milestone('Membongkar skandal besar');}},
/* ---- POLITIK ---- */
{k:'gabung',tab:'politik',lbl:'Gabung partai',sub:'Tiket masuk gelanggang',cond:()=>!P.partai&&!P.retired,e:()=>{
  ask({title:'PILIH KENDARAAN POLITIK',text:'Setiap partai punya mesin dan harga. Pilih rumah Anda:',
    opts:PARTAI.map(pt=>{const mesin=ri(35,75);return {t:pt.n,sub:'Basis '+pt.w+' · mesin partai '+mesin+'/100',e:()=>{
      P.partai={n:pt.n,dukungan:30,mesin};
      addLog('Anda resmi berkartu anggota <b>'+pt.n+'</b>. Selamat datang di rimba.','good');
      milestone('Bergabung dengan '+pt.n);}}})
    .concat([{t:'Batal',e:()=>{}}])});}},
{k:'loyal',tab:'politik',lbl:'Rajin acara partai',sub:'Dukungan partai +6',cond:()=>!!P.partai,e:()=>
  addLog('Anda hadir di semua acara partai, duduk manis, bertepuk tangan di saat yang tepat.'+fx({pengaruh:+1})+' <span class="d">(Dukungan partai +6)</span>',(P.partai.dukungan=clamp(P.partai.dukungan+6,0,100),undefined))},
{k:'mahar',tab:'politik',lbl:'Setor "mahar politik"',sub:'Rp 2 M · dukungan partai +18',cond:()=>!!P.partai&&P.money+P.gelap>=2e9,e:()=>{
  const c=2e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);
  P.partai.dukungan=clamp(P.partai.dukungan+18,0,100);
  addLog('Koper diserahkan di ruang tertutup. Tiba-tiba nama Anda naik di bursa pencalonan.'+fx({integritas:-5,heat:+4}),'bad');}},
{k:'basis',tab:'politik',lbl:'Turun ke akar rumput',sub:'Blusukan, pasar, posyandu',cond:()=>!P.retired,e:()=>{
  addLog('Anda blusukan ke pasar dan gang sempit. Salaman ribuan kali, makan di warung warga.'+fx({popularitas:+4,kesehatan:-1}),'good');leg(2,0);}},
{k:'lobi',tab:'politik',lbl:'Lobi para elite',sub:'Makan malam tertutup',cond:()=>!P.retired,e:()=>
  addLog('Makan malam di restoran mahal bersama orang-orang yang fotonya jarang muncul di koran.'+fx({pengaruh:+4,integritas:-1,stres:+2}))},
{k:'koalisiLobi',tab:'politik',lbl:'Galang koalisi parlemen',sub:'Perkuat dukungan DPR',cond:isPres,e:()=>{
  ask({title:'GALANG KOALISI',text:'Koalisi Anda di parlemen: <b>'+N.koalisi+'/100</b>. Makin kuat, makin mulus kebijakan lolos. Caranya?',opts:[
    {t:'Lobi & kompromi politik',sub:'Pengaruh −, koalisi +',e:()=>{N.koalisi=clamp(N.koalisi+ri(6,12),0,100);
      addLog('Anda berkeliling menemui ketua-ketua fraksi. Beberapa kompromi diteken, beberapa idealisme dikorbankan.'+fx({pengaruh:-3,stres:+3}),'sys');leg(0,1);}},
    {t:'Bagi-bagi kursi & proyek',sub:'Rp 3 M gelap · koalisi naik banyak',cond:()=>P.gelap>=3e9||P.money>=3e9,e:()=>{const c=3e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);
      N.koalisi=clamp(N.koalisi+ri(12,20),0,100);
      addLog('Kursi komisaris BUMN dan jatah proyek dibagi ke partai koalisi. Mereka mendadak sangat loyal.'+fx({integritas:-5,heat:+4})+nx({korupsi:+1}),'bad');leg(-3,1);}},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'persBina',tab:'politik',lbl:'Bina hubungan pers',sub:'Konferensi pers rutin, akses terbuka',cond:()=>!!P.jab,e:()=>{
  N.pers=clamp(N.pers+ri(6,12),0,100);
  addLog('Anda rutin menggelar konferensi pers dan membuka akses ke wartawan. Liputan jadi lebih bersahabat.'+fx({popularitas:+2}),'good');}},
{k:'persTekan',tab:'siasat',lbl:'Tekan media kritis',sub:'Kuasai narasi · gerus kebebasan',cond:()=>!!P.jab&&P.st.pengaruh>=45,e:()=>{
  N.pers=clamp(N.pers+ri(10,16),0,100);
  addLog('Lewat tekanan ke pemilik media dan iklan negara, liputan miring meredup. Ruang kritik ikut menyempit.'+fx({pengaruh:+2,integritas:-5})+nx({kebebasan:-3,demokrasi:-2}),'bad');leg(-3,1);}},
{k:'maju',tab:'politik',lbl:'MAJU PEMILU',sub:'Hanya di tahun politik',cond:()=>isPemilu()&&!!P.partai&&!P.retired&&P.penjara<=0,e:()=>kampanye()},
{k:'mundur',tab:'politik',lbl:'Mundur dari jabatan',sub:'Letakkan mandat',cond:()=>!!P.jab,e:()=>{
  ask({title:'LETAKKAN MANDAT?',text:'Mundur dari '+JAB[P.jab.k].n+'. Yakin?',opts:[
    {t:'Mundur demi prinsip',e:()=>{endJab('mengundurkan diri');addLog('Surat pengunduran diri Anda jadi berita utama. Sebagian menyebut Anda ksatria.'+fx({integritas:+5,popularitas:+3}));leg(3,-2);}},
    {t:'Batal',e:()=>{}}
  ]});}},
/* ---- KEBIJAKAN: UMUM (semua pejabat) ---- */
{k:'berantas',tab:'kebijakan',lbl:'Bersihkan institusi dari korupsi',sub:'Tindak permainan di lingkup Anda',cond:()=>!!P.jab,e:()=>{
  P.bersihAksi++;
  if(r()<0.45+P.st.integritas/250){
    addLog('Anda menggeledah dan menindak permainan anggaran di institusi sendiri. Beberapa anak buah jadi tersangka — sebagian membenci Anda diam-diam.'+fx({popularitas:+5,integritas:+4,pengaruh:-4})+nx({korupsi:-3,mood:+2}),'good');leg(5,3);
  } else {
    addLog('Upaya bersih-bersih Anda dijegal — berkas raib, saksi kunci dimutasi. "Sistem" ternyata lebih kuat dari niat.'+fx({stres:+5,pengaruh:-2}),'bad');leg(1,0);
  }}},
/* ---- KEBIJAKAN: LEGISLATIF ---- */
{k:'ruuRakyat',tab:'kebijakan',lbl:'Perjuangkan RUU pro-rakyat',sub:'Perlindungan publik',cond:isLeg,e:()=>{
  if(r()<0.3+P.st.pengaruh/200){
    addLog('Setelah lobi panjang, RUU yang Anda kawal disahkan. Buruh dan petani bersorak.'+fx({popularitas:+6,pengaruh:-3})+nx({mood:+4,kemiskinan:-0.4}),'good');leg(6,1);
  } else addLog('RUU Anda dijegal di rapat tertutup — "belum masuk prioritas".'+fx({stres:+5}),'bad');}},
{k:'ruuTitipan',tab:'kebijakan',lbl:'Loloskan RUU titipan',sub:'Pesanan para pemodal',cond:isLeg,e:()=>{
  addLog('Pasal-pasal pesanan lolos di pengujung malam, saat publik tertidur.'+fx({pengaruh:+6,integritas:-7,gelap:+ri(2,5)*1e9,heat:+6})+nx({mood:-4,kebebasan:-2}),'bad');
  leg(-6,3);}},
{k:'aspirasi',tab:'kebijakan',lbl:'Kelola dana aspirasi',sub:'Anggaran untuk dapil',cond:isLeg,e:()=>{
  ask({title:'DANA ASPIRASI CAIR',text:'Dana aspirasi dapil Anda cair. Mau diapakan?',opts:[
    {t:'Salurkan penuh ke program warga',e:()=>{addLog('Jalan desa diaspal, posyandu direnovasi. Warga dapil menyebut nama Anda dengan hangat.'+fx({popularitas:+5})+nx({mood:+2,infra:+1}),'good');leg(4,1);}},
    {t:'Sunat 40% untuk "operasional"',e:()=>{addLog('Proyek tetap jalan — kualitasnya saja yang menyusut, seperti nurani Anda.'+fx({gelap:+900e6,integritas:-8,heat:+7}),'bad');leg(-4,0);}}
  ]});}},
{k:'interpelasi',tab:'kebijakan',lbl:'Interpelasi pemerintah',sub:'Kritik keras dari podium',cond:()=>isLeg()&&!isPres(),e:()=>{
  addLog('Pidato interpelasi Anda viral — pemerintah kebakaran jenggot.'+fx({popularitas:+5,pengaruh:-2}),'good');leg(3,-3);}},
{k:'studi',tab:'kebijakan',lbl:'Studi banding ke Eropa',sub:'"Belajar" pakai uang negara',multi:true,cond:isLeg,e:()=>{
  const narasi=pick([
    'Dua minggu "studi banding" di Eropa. Oleh-olehnya: foto-foto di depan menara, dan laporan setebal dua halaman dengan margin sangat lebar.',
    'Anda terbang ke Skandinavia untuk "belajar transparansi". Yang dibawa pulang: tas branded, bukan kebijakannya.',
    'Studi banding pengelolaan sampah di kota yang sudah Anda kunjungi dua tahun lalu. Konsistensi adalah kunci.'
  ]);
  addLog(narasi+fx({stres:-8,popularitas:-3,integritas:-3})+nx({kas:-1}),'bad');leg(-3,0);}},
/* ---- KEBIJAKAN: KEPALA DAERAH (acuan = indikator daerah) ---- */
{k:'bangunDa',tab:'kebijakan',lbl:'Bangun infrastruktur daerah',sub:'Jalan, pasar, transportasi wilayah',cond:isKepda,e:()=>{
  const D=P.jabData.daerah, m=need(D.infra);
  addLog('Proyek jalan dan pasar rakyat dikebut di '+P.jabData.wilayah+'.'+fx({popularitas:+Math.round(3*m)})+dx({infra:+6,kepuasan:+3})+nx({kas:-15,infra:+1}),'good');leg(Math.round(3*m),3);}},
{k:'ekonomiDa',tab:'kebijakan',lbl:'Bangun sentra ekonomi daerah',sub:'UMKM, pasar induk, lapangan kerja lokal',cond:isKepda,e:()=>{
  const D=P.jabData.daerah, m=need(D.ekonomi);
  addLog('Sentra UMKM dan kawasan usaha baru dibuka di wilayah Anda. Lapangan kerja lokal bertambah.'+fx({popularitas:+Math.round(3*m)})+dx({ekonomi:+6,kepuasan:+2})+nx({kas:-20,pengangguran:-0.4}),'good');leg(Math.round(3*m),3);}},
{k:'bansosDa',tab:'kebijakan',lbl:'Program bansos & kesejahteraan',sub:'Jaring pengaman warga daerah',cond:isKepda,e:()=>{
  const D=P.jabData.daerah, m=need(D.sejahtera);
  addLog('Beras dan bantuan tunai mengalir ke kantong-kantong kemiskinan di '+P.jabData.wilayah+'.'+fx({popularitas:+Math.round(3*m)})+dx({sejahtera:+5,kepuasan:+3})+nx({kas:-10,kemiskinan:-0.2}),'good');leg(Math.round(4*m),1);}},
{k:'layananDa',tab:'kebijakan',lbl:'Perkuat layanan publik daerah',sub:'Puskesmas, sekolah, administrasi',cond:isKepda,e:()=>{
  const D=P.jabData.daerah, m=need(D.layanan);
  addLog('Puskesmas dan sekolah daerah dibenahi, layanan administrasi dipercepat.'+fx({popularitas:+Math.round(3*m)})+dx({layanan:+6,kepuasan:+2})+nx({kas:-18}),'good');leg(Math.round(3*m),2);}},
{k:'apbdProyek',tab:'kebijakan',lbl:'Ajukan APBD: proyek daerah',sub:'Wisata, jalan, RSUD, pasar, irigasi, dll',cond:()=>isKepda()&&!!(P.jabData&&P.jabData.daerah),e:()=>{
  ask({title:'APBD — PROYEK DAERAH',text:'Pagu APBD '+P.jabData.wilayah+': <b>'+rpT(P.jabData.apbd)+'</b>. Pilih proyek (yang dananya cukup):',
    opts:PROYEK_DA.map(p=>({t:p.n,sub:rpT(p.biaya)+' · '+efekRingkasD(p.efek),cond:()=>P.jabData.apbd>=p.biaya,e:()=>bangunProyekDa(p)}))
      .concat([{t:'Batal',e:()=>{}}])});}},
{k:'mintaTransfer',tab:'kebijakan',lbl:'Minta tambahan transfer pusat',sub:'Lobi DAU/DAK untuk menambah pagu APBD',cond:isKepda,e:()=>{
  const chance=clamp(0.45+P.st.pengaruh/300+N.koalisi/500,0.1,0.9);
  if(r()<chance){
    const tambah=P.jab.k==='gubernur'?ri(10,25):ri(4,10);
    P.jabData.apbd=+((P.jabData.apbd||0)+tambah).toFixed(1);
    addLog('Lobi Anda ke kementerian keuangan berbuah: tambahan transfer <b>'+rpT(tambah)+'</b> masuk ke pagu APBD daerah.'+fx({pengaruh:-2,stres:+2}),'good');
  } else addLog('Pengajuan tambahan transfer ditolak pusat — "fiskal nasional sedang ketat," katanya.'+fx({stres:+3}),'bad');}},
{k:'izinTambang',tab:'kebijakan',lbl:'Permohonan izin tambang',sub:'Investor menunggu tanda tangan',cond:isKepda,e:()=>{
  ask({title:'MAP MERAH DI MEJA',text:'Perusahaan tambang mengajukan izin di hutan lindung. Di dalam map, ada amplop tebal.',opts:[
    {t:'Tolak — lindungi lingkungan',e:()=>{addLog('Anda menolak dan mengembalikan amplopnya. Investor pindah ke daerah sebelah sambil mengumpat.'+fx({integritas:+5,pengaruh:-4})+nx({lingkungan:+2}),'good');leg(4,-2);}},
    {t:'Teken — dengan "biaya koordinasi"',e:()=>{addLog('Izin terbit. Ekskavator masuk hutan, amplop masuk laci.'+fx({gelap:+4e9,integritas:-10,heat:+9})+dx({ekonomi:+4,kepuasan:-3})+nx({lingkungan:-5}),'bad');leg(-6,2);}}
  ]});}},
{k:'gusur',tab:'kebijakan',lbl:'Tata kota: penertiban',sub:'Gusur kawasan kumuh',cond:isKepda,e:()=>{
  addLog('Alat berat meratakan permukiman liar demi "wajah kota". Tangis warga vs tepuk tangan pengembang.'+fx({popularitas:-5})+dx({infra:+5,kepuasan:-5}),'bad');leg(-6,4);}},
/* ---- KEBIJAKAN: LEGISLATIF (sesuai komisi) ---- */
{k:'progKomisi',tab:'kebijakan',lbl:'Dorong agenda komisi',sub:'Kerja sesuai komisi Anda',cond:()=>isLeg()&&!!(P.jabData&&P.jabData.komisi),e:()=>{
  const ko=P.jabData.komisi; P.jabData.ruu=(P.jabData.ruu||0)+1;
  const map={
    korupsi:{nx:{korupsi:-2,mood:+1},log:'menggelar rapat dengar pendapat membongkar mata anggaran yang bocor'},
    kas:{nx:{kas:+20},log:'mengetatkan pengawasan APBN bersama BPK'},
    infra:{nx:{infra:+2},log:'mengawal proyek konektivitas agar tidak mangkrak'},
    pendidikan:{nx:{pendidikan:+3},log:'memastikan anggaran pendidikan benar-benar terserap ke ruang kelas'},
    keswa:{nx:{keswa:+3},log:'mengawasi tata kelola BPJS dan distribusi obat'},
    lingkungan:{nx:{lingkungan:+3},log:'membentuk panja penyetop izin tambang ilegal'},
    militer:{nx:{militer:+2},log:'mengawal modernisasi alutsista yang transparan'}
  };
  const e=map[ko.sektor]||map.infra;
  addLog('Sebagai anggota <b>'+ko.n+'</b>, Anda '+e.log+'.'+fx({popularitas:+3,pengaruh:+1})+nx(e.nx),'good');leg(3,2);}},
/* ---- KEBIJAKAN: MENTERI (sesuai portofolio) ---- */
{k:'progKem',tab:'kebijakan',lbl:'Program unggulan kementerian',sub:'Gebrakan sesuai portofolio',cond:isMen,e:()=>{
  const km=P.jabData&&P.jabData.kementerian;
  if(!km){addLog('Portofolio kementerian belum jelas.','sys');return;}
  const eff={
    pendidikan:()=>{const m=need(N.pendidikan);addLog('Sebagai <b>'+km.n+'</b>, Anda meluncurkan beasiswa & renovasi sekolah hingga pelosok.'+fx({popularitas:+Math.round(3*m)})+nx({pendidikan:+5,kas:-40,mood:+Math.round(2*m)}),'good');leg(Math.round(3*m),3);},
    keswa:()=>{const m=need(N.keswa);addLog('Sebagai <b>'+km.n+'</b>, Anda memperkuat puskesmas & memangkas antrean BPJS.'+fx({popularitas:+Math.round(3*m)})+nx({keswa:+5,kas:-40,mood:+Math.round(2*m)}),'good');leg(Math.round(3*m),3);},
    infra:()=>{const m=need(N.infra);addLog('Sebagai <b>'+km.n+'</b>, Anda membangun jembatan & pelabuhan penghubung pulau.'+nx({infra:+5,kas:-50,ekonomi:+1}),'good');leg(Math.round(2*m),4);},
    kemiskinan:()=>{const m=needK();addLog('Sebagai <b>'+km.n+'</b>, Anda menyalurkan bansos & program pemberdayaan ke kantong kemiskinan.'+fx({popularitas:+Math.round(3*m)})+nx({kemiskinan:-0.8,kas:-40,mood:+Math.round(2*m)}),'good');leg(Math.round(3*m),2);},
    kas:()=>{addLog('Sebagai <b>'+km.n+'</b>, Anda menertibkan pajak & menutup kebocoran anggaran.'+fx({kompetensi:+2})+nx({kas:+60,korupsi:-2}),'good');leg(2,4);},
    lingkungan:()=>{const m=need(N.lingkungan);addLog('Sebagai <b>'+km.n+'</b>, Anda merehabilitasi hutan & menindak pencemar.'+nx({lingkungan:+5,kas:-25})+fx({pengaruh:-2}),'good');leg(Math.round(3*m),3);}
  };
  (eff[km.sektor]||eff.infra)();}},
{k:'anggaranKem',tab:'kebijakan',lbl:'Kelola anggaran kementerian',sub:'Triliunan lewat meja Anda',cond:isMen,e:()=>{
  ask({title:'REALISASI ANGGARAN',text:'Anggaran tahunan kementerian harus diserap. Bagaimana caranya?',opts:[
    {t:'Transparan & efisien',e:()=>{addLog('Serapan anggaran Anda jadi contoh kementerian lain.'+fx({kompetensi:+3,integritas:+3})+nx({korupsi:-1}),'good');leg(2,3);}},
    {t:'Mark-up lewat vendor "teman"',e:()=>{addLog('Proyek pengadaan digelembungkan. Selisihnya pulang ke rekening cangkang.'+fx({gelap:+6e9,integritas:-12,heat:+12}),'bad');leg(-5,0);}}
  ]});}},
/* ---- KEBIJAKAN: PRESIDEN ---- */
{k:'pajakNaik',tab:'kebijakan',lbl:'Naikkan pajak',sub:'+3% · kas terisi, rakyat mengeluh · butuh DPR',multi:true,cond:()=>isPres()&&N.pajak<40,parlemen:true,sulit:0.1,e:()=>{
  addLog('Anda menaikkan tarif pajak. Kas negara tersenyum, warung kopi menggerutu.'+nx({pajak:+3,mood:-7})+fx({popularitas:-4}),'bad');leg(-4,4);}},
{k:'pajakTurun',tab:'kebijakan',lbl:'Turunkan pajak',sub:'−3% · rakyat senang, kas menjerit',multi:true,cond:()=>isPres()&&N.pajak>5,e:()=>{
  addLog('Anda memangkas pajak. Sorak-sorai di mana-mana — bendahara negara pucat.'+nx({pajak:-3,mood:+6})+fx({popularitas:+4}),'good');leg(4,-3);}},
{k:'bansosNas',tab:'kebijakan',lbl:'Bansos nasional',sub:'Rp 80 T · jaring pengaman',cond:()=>isPres()&&N.kas>-50,e:()=>{
  const m=needK();
  addLog('Bantuan sosial digelontorkan ke seluruh negeri.'+nx({kas:-80,kemiskinan:-1.2,mood:+Math.round(6*m)})+fx({popularitas:+Math.round(5*m)}),'good');leg(Math.round(6*m),2);}},
{k:'infraNas',tab:'kebijakan',lbl:'Pembangunan infrastruktur',sub:'Rp 150 T · jalan tol & bendungan',cond:()=>isPres()&&N.kas>-50,e:()=>{
  const m=need(N.infra);
  addLog('Tol, bendungan, dan pelabuhan dibangun serentak. Negeri jadi proyek raksasa.'+nx({kas:-150,infra:+7,ekonomi:+2,lingkungan:-3,mood:+Math.round(3*m)}),'good');leg(Math.round(3*m),6);}},
{k:'sosialNas',tab:'kebijakan',lbl:'Anggaran pendidikan & kesehatan',sub:'Rp 120 T · SDM jangka panjang',cond:()=>isPres()&&N.kas>-50,e:()=>{
  const m=(need(N.pendidikan)+need(N.keswa))/2;
  addLog('Sekolah dan rumah sakit dapat suntikan besar. Hasilnya panen satu generasi lagi.'+nx({kas:-120,pendidikan:+6,keswa:+6,mood:+Math.round(3*m)}),'good');leg(Math.round(4*m),4);}},
{k:'industri',tab:'kebijakan',lbl:'Bangun kawasan industri',sub:'Rp 120 T · buka lapangan kerja',cond:()=>isPres()&&N.kas>-50,e:()=>{
  addLog('Pabrik dan kawasan industri baru diresmikan. Ratusan ribu lowongan terbuka, cerobong mengepul, pengangguran turun.'+nx({kas:-120,pengangguran:-2.5,ekonomi:+3,lingkungan:-3,mood:+3})+fx({popularitas:+4}),'good');leg(4,4);}},
{k:'bpjs',tab:'kebijakan',lbl:'Perluas cakupan BPJS',sub:'Rp 90 T · kesehatan untuk semua',cond:()=>isPres()&&N.kas>-50,e:()=>{
  const m=need(N.keswa);
  addLog('Cakupan BPJS diperluas sampai pelosok, iuran rakyat kecil ditanggung negara. Antrean masih ada, tapi pintunya kini terbuka untuk semua.'+nx({kas:-90,keswa:+7,mood:+Math.round(4*m)})+fx({popularitas:+Math.round(4*m)}),'good');leg(Math.round(5*m),3);}},
{k:'apbnProyek',tab:'kebijakan',lbl:'Ajukan APBN: proyek strategis',sub:'Tol, bandara, pariwisata, RS, EBT, dll',cond:()=>isPres()&&N.kas>-100,e:()=>{
  ask({title:'APBN — PROYEK STRATEGIS NASIONAL',text:'Kas negara: '+rpT(N.kas)+'. Pilih bidang pembangunan (tiap proyek butuh restu DPR):',
    opts:KAT_NAS.map(([kk,kn])=>({t:kn,sub:PROYEK_NAS.filter(p=>p.kat===kk).length+' proyek',e:()=>pilihProyekNas(kk)})).concat([{t:'Batal',e:()=>{}}])});}},
{k:'kpk',tab:'kebijakan',lbl:'Nasib lembaga antikorupsi',sub:'Perkuat atau lemahkan · butuh DPR',cond:isPres,parlemen:true,sulit:0.12,e:()=>{
  ask({title:'REVISI UU ANTIKORUPSI',text:'Draf revisi UU lembaga antikorupsi ada di meja Anda. Para elite menunggu arah angin.',opts:[
    {t:'Perkuat — beri taring penuh',e:()=>{addLog('Lembaga antikorupsi diberi kewenangan penuh. Beberapa kolega Anda mendadak sering ke luar negeri.'+nx({korupsi:-6,mood:+5})+fx({pengaruh:-8}),'good');leg(8,-2);}},
    {t:'Lemahkan — "penyempurnaan kelembagaan"',e:()=>{addLog('Taring lembaga antikorupsi dicabut lewat revisi tengah malam. Demo pecah, elite bersulang.'+nx({korupsi:+8,mood:-9,kebebasan:-4})+fx({pengaruh:+10,integritas:-10,heat:-8}),'bad');leg(-12,4);}}
  ]});}},
{k:'pers',tab:'kebijakan',lbl:'Kebijakan pers & sipil',sub:'Buka atau bungkam · butuh DPR',cond:isPres,parlemen:true,sulit:0.1,e:()=>{
  ask({title:'RUANG SIPIL',text:'Media dan masyarakat sipil makin nyaring. Sikap Anda?',opts:[
    {t:'Jamin kebebasan penuh',e:()=>{addLog('Anda mencabut pasal-pasal karet. Kritik makin pedas — termasuk ke Anda.'+nx({kebebasan:+8,mood:+4})+fx({heat:+3}),'good');leg(5,-2);}},
    {t:'Kendalikan narasi',sub:'Blokir, pasal karet, intimidasi',e:()=>{addLog('Satu per satu kanal kritis senyap. Linimasa jadi seragam dan membosankan.'+nx({kebebasan:-12,mood:-5})+fx({heat:-8,integritas:-8}),'bad');leg(-8,3);}}
  ]});}},
{k:'lingk',tab:'kebijakan',lbl:'Kebijakan lingkungan',sub:'Hutan vs investasi · butuh DPR',cond:isPres,parlemen:true,sulit:0.1,e:()=>{
  ask({title:'HUTAN ATAU TAMBANG',text:'Investor antre minta konsesi. Aktivis lingkungan berkemah di depan istana.',opts:[
    {t:'Moratorium izin tambang & sawit',e:()=>{addLog('Anda membekukan izin baru. Orangutan aman, beberapa konglomerat mengamuk.'+nx({lingkungan:+7,ekonomi:-2})+fx({pengaruh:-6}),'good');leg(5,-1);}},
    {t:'Obral konsesi demi pertumbuhan',e:()=>{addLog('Jutaan hektare hutan berganti jadi "kawasan produktif".'+nx({ekonomi:+4,lingkungan:-9})+fx({gelap:+8e9,heat:+8,integritas:-8}),'bad');leg(-6,3);}}
  ]});}},
{k:'utangLN',tab:'kebijakan',lbl:'Tarik utang luar negeri',sub:'Rp 300 T segar · bunga menanti',multi:true,cond:isPres,e:()=>{
  addLog('Anda meneken pinjaman luar negeri. Hari ini lega, anak cucu yang menghitung.'+nx({kas:+300,utang:+300}),'sys');leg(0,1);}},
/* ===== MEGAPROYEK & POLITIK LUAR NEGERI (PRESIDEN) ===== */
{k:'ikn',tab:'kebijakan',lbl:'Bangun Ibu Kota Baru (IKN)',sub:'Rp 450 T · warisan abadi',cond:()=>isPres()&&N.iknFase===0,e:()=>{
  ask({title:'IBU KOTA BARU',text:'Mimpi memindahkan ibu kota ke tengah pulau. Megaproyek setengah abad sekali — atau penghamburan setengah abad sekali, tergantung sudut pandang.',opts:[
    {t:'Groundbreaking! Sejarah harus mencatat nama saya',sub:'Rp 450 T tahap awal',cond:()=>N.kas>=-100,e:()=>{P.ikn=true;N.iknFase=1;ach('mercusuar');
      addLog('Tiang pancang IKN ditancapkan di tengah hutan. Megah di maket, sunyi di lapangan. Investor masih mempelajari proposal yang Anda kirim 4 tahun lalu.'+nx({kas:-450,infra:+4,mood:-7,lingkungan:-5,utang:+200}),'bad');leg(-4,10);milestone('Memulai IKN');}},
    {t:'Skala kecil saja — istana mini',sub:'Rp 120 T',cond:()=>N.kas>=-50,e:()=>{N.iknFase=1;P.ikn=true;
      addLog('Anda hanya membangun kompleks istana terbatas. Tidak megah, tapi tidak juga memalukan.'+nx({kas:-120,infra:+2,mood:-3,lingkungan:-2}),'sys');leg(-1,3);}},
    {t:'Batalkan — uangnya untuk rakyat',e:()=>{addLog('"Sekolah dulu, istana belakangan," kata Anda di mimbar — kalimat yang langsung dikutip di mana-mana.'+nx({mood:+5})+fx({popularitas:+4}),'good');leg(5,-2);}}
  ]});}},
{k:'iknLanjut',tab:'kebijakan',lbl:'Lanjutkan pembangunan IKN',sub:'Suntik dana fase berikutnya',cond:()=>isPres()&&N.iknFase>=1&&N.iknFase<3,e:()=>{
  const biaya=N.iknFase===1?300:200;
  ask({title:'IKN FASE '+(N.iknFase+1),text:'Pembangunan mandek di fase '+N.iknFase+'. Suntikan '+rpT(biaya)+' lagi untuk lanjut.',opts:[
    {t:'Lanjut — tanggung jawab presiden',sub:rpT(biaya),cond:()=>N.kas>=-150,e:()=>{N.iknFase++;
      addLog('Anggaran '+rpT(biaya)+' digelontorkan. Gedung-gedung pelat-pelat baja bertambah. ASN dipaksa pindah — separuhnya minta pindah balik.'+nx({kas:-biaya,infra:+4,mood:-3,utang:+100}),'sys');
      if(N.iknFase>=3){ach('iknJadi');stamp('IKN BERFUNGSI','gold');leg(3,12);addLog('IKN resmi berfungsi sebagai pusat pemerintahan. Sejarah dicetak, tinta belum kering.','good');}
      else leg(-2,5);}},
    {t:'Mangkrakan dulu',sub:'Tunda tanpa batas',e:()=>{addLog('Anda memilih menunda. Gedung megah jadi habitat monyet ekor panjang. Foto-fotonya viral.'+nx({mood:-4})+fx({popularitas:-3}),'bad');leg(-2,-2);}}
  ]});}},
{k:'mbgStart',tab:'kebijakan',lbl:'Luncurkan Makan Bergizi Gratis (MBG)',sub:'Rp 200 T/thn · janji kampanye',cond:()=>isPres()&&!N.mbg,e:()=>{
  ask({title:'PROGRAM MAKAN BERGIZI GRATIS',text:'Janji kampanye yang sulit ditarik kembali. Jutaan anak sekolah menanti kotak makanan.',opts:[
    {t:'Luncurkan penuh — Rp 200 T/thn',sub:'Skala nasional',cond:()=>N.kas>=-50,e:()=>{N.mbg=true;ach('mbg');
      addLog('MBG resmi diluncurkan dengan upacara meriah. Truk catering berkonvoi ke sekolah-sekolah. Setiap anak dapat menu yang fotonya jauh lebih meyakinkan daripada rasanya.'+nx({kas:-200,pendidikan:+3,keswa:+3,mood:+8,kemiskinan:-0.5})+fx({popularitas:+10}),'good');
      stamp('MBG DILUNCURKAN','green');milestone('Meluncurkan MBG');leg(8,3);}},
    {t:'Versi terbatas dulu',sub:'Rp 80 T · pilot project',cond:()=>N.kas>=-30,e:()=>{N.mbg=true;
      addLog('Versi terbatas: 12 provinsi pilot. Banyak yang dapat, lebih banyak yang menonton dari rumah.'+nx({kas:-80,pendidikan:+1,keswa:+1,mood:+4})+fx({popularitas:+5}),'good');leg(4,1);}},
    {t:'Tunda — fiskal belum sehat',e:()=>{addLog('Anda menunda janji kampanye sendiri. Lawan politik langsung membuat tagar #JanjiTinggal.'+fx({popularitas:-8,integritas:-2}),'bad');leg(-6,1);}}
  ]});}},
{k:'mbgStop',tab:'kebijakan',lbl:'Hentikan MBG',sub:'Berani tarik janji?',cond:()=>isPres()&&N.mbg,e:()=>{
  N.mbg=false;
  addLog('Anda mengakhiri MBG. Vendor catering menggugat, jutaan anak kembali bawa bekal seadanya.'+nx({mood:-10,kemiskinan:+0.3})+fx({popularitas:-12,integritas:+2}),'bad');leg(-10,4);}},
{k:'milBudget',tab:'kebijakan',lbl:'Naikkan anggaran militer',sub:'Rp 80 T · alutsista baru',cond:()=>isPres()&&N.kas>=-30,e:()=>{
  const k=N.perang?12:6;
  N.militer=clamp(N.militer+k,0,100);
  addLog('Pesawat tempur baru mendarat, jet tempur tua dipensiunkan. Pabrikan luar negeri tersenyum lebar.'+nx({kas:-80})+fx({pengaruh:+3}),'sys');leg(0,3);}},
{k:'blokLN',tab:'kebijakan',lbl:'Atur posisi geopolitik',sub:'Pilih blok kawan',cond:()=>isPres()&&!N.perang,e:()=>{
  ask({title:'POSISI GEOPOLITIK',text:'Saat ini: <b>'+N.hubLN+'</b>. Mau ke mana arah angin?',opts:[
    {t:'Condong ke blok Barat',sub:'Investasi & teknologi · risiko sanksi blok lawan',cond:()=>N.hubLN!=='blok_barat',e:()=>{N.hubLN='blok_barat';
      addLog('Anda meneken kerja sama strategis dengan negara-negara Barat. Bahasa Inggris ditingkatkan di kabinet.'+nx({diplomasi:+6,ekonomi:+2,militer:+2}),'good');leg(0,3);}},
    {t:'Condong ke blok Timur',sub:'Pinjaman murah · risiko jebakan utang',cond:()=>N.hubLN!=='blok_timur',e:()=>{N.hubLN='blok_timur';
      addLog('Anda meneken kerja sama infrastruktur dengan mitra Timur. Mandor-mandornya tidak banyak basa-basi.'+nx({diplomasi:+4,infra:+3,utang:+200,ekonomi:+1}),'sys');leg(2,2);}},
    {t:'Non-blok aktif',sub:'Politik bebas-aktif klasik',cond:()=>N.hubLN!=='non_blok',e:()=>{N.hubLN='non_blok';
      addLog('Anda menegaskan politik bebas-aktif. Kedutaan ramai didatangi, semua negara berebut difoto bersama Anda.'+nx({diplomasi:+8})+fx({integritas:+2}),'good');ach('diplomat');leg(3,4);}},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'damaiKtt',tab:'kebijakan',lbl:'Tuan rumah KTT perdamaian',sub:'Rp 60 T · panggung dunia',cond:()=>isPres()&&N.diplomasi>=40&&N.kas>=-20,e:()=>{
  addLog('Anda menggelar KTT perdamaian dunia. Karpet merah, foto bersama, deklarasi indah. Anggaran Rp 60 T menguap dalam tiga hari.'+nx({kas:-60,diplomasi:+12,mood:+3})+fx({popularitas:+6,pengaruh:+4}),'good');ach('diplomat');leg(5,5);}},
{k:'akhiriPerang',tab:'kebijakan',lbl:'Akhiri perang sekarang',sub:'Pilihan damai vs serangan besar',cond:()=>isPres()&&!!N.perang,e:()=>{
  const m=N.militer, lawan=N.perang.dengan, thn=N.perang.thn;
  ask({title:'AKHIRI PERANG',text:'Perang dengan '+lawan+' sudah berjalan '+thn+' tahun. Militer kita: '+m+'/100.',opts:[
    {t:'Gencatan senjata & negosiasi',sub:'Pulang dengan kepala tegak (atau tertunduk)',e:()=>{
      const ok=r()<0.4+N.diplomasi/250;
      if(ok){N.perang=null;addLog('Perjanjian damai diteken di kota netral. Tidak ada yang menang, tidak ada yang sungguh kalah.'+nx({keamanan:+5,diplomasi:+4,mood:+6}),'good');stamp('PERANG BERAKHIR','green');ach('merpati');leg(6,4);milestone('Mengakhiri perang dengan damai');}
      else {addLog('Pihak lawan menolak negosiasi — perang berlanjut.'+fx({stres:+10}),'bad');}}},
    {t:'Serangan besar terakhir',sub:'Butuh militer >=60 · all in',cond:()=>m>=60,e:()=>{
      const menang=r()<0.4+m/200;
      if(menang){N.perang=null;ach('panglima');stamp('KEMENANGAN','gold');
        addLog('Serangan besar berhasil — '+lawan+' mengaku kalah dalam 48 jam. Bendera kita berkibar di tanah sengketa.'+nx({keamanan:+8,militer:+5,mood:+12,ekonomi:+2})+fx({popularitas:+15,pengaruh:+10}),'good');
        leg(8,12);milestone('Memenangkan perang');}
      else {N.perang=null;
        addLog('Serangan besar gagal. Pasukan dipulangkan dengan kerugian besar. Sejarah mencatat kekalahan yang pahit.'+nx({militer:-15,keamanan:-8,mood:-15,ekonomi:-5})+fx({popularitas:-15,stres:+20}),'bad');
        leg(-12,-15);milestone('Kalah perang');}}},
    {t:'Lanjutkan saja, perang panjang melatih bangsa',e:()=>{addLog('Anda menolak mengakhiri. Pidato heroik tentang "patriotisme" disiarkan tiap malam.'+fx({pengaruh:+3,stres:+8}),'sys');leg(-3,2);}}
  ]});}},
{k:'subsidi',tab:'kebijakan',lbl:'Subsidi BBM & LPG',sub:'Rp 100 T · rakyat senang, fiskal pening',multi:true,cond:()=>isPres()&&N.kas>=-30,e:()=>{
  addLog('Subsidi energi dipertahankan. SPBU damai, kementerian keuangan migrain.'+nx({kas:-100,mood:+5,inflasi:-1})+fx({popularitas:+4}),'good');leg(4,-2);}},
{k:'cabutSubsidi',tab:'kebijakan',lbl:'Cabut subsidi BBM',sub:'Fiskal sehat, rakyat protes · butuh DPR',cond:isPres,parlemen:true,sulit:0.18,e:()=>{
  P._cabutBBM=true;
  addLog('Anda mencabut subsidi BBM. Antrean panjang di SPBU, dilanjut demo di mana-mana. Menteri keuangan mengangkat dua jempol diam-diam.'+nx({kas:+90,inflasi:+2,mood:-9})+fx({popularitas:-9,integritas:+3}),'bad');leg(-9,5);}},
{k:'amandemen',tab:'kebijakan',lbl:'Amandemen: 3 periode',sub:'Utak-atik konstitusi',cond:()=>isPres()&&(P.terms.presiden||0)>=2&&!P.tigaOk,e:()=>{
  ask({title:'BISIKAN TIGA PERIODE',text:'Para pembisik berkata rakyat "masih menginginkan Anda". Konstitusi tinggal selembar kertas, bukan?',opts:[
    {t:'Dorong amandemen',sub:'Butuh Pengaruh besar',e:()=>{
      if(P.st.pengaruh>=75&&r()<0.55){
        P.tigaOk=true;
        addLog('Konstitusi diamandemen tengah malam. Anda boleh maju lagi. Demokrasi memble, istana bersorak.'+nx({kebebasan:-15,demokrasi:-20,mood:-12})+fx({integritas:-15}),'bad');
        leg(-15,5); milestone('Meloloskan amandemen 3 periode');
      } else {
        addLog('Manuver amandemen kandas — mahasiswa turun, elite balik badan.'+fx({popularitas:-10,pengaruh:-15})+nx({mood:-4}),'bad');
      }}},
    {t:'Tolak — dua periode itu amanah',e:()=>{addLog('Anda menutup pintu tiga periode. "Konstitusi bukan mainan," tegas Anda. Sejarah mencatat dengan tinta emas.'+fx({integritas:+8,popularitas:+5}),'good');leg(8,2);}}
  ]});}},
{k:'reshuffle',tab:'kebijakan',lbl:'Susun / rombak kabinet',sub:'Tentukan mutu menteri vs jatah koalisi',cond:isPres,e:()=>{
  ask({title:'SUSUN KABINET',text:'Komposisi kabinet menentukan kinerja sektor tiap tahun dan dukungan koalisi. Gaya Anda?'+(N.kabinet.length?' (Mutu kabinet sekarang: '+N.kabinetMutu+'/100)':''),opts:[
    {t:'Kabinet profesional',sub:'Mutu tinggi · koalisi turun',e:()=>{N.kabinetMutu=ri(70,90);N.kabinet=buatKabinet();N.koalisi=clamp(N.koalisi-ri(6,12),0,100);
      addLog('Anda mengisi kabinet dengan teknokrat & profesional. Kinerja sektor menjanjikan, tapi partai koalisi merengut tak kebagian kursi.'+fx({kompetensi:+2})+nx({mood:+2}),'good');leg(3,4);}},
    {t:'Kabinet akomodatif',sub:'Bagi kursi ke koalisi · mutu rendah',e:()=>{N.kabinetMutu=ri(30,50);N.kabinet=buatKabinet();N.koalisi=clamp(N.koalisi+ri(8,15),0,100);
      addLog('Kursi menteri dibagi rata ke partai koalisi. Mereka senang, rakyat dapat menteri "titipan".'+nx({korupsi:+1}),'sys');leg(-2,-1);}},
    {t:'Kabinet campuran',sub:'Seimbang',e:()=>{N.kabinetMutu=ri(50,65);N.kabinet=buatKabinet();N.koalisi=clamp(N.koalisi+ri(2,6),0,100);
      addLog('Anda menyeimbangkan teknokrat dan jatah politik. Tidak istimewa, tapi aman.'+fx({pengaruh:+2}),'sys');leg(1,1);}},
    {t:'Batal',e:()=>{}}
  ]});}},
{k:'gajiPns',tab:'kebijakan',lbl:'Naikkan gaji ASN',sub:'Rp 40 T · mesin birokrasi senang',cond:()=>isPres()&&N.kas>-50,e:()=>
  addLog('Gaji aparatur negara naik. Birokrasi mendadak rajin, setidaknya seminggu.'+nx({kas:-40,mood:+2})+fx({pengaruh:+4}))},
/* ---- SIASAT ---- */
{k:'titipan',tab:'siasat',lbl:'Terima "titipan" proyek',sub:'Amplop tebal tanpa kuitansi',cond:()=>!!P.jab,e:()=>{
  const u=ri(1,4)*1e9*Math.max(lvNow(),1);
  const narasi=pick([
    'Seorang "rekan pengusaha" menitipkan tanda terima kasih atas kelancaran proyeknya. Amplop coklat itu cukup tebal untuk berdiri sendiri.',
    'Tamu malam Anda hanya menaruh kardus di atas meja, lalu pamit tanpa banyak kata. Profesional, seperti seharusnya.',
    'Anda menerima "fee konsultasi" — kategori paling abu-abu dalam buku akuntansi negeri ini.',
    'Sang pengusaha berkata, "Ini bukan suap, Pak, ini hadiah." Anda mengangguk. Definisi memang penting.'
  ]);
  addLog(narasi+fx({gelap:+u,integritas:-8,heat:+8}),'bad');leg(-3,0);}},
{k:'markup',tab:'siasat',lbl:'Mark-up anggaran',sub:'Gelembungkan, sisanya masuk kantong',cond:()=>!!P.jab&&lvNow()>=2,e:()=>{
  const u=ri(3,8)*1e9*(lvNow()-1);
  const narasi=pick([
    'Anggaran proyek menggelembung di atas kertas. Selisihnya menguap ke rekening cangkang di pulau yang tidak ada di peta sekolah dasar.',
    'Harga semen di laporan Anda lebih mahal daripada caviar. Auditor BPK berpura-pura tidak melihat.',
    'Vendor "teman lama" memenangkan tender yang spesifikasinya tertulis: "merek harus persis seperti yang dia jual".',
    'Mark-up dieksekusi dengan rapi. Bahkan koruptor kelas internasional mungkin akan memberi acungan jempol kecil.'
  ]);
  addLog(narasi+fx({gelap:+u,integritas:-10,heat:+10}),'bad');leg(-4,0);}},
{k:'cuci',tab:'siasat',lbl:'Cuci uang gelap',get sub(){ return N&&N.tahun<2016?'Lewat kafe, properti & yayasan':'Lewat kafe, kripto & yayasan'; },cond:()=>P.gelap>=1e9,e:()=>{
  const x=P.gelap, bersih=Math.round(x*0.7);
  P.gelap=0; P.money+=bersih;
  addLog('Uang gelap '+rp(x)+' diputar lewat bisnis kafe dan yayasan. Yang kembali "bersih": '+rp(bersih)+'.'+fx({heat:+5,integritas:-4}),'bad');}},
{k:'suapHukum',tab:'siasat',lbl:'"Kondisikan" penegak hukum',sub:'Rp 3 M gelap · redam sorotan',cond:()=>P.heat>=25&&P.gelap>=3e9,e:()=>{
  P.gelap-=3e9;
  addLog('Beberapa makan malam mahal kemudian, berkas tentang Anda berpindah ke laci paling bawah.'+fx({heat:-18,integritas:-6}),'bad');}},
{k:'buzzer',tab:'siasat',lbl:'Pasang pasukan buzzer',sub:'Rp 300 jt · banjiri linimasa',cond:()=>P.money>=300e6&&N.tahun>=2012,e:()=>{
  P.money-=300e6;P.buzzed++;
  const narasi=pick([
    'Ribuan akun anonim mendadak memuji Anda dengan kalimat yang persis sama. Salah satu lupa edit, kata "[NAMA TOKOH]" masih nempel di komentarnya.',
    'Pasukan udara cyber Anda menggempur tagar tandingan. Algoritma menerimanya tanpa pertanyaan, seperti biasa.',
    'Buzzer baru Anda fresh graduate yang bayarannya per cuitan. Krisis lapangan kerja punya hikmahnya juga, ternyata.'
  ]);
  addLog(narasi+fx({popularitas:+5,integritas:-3}),'bad');}},
{k:'kriminalisasi',tab:'siasat',lbl:'Kriminalisasi pengkritik',sub:'Pasal karet untuk lawan',cond:()=>P.st.pengaruh>=55&&!!P.jab,e:()=>{
  addLog('Pengkritik paling nyaring Anda mendadak jadi tersangka kasus lama. Kebetulan yang aneh.'+fx({pengaruh:+5,integritas:-12,heat:+5})+nx({kebebasan:-3}),'bad');leg(-7,2);}},
{k:'nepotisme',tab:'siasat',lbl:'Angkat kerabat ke posisi basah',sub:'Keluarga dulu, negara kemudian',cond:()=>!!P.jab&&lvNow()>=3,e:()=>{
  addLog('Ponakan Anda yang baru lulus mendadak jadi komisaris BUMN.'+fx({pengaruh:+4,integritas:-6})+nx({mood:-2,korupsi:+1}),'bad');leg(-3,1);}},
{k:'rival',tab:'siasat',lbl:'Hadapi rival politik',sub:'Ajak beraliansi atau jatuhkan',cond:()=>!!P.rival&&P.rival.hub!=='sekutu',e:()=>{
  const rv=P.rival;
  ask({title:'BERHADAPAN DENGAN '+rv.nama.split(' ')[0].toUpperCase(),text:'Rival bebuyutan: <b>'+rv.nama+'</b> ('+rv.partai.replace('Partai ','')+', '+rv.latar+'). Rekam jejak lawan Anda: '+rv.kalah+'× kalah, '+rv.menang+'× menang. Langkah Anda?',opts:[
    {t:'Ajak beraliansi',sub:'Musuh jadi kawan — bagi kekuasaan',e:()=>{
      if(r()<0.4+P.st.pengaruh/250){rv.hub='sekutu';addLog('Setelah pertemuan empat mata, Anda dan '+rv.nama.split(' ')[0]+' sepakat berkoalisi. Musuh jadi kawan — untuk sekarang.'+fx({pengaruh:+4}),'good');if(isPres())N.koalisi=clamp(N.koalisi+ri(6,12),0,100);leg(1,1);}
      else addLog(rv.nama.split(' ')[0]+' menolak uluran tangan Anda — gengsi politik terlalu mahal.'+fx({stres:+3}),'bad');}},
    {t:'Jatuhkan lewat skandal',sub:'Rp 2 M gelap · bisa berbalik',cond:()=>P.gelap>=2e9||P.money>=2e9,e:()=>{const c=2e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);
      if(r()<0.5){rv.pop=clamp(rv.pop-15,0,100);addLog('Aib '+rv.nama.split(' ')[0]+' bocor ke publik tepat waktu. Elektabilitasnya rontok.'+fx({integritas:-4,heat:+3}),'bad');leg(-2,0);}
      else {rv.pop=clamp(rv.pop+5,0,100);addLog('Serangan Anda berbalik — publik menilainya politik kotor. Simpati malah mengalir ke '+rv.nama.split(' ')[0]+'.'+fx({popularitas:-6,heat:+5}),'bad');}}},
    {t:'Abaikan saja',e:()=>{}}
  ]});}},
{k:'kaderAnak',tab:'siasat',lbl:'Kaderkan anak ke politik',sub:'Bangun dinasti keluarga',cond:()=>P.anak>0&&P.age>=45&&!P.anakKader&&(!!P.jab||P.st.pengaruh>=50),e:()=>{
  P.anakKader=true;ach('dinastiP');
  addLog('Anak Anda tiba-tiba memimpin organisasi pemuda, lalu maju pilkada. Warganet menghitung silsilah.'+fx({pengaruh:+3})+nx({mood:-2}),'bad');
  milestone('Mengkaderkan anak ke politik');leg(-3,1);}},
/* ---- UANG ---- */
{k:'sumbang',tab:'uang',lbl:'Filantropi & beasiswa',sub:'Rp 500 jt · nama harum',cond:()=>P.money>=500e6,e:()=>{
  P.money-=500e6;
  addLog('Yayasan Anda membagikan beasiswa untuk anak-anak tak mampu.'+fx({popularitas:+4,integritas:+3}),'good');
  if(!P.ach.dermawan&&P.st.integritas>=60)ach('dermawan');
  leg(3,1);}},
{k:'depoSetor',tab:'uang',lbl:'Simpan ke deposito',sub:'Bunga 4%/thn',multi:true,cond:()=>P.money>=100e6,e:()=>{
  ask({title:'SETOR DEPOSITO',text:'Berapa yang mau diparkir? (Uang resmi: '+rp(P.money)+')',
    opts:[100e6,500e6,2e9,10e9].filter(x=>x<=P.money).map(x=>({t:rp(x),e:()=>{P.money-=x;P.depo+=x;
      addLog('Anda memarkir '+rp(x)+' di deposito.','sys');}}))
    .concat([{t:'Batal',e:()=>{}}])});}},
{k:'depoTarik',tab:'uang',lbl:'Cairkan deposito',sub:'Tarik seluruh saldo',cond:()=>P.depo>0,e:()=>{
  const x=P.depo;P.depo=0;P.money+=x;
  addLog('Deposito '+rp(x)+' dicairkan.','sys');}},
{k:'mewahA',tab:'uang',lbl:'Beli aset mewah',sub:'Rp 3 M · rumah, moge, jam',cond:()=>P.money+P.gelap>=3e9,e:()=>{
  const c=3e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);P.mewah++;
  addLog('Garasi Anda bertambah penghuni. Stafsus menyarankan jangan dipamerkan — Anda memotretnya juga.'+fx({stres:-6,popularitas:-1}),'bad');}},
{k:'lhkpn',tab:'uang',lbl:'Rapikan LHKPN',sub:'Rp 200 jt · konsultan "penataan harta"',cond:()=>!!P.jab&&P.money>=200e6,e:()=>{
  P.money-=200e6;
  addLog('Konsultan merapikan laporan harta Anda. Semua "wajar dan dapat dijelaskan", asal yang menjelaskan adalah si konsultan, bukan auditor.'+fx({heat:-6}),'sys');}},
{k:'wawancara',tab:'politik',lbl:'Wawancara TV prime-time',sub:'Jawaban Anda menentukan citra',cond:()=>!P.retired,e:()=>wawancara()},
{k:'pidato',tab:'politik',lbl:'Pidato kenegaraan',sub:'Janji-janji baru, retorika lama',cond:()=>!!P.jab,e:()=>{
  const narasi=pick([
    'Anda berpidato berapi-api soal "kebangkitan bangsa". Editor stasiun TV pemerintah memotong di bagian yang paling dramatis.',
    'Anda mengulang janji yang sama dari pidato tahun lalu, hanya tanggal dan persentasenya yang Anda perbarui.',
    'Pidato Anda dipenuhi diksi puitis: "gemah ripah loh jinawi". Penonton di rumah tertidur di tengah jalan.'
  ]);
  addLog(narasi+fx({popularitas:+2,stres:+2}));}},
{k:'kelilingDaerah',tab:'politik',lbl:'Kunjungan kerja ke daerah',sub:'Salam komando, foto-foto',cond:()=>!P.retired,e:()=>{
  addLog('Anda mengunjungi daerah terpencil. Foto Anda menggendong anak warga viral — anaknya menangis, tapi caption-nya tetap "kehangatan".'+fx({popularitas:+3,kesehatan:-1}));leg(2,1);}},
{k:'bukuMemoar',tab:'diri',lbl:'Tulis memoar politik',sub:'Rp 30 jt · jadi penulis',cond:()=>P.age>=50&&P.money>=30e6&&!P.ach.penulis,e:()=>{
  P.money-=30e6;ach('penulis');
  addLog('Anda merilis memoar "Perjalanan Bangsa, Perjalanan Saya". Sebagian fakta diluruskan, sebagian diluruskan ulang.'+fx({popularitas:+4,kompetensi:+2}),'good');}},
{k:'jamuTamu',tab:'siasat',lbl:'Jamu wartawan amplop',sub:'Rp 100 jt · ubah liputan',multi:true,cond:()=>P.money>=100e6&&P.heat>=20,e:()=>{
  P.money-=100e6;
  addLog('Beberapa redaksi mendadak menemukan "perspektif baru" tentang Anda. Amplop memang punya sihirnya sendiri.'+fx({heat:-8,popularitas:+2,integritas:-3}),'bad');}}
];

function actAvail(a){
  if(P.penjara>0&&!a.lapas)return {ok:false,why:'Anda di dalam lapas'};
  if(P.penjara<=0&&a.lapas)return {ok:false,why:'Hanya dari dalam lapas'};
  if(a.cond&&!a.cond())return {ok:false,why:'Syarat belum terpenuhi'};
  if(!a.multi&&P.used[a.k])return {ok:false,why:'Sudah dilakukan tahun ini',used:true};
  return {ok:true};
}
function doAct(k){
  if(!P||G.current||G.over||!P.alive)return;
  const a=ACTS.find(x=>x.k===k);
  if(!a)return;
  const av=actAvail(a);
  if(!av.ok)return;
  /* kebijakan bertanda parlemen bisa ditolak DPR kalau koalisi lemah */
  if(a.parlemen&&isPres()&&!voteParlemen(a.sulit||0)){
    if(!a.multi)P.used[k]=true; G.acted++;
    addLog('<b>DPR MENOLAK.</b> "'+a.lbl+'" kandas di parlemen — koalisi Anda belum cukup solid (koalisi '+N.koalisi+'/100). Perkuat dukungan dulu.'+fx({pengaruh:-3,stres:+4})+nx({mood:-1}),'bad');
    checkAch(); render(); return;
  }
  if(!a.multi)P.used[k]=true;
  G.acted++;
  a.e();
  if(G.acted>5){ P.st.stres=clamp(P.st.stres+2,0,100); }
  checkAch();
  render();
}

