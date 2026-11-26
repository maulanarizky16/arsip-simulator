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
  if(r()<p)die(s.kesehatan<40?'jatuh sakit setelah bertahun-tahun memforsir diri':pick(SEBAB_TUA));
}
function maxSkala(){ return P.usaha.reduce((m,u)=>Math.max(m,u.skala),0); }
function checkAch(){
  const nw=netWorth();
  if(nw>=1e9)ach('miliarder');
  if(nw>=1e12)ach('triliuner');
  if(nw>=20e12)ach('sultan');
  cekSkalaAch();
  if(P.bangkrutTotal>0&&nw>=2e9)ach('bangkrutBangkit');
  if(nw>=1e12&&(P.gelapTotal>=2e9||P.suapKali>=2||P.buruh<=35))ach('taipanHitam');
}
function nilaiAkhir(){
  const nw=netWorth();
  const skalaLog=clamp(Math.log10(Math.max(nw,1e6))-6,0,7);   /* 1jt→0 · 1M→3 · 1T→6 · 10T→7 */
  let harta=Math.round(12 + P.legH*0.4 + skalaLog*9 + maxSkala()*3 + jumlahSektor()*2 + P.ipoKali*4 + clamp(P.akuisisiKali,0,3)*2);
  if(P.vonis)harta-=20;
  harta=clamp(harta,0,100);
  let nama=Math.round(40 + P.legN*0.55 + (P.reputasi-30)/3 + (P.buruh-50)/4
    + (P.hajiDone?3:0) + clamp(P.csrTotal/2e9,0,12)
    - P.suapKali*2 - clamp(P.gelapTotal/2e9,0,8) - clamp(P.pajakNunggak/2e9,0,6));
  if(P.modusPajak==='hindar')nama-=4;
  if(P.vonis)nama-=30;
  nama=clamp(nama,0,100);
  let jh;
  if(P.vonis)jh='Taipan yang Jatuh';
  else if(nw>=10e12)jh='Konglomerat Raksasa';
  else if(harta>=80)jh='Sang Konglomerat';
  else if(harta>=62)jh='Juragan Besar';
  else if(harta>=45)jh='Pengusaha Mapan';
  else if(harta>=28)jh='Pedagang yang Bertahan';
  else jh='Usaha Kecil yang Tersendat';
  let gn;
  if(P.vonis)gn='Berakhir di Balik Jeruji';
  else if(nama>=82)gn='Dermawan yang Dikenang';
  else if(nama>=66)gn='Pengusaha Terhormat';
  else if(nama>=48)gn='Pengusaha Biasa';
  else if(nama>=30)gn='Pengusaha Licik';
  else gn='Bos Bertangan Kotor';
  if(harta>=80&&nama>=75&&!P.vonis)ach('legend');
  if(P.csrTotal>=2e9)ach('dermawan');
  return {harta,nama,jh,gn,nw};
}
function ringkasanKarier(){
  const plus=[],minus=[];
  if(maxSkala()>=5)plus.push('Membangun '+(maxSkala()>=6?'konglomerasi':'korporasi')+' dari nol');
  if(jumlahSektor()>=4)plus.push('Menggurita di '+jumlahSektor()+' sektor berbeda');
  if(netWorth()>=1e12)plus.push('Menembus kekayaan triliunan');
  if(P.ipoKali>0)plus.push('Membawa '+P.ipoKali+' perusahaan IPO');
  if(P.csrTotal>=1e9)plus.push('Menyalurkan '+rp(P.csrTotal)+' untuk sesama');
  if(P.buruh>=70)plus.push('Mengayomi & menyejahterakan pekerja');
  if(P.modusPajak==='patuh'&&P.pajakNunggak===0)plus.push('Patuh pajak sampai akhir');
  if(P.hajiDone)plus.push('Menunaikan haji dari hasil usaha');
  if(P.dealBagus>=4)plus.push('Jeli mencium peluang emas ('+P.dealBagus+'×)');
  if(P.bangkrutTotal>0&&netWorth()>=2e9)plus.push('Bangkit dari kebangkrutan');
  if(P.vonis)minus.push('Divonis penjara atas kasus pajak/korupsi');
  if(P.suapKali>0)minus.push('Menyuap demi proyek ('+P.suapKali+'×)');
  if(P.gelapTotal>=2e9)minus.push('Menumpuk uang gelap '+rp(P.gelapTotal));
  if(P.buruh<=35)minus.push('Memeras & menelantarkan pekerja');
  if(P.modusPajak==='hindar')minus.push('Mengemplang pajak negara');
  if(P.dealJebakan>=3)minus.push('Berulang kali terjebak deal busuk');
  if(P.usahaBangkrut>=2||P.bangkrutTotal>=2)minus.push('Beberapa usaha gulung tikar di tangannya');
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
  $('epilog').innerHTML=
    '<div class="arsip-sharecard">'+
      '<h2>BERKAS DITUTUP</h2>'+
      '<div class="sub">'+P.nama+' · '+P.lahir+'–'+N.tahun+' · '+P.latarN+'<br>'+
        (P.sebab?('Wafat usia '+P.age+', '+P.sebab+' · '):'')+'Kekayaan bersih akhir: '+rp(v.nw)+'</div>'+
      '<div class="vrow">'+
        '<div class="vbox harta"><h4>HARTA & IMPERIUM</h4><div class="vskor">'+v.harta+'</div><div class="vjdl">"'+v.jh+'"</div>'+
          '<div class="vq">Dari sisi kekayaan & skala, ia '+(v.harta>=70?'membangun kerajaan bisnis yang disegani.':v.harta>=45?'menjadi pengusaha yang cukup mapan.':'tak sempat besar, tapi pernah mencoba.')+'</div></div>'+
        '<div class="vbox nama"><h4>NAMA & WARISAN</h4><div class="vskor">'+v.nama+'</div><div class="vjdl">"'+v.gn+'"</div>'+
          '<div class="vq">Di mata orang banyak, ia dikenang '+(v.nama>=70?'sebagai pengusaha terhormat yang membangun dengan cara baik.':v.nama>=45?'sebagai pebisnis biasa, ada baik ada buruk.':'sebagai contoh bahwa kaya saja tak cukup membeli nama baik.')+'</div></div>'+
      '</div>'+
      summaryHtml()+
      '<div class="sub">Usaha: '+P.usaha.length+' di '+jumlahSektor()+' sektor · Karyawan: '+totalKaryawan()+' · Skala tertinggi: '+(SKALA_LBL[maxSkala()]||'—')+(P.gelapTotal>0?(' · Gelap: '+rp(P.gelapTotal)):'')+'</div>'+
      '<div class="achr">'+achs+'</div>'+
    '</div>'+
    '<ul>'+rw+'</ul>'+
    '<button data-go="new">Tulis Berkas Baru »</button>';
  $('overlay').classList.remove('hidden');
  if(window.Platform){
    try{ Platform.handleResult({
      game:'niaga', nama:P.nama, age:P.age, lahir:P.lahir, tahun:N.tahun, kota:P.kota, sebab:P.sebab,
      latar:P.latarN, skorHarta:v.harta, skorNama:v.nama, julukanHarta:v.jh, gelarNama:v.gn,
      kekayaan:v.nw, usaha:P.usaha.length, sektor:jumlahSektor(), karyawan:totalKaryawan(),
      skalaTertinggi:SKALA_LBL[maxSkala()]||'—', gelapTotal:P.gelapTotal, vonis:P.vonis,
      achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
    }); }catch(e){}
  }
}
