'use strict';
/* ================= EVENTS ================= */
function events(){
  const s=P.st;
  cekPromosi();
  /* Komisi Yudisial memeriksa pola putusan janggal */
  if((s.integritas<45||P.takadil>P.adil+2)&&r()<0.2){
    addLog('Komisi Yudisial memeriksa pola putusan Anda yang dianggap janggal.'+fx({heat:+6,reputasi:-4,stres:+5}),'bad');
    if(s.integritas<35&&r()<0.4){ addLog('KY menjatuhkan sanksi etik. Karier Anda tercoreng.'+fx({reputasi:-8}),'bad'); leg(-3,-2); }
  }
  /* OTT KPK */
  kasusCheck();
  /* sorotan media */
  if(r()<0.12){
    if(P.adil>P.takadil&&s.integritas>=60) addLog('Sebuah putusan Anda dipuji media sebagai "putusan yang menghidupkan harapan keadilan".'+fx({reputasi:+5,trust:+2}),'good');
    else if(P.takadil>P.adil) addLog('Putusan kontroversial Anda jadi sorotan. Tagar #HakimNakal sempat trending.'+fx({reputasi:-5,heat:+3}),'bad');
  }
  /* teror untuk hakim pemberani */
  if(s.nyali>=60&&s.integritas>=60&&P.adil>=4&&r()<0.12){
    ask({title:'TEROR TENGAH MALAM',text:'Rumah Anda dilempari, ban mobil disayat. Pesannya jelas: jangan macam-macam dengan perkara besar.',opts:[
      {t:'Tetap pada pendirian',e:()=>{addLog('Anda menolak gentar. "Hakim tidak tunduk pada teror," ujar Anda.'+fx({nyali:+5,stres:+8,reputasi:+4}),'good');leg(5,0);ach('konsisten');}},
      {t:'Mulai berhati-hati & melunak',e:()=>{addLog('Anda diam-diam mulai menghindari perkara berisiko.'+fx({nyali:-8,stres:-3,integritas:-3}),'bad');leg(-3,1);}}
    ]});
  }
  /* tawaran jadi hakim tipikor */
  if(P.jab==='pn'&&!P.tipikor&&s.kompetensi>=55&&s.integritas>=50&&r()<0.13){
    ask({title:'TAWARAN HAKIM TIPIKOR',text:'Anda ditawari menjadi Hakim Tindak Pidana Korupsi. Perkaranya besar, godaannya raksasa, sorotannya tajam.',opts:[
      {t:'Terima — adili para koruptor',e:()=>{P.tipikor=true;P.posisi='Pengadilan Tipikor '+P.kota;addLog('Anda kini Hakim Tipikor. Meja Anda dipenuhi berkas kelas kakap.'+fx({reputasi:+4,stres:+5}),'good');milestone('Menjadi Hakim Tipikor');}},
      {t:'Tolak — terlalu berisiko',e:()=>addLog('Anda memilih perkara yang lebih tenang.'+fx({stres:-2}))}
    ]});
  }
  /* godaan suap besar di luar sidang */
  if(s.integritas<62&&P.gelap<3e9&&r()<0.08){
    const amt=ri(2,6)*1e9;
    ask({title:'TAMU TAK DIUNDANG',text:'Seorang "kurir" menaruh koper di ruang kerja Anda: '+rp(amt)+', titipan untuk perkara yang sedang Anda tangani.',opts:[
      {t:'Kembalikan & laporkan',e:()=>{addLog('Anda menolak dan melaporkannya. Integritas Anda jadi buah bibir positif.'+fx({integritas:+6,reputasi:+5,trust:+2}),'good');leg(6,-1);ach('bersih');}},
      {t:'Simpan diam-diam',e:()=>{addLog('Koper itu masuk brankas. Tak ada yang tahu, untuk sekarang.'+fx({gelap:+amt,integritas:-10,heat:+6}),'bad');leg(-5,2);}}
    ]});
  }
  /* keluarga */
  if(!P.keluarga&&P.age>=30&&r()<0.25){ P.keluarga=true; addLog('Anda menikah. Ada rumah untuk pulang setelah hari-hari berat di ruang sidang.'+fx({stres:-6,kesehatan:+2}),'good'); milestone('Menikah'); }
  if(P.keluarga&&P.anak<3&&P.age<48&&r()<0.2){ P.anak++; addLog('Anak ke-'+P.anak+' lahir. Satu alasan lagi menjaga nama baik (atau justru tergoda menimbun harta).'+fx({stres:-3}),'good'); }
  /* kesehatan */
  if(P.age>=45&&s.kesehatan<55&&r()<0.25){ const biaya=ri(10,30)*1e6; addLog('Tekanan kerja menggerogoti kesehatan, Anda sempat dirawat. Biaya '+rp(biaya)+'.'+fx({money:-biaya,kesehatan:+6,stres:+4}),'bad'); }
  /* pensiun (PN/PT 65, Agung/Ketua 70) */
  const batas=lvNow()>=3?70:65;
  if(P.age>=batas&&!P.retired){
    P.retired=true;
    addLog('Anda memasuki masa pensiun dari kursi hakim di usia '+P.age+'. Palu diletakkan untuk terakhir kalinya.'+fx({stres:-15}),'sys');
    stamp('PENSIUN'); milestone('Pensiun sebagai '+JAB[P.jab].n);
  }
}
function kasusCheck(){
  if(P.penjara>0||G.over||P.dipecat)return;
  const pelu=(P.heat-25)/130;
  if(P.heat>=30&&r()<pelu){
    stamp('OPERASI TANGKAP TANGAN'); ach('ott');
    ask({title:'KPK DI RUANG KERJA',text:'Penyidik KPK menemukan aliran "uang ketok" di rekening dan ruang kerja Anda. Kamera menyala di lobi pengadilan. Bagaimana Anda menyelamatkan diri? <span class="d">(Koneksi Anda: '+P.koneksi+'/100)</span>',opts:[
      {t:'Hadapi proses hukum, sewa pengacara top',sub:'Rp 2 M · perlemah dakwaan',cond:()=>P.money>=2e9,e:()=>{P.money-=2e9;resolveOTT(0.25,true);}},
      {t:'Bayar "pengamanan perkara"',sub:'Rp 5 M (boleh gelap) · suap penyidik',cond:()=>P.money+P.gelap>=5e9,e:()=>{const c=5e9,dg=Math.min(P.gelap,c);P.gelap-=dg;P.money-=(c-dg);resolveOTT(0.35,false);}},
      {t:'Kerahkan koneksi & lobi pejabat',sub:'Butuh koneksi kuat (>=40)',cond:()=>P.koneksi>=40,e:()=>resolveOTT(0.15+P.koneksi/250,false)},
      {t:'Pasrah, hadapi apa adanya',e:()=>resolveOTT(0,false)}
    ]});
  }
}
function resolveOTT(bonus,pengacara){
  const selamat=clamp(0.12+bonus+P.koneksi/250+P.st.reputasi/400,0.05,0.92);
  const x=r();
  if(x<selamat){
    addLog('Lewat tangan-tangan tak terlihat, berkas Anda mendadak "kurang bukti" dan penyidik kunci dimutasi. Anda <b>LOLOS</b> dari jerat. Licin bagai belut.'+fx({heat:-32,integritas:-6,reputasi:-3}),'bad');
    ach('licin'); leg(-6,1); milestone('Lolos dari OTT KPK');
  } else if(x<selamat+0.32){
    addLog('Anda lolos dari pidana, tapi Komisi Yudisial menjatuhkan <b>sanksi etik berat</b>: dinonpalukan dan dimutasi ke pengadilan terpencil. Karier tersandera, tapi setidaknya tidak dipenjara.'+fx({heat:-14,reputasi:-16,integritas:-4,stres:+8}),'bad');
    leg(-5,-3); milestone('Kena sanksi etik KY');
  } else {
    diadili(pengacara);
  }
}
function diadili(pengacara){
  let th=ri(4,9)-(pengacara?2:0); th=Math.max(th,2);
  const sita=P.gelap; P.gelap=0;
  P.vonis=true; P.penjara=th; P.dipecat=true; P.retired=true;
  addLog('Palu diketuk untuk Anda sendiri: <b>vonis '+th+' tahun penjara</b>, harta gelap '+rp(sita)+' disita negara, dan Anda <b>dipecat tidak hormat</b>. Ironi paling pahit bagi seorang hakim.'+fx({reputasi:-30,stres:+15}),'bad');
  stamp('VONIS '+th+' TAHUN'); ach('tahanan'); milestone('Divonis korupsi '+th+' tahun, dipecat');
  leg(-18,-15);
}
