'use strict';
/* ================= AKHIR ================= */
function die(sebab){
  P.alive=false; P.sebab=sebab; G.over=true;
  addLog('<b>'+P.nama+' wafat di usia '+P.age+' tahun</b> — '+sebab+'.','bad');
  stamp('BERKAS DITUTUP'); showEpilog();
}
function deathCheck(){
  const s=P.st; let p=0;
  if(P.age>60)p+=(P.age-60)*0.01;
  if(s.kesehatan<25)p+=0.12; else if(s.kesehatan<45)p+=0.03;
  if(s.stres>90&&s.kesehatan<40)p+=0.05;
  if(r()<p)die(s.kesehatan<40?'serangan jantung di depan layar setelah bertahun-tahun overwork':pick(SEBAB_TUA));
}
function checkAch(){
  if(P.beres>=40)ach('pemadam');
  if(P.maxLv>=6)ach('cto');
  if(P.money+P.saham+(P.ekuitas||0)>=20e9)ach('sultanTech');
  if(P.sertifikat.filter(x=>+x.slice(-1)>=1).length>=4)ach('sertifikat');
  if(P.st.ngoding>=80&&P.st.sistem>=70&&P.st.jaringan>=65)ach('polyglot');
  if(P.spes==='iot'&&infraGet('iotfleet')&&infraGet('iotfleet').sehat>=85&&P.beres>=12)ach('iotMaster');
}
function nilaiAkhir(){
  const handled=P.beres+P.gagal;
  const beresR=handled?P.beres/handled:0.5;   /* dihitung hanya atas insiden yang ditangani sendiri */
  const repAvg=P.years?P.sumRep/P.years:P.reputasi;   /* reputasi rata-rata sepanjang karier */
  const harta=P.money+P.saham+(P.ekuitas||0)+(P.saasMRR||0)*24;   /* tunai + investasi pribadi + ekuitas startup + nilai produk SaaS */
  let karya=Math.round(34 + P.legK*0.55 + (P.reputasi-30)/3 + (repAvg-30)/8 + (beresR-0.5)*42 + (uptimeRata()-70)/4
    + P.mentorKali*1.4 + (P.openSource?5:0) + P.hackWhite*1.4 + P.ctfMenang*1.2 + clamp((P.uptimeStreak||0),0,6)
    - P.hackBlack*4 - P.exploitJual*3 - P.dataHilang*3 - P.outageBesar*2 - (P.coverUps||0)*2);
  if(P.vonis)karya-=30;
  karya=clamp(karya,0,100);
  let cuan=Math.round(18 + P.maxLv*11 + P.legC*0.4 + clamp(harta/2e9,0,30) + (P.reputasi-30)/6 + clamp(P.gelapTotal/2e9,0,8));
  if(P.dipecat&&!P.buronan)cuan-=12;
  if(P.buronan)cuan=Math.max(cuan,55);   /* buronan kaya: harta besar walau karier resmi tamat */
  cuan=clamp(cuan,0,100);
  /* julukan KARYA (sisi engineering & etika) */
  let jk;
  if(P.vonis)jk='Black Hat yang Tumbang';
  else if(P.topi==='hitam')jk='Peretas Topi Hitam';
  else if(karya>=84&&P.reputasi>=75)jk='Engineer Legendaris';
  else if(karya>=70)jk='Engineer Andal yang Dihormati';
  else if(karya>=52)jk='Engineer Solid';
  else if(karya>=34)jk='Tukang Tambal Sistem';
  else jk='Script Kiddie yang Menua';
  /* gelar CUAN/KARIER */
  let gc;
  if(P.buronan)gc='Buronan Siber yang Kaya';
  else if(P.dipecat&&P.vonis)gc='Karier Tamat di Penjara';
  else if(P.maxLv>=6)gc='CTO / VP Engineering';
  else if(P.maxLv>=5)gc='Principal Engineer';
  else if(P.maxLv>=4)gc='Tech Lead';
  else if(P.maxLv>=3)gc='Senior Engineer';
  else if(P.maxLv>=2)gc='Medior Engineer';
  else gc='Engineer Junior Abadi';
  if(karya>=84&&P.reputasi>=75&&!P.vonis)ach('legend');
  return {karya,cuan,jk,gc,harta};
}
function ringkasanKarier(){
  const plus=[],minus=[];
  if(P.beres>=15)plus.push('Memadamkan '+P.beres+' insiden produksi');
  if(uptimeRata()>=88)plus.push('Menjaga uptime sistem di '+uptimeRata()+'%');
  if(P.reputasi>=70)plus.push('Reputasi teknis tinggi di komunitas');
  if(P.maxLv>=5)plus.push('Menapaki kursi '+(P.maxLv>=6?'CTO':'Principal'));
  if(P.openSource)plus.push('Mewariskan proyek open source');
  if(P.mentorKali>=3)plus.push('Membimbing '+P.mentorKali+' kali generasi engineer berikutnya');
  if(P.hackWhite>0||P.bugBounty>0)plus.push('Berburu celah sebagai topi putih');
  { const st=sertTertinggi(); if(P.sertifikat.length>=3||(st&&st.g>=2))plus.push('Mengantongi '+P.sertifikat.length+' sertifikasi'+(st?', tertinggi '+sertNama(st.j,st.g):'')); }
  if(P.pelatihanAI)plus.push('Bertahan & berkembang di gelombang AI');
  if(P.ach.exit)plus.push('Meraup cuan dari exit startup');
  else if(P.saham>=1e9)plus.push('Membangun portofolio investasi '+rp(P.saham));
  if(P.saasMRR>0)plus.push('Membangun produk SaaS berpenghasilan pasif');
  if((P.uptimeStreak||0)>=3)plus.push('Menjaga uptime tinggi bertahun-tahun beruntun');
  if(P.vonis)minus.push('Divonis penjara atas kejahatan siber');
  if(P.buronan)minus.push('Kabur jadi buronan siber, tak bisa pulang');
  if((P.coverUps||0)>0)minus.push('Menutup-nutupi '+P.coverUps+' insiden kebocoran data');
  if(P.hackBlack>0)minus.push('Menjalankan '+P.hackBlack+' operasi topi hitam');
  if(P.exploitJual>0)minus.push('Menjual '+P.exploitJual+' exploit di pasar gelap');
  if(P.dataHilang>0)minus.push('Kehilangan/membocorkan data di '+P.dataHilang+' insiden');
  if(P.outageBesar>=2)minus.push('Menyebabkan '+P.outageBesar+' outage besar');
  if(P.gagal>P.beres&&P.insidenTotal>=6)minus.push('Lebih sering gagal menangani insiden');
  if(P.eskalasi>=5)minus.push('Sering lempar masalah ke orang lain ('+P.eskalasi+'×)');
  if(P.gelapTotal>=2e9)minus.push('Menumpuk uang gelap '+rp(P.gelapTotal));
  if(P.burnoutKali>=2)minus.push('Berkali-kali tumbang oleh burnout');
  return {plus:plus.slice(0,7),minus:minus.slice(0,7)};
}
function summaryHtml(){
  const rk=ringkasanKarier();
  const col=(t,arr,cls)=>'<div class="pm-col '+cls+'"><h5>'+t+'</h5>'+(arr.length?'<ul>'+arr.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<div class="pm-none">tidak ada yang menonjol</div>')+'</div>';
  return '<div class="pm-cols">'+col('SEPANJANG KARIER — BAIK',rk.plus,'plus')+col('SEPANJANG KARIER — BURUK',rk.minus,'minus')+'</div>';
}
function showEpilog(){
  const v=nilaiAkhir();
  const rw=P.riwayat.map(x=>'<li>'+x.th+' — '+x.t+'</li>').join('');
  const achs=Object.keys(P.ach).map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join('')||'<span class="muted">—</span>';
  if(!hasDoc)return;
  const jabTop=JAB[Object.keys(JAB).find(k=>JAB[k].lv===P.maxLv)]||JAB.junior;
  $('epilog').innerHTML=
    '<div class="arsip-sharecard">'+
      '<h2>BERKAS DITUTUP</h2>'+
      '<div class="sub">'+P.nama+' · '+P.lahir+'–'+N.tahun+' · '+P.spesN+'<br>'+
        (P.sebab?('Wafat usia '+P.age+', '+P.sebab+' · '):'')+'Posisi tertinggi: '+jabTop.n+' '+P.spesN+'</div>'+
      '<div class="vrow">'+
        '<div class="vbox karya"><h4>KARYA & INTEGRITAS</h4><div class="vskor">'+v.karya+'</div><div class="vjdl">"'+v.jk+'"</div>'+
          '<div class="vq">Di mata komunitas, ia dikenang '+(v.karya>=70?'sebagai engineer yang membangun sistem andal dengan tangan bersih.':v.karya>=45?'sebagai engineer biasa yang naik-turun.':'sebagai pengingat bahwa skill tanpa arah cepat usang.')+'</div></div>'+
        '<div class="vbox cuan"><h4>CUAN & KARIER</h4><div class="vskor">'+v.cuan+'</div><div class="vjdl">"'+v.gc+'"</div>'+
          '<div class="vq">Dari sisi karier & kekayaan, ia '+(P.vonis?'berakhir di kursi pesakitan.':v.cuan>=70?'mencapai puncak dan harta yang melimpah.':v.cuan>=45?'meniti karier yang lumayan mapan.':'tak banyak menanjak secara materi.')+'</div></div>'+
      '</div>'+
      summaryHtml()+
      '<div class="sub">Insiden ditangani: '+P.insidenTotal+' · Beres: '+P.beres+' · Gagal: '+P.gagal+' · Uptime akhir: '+uptimeRata()+'% · Harta: '+rp(v.harta)+(P.gelapTotal>0?' · Gelap: '+rp(P.gelapTotal):'')+'</div>'+
      '<div class="achr">'+achs+'</div>'+
    '</div>'+
    '<ul>'+rw+'</ul>'+
    '<button data-go="new">Tulis Berkas Baru »</button>';
  $('overlay').classList.remove('hidden');
  if(window.Platform){
    try{ Platform.handleResult({
      game:'it', nama:P.nama, age:P.age, lahir:P.lahir, tahun:N.tahun, kota:P.kota, sebab:P.sebab,
      spesialisasi:P.spesN, skorKarya:v.karya, skorCuan:v.cuan, julukanKarya:v.jk, gelarCuan:v.gc,
      jabatanTertinggi:jabTop.n+' '+P.spesN, topi:P.topi,
      insiden:P.insidenTotal, beres:P.beres, uptime:uptimeRata(), harta:v.harta, gelapTotal:P.gelapTotal, vonis:P.vonis,
      achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
    }); }catch(e){}
  }
}
