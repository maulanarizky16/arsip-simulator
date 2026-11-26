'use strict';
/* ================= KEMATIAN & AKHIR ================= */
function die(sebab){
  P.alive=false; P.sebab=sebab; G.over=true;
  addLog('<b>'+P.nama+' wafat di usia '+P.age+' tahun</b> — '+sebab+'.','bad');
  stamp('BERKAS DITUTUP');
  showEpilog();
}
function deathCheck(){
  const s=P.st;
  let p=0;
  if(P.age>62)p+=(P.age-62)*0.008;
  if(s.kesehatan<25)p+=0.10;
  else if(s.kesehatan<45)p+=0.03;
  if(r()<p)die(s.kesehatan<40?'sakit yang lama menggerogoti':pick(SEBAB_TUA));
}
function checkAch(){
  if(P.korupsiTurun>=20)ach('reformis');
  if(P.maxLv>=2&&P.st.integritas>=85)ach('bersih');
  if(P.gelapTotal>=50e9)ach('kakap');
  if(P.cDemo>=10)ach('orator');
  if(N.demokrasi>=85&&P.maxLv>=4)ach('kompromi');
}
/* dua kacamata: rakyat vs negara */
function nilaiAkhir(){
  const avgPop=P.sumPop/Math.max(P.years,1);
  let nr=Math.round(45+P.legR*0.8+(avgPop-35)/2.2);
  if(P.vonis)nr-=28;
  if(P.tapol)nr+=10;
  nr=clamp(nr,0,100);
  let nn=Math.round(38+P.legN*0.9+P.maxLv*7);
  if(P.vonis)nn-=45;
  if(P.tapol)nn-=15;
  nn=clamp(nn,0,100);
  let jr;
  if(P.vonis&&avgPop>=52)jr='Koruptor yang Tetap Dirindukan';
  else if(P.vonis)jr='Koruptor Kelas Kakap';
  else if(nr>=78&&P.cDemo+P.cEkspos+P.cWhistle>=10)jr='Pahlawan Rakyat Kecil';
  else if(nr>=78)jr='Pemimpin yang Dicintai';
  else if(nr>=58)jr='Politisi yang Lumayan Lah';
  else if(nr>=38)jr='Yang Penting Pernah Ada';
  else jr='Dilupakan (atau Dimaki) Sejarah';
  let gn;
  if(P.vonis)gn='Dicoret dari Buku Sejarah Resmi';
  else if(P.legN<=-30)gn='Dicap Musuh Ketertiban Negara';
  else if(P.tapol)gn='Eks Tahanan — Berkas Diberi Tanda Merah';
  else if(nn>=82&&P.maxLv>=4)gn='PAHLAWAN NASIONAL (Anumerta)';
  else if(nn>=68)gn='Bintang Mahaputera';
  else if(nn>=52)gn='Tercatat Baik dalam Arsip Negara';
  else if(nn>=35)gn='Sekadar Tercatat';
  else gn='Nyaris Tak Tercatat';
  return {nr,nn,jr,gn,avgPop:Math.round(avgPop)};
}
/* daftar poin baik & buruk selama menjabat — diturunkan dari kondisi akhir & rekam jejak */
function ringkasanKepemimpinan(){
  const plus=[], minus=[];
  const has=t=>P.riwayat.some(x=>x.t.indexOf(t)>=0);
  if(P.korupsiTurun>=8)plus.push('Menekan korupsi — indeks turun '+Math.round(P.korupsiTurun)+' poin');
  if(P.bersihAksi>0)plus.push('Aktif membersihkan institusi ('+P.bersihAksi+'×)');
  if(N.demokrasi>=60)plus.push('Menjaga demokrasi tetap sehat ('+N.demokrasi+'/100)');
  if(N.kebebasan>=60)plus.push('Ruang kebebasan sipil terjaga');
  if(N.infra>=65)plus.push('Membangun infrastruktur (indeks '+N.infra+')');
  if(N.pendidikan>=62)plus.push('Memajukan pendidikan');
  if(N.keswa>=62)plus.push('Memperkuat layanan kesehatan');
  if(N.kemiskinan<=12)plus.push('Menekan kemiskinan ke '+N.kemiskinan.toFixed(1)+'%');
  if(N.ekonomi>=62)plus.push('Menjaga ekonomi tumbuh ('+N.ekonomi+')');
  if(N.lingkungan>=60)plus.push('Menjaga lingkungan');
  if(P.st.integritas>=72)plus.push('Menjaga integritas pribadi');
  if(P.cWhistle+P.cEkspos>0)plus.push('Berani membongkar korupsi/skandal');
  if(N.mbg)plus.push('Menjalankan program Makan Bergizi Gratis');
  if(N.iknFase>=3)plus.push('Menuntaskan IKN hingga berfungsi');
  if(P.ach.merpati||has('damai'))plus.push('Menyelesaikan konflik lewat jalan damai');
  if(P.rival&&P.rival.hub==='sekutu')plus.push('Merangkul rival '+P.rival.nama.split(' ')[0]+' menjadi sekutu');
  else if(P.rival&&P.rival.kalah>=2)plus.push('Berulang kali mengalahkan rival '+P.rival.nama.split(' ')[0]+' ('+P.rival.kalah+'×)');
  if(P.vonis)minus.push('Divonis korupsi dan dipenjara');
  if(P.gelapTotal>=10e9)minus.push('Mengumpulkan uang gelap '+rp(P.gelapTotal));
  if(N.korupsi>=70)minus.push('Korupsi merajalela ('+N.korupsi+'/100)');
  if(N.demokrasi<=40)minus.push('Demokrasi merosot ('+N.demokrasi+')');
  if(N.kebebasan<=40)minus.push('Mengekang kebebasan sipil');
  if(has('Memulai perang'))minus.push('Menyeret negara ke dalam perang');
  if(has('Dimakzulkan'))minus.push('Dimakzulkan dari jabatan');
  if(has('sanksi internasional'))minus.push('Negara terkena sanksi internasional');
  if(N.utang>=2500)minus.push('Menumpuk utang negara ('+rpT(N.utang)+')');
  if(N.inflasi>=12)minus.push('Inflasi tinggi dibiarkan ('+N.inflasi.toFixed(1)+'%)');
  if(N.kemiskinan>=22)minus.push('Kemiskinan meningkat tajam ('+N.kemiskinan.toFixed(1)+'%)');
  if(P.tigaOk)minus.push('Mengutak-atik konstitusi demi 3 periode');
  if(N.lingkungan<=35)minus.push('Membiarkan kerusakan lingkungan');
  if(P.mewah>0)minus.push('Memamerkan kekayaan di tengah jabatan');
  if(N.pers>=70&&N.kebebasan<=45)minus.push('Mengendalikan media demi citra');
  if(P.rival&&P.rival.menang>=2&&P.rival.hub!=='sekutu')minus.push('Berulang kali dikalahkan rival '+P.rival.nama.split(' ')[0]);
  return {plus:plus.slice(0,8), minus:minus.slice(0,8)};
}
function summaryHtml(){
  if(!P.maxLv) return '<div class="sub" style="font-style:italic">Tidak pernah memegang jabatan — tak ada catatan kepemimpinan untuk dinilai.</div>';
  const rk=ringkasanKepemimpinan();
  const col=(title,arr,cls)=>'<div class="pm-col '+cls+'"><h5>'+title+'</h5>'+(arr.length?'<ul>'+arr.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<div class="pm-none">tidak ada yang menonjol</div>')+'</div>';
  return '<div class="pm-cols">'+col('SELAMA MENJABAT — POSITIF',rk.plus,'plus')+col('SELAMA MENJABAT — NEGATIF',rk.minus,'minus')+'</div>';
}
function showEpilog(){
  const v=nilaiAkhir();
  if(P.st.integritas>=70&&(P.cDemo+P.cWhistle)>=6&&v.nr>=70)ach('pahlawan'in ACH_DEF?'pahlawan':'orator');
  const rw=P.riwayat.map(x=>'<li>'+x.th+' — '+x.t+'</li>').join('');
  const achs=Object.keys(P.ach).map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join('')||'<span class="muted">—</span>';
  if(!hasDoc)return;
  $('epilog').innerHTML=
    '<div class="arsip-sharecard">'+
      '<h2>BERKAS DITUTUP</h2>'+
      '<div class="sub">'+P.nama+' · '+P.lahir+'–'+N.tahun+' · '+P.kota+'<br>Wafat usia '+P.age+', '+P.sebab+' · Jabatan tertinggi: '+(P.maxLv?Object.values(JAB).find(j=>j.lv===P.maxLv).n:'tidak pernah menjabat')+'</div>'+
      '<div class="vrow">'+
        '<div class="vbox rakyat"><h4>PENILAIAN RAKYAT</h4><div class="vskor">'+v.nr+'</div><div class="vjdl">"'+v.jr+'"</div>'+
          '<div class="vq">Di warung kopi, orang-orang mengingatnya sebagai '+(v.nr>=58?'sosok yang berpihak pada mereka.':v.nr>=38?'nama yang samar-samar pernah terdengar.':'contoh agar anak-anak tidak meniru.')+'</div></div>'+
        '<div class="vbox negara"><h4>CATATAN NEGARA</h4><div class="vskor">'+v.nn+'</div><div class="vjdl">"'+v.gn+'"</div>'+
          '<div class="vq">Dalam dokumen resmi, ia tercatat '+(v.nn>=52?'sebagai aset bangsa yang berjasa.':v.nn>=35?'tanpa banyak catatan kaki.':'dengan stempel yang tidak menyenangkan.')+'</div></div>'+
      '</div>'+
      summaryHtml()+
      '<div class="sub">Rata-rata popularitas seumur hidup: '+v.avgPop+'% · Uang gelap kumulatif: '+rp(P.gelapTotal)+' · Demo/ekspos: '+(P.cDemo+P.cEkspos+P.cWhistle)+'×</div>'+
      '<div class="achr">'+achs+'</div>'+
    '</div>'+
    '<ul>'+rw+'</ul>'+
    '<button data-go="new">Tulis Sejarah Baru »</button>';
  $('overlay').classList.remove('hidden');
  if(window.Platform){
    try{ Platform.handleResult({
      game:'negara',
      nama:P.nama, age:P.age, lahir:P.lahir, tahun:N.tahun, kota:P.kota,
      sebab:P.sebab,
      skorRakyat:v.nr, skorNegara:v.nn,
      julukanRakyat:v.jr, gelarNegara:v.gn,
      avgPop:v.avgPop,
      jabatanTertinggi:(P.maxLv?Object.values(JAB).find(function(j){return j.lv===P.maxLv;}).n:'tidak pernah menjabat'),
      gelapTotal:P.gelapTotal, aksiGerakan:(P.cDemo+P.cEkspos+P.cWhistle),
      vonis:P.vonis, tapol:P.tapol,
      achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
    }); }catch(e){}
  }
}

