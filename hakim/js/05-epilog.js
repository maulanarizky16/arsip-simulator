'use strict';
/* ================= KEMATIAN & AKHIR ================= */
function die(sebab){
  P.alive=false; P.sebab=sebab; G.over=true;
  addLog('<b>'+P.nama+' wafat di usia '+P.age+' tahun</b> — '+sebab+'.','bad');
  stamp('BERKAS DITUTUP'); showEpilog();
}
function deathCheck(){
  const s=P.st; let p=0;
  if(P.age>62)p+=(P.age-62)*0.008;
  if(s.kesehatan<25)p+=0.10; else if(s.kesehatan<45)p+=0.03;
  if(r()<p)die(s.kesehatan<40?'sakit yang lama menggerogoti':pick(SEBAB_TUA));
}
function checkAch(){
  if(P.st.integritas>=85&&P.adil>=8)ach('adilSejati');
  if(P.adil>=12&&P.takadil===0&&P.suapTerima===0)ach('wakilTuhan');
  if((P.money+P.gelap)>=20e9)ach('kaya');
  if(P.st.kompetensi>=88)ach('guru');
  if(P.st.integritas>=80&&P.st.reputasi>=70&&P.adil>=10&&P.suapTerima===0)ach('teladan');
}
function nilaiAkhir(){
  const s=P.st;
  const ratio=P.perkara?P.adil/((P.adil+P.takadil)||1):0.5;
  let adil=Math.round(40+P.keadilanLeg*0.6+(s.integritas-50)/3+(ratio-0.5)*40+(N.kepercayaan-50)/5);
  if(P.vonis)adil-=30;
  adil-=P.suapTerima*2;
  adil=clamp(adil,0,100);
  const harta=P.money+P.gelap;
  let karier=Math.round(20+P.maxLv*14+P.kuasaLeg*0.4+(s.reputasi-30)/4+clamp(harta/2e9,0,18)+clamp(P.koneksi/10,0,10));
  if(P.dipecat)karier-=15;
  karier=clamp(karier,0,100);
  let jr;
  if(P.vonis)jr='Mafia Peradilan yang Tumbang';
  else if(adil>=82&&s.integritas>=75)jr='Wakil Tuhan di Bumi';
  else if(adil>=68)jr='Hakim yang Adil';
  else if(adil>=50)jr='Hakim yang Lumayan Lurus';
  else if(adil>=32)jr='Hakim yang Mudah Goyah';
  else jr='Makelar Kasus Berjubah Hakim';
  let gn;
  if(P.dipecat)gn='Dicopot & Dicoret dari Korps Hakim';
  else if(P.maxLv>=4)gn='Ketua Mahkamah Agung';
  else if(P.maxLv>=3)gn='Hakim Agung';
  else if(P.maxLv>=2)gn='Hakim Tinggi';
  else gn='Hakim Pengadilan Negeri';
  if(adil>=80&&s.integritas>=75)ach('wakilTuhan');
  if(P.maxLv>=4&&!P.vonis)ach('ketua');
  return {adil,karier,jr,gn,harta};
}
function ringkasanKarier(){
  const plus=[],minus=[];
  if(P.adil>=6)plus.push('Menegakkan keadilan di '+P.adil+' perkara');
  if(P.st.integritas>=70)plus.push('Menjaga integritas sampai akhir');
  if(P.suapTerima===0&&P.perkara>=5)plus.push('Tak sekali pun menerima suap');
  if(P.dissent>0)plus.push('Menulis dissenting opinion di '+P.dissent+' perkara');
  if(P.mediasi>=3)plus.push('Mendamaikan '+P.mediasi+' perkara lewat mediasi');
  if(P.ach&&P.ach.doktor)plus.push('Meraih gelar Doktor Ilmu Hukum');
  if(P.vonisMati>0)plus.push('Tegas pada kejahatan keji');
  if(P.maxLv>=3)plus.push('Menapaki kursi tertinggi peradilan');
  if(N.kepercayaan>=60)plus.push('Mengangkat kepercayaan publik pada peradilan');
  if(P.st.nyali>=70)plus.push('Berani melawan tekanan orang kuat');
  if(P.taatKaidah>=8)plus.push('Konsisten menerapkan kaidah hukum');
  if(P.vonis)minus.push('Divonis korupsi dan dipecat');
  if(P.ach&&P.ach.licin)minus.push('Lolos dari OTT dengan koneksi & uang');
  if(P.mundur>=5)minus.push('Sering mundur dari perkara berat ('+P.mundur+'×)');
  if(P.suapTerima>0)minus.push('Menerima suap di '+P.suapTerima+' perkara');
  if(P.takadil>P.adil)minus.push('Lebih sering memutus menyimpang dari bukti');
  if(P.suapTotal>=5e9)minus.push('Menumpuk uang ketok '+rp(P.suapTotal));
  if(N.kepercayaan<=35)minus.push('Meruntuhkan kepercayaan publik pada hukum');
  return {plus:plus.slice(0,7),minus:minus.slice(0,7)};
}
function summaryHtml(){
  const rk=ringkasanKarier();
  const col=(t,arr,cls)=>'<div class="pm-col '+cls+'"><h5>'+t+'</h5>'+(arr.length?'<ul>'+arr.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<div class="pm-none">tidak ada yang menonjol</div>')+'</div>';
  return '<div class="pm-cols">'+col('SELAMA BERTUGAS — BAIK',rk.plus,'plus')+col('SELAMA BERTUGAS — BURUK',rk.minus,'minus')+'</div>';
}
function showEpilog(){
  const v=nilaiAkhir();
  const rw=P.riwayat.map(x=>'<li>'+x.th+' — '+x.t+'</li>').join('');
  const achs=Object.keys(P.ach).map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join('')||'<span class="muted">—</span>';
  if(!hasDoc)return;
  $('epilog').innerHTML=
    '<div class="arsip-sharecard">'+
      '<h2>BERKAS DITUTUP</h2>'+
      '<div class="sub">'+P.nama+', '+P.gelar+' · '+P.lahir+'–'+N.tahun+'<br>Wafat usia '+P.age+', '+P.sebab+' · Jabatan tertinggi: '+(JAB[Object.keys(JAB).find(k=>JAB[k].lv===P.maxLv)]||JAB.pn).n+'</div>'+
      '<div class="vrow">'+
        '<div class="vbox rakyat"><h4>KEADILAN</h4><div class="vskor">'+v.adil+'</div><div class="vjdl">"'+v.jr+'"</div>'+
          '<div class="vq">Di mata pencari keadilan, ia dikenang '+(v.adil>=68?'sebagai hakim yang menegakkan hukum.':v.adil>=45?'sebagai hakim biasa yang kadang goyah.':'sebagai contoh kenapa orang tak percaya pengadilan.')+'</div></div>'+
        '<div class="vbox negara"><h4>KARIER & KUASA</h4><div class="vskor">'+v.karier+'</div><div class="vjdl">"'+v.gn+'"</div>'+
          '<div class="vq">Dalam catatan korps, ia '+(P.dipecat?'berakhir dengan tinta merah.':v.karier>=70?'mencapai puncak kekuasaan peradilan.':v.karier>=45?'meniti karier yang lumayan.':'tak banyak menanjak.')+'</div></div>'+
      '</div>'+
      summaryHtml()+
      '<div class="sub">Perkara ditangani: '+P.perkara+' · Putusan adil: '+P.adil+' · Menyimpang: '+P.takadil+' · Suap diterima: '+P.suapTerima+'× · Harta akhir: '+rp(v.harta)+'</div>'+
      '<div class="achr">'+achs+'</div>'+
    '</div>'+
    '<ul>'+rw+'</ul>'+
    '<button data-go="new">Tulis Berkas Baru »</button>';
  $('overlay').classList.remove('hidden');
  if(window.Platform){
    try{ Platform.handleResult({
      game:'hakim', nama:P.nama, age:P.age, lahir:P.lahir, tahun:N.tahun, kota:P.kota, sebab:P.sebab,
      skorAdil:v.adil, skorKarier:v.karier, julukanAdil:v.jr, gelarKarier:v.gn,
      jabatanTertinggi:(JAB[Object.keys(JAB).find(k=>JAB[k].lv===P.maxLv)]||JAB.pn).n,
      perkara:P.perkara, adil:P.adil, suapTerima:P.suapTerima, vonis:P.vonis,
      achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
    }); }catch(e){}
  }
}
