'use strict';
/* ================= AKSI ================= */
const TABS=[['diri','DIRI'],['karier','KARIER & SIDANG'],['siasat','INTEGRITAS & SIASAT'],['uang','UANG']];
const ACTS=[
/* ---- DIRI ---- */
{k:'rehat',tab:'diri',lbl:'Rehat sejenak',sub:'Stres −8',e:()=>addLog('Anda menepi sejenak dari tumpukan berkas perkara.'+fx({stres:-8}))},
{k:'sehat',tab:'diri',lbl:'Jaga kesehatan',sub:'Kesehatan +3',e:()=>addLog('Olahraga dan pola makan dijaga di sela jadwal sidang.'+fx({kesehatan:+3,stres:-2}))},
{k:'ibadah',tab:'diri',lbl:'Ibadah & perenungan',sub:'Menjernihkan nurani',e:()=>addLog('Anda beribadah, mengingat sumpah jabatan: mengadili demi keadilan.'+fx({stres:-5,integritas:+2}))},
{k:'keluarga',tab:'diri',lbl:'Waktu untuk keluarga',sub:'Stres −6',cond:()=>P.keluarga,e:()=>addLog('Sehari penuh tanpa berkas, hanya keluarga.'+fx({stres:-6,kesehatan:+1}))},
{k:'tutup',tab:'diri',lbl:'Tutup berkas (akhiri)',sub:'Akhiri perjalanan dengan tenang',cond:()=>P.retired||P.dipecat,e:()=>{
  ask({title:'TUTUP BERKAS?',text:'Akhiri kisah ini sekarang dan lihat penilaian akhir?',opts:[
    {t:'Ya, tutup berkas',e:()=>{P.alive=false;P.sebab='menutup riwayat dengan tenang di masa pensiun';G.over=true;addLog('Anda menutup lembar terakhir riwayat hidup Anda.','sys');stamp('BERKAS DITUTUP');showEpilog();}},
    {t:'Belum',e:()=>{}}
  ]});}},
/* ---- KARIER & SIDANG ---- */
{k:'diklat',tab:'karier',lbl:'Ikut diklat hukum',sub:'Kompetensi +5',cond:()=>!P.retired&&P.st.kompetensi<95,e:()=>addLog('Anda mengikuti pelatihan hukum lanjutan. Wawasan bertambah.'+fx({kompetensi:+5,stres:+3}))},
{k:'jurnal',tab:'karier',lbl:'Tulis jurnal hukum',sub:'Reputasi +4',multi:true,cond:()=>!P.retired&&P.st.kompetensi>=50,e:()=>addLog('Tulisan hukum Anda dimuat dan dikutip kalangan akademik.'+fx({reputasi:+4,kompetensi:+1}))},
{k:'sidangEkstra',tab:'karier',lbl:'Ambil perkara tambahan',sub:'Gelar sidang ekstra tahun ini',multi:true,cond:()=>!P.retired&&!P.dipecat,e:()=>{addLog('Anda mengambil perkara tambahan untuk dituntaskan.'+fx({stres:+4}));gelarPerkara(buatKasus());}},
{k:'bukuHukum',tab:'karier',lbl:'Tulis buku & mengajar',sub:'Rp 50 jt · reputasi & ilmu',cond:()=>P.money>=50e6&&P.st.kompetensi>=70&&!P.ach.guru,e:()=>{P.money-=50e6;ach('guru');addLog('Buku hukum Anda terbit; Anda diundang mengajar di fakultas hukum.'+fx({reputasi:+6,kompetensi:+3}),'good');}},
{k:'s3',tab:'karier',lbl:'Tempuh S3 Ilmu Hukum',sub:'Rp 150 jt · 3 tahun jadi Doktor',cond:()=>!P.retired&&!P.study&&!P.ach.doktor&&P.st.kompetensi>=68&&P.money>=150e6,e:()=>{
  P.money-=150e6; P.study=3;
  addLog('Anda mendaftar program doktor ilmu hukum. Tiga tahun ke depan: disertasi menumpuk di atas berkas perkara.'+fx({stres:+5}),'sys');}},
{k:'seminar',tab:'karier',lbl:'Isi seminar & kuliah umum',sub:'Reputasi & nama di publik',multi:true,cond:()=>!P.retired&&P.st.kompetensi>=58,e:()=>
  addLog('Anda jadi pembicara di seminar hukum dan kuliah umum. Gagasan Anda soal keadilan tersiar lebih luas.'+fx({reputasi:+3,trust:+1}),'good')},
{k:'bimbing',tab:'karier',lbl:'Bimbing hakim muda',sub:'Tularkan integritas ke korps',multi:true,cond:()=>!P.retired&&lvNow()>=2,e:()=>{
  addLog('Anda meluangkan waktu membimbing hakim-hakim muda — soal teknis beracara, juga soal menjaga nurani di tengah godaan.'+fx({reputasi:+2,trust:+1,stres:+1}),'good');leg(2,0);}},
/* ---- INTEGRITAS & SIASAT ---- */
{k:'etik',tab:'siasat',lbl:'Ikut pembinaan kode etik',sub:'Mawas diri · integritas +5',cond:()=>!P.retired&&P.st.integritas<75,e:()=>
  addLog('Anda mengikuti pembinaan kode etik & pedoman perilaku hakim. Sebuah jeda untuk mawas diri di tengah arus godaan.'+fx({integritas:+5,stres:+2}))},
{k:'lapor',tab:'siasat',lbl:'Laporkan rekan yang korup',sub:'Bersihkan korps · berisiko',cond:()=>!P.retired&&P.st.integritas>=60,e:()=>{
  if(r()<0.5+P.st.nyali/200){addLog('Anda melaporkan hakim nakal ke KY/KPK. Korps gempar — sebagian menghormati, sebagian memusuhi.'+fx({integritas:+6,reputasi:+5,heat:+4,trust:+3}),'good');leg(7,-2);ach('berani');}
  else addLog('Laporan Anda mental — buktinya kurang kuat, dan kini Anda punya musuh baru.'+fx({heat:+6,stres:+5}),'bad');}},
{k:'makelar',tab:'siasat',lbl:'Buka jasa "pengurusan perkara"',sub:'Raup uang ketok · rusak integritas',multi:true,cond:()=>!P.retired&&!P.dipecat,e:()=>{
  const u=ri(1,4)*1e9*Math.max(lvNow(),1);
  P.suapTerima++; addLog('Lewat panitera dan pengacara "langganan", perkara bisa diatur. Amplop pun mengalir.'+fx({gelap:+u,integritas:-10,heat:+9,trust:-2}),'bad');leg(-5,2);ach('makelar');if(P.suapTerima>=8)ach('mafia');}},
{k:'bina',tab:'siasat',lbl:'Bina koneksi & jejaring',sub:'Rp 300 jt · backing untuk karier & "pengaman"',multi:true,cond:()=>!P.retired&&P.money>=300e6,e:()=>{
  P.money-=300e6; P.koneksi=clamp(P.koneksi+ri(8,15),0,100);
  addLog('Anda rajin hadir di forum hakim, makan malam dengan pejabat, dan menjaga relasi dengan "orang penting". Backing Anda menguat.'+fx({reputasi:+2}),'sys');}},
{k:'lobiJabatan',tab:'siasat',lbl:'Lobi & "pelicin" jabatan',sub:'Rp 2 M · percepat promosi',cond:()=>!P.retired&&lvNow()<4&&P.money+P.gelap>=2e9,e:()=>{
  const c=2e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);
  P.koneksi=clamp(P.koneksi+ri(6,12),0,100);
  addLog('Beberapa makan malam dan amplop kemudian, nama Anda naik di bursa promosi dan koneksi Anda mengakar.'+fx({reputasi:+8,integritas:-6,heat:+4}),'bad');leg(-3,3);}},
{k:'cuci',tab:'siasat',lbl:'Cuci uang ketok',sub:'Putar lewat properti & yayasan',multi:true,cond:()=>P.gelap>=1e9,e:()=>{
  const x=P.gelap,bersih=Math.round(x*0.7);P.gelap=0;P.money+=bersih;
  addLog('Uang ketok '+rp(x)+' diputar lewat properti dan yayasan. Yang kembali "bersih": '+rp(bersih)+'.'+fx({heat:+5,integritas:-3}),'bad');}},
{k:'bersihHeat',tab:'siasat',lbl:'Konsultan & "rapikan" LHKPN',sub:'Rp 200 jt · redam sorotan',cond:()=>P.heat>=20&&P.money>=200e6,e:()=>{P.money-=200e6;addLog('Konsultan merapikan laporan harta Anda. Untuk sementara, semuanya "wajar".'+fx({heat:-10}),'sys');}},
/* ---- UANG ---- */
{k:'sumbang',tab:'uang',lbl:'Donasi bantuan hukum',sub:'Rp 200 jt · nama harum',cond:()=>P.money>=200e6,e:()=>{P.money-=200e6;addLog('Anda menyokong bantuan hukum untuk warga tak mampu.'+fx({reputasi:+4,integritas:+2,trust:+1}),'good');leg(2,0);}},
{k:'mewah',tab:'uang',lbl:'Beli aset mewah',sub:'Rp 3 M · gaya hidup naik, sorotan ikut',cond:()=>P.money+P.gelap>=3e9,e:()=>{const c=3e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);addLog('Rumah dan mobil baru menghias garasi. Stafsus menyarankan jangan dipamer, tapi tetangga sudah terlanjur melihat.'+fx({stres:-5,heat:+4,reputasi:-2}),'bad');}}
];

function actAvail(a){
  if(P.penjara>0)return {ok:false,why:'Anda di dalam lapas'};
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
  if(!a.multi)P.used[k]=true;
  G.acted++;
  a.e();
  if(G.acted>5){ P.st.stres=clamp(P.st.stres+2,0,100); }
  checkAch();
  render();
}
