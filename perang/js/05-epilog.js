'use strict';
/* ================= AKHIR & PENILAIAN ================= */
function akhiri(hasil,narasi){
  if(G.over)return;
  P.hasil=hasil; P.alive=false; P.sebab=HASIL[hasil].n.toLowerCase()+' — '+HASIL[hasil].d; G.over=true; G.current=null; G.queue=[];
  addLog('<b>'+HASIL[hasil].n+'.</b> '+narasi,hasil==='menang'||hasil==='menangTerbatas'?'good':hasil==='damai'||hasil==='beku'?'sys':'bad');
  stamp(HASIL[hasil].n); milestone(HASIL[hasil].n);
  /* peta dunia: yang kalah total hilang dari peta (abu-abu) untuk perang-perang berikutnya */
  if(hasil==='menang'){ tandaiKalah(N.e.k,P.neg,'ditaklukkan '+NEG[P.neg].n); addLog('Di peta dunia, <b>'+NEG[N.e.k].n+'</b> kini berwarna abu-abu.','sys'); }
  else if(hasil==='kalah'){ tandaiKalah(P.neg,N.e.k,'ditaklukkan '+NEG[N.e.k].n); addLog('Di peta dunia, <b>'+NEG[P.neg].n+'</b> kini berwarna abu-abu.','sys'); }
  else if(hasil==='kiamat'){ tandaiKalah(P.neg,null,'hancur dalam perang nuklir'); tandaiKalah(N.e.k,null,'hancur dalam perang nuklir'); addLog('Di peta dunia, kedua negara kini berwarna abu-abu.','sys'); }
  checkAch(true);
  showEpilog();
}
function checkAch(akhir){
  if(!P.f)return;
  if(P.puncakUdara>=75)ach('udara');
  if(P.puncakLaut>=75)ach('laut');
  if(P.mobil>=3)ach('mobilisasi');
  if(P.st.logistik>=85&&N.front>=30)ach('logistik');
  if(!akhir)return;
  const h=P.hasil, menang=h==='menang'||h==='menangTerbatas';
  if(h==='menang')ach('menang');
  if(h==='menangTerbatas')ach('terbatas');
  if(menang&&N.minggu<=20)ach('kilat');
  if(menang&&P.underdog)ach('daud');
  if(menang&&P.tujuan==='bertahan')ach('bertahan');
  if(menang&&P.tewas<=P.awal.pasukan*0.04)ach('hemat');
  if(h==='beku')ach('beku');
  if(P.underdog&&(h==='damai'||h==='beku'||menang))ach('gerilya');
  if(P.kejahatan===0&&P.sipilLawan<1&&menang)ach('bersih');
  if(P.kejahatan>=1)ach('penjahat');
}
function nilaiAkhir(){
  const h=P.hasil||'beku';
  const dasar={menang:85,menangTerbatas:74,damai:50,beku:38,damaiRugi:25,jatuh:15,kalah:8,kiamat:0}[h];
  const total=P.awal.pasukan+(P.mobilJumlah||0);
  const rugi=clamp(P.tewas/Math.max(total,1),0,1);                  /* porsi pasukan yang gugur */
  let menang=dasar-clamp(rugi*120,0,22)+(P.underdog?8:0);
  if((h==='menang'||h==='menangTerbatas')&&N.minggu<=20)menang+=6;
  if(h==='menangTerbatas'&&P.tujuan!=='total')menang+=6;            /* tujuan terbatas tercapai penuh */
  if(h==='kiamat')menang=0;
  menang=clamp(Math.round(menang),0,100);
  const sipil=P.sipilLawan+P.sipilKita*0.5;                          /* ribu jiwa */
  let manusia=74-clamp(Math.log10(1+sipil*1000)*6.5,0,34)-P.kejahatan*10+Math.min(P.koridor,4)*3+Math.min(P.tawananBaik,4)*3
    -(N.eskalasi>=60?8:0)-(P.agresor?8:0)+(h==='menangTerbatas'||h==='damai'?7:0)+(P.tawarDamai>0?3:0);
  if(h==='kiamat')manusia=0;
  manusia=clamp(Math.round(manusia),0,100);
  let jm;
  if(h==='kiamat')jm='Panglima Negeri yang Tak Ada Lagi';
  else if(menang>=85)jm='Ahli Strategi Agung';
  else if(menang>=70)jm='Panglima Pemenang';
  else if(menang>=50)jm='Panglima yang Bertahan';
  else if(menang>=30)jm='Panglima yang Terdesak';
  else jm='Panglima yang Kalah';
  let gm;
  if(h==='kiamat')gm='Penekan Tombol Kiamat';
  else if(P.kejahatan>=3)gm='Buronan Mahkamah Internasional';
  else if(manusia>=80)gm='Prajurit yang Menjaga Nurani';
  else if(manusia>=62)gm='Panglima yang Tahu Batas';
  else if(manusia>=42)gm='Panglima Bertangan Besi';
  else gm='Penjahat Perang';
  return {menang,manusia,jm,gm};
}
function ringkasanPerang(){
  const plus=[],minus=[], h=P.hasil;
  if(h==='menang'||h==='menangTerbatas')plus.push('Mencapai tujuan perang dalam '+N.minggu+' minggu');
  if(P.underdog&&h!=='kalah'&&h!=='jatuh'&&h!=='kiamat')plus.push('Bertahan melawan lawan yang jauh lebih kuat');
  if(P.koridor>0)plus.push('Membuka koridor kemanusiaan '+P.koridor+'×');
  if(P.tawananBaik>0)plus.push('Memperlakukan tawanan sesuai Konvensi Jenewa');
  if(P.puncakUdara>=75)plus.push('Merebut keunggulan udara');
  if(P.puncakLaut>=75)plus.push('Menguasai laut');
  if(P.tawarDamai>0)plus.push('Bersedia duduk di meja perundingan');
  if(P.kejahatan===0&&P.sipilLawan<1)plus.push('Nyaris tanpa korban sipil di pihak lawan');
  if(h==='kiamat')minus.push('Membawa dua bangsa ke kehancuran nuklir');
  if(h==='kalah')minus.push('Kehilangan ibu kota');
  if(h==='jatuh')minus.push('Kehilangan dukungan rakyat sendiri');
  if(P.kejahatan>0)minus.push('Terlibat '+P.kejahatan+' kejahatan perang');
  if(P.sipilLawan>=1)minus.push('±'+org(P.sipilLawan)+' warga sipil lawan tewas');
  if(P.sipilKita>=1)minus.push('±'+org(P.sipilKita)+' warga sipil sendiri tewas');
  if(P.tewas>=P.awal.pasukan*0.15)minus.push(org(P.tewas)+' prajurit gugur');
  if(P.agresor&&P.tujuan==='total')minus.push('Memulai perang penaklukan');
  if(P.minusDana>=6)minus.push('Membangkrutkan kas negara');
  return {plus:plus.slice(0,7),minus:minus.slice(0,7)};
}
function summaryHtml(){
  const rk=ringkasanPerang();
  const col=(t,arr,cls)=>'<div class="pm-col '+cls+'"><h5>'+t+'</h5>'+(arr.length?'<ul>'+arr.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<div class="pm-none">tidak ada yang menonjol</div>')+'</div>';
  return '<div class="pm-cols">'+col('CATATAN PERANG — BAIK',rk.plus,'plus')+col('CATATAN PERANG — BURUK',rk.minus,'minus')+'</div>';
}
function showEpilog(){
  const v=nilaiAkhir(), cA=NEG[P.neg], cB=NEG[N.e.k];
  const rw=P.riwayat.map(x=>'<li>'+x.th+' — '+x.t+'</li>').join('');
  const achs=Object.keys(P.ach).map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join('')||'<span class="muted">—</span>';
  if(!hasDoc)return;
  $('epilog').innerHTML=
    '<div class="arsip-sharecard">'+
      '<h2>BERKAS PERANG DITUTUP</h2>'+
      '<div class="sub">Jenderal '+P.nama+' · '+cA.n+' melawan '+cB.n+' · '+TUJUAN[P.tujuan].n+'<br>'+HASIL[P.hasil].n+' setelah '+N.minggu+' minggu — '+HASIL[P.hasil].d+'</div>'+
      '<div class="vrow">'+
        '<div class="vbox rakyat"><h4>KEMENANGAN</h4><div class="vskor">'+v.menang+'</div><div class="vjdl">"'+v.jm+'"</div>'+
          '<div class="vq">Di buku sejarah militer, ia tercatat '+(v.menang>=70?'sebagai panglima yang menuntaskan tugasnya.':v.menang>=45?'sebagai panglima yang menahan keadaan agar tidak lebih buruk.':'sebagai pelajaran tentang perang yang salah hitung.')+'</div></div>'+
        '<div class="vbox negara"><h4>KEMANUSIAAN</h4><div class="vskor">'+v.manusia+'</div><div class="vjdl">"'+v.gm+'"</div>'+
          '<div class="vq">Di mata para penyintas, ia dikenang '+(v.manusia>=70?'sebagai prajurit yang masih ingat batas.':v.manusia>=45?'sebagai orang yang menang atau kalah dengan harga mahal.':'dengan nama-nama yang terukir di tugu peringatan.')+'</div></div>'+
      '</div>'+
      summaryHtml()+
      '<div class="sub">Prajurit gugur: '+org(P.tewas)+' · Perkiraan prajurit lawan gugur: '+org(P.tewasLawan)+' · Warga sipil tewas (dua pihak): '+org(P.sipilLawan+P.sipilKita)+'</div>'+
      '<div class="achr">'+achs+'</div>'+
    '</div>'+
    '<ul>'+rw+'</ul>'+
    '<div class="sub" style="margin-top:8px">Simulasi hipotetis. Angka kekuatan adalah perkiraan dari data terbuka, dan perang sungguhan selalu lebih buruk daripada angka-angkanya.</div>'+
    '<button data-go="new">Buka Berkas Perang Baru »</button>';
  $('overlay').classList.remove('hidden');
  if(window.Platform){
    try{ Platform.handleResult({
      game:'perang', nama:P.nama, age:P.age, lahir:N.tahun-P.age, tahun:N.tahun, kota:cA.n, sebab:P.sebab,
      skorMenang:v.menang, skorManusia:v.manusia, julukanMenang:v.jm, gelarManusia:v.gm,
      negara:cA.n, lawan:cB.n, tujuan:TUJUAN[P.tujuan].n, hasil:HASIL[P.hasil].n, minggu:N.minggu,
      gugur:Math.round(P.tewas*1000), sipil:Math.round((P.sipilLawan+P.sipilKita)*1000), kejahatan:P.kejahatan,
      achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
    }); }catch(e){}
  }
}
