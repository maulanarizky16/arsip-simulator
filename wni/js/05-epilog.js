'use strict';
/* ================= AKHIR CERITA ================= */
const ENDING={
  tahan:{t:'Bertahan 3 Tahun',s:'Tiga tahun berlalu. Kamu masih di sini: masih bangun pagi, masih menunggu tanggal gajian, masih tertawa melihat meme yang terlalu relate. Itu sudah prestasi.'},
  pulang:{t:'Pulang Kampung',s:'Kewarasanmu habis. Suatu pagi ibumu datang, memelukmu, dan membawamu pulang ke kampung. Di sana ada sawah, nasi hangat, dan tidak ada yang menanyakan target bulanan.'},
  tumbang:{t:'Tumbang',s:'Badanmu menyerah. Kamu dirawat berminggu-minggu dan akhirnya pulang ke rumah orang tua untuk pemulihan panjang.'},
  dc:{t:'Dikejar Debt Collector',s:'Utang pinjol menggunung. Debt collector datang ke kos, ke kantor, ke grup keluarga. Kamu memutuskan "menghilang" sejenak, ganti nomor, pindah kota.'},
  diaspora:{t:'#KaburAjaDulu',s:'Dengan tabungan, nekat, dan sertifikat bahasa, kamu berangkat kerja ke luar negeri. Di bandara kamu menatap ke belakang: negeri yang kamu cintai, yang terlalu sering membuatmu lelah.'},
  tutup:{t:'Berkas Ditutup',s:'Kamu memilih menutup berkas lebih awal. Kadang berhenti juga sebuah keputusan.'}
};
function akhir(kind){
  if(G.over)return;
  P.ending=kind; G.over=true; G.current=null; G.queue=[];
  if(hasDoc)$('kartu').innerHTML='';
  const e=ENDING[kind]||ENDING.tutup;
  addLog('<b>'+e.t.toUpperCase()+'.</b> '+e.s,kind==='tahan'||kind==='diaspora'?'good':'bad');
  stamp(e.t.toUpperCase(),kind==='tahan'||kind==='diaspora'?'green':'');
  milestone('Akhir: '+e.t);
  if(kind==='tahan')ach('tahan');
  if(kind==='diaspora')ach('diaspora');
  showEpilog();
}
function endCheck(){
  if(G.over)return;
  if(P.st.waras<=0)akhir('pulang');
  else if(P.st.sehat<=0)akhir('tumbang');
}
function checkAch(){
  if(P.tabungan+P.emas>=3*biayaPokok())ach('darurat');
  if(P.emas>0)ach('emas');
  if(P.st.nrimo>=90)ach('nrimo');
  if(P.healingKali>=5)ach('healing');
  if(P.sideKali>=5)ach('cuan');
}
function nilaiAkhir(){
  const nw=netWorth(), biaya=biayaPokok();
  const bantuan=(P.modalAwal||0)+(P.kirimanTotal>0?P.kirimanTotal:P.kirimanTotal*0.8);
  const usaha=nw-bantuan+3e6;            /* +3 jt = modal awal rata-rata orang kebanyakan */
  let dompet=Math.round(30+clamp(usaha/5e6*6,-30,50)+(P.rumah?10:0)+(P.tabungan+P.emas>=3*biaya?6:0)
    -P.pinjolKali*3-P.cicilan.length*2-clamp(P.judolRugi/1e6,0,10));
  if(P.ending==='dc')dompet-=25;
  if(P.ending==='diaspora')dompet+=5;
  dompet=clamp(dompet,0,100);
  const rataWaras=P.bulanHidup?P.sumWaras/P.bulanHidup:P.st.waras;
  let waras=Math.round(rataWaras*0.6+P.st.relasi*0.2+P.st.sehat*0.2+(P.st.nrimo-50)/5);
  if(P.ending==='pulang')waras-=20;
  if(P.ending==='tumbang')waras-=10;
  if(P.ending==='diaspora')waras+=8;
  waras=clamp(waras,0,100);
  let jd;
  if(P.ending==='dc')jd='Buronan Debt Collector';
  else if(P.ending==='diaspora')jd='Diaspora #KaburAjaDulu';
  else if(P.pinjolKali>=3&&dompet<40)jd='Korban Pinjol';
  else if(dompet>=80)jd='Sultan Kecil-kecilan';
  else if(dompet>=62)jd='Kelas Menengah Bertahan';
  else if(P.cicilan.length>=2)jd='Budak Cicilan';
  else if(dompet>=42)jd='Pejuang Tanggal Tua';
  else if(dompet>=25)jd='Dompet Kembang Kempis';
  else jd='Dompet Menangis';
  let gw;
  if(P.ending==='pulang')gw='Dijemput Ibu Pulang Kampung';
  else if(waras>=80)gw='Warga Teladan RT 05';
  else if(waras>=66)gw=P.burukKali>=3?'Manusia Mental Baja':'Netizen Budiman yang Tenang';
  else if(waras>=50)gw=P.healingKali>=4?'Healing Garis Keras':'Lelah tapi Masih Waras';
  else if(waras>=35)gw='Overthinker Akut';
  else gw='Sudah Mati Rasa';
  if(dompet>=80)ach('sultan');
  if(P.ending==='tahan'&&(P.latar==='yatim'||P.latar==='sandwich')&&dompet>=50)ach('mandiri');
  return {dompet,waras,jd,gw,nw,bantuan};
}
function ringkasan(){
  const plus=[],minus=[];
  if(P.ending==='tahan')plus.push('Bertahan '+TOTAL_BULAN+' bulan penuh sebagai warga +62');
  if(P.kirimanTotal<=-10e6)plus.push('Menghidupi keluarga: '+rp(-P.kirimanTotal)+' dikirim ke rumah');
  if(P.ach.tolakOrangDalam)plus.push('Menolak jalur orang dalam');
  if(P.ach.asn)plus.push('Lolos CPNS, bapak bangga');
  if(P.tabungan+P.emas>=3*biayaPokok())plus.push('Punya dana darurat '+rp(P.tabungan+P.emas));
  if(P.rumah)plus.push('Akhirnya punya rumah sendiri (walau subsidi & jauh)');
  if(P.ach.lunas)plus.push('Berhasil melunasi utang pinjol');
  if(P.ach.naikKelas)plus.push('Naik kelas: gaji & status membaik');
  if(P.menikah)plus.push('Menikah di tengah ekonomi yang tidak menentu');
  if(P.sideKali>=3)plus.push('Rajin cari cuan sampingan ('+P.sideKali+'×)');
  if(P.st.relasi>=70)plus.push('Hubungan dengan keluarga & teman tetap hangat');
  if(P.ach.sadarJudol)plus.push('Lepas dari jerat judi online');
  if(P.pinjolKali)minus.push('Terjerat pinjol ('+P.pinjolKali+'×)');
  if(P.cicilan.length)minus.push('Masih menanggung '+P.cicilan.length+' cicilan');
  if(P.judolRugi>0)minus.push('Rugi judi online '+rp(P.judolRugi));
  if(P.pernahPHK)minus.push('Pernah kena PHK');
  if(P.ach.damai)minus.push('Pernah "damai di tempat"');
  if(P.ending==='pulang')minus.push('Kewarasan habis, pulang kampung');
  if(P.ending==='dc')minus.push('Kabur dari debt collector');
  if(P.st.gengsi>=75)minus.push('Gengsi lebih besar dari gaji');
  if(P.kirimanTotal>=20e6)minus.push('Disubsidi ortu '+rp(P.kirimanTotal));
  if(P.profesi==='staf')minus.push('Bekerja lewat jalur titipan');
  return {plus:plus.slice(0,7),minus:minus.slice(0,7)};
}
function showEpilog(){
  const v=nilaiAkhir();
  const e=ENDING[P.ending]||ENDING.tutup;
  if(!hasDoc){ kirimHasil(v,e); return; }
  const rk=ringkasan();
  const col=(t,arr,cls)=>'<div class="pm-col '+cls+'"><h5>'+t+'</h5>'+(arr.length?'<ul>'+arr.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'<div class="pm-none">tidak ada yang menonjol</div>')+'</div>';
  const achs=Object.keys(P.ach).map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join('')||'<span class="muted">—</span>';
  $('epilog').innerHTML=
    '<div class="arsip-sharecard">'+
      '<h2>'+e.t.toUpperCase()+'</h2>'+
      '<div class="sub">'+P.nama+' · '+P.latarN+' · '+P.kota+' · '+N.ke+' bulan sebagai warga +62<br>'+e.s+'</div>'+
      '<div class="vrow">'+
        '<div class="vbox dompet"><h4>DOMPET</h4><div class="vskor">'+v.dompet+'</div><div class="vjdl">"'+v.jd+'"</div>'+
          '<div class="vq">Kekayaan bersih akhir '+rp(v.nw)+(P.utang>0?' · utang pinjol '+rp(P.utang):'')+'. '+(v.bantuan>5e6?'Dinilai tanpa modal & kiriman ortu ('+rp(v.bantuan)+').':P.kirimanTotal<0?'Uang yang kamu kirim ke keluarga ikut dihargai.':'Murni hasil usaha sendiri.')+'</div></div>'+
        '<div class="vbox waras"><h4>KEWARASAN</h4><div class="vskor">'+v.waras+'</div><div class="vjdl">"'+v.gw+'"</div>'+
          '<div class="vq">Rata-rata kewarasan '+Math.round(P.bulanHidup?P.sumWaras/P.bulanHidup:P.st.waras)+'/100 sepanjang perjalanan.</div></div>'+
      '</div>'+
      '<div class="pm-cols">'+col('YANG PATUT DIBANGGAKAN',rk.plus,'plus')+col('YANG BIKIN NGELUS DADA',rk.minus,'minus')+'</div>'+
      '<div class="achr">'+achs+'</div>'+
    '</div>'+
    '<ul>'+P.riwayat.map(x=>'<li>'+x.th+' — '+x.t+'</li>').join('')+'</ul>'+
    '<button data-go="new">Jalani Hidup Baru »</button>';
  $('overlay').classList.remove('hidden');
  kirimHasil(v,e);
}
function kirimHasil(v,e){
  if(!(typeof window!=='undefined'&&window.Platform))return;
  try{ Platform.handleResult({
    game:'wni', nama:P.nama, age:P.age, lahir:P.lahir, tahun:N.tahun, kota:P.kota,
    meta:P.latarN+' · '+P.kota+' · '+N.ke+' bulan · '+e.t, latar:P.latarN,
    profesi:P.profesiN, bulan:N.ke, ending:e.t,
    skorDompet:v.dompet, skorWaras:v.waras, julukanDompet:v.jd, gelarWaras:v.gw,
    kekayaan:v.nw, utang:P.utang, pinjol:P.pinjolKali,
    achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
  }); }catch(err){}
}
