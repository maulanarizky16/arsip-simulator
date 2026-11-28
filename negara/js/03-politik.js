'use strict';
/* ================= POLITIK HELPERS ================= */
function isPemilu(){ return (N.tahun-2004)%5===0; }
function pemiluIn(){ return (5-((N.tahun-2004)%5))%5; }
function lvNow(){ return P.jab?JAB[P.jab.k].lv:0; }
function isLeg(){ return !!P.jab&&!!JAB[P.jab.k].leg; }
function isKepda(){ return !!P.jab&&(P.jab.k==='walikota'||P.jab.k==='gubernur'); }
function isPres(){ return !!P.jab&&P.jab.k==='presiden'; }
function isMen(){ return !!P.jab&&P.jab.k==='menteri'; }
/* lolos tidaknya kebijakan di DPR: tergantung koalisi & pengaruh */
function voteParlemen(sulit){ const c=0.35+N.koalisi/200+P.st.pengaruh/300-(sulit||0); return r()<clamp(c,0.05,0.95); }
function setJab(k){
  const j=JAB[k];
  P.jab={k,sisa:k==='menteri'?Math.max(pemiluIn(),1):5};
  P.terms[k]=(P.terms[k]||0)+1;
  P.lastLv=j.lv; if(j.lv>P.maxLv)P.maxLv=j.lv;
  /* portofolio jabatan: tiap posisi punya data & kewenangan sendiri */
  P.jabData={};
  if(k==='dpr'||k==='dprd'){ P.jabData.komisi=pick(KOMISI); P.jabData.fraksi=P.partai?P.partai.n.replace('Partai ',''):'Independen'; P.jabData.ruu=0; }
  else if(k==='menteri'){ P.jabData.kementerian=pick(KEMENTERIAN); }
  else if(k==='walikota'){ P.jabData.wilayah=P.kota; P.jabData.daerah=initDaerah(); P.jabData.apbd=ri(6,12); }
  else if(k==='gubernur'){ P.jabData.wilayah='Provinsi '+P.kota; P.jabData.daerah=initDaerah(); P.jabData.apbd=ri(25,45); }
  else if(k==='presiden'){ N.koalisi=clamp((P.partai?P.partai.dukungan:40)+ri(0,15),20,90); P.jabData.koalisi=N.koalisi;
    if(P._cawapres){ P.wapres=P._cawapres; P._cawapres=null; addLog('Anda dilantik bersama wakil presiden <b>'+P.wapres.nama+'</b> ('+P.wapres.partai.replace('Partai ','')+').','sys'); } }
  stamp(j.n.toUpperCase(),'green');
  milestone('Menjabat '+j.n+(P.terms[k]>1?' (periode '+P.terms[k]+')':''));
  if(k==='dpr')ach('senayan');
  if(k==='walikota')ach('kepda');
  if(k==='gubernur')ach('gub');
  if(k==='menteri')ach('menteri');
  if(k==='presiden'){ach('presiden');if(P.terms.presiden>=2)ach('duaP');if(P.terms.presiden>=3)ach('abadi');}
}
function endJab(alasan){
  if(!P.jab)return;
  const j=JAB[P.jab.k];
  addLog('Masa tugas sebagai '+j.n+' berakhir'+(alasan?' — '+alasan:'')+'.');
  milestone('Selesai menjabat '+j.n);
  if(P.janji&&P.janji.length)evalJanji();
  const wasPres=P.jab.k==='presiden';
  if((P.jab.k==='walikota'||P.jab.k==='gubernur')&&daerahRata()>=70){ ach('kepdaSukses'); addLog('Anda meninggalkan '+(P.jabData&&P.jabData.wilayah||'daerah')+' dengan indeks pembangunan yang tinggi ('+daerahRata()+'/100). Warga mengenang masa kepemimpinan Anda.','good'); leg(5,4); }
  P.petahana=P.jab.k; P.jab=null; P.jabData=null;
  if(wasPres){ P.wapres=null; N.kabinet=[]; N.kabinetMutu=0; }
}
/* indikator daerah awal: cerminan nasional dengan bias lebih rendah (daerah punya PR) */
function initDaerah(){
  return {
    infra: clamp(N.infra+ri(-18,4),5,95),
    ekonomi: clamp(N.ekonomi+ri(-15,8),5,95),
    sejahtera: clamp(Math.round(100-N.kemiskinan*2.2)+ri(-12,8),5,95),
    layanan: clamp(Math.round((N.pendidikan+N.keswa)/2)+ri(-15,6),5,95),
    kepuasan: clamp(N.mood+ri(-12,10),5,95)
  };
}
/* ringkasan efek proyek untuk teks pilihan */
function efekRingkas(efek){
  const map={infra:'Infra',ekonomi:'Ekonomi',pengangguran:'Pengangguran',keswa:'Kesehatan',pendidikan:'Pendidikan',lingkungan:'Lingkungan',kemiskinan:'Kemiskinan',mood:'Kepuasan',inflasi:'Inflasi',diplomasi:'Diplomasi'};
  return Object.keys(efek).filter(k=>k!=='utang').slice(0,3).map(k=>(map[k]||k)+' '+(efek[k]>=0?'+':'')+efek[k]).join(', ');
}
function efekRingkasD(efek){
  return Object.keys(efek).slice(0,3).map(k=>(DLBL[k]||k).replace(' daerah','').replace('Kesejahteraan','Sejahtera').replace('Layanan publik','Layanan').replace('Kepuasan warga','Kepuasan')+' '+(efek[k]>=0?'+':'')+efek[k]).join(', ');
}
/* APBN: pilih kategori lalu proyek; anggaran diajukan ke DPR */
function pilihProyekNas(kat){
  const list=PROYEK_NAS.filter(p=>p.kat===kat);
  const kn=(KAT_NAS.find(x=>x[0]===kat)||['',''])[1];
  ask({title:'PROYEK '+kn.toUpperCase(),text:'Kas negara '+rpT(N.kas)+'. Pilih proyek (anggaran diajukan ke DPR):',
    opts:list.map(p=>({t:p.n,sub:rpT(p.biaya)+(p.efek.utang?' (+utang)':'')+' · '+efekRingkas(p.efek),e:()=>bangunProyekNas(p)}))
      .concat([{t:'Kembali',e:()=>{}}])});
}
function bangunProyekNas(p){
  if(!voteParlemen(0.1)){
    addLog('<b>DPR menolak</b> anggaran proyek "'+p.n+'" — koalisi belum cukup solid (koalisi '+N.koalisi+'/100). Galang dukungan dulu.'+fx({pengaruh:-2,stres:+3})+nx({mood:-1}),'bad');
    return;
  }
  N.kas=Math.round(N.kas-p.biaya);
  addLog('<b>'+p.n+'</b> resmi dibangun lewat APBN '+rpT(p.biaya)+'. Pita digunting, papan proyek dipasang.'+nx(p.efek)+fx({popularitas:+(p.pop||0)}),'good');
  milestone('Bangun '+p.n); leg(Math.round((p.pop||0)/2),4);
}
function bangunProyekDa(p){
  P.jabData.apbd=+(P.jabData.apbd-p.biaya).toFixed(1);
  addLog('<b>'+p.n+'</b> dibangun lewat APBD '+rpT(p.biaya)+' di '+P.jabData.wilayah+'. Warga menyambut dengan harapan.'+dx(p.efek)+fx({popularitas:+(p.pop||0)}),'good');
  milestone('Bangun '+p.n+' (daerah)'); leg(Math.round((p.pop||0)/2),2);
}
function syaratMaju(k){
  const s=P.st, d=P.partai?P.partai.dukungan:0;
  if(P.age<(JAB[k].minU||0))return false;   /* batas umur calon */
  if(k==='dprd')return true;
  if(k==='dpr')return s.popularitas>=32||(P.terms.dprd||0)>0;
  if(k==='walikota')return s.popularitas>=35&&(P.terms.walikota||0)<2;
  if(k==='gubernur')return s.popularitas>=48&&s.pengaruh>=35&&(P.terms.gubernur||0)<2;
  if(k==='presiden')return s.popularitas>=50&&s.pengaruh>=45&&d>=55&&P.maxLv>=3&&(P.kalahPilpres||0)<2&&((P.terms.presiden||0)<2||P.tigaOk);   /* tiket capres: pernah jadi Gubernur/Menteri & belum dua kali kalah pilpres */
  return false;
}
/* apa yang masih kurang untuk maju Presiden (untuk ditampilkan ke pemain) */
function syaratPresKurang(){
  const s=P.st, d=P.partai?P.partai.dukungan:0, miss=[];
  if(s.popularitas<50)miss.push('Popularitas '+Math.round(s.popularitas)+'/50');
  if(s.pengaruh<45)miss.push('Pengaruh '+s.pengaruh+'/45');
  if(d<55)miss.push('Dukungan partai '+d+'/55');
  if(P.maxLv<3)miss.push('belum pernah jadi Gubernur atau Menteri');
  if((P.kalahPilpres||0)>=2)miss.push('sudah dua kali kalah pilpres — partai tak mau mengusung lagi');
  if(P.age<JAB.presiden.minU)miss.push('umur minimal '+JAB.presiden.minU+' tahun (Anda '+P.age+')');
  if((P.terms.presiden||0)>=2&&!P.tigaOk)miss.push('sudah 2 periode');
  return miss;
}
/* peluang menang: makin tinggi jabatan & makin kuat lawan, makin sulit. Bisa kalah betulan. */
function peluang(k,tier,fajar){
  let c=0.08+P.st.popularitas/260+(tier||0)*0.06+(P.partai?P.partai.dukungan/360:0)+(P.partai?P.partai.mesin/380:0);
  if(P.petahana===k)c+=0.08;
  if(fajar)c+=0.12;
  if(P.heat>=50)c-=0.10;
  c-=[0,0.02,0.08,0.18,0.18,0.42][JAB[k].lv]||0;   /* kursi makin tinggi makin sulit: pemilihan presiden diikuti tokoh-tokoh terkuat se-negeri */
  c-=(P._lawanKuat||0);
  c+=(P._debatBonus||0);
  c+=(P._cawElekt||0);
  if(k==='presiden')c-=(P.kalahPilpres||0)*0.06;   /* capres yang pernah kalah makin sulit dijual */
  return clamp(c,0.04,k==='presiden'?0.4:0.90);
}
function labelPeluang(p){ return p>=0.7?'besar':p>=0.45?'sedang':p>=0.25?'tipis':'kecil'; }
function kampanye(){
  P._lawanKuat=ri(0,22)/100;
  const lk=P._lawanKuat;
  const targets=['dprd','dpr','walikota','gubernur','presiden'].filter(syaratMaju);
  addLog('Survei internal menilai kekuatan lawan tahun ini: <b>'+(lk>=0.15?'kuat':lk>=0.08?'sedang':'lemah')+'</b>.','sys');
  let hint='';
  if(!syaratMaju('presiden')&&!P.retired){ const m=syaratPresKurang(); if(m.length)hint='<br><span class="d">Untuk maju Presiden, masih kurang: '+m.join(', ')+'.</span>'; }
  ask({title:'MAJU PEMILU '+N.tahun,text:'Tahun politik. Kursi mana yang Anda incar? (Pemilu serentak — pilih satu.) Kekuatan lawan: <b>'+(lk>=0.15?'kuat':lk>=0.08?'sedang':'lemah')+'</b>.'+hint,
    opts:targets.map(k=>{const p=peluang(k,1,false);return {t:JAB[k].n,sub:'Lv '+JAB[k].lv+' · peluang awal ~'+Math.round(p*100)+'% ('+labelPeluang(p)+')'+(P.petahana===k?' · petahana':''),e:()=>pilihDana(k)};})
      .concat([{t:'Tidak maju tahun ini',e:()=>{P._lawanKuat=0;addLog('Anda memilih menepi dari kontestasi tahun ini.');}}])});
}
function buatLawan(k){
  const g=r()<0.5?'L':'P';
  const others=PARTAI.filter(p=>!P.partai||p.n!==P.partai.n);
  const partai=pick(others.length?others:PARTAI);
  const lat=pick(LATAR);
  const pop=clamp(ri(30,72)+JAB[k].lv*2,0,100);
  const integritas=ri(28,82), kompetensi=ri(38,86);
  const kuat=clamp((pop-P.st.popularitas)/200 + JAB[k].lv*0.02 + ri(0,10)/100, 0, 0.28);
  return {nama:(g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK), gender:g, partai:partai.n, latar:lat.n.toLowerCase(),
    pop, integritas, kompetensi, kuat,
    julukan:pick(['petahana kuat','pendatang baru','kuda hitam','tokoh populer','politisi senior','idola anak muda','wajah lama'])};
}
function lawanProfilHtml(L){
  const cmp=(mine,theirs)=> mine>theirs?'<span style="color:var(--green)">Anda unggul</span>':mine===theirs?'imbang':'<span style="color:var(--red)">Anda tertinggal</span>';
  return '<div class="lawan-box"><b>Lawan: '+L.nama+'</b> · '+L.partai.replace('Partai ','')+' · '+L.latar+' · "'+L.julukan+'"'+
    '<br>Popularitas '+L.pop+' (Anda '+Math.round(P.st.popularitas)+', '+cmp(Math.round(P.st.popularitas),L.pop)+')'+
    ' · Integritas '+L.integritas+' · Kompetensi '+L.kompetensi+'</div>';
}
function buatKabinet(){
  const out=[];
  for(const km of [...KEMENTERIAN].sort(()=>r()-0.5).slice(0,4)){ const g=r()<0.5?'L':'P'; out.push({sektor:km.n, nama:(g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK)}); }
  return out;
}
/* rival politik persisten: lawan bebuyutan yang muncul berulang & menguat */
function buatRival(){
  const g=r()<0.5?'L':'P';
  return {nama:(g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK), partai:pick(PARTAI).n, latar:pick(LATAR).n.toLowerCase(),
    pop:ri(40,58), ambisi:ri(5,9)/10, jejak:0, menang:0, kalah:0, hub:'rival'};
}
function lawanDariRival(rv,k){
  const pop=clamp(rv.pop+rv.jejak*3+JAB[k].lv*2,0,100);
  const kuat=clamp((pop-P.st.popularitas)/200 + JAB[k].lv*0.02 + ri(0,8)/100, 0, 0.30);
  return {nama:rv.nama, gender:'?', partai:rv.partai, latar:rv.latar, pop, integritas:ri(30,75), kompetensi:ri(45,85), kuat,
    julukan:'rival lama Anda', _rival:true};
}
function buatCawapres(tipe){
  const g=r()<0.5?'L':'P';
  const nama=(g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK);
  const partai=pick(PARTAI).n;
  if(tipe==='vote')return {nama,partai,tipe,label:'magnet suara',desc:'Sangat populer — dongkrak elektabilitas besar, tapi ambisius.',elekt:0.10,ambisi:0.7};
  if(tipe==='teknokrat')return {nama,partai,tipe,label:'teknokrat loyal',desc:'Kompeten & setia, dongkrak elektabilitas kecil.',elekt:0.04,ambisi:0.2};
  return {nama,partai,tipe,label:'loyalis partai',desc:'Memperkuat koalisi, elektabilitas sedang, ambisi sedang.',elekt:0.06,ambisi:0.4};
}
function pilihDana(k){
  if(!P.rival&&JAB[k].lv>=2&&r()<0.7)P.rival=buatRival();
  if(P.rival&&P.rival.hub!=='sekutu'&&r()<0.55) P._lawan=lawanDariRival(P.rival,k);
  else P._lawan=buatLawan(k);
  P._lawanKuat=P._lawan.kuat; P._debatBonus=0; P._cawapres=null; P._cawElekt=0;
  if(k==='presiden')pilihCawapres(k); else danaKampanye(k);
}
function pilihCawapres(k){
  const opsi=[buatCawapres('vote'),buatCawapres('loyalis'),buatCawapres('teknokrat')];
  ask({title:'PILIH BAKAL WAKIL PRESIDEN',text:'Pendamping menentukan elektabilitas — dan risiko di masa jabatan nanti. '+lawanProfilHtml(P._lawan)+'Pilih cawapres:',
    opts:opsi.map(c=>({t:c.nama.split(' ')[0]+' — '+c.label,sub:c.desc,e:()=>{
      P._cawapres=c; P._cawElekt=c.elekt;
      addLog('Anda menggandeng <b>'+c.nama+'</b> ('+c.label+') sebagai bakal wapres.','sys');
      danaKampanye(k);}}))
      .concat([{t:'Maju tanpa cawapres kuat',e:()=>{P._cawapres=null;P._cawElekt=0;danaKampanye(k);}}])});
}
function danaKampanye(k){
  const lv=JAB[k].lv;
  const tiers=[[0,'Modal dengkul','Kampanye dari mulut ke mulut'],[lv*400e6,'Standar','Baliho, tim sukses, iklan'],[lv*2.5e9,'Jor-joran','Konser, media, logistik penuh']];
  ask({title:'DANA KAMPANYE — '+JAB[k].n.toUpperCase(),text:'KPU menetapkan lawan Anda di kursi ini. '+lawanProfilHtml(P._lawan)+'Seberapa besar mesin kampanye Anda? (Uang resmi: '+rp(P.money)+')',
    opts:tiers.map((t,i)=>{const p=peluang(k,i,false);return {t:t[1],sub:(t[0]?rp(t[0])+' · ':'Gratis · ')+t[2]+' · ~'+Math.round(p*100)+'% menang',cond:()=>P.money>=t[0],e:()=>{
      P.money-=t[0];
      pilihJanji(k,i);
    }};}).concat([{t:'Batal maju',e:()=>{P._lawanKuat=0;P._lawan=null;P._cawapres=null;P._cawElekt=0;}}])});
}
/* ===== DEBAT KANDIDAT — performa memengaruhi peluang menang ===== */
function debat(k,tier){
  const L=P._lawan;
  const qs=[...DEBAT_TOPIK].sort(()=>r()-0.5).slice(0,3);
  ask({title:'DEBAT KANDIDAT — '+JAB[k].n.toUpperCase(),
    text:'Lampu panggung menyala. Anda berhadapan langsung dengan lawan. '+lawanProfilHtml(L)+'Tiga ronde pertanyaan — performa debat memengaruhi elektabilitas jelang pencoblosan.',
    opts:[
      {t:'Naik podium, hadapi debat',e:()=>debatRonde(k,tier,0,0,qs)},
      {t:'Mangkir dari debat',sub:'Kursi kosong — lawan bicara tanpa tandingan',e:()=>{
        P._debatBonus=-0.10;
        addLog('Anda mangkir dari debat. Kursi kosong Anda jadi sorotan; lawan berpidato tanpa lawan.'+fx({popularitas:-3}),'bad');
        tawarFajar(k,tier);}}
    ]});
}
function debatRonde(k,tier,qi,score,qs){
  if(qi>=qs.length){
    const L=P._lawan;
    const lawanSkor=Math.round((L.kompetensi+L.pop)/40-2)+ri(-1,2);
    const selisih=score-lawanSkor;
    P._debatBonus=clamp(selisih*0.035,-0.16,0.20);
    let kelas,nar;
    if(selisih>=4){kelas='good';nar='<b>Anda menang debat telak.</b> Potongan terbaik Anda viral positif sepanjang malam.';P.st.popularitas=clamp(P.st.popularitas+5,0,100);}
    else if(selisih>=1){kelas='good';nar='Anda unggul dalam debat. Pengamat menilai Anda lebih siap.';P.st.popularitas=clamp(P.st.popularitas+2,0,100);}
    else if(selisih<=-4){kelas='bad';nar='<b>Anda kalah debat.</b> Blunder Anda jadi meme; elektabilitas tergerus.';P.st.popularitas=clamp(P.st.popularitas-4,0,100);}
    else if(selisih<=-1){kelas='bad';nar='Anda kalah tipis dalam debat — lawan tampil lebih meyakinkan.';}
    else {kelas='sys';nar='Debat berjalan imbang, tak ada yang benar-benar unggul.';}
    addLog('Debat usai — skor Anda '+score+' vs '+L.nama.split(' ')[0]+' '+lawanSkor+'. '+nar+' <span class="d">(elektabilitas '+(P._debatBonus>=0?'+':'')+Math.round(P._debatBonus*100)+'%)</span>',kelas);
    tawarFajar(k,tier);
    return;
  }
  const q=qs[qi];
  ask({title:'DEBAT — RONDE '+(qi+1)+'/'+qs.length,text:'Moderator: '+q.t,
    opts:q.a.map(a=>({t:a.t,sub:a.sub,e:()=>{
      if(a.fx)for(const kk in a.fx)P.st[kk]=clamp(P.st[kk]+a.fx[kk],0,100);
      debatRonde(k,tier,qi+1,score+(a.d||0),qs);
    }}))});
}
function tawarFajar(k,tier){
  const biaya=JAB[k].lv*600e6;
  const punya=P.money+P.gelap>=biaya;
  ask({title:'MALAM SEBELUM PENCOBLOSAN',text:'Tim sukses berbisik: amplop "serangan fajar" siap disebar untuk mendongkrak suara. Butuh '+rp(biaya)+' (boleh dari uang gelap). Peluang menang naik, tapi integritas & sorotan jadi taruhannya.',opts:[
    {t:'Sebar amplop — pakai dana sendiri',sub:'Bayar '+rp(biaya)+' · integritas turun',cond:()=>punya,e:()=>{
      const dg=Math.min(P.gelap,biaya); P.gelap-=dg; P.money-=(biaya-dg);
      addLog('Subuh itu, amplop-amplop berpindah tangan di gang-gang sempit.'+fx({integritas:-8,heat:+8}),'bad');
      hasilPemilu(k,tier,true);}},
    {t:'Sebar amplop — ditalangi cukong',sub:'Dana kurang? Pemodal menalangi · utang budi',cond:()=>!punya,e:()=>{
      P.cukong=true;
      addLog('Dana Anda tak cukup, tapi seorang pemodal gelap menalangi serangan fajar. "Anggap saja investasi," bisiknya. Kelak ia akan menagih.'+fx({integritas:-10,heat:+12}),'bad');
      hasilPemilu(k,tier,true);}},
    {t:'Tolak — menang bersih atau tidak sama sekali',e:()=>{
      addLog('Anda menolak politik uang. Tim sukses menghela napas panjang.'+fx({integritas:+4}));
      hasilPemilu(k,tier,false);}}
  ]});
}
function hasilPemilu(k,tier,fajar){
  const c=peluang(k,tier,fajar);
  const lawanNama=P._lawan?P._lawan.nama:'pesaing';
  const lawanRival=!!(P._lawan&&P._lawan._rival);
  addLog('Hari pencoblosan tiba. Quick count berjalan... peluang kemenangan Anda ditaksir <b>'+Math.round(c*100)+'%</b>.','sys');
  P._lawanKuat=0; P._debatBonus=0; P._lawan=null; P._cawElekt=0;
  const menang=r()<c;
  if(lawanRival&&P.rival){ P.rival.jejak++; if(menang){P.rival.kalah++;P.rival.pop=clamp(P.rival.pop-3,0,100);} else {P.rival.menang++;P.rival.pop=clamp(P.rival.pop+6,0,100);} }
  if(menang){
    if(P.jab)endJab('beralih ke jabatan baru');
    setJab(k);
    addLog('KPU menetapkan: <b>Anda MENANG</b> sebagai '+JAB[k].n+', mengalahkan '+lawanNama+'! Pendukung tumpah ke jalan.'+fx({popularitas:+6,stres:+6}),'good');
    leg(2,3);
    if(P.pendingJanji&&P.pendingJanji.length){
      P.janji=P.pendingJanji;P.janjiSnap=snapJanji();P._perangBaru=false;P._cabutBBM=false;
      addLog('Janji kampanye Anda dicatat publik: <b>'+P.janji.map(c=>(JANJI.find(x=>x.k===c)||{}).n).join('; ')+'</b>. Sampai jumpa di akhir periode.','sys');
    }
    P.pendingJanji=null;
  } else {
    addLog('Hasil rekapitulasi: <b>Anda KALAH</b> dari '+lawanNama+'. Pesaing unggul di kotak suara. Baliho-baliho itu kini hanya kenangan mahal.'+fx({popularitas:-3,stres:+10,pengaruh:-3}),'bad');
    milestone('Kalah pemilu '+JAB[k].n);
    leg(-1,0);
    if(k==='presiden'){ P.kalahPilpres=(P.kalahPilpres||0)+1; if(P.partai)P.partai.dukungan=clamp(P.partai.dukungan-15,0,100);
      addLog('Partai mulai melirik nama lain untuk pemilihan berikutnya. <span class="d">(Dukungan partai −15)</span>'+fx({pengaruh:-8}),'bad'); }
    P.pendingJanji=null;
  }
}

/* ================= EKONOMI NEGARA ================= */
function apbn(){
  const masuk=Math.round(N.ekonomi*N.pajak*1.5);
  const keluar=Math.round(masuk*0.93)+Math.round(N.utang*0.04);
  N.kas+=masuk-keluar;
  if(N.kas<-100){
    N.utang+=400; N.kas+=400;
    addLog('Kas negara kering — pemerintah menerbitkan surat utang baru '+rpT(400)+'.','sys');
  }
}
function negaraDrift(){
  apbn();
  /* inersia & saling pengaruh */
  let de=ri(-1,1);
  if(N.pajak>30)de-=1;
  if(N.infra>=70)de+=1;
  if(N.korupsi>=75)de-=1;
  if(N.keamanan<40)de-=1;
  if(N.sanksi)de-=2;
  if(N.perang)de-=2;
  if(N.inflasi>15)de-=1;
  N.ekonomi=clamp(N.ekonomi+de,5,100);
  /* inflasi: didorong defisit, utang LN, perang, kurangi oleh ekonomi sehat */
  let din=ri(-2,2)/10;
  if(N.kas<-50)din+=0.6;
  if(N.utang>2500)din+=0.4;
  if(N.perang)din+=0.8;
  if(N.sanksi)din+=0.5;
  if(N.ekonomi>=70)din-=0.4;
  N.inflasi=clamp(+(N.inflasi+din).toFixed(1),0,80);
  /* pengangguran: ngikut ekonomi terbalik */
  N.pengangguran=clamp(+(N.pengangguran+(55-N.ekonomi)/55+ri(-2,2)/10).toFixed(1),1,35);
  /* militer: meluruh tanpa anggaran, naik kalau anggaran besar (ditangani via aksi) */
  if(!N.perang)N.militer=clamp(N.militer-1,0,100);
  else N.militer=clamp(N.militer-2,0,100);
  /* diplomasi: ngikut kebebasan & rezim */
  let dd=ri(-1,1);
  if(N.kebebasan>=70)dd+=1;
  if(N.kebebasan<35)dd-=1;
  if(N.sanksi)dd-=2;
  N.diplomasi=clamp(N.diplomasi+dd,0,100);
  /* demokrasi: rata-rata kebebasan & inverse korupsi */
  const targetDem=Math.round((N.kebebasan+(100-N.korupsi))/2);
  N.demokrasi=clamp(N.demokrasi+(targetDem>N.demokrasi?1:-1),0,100);
  N.kemiskinan=clamp(+(N.kemiskinan+(55-N.ekonomi)/40+N.inflasi/25+ri(-3,3)/10).toFixed(1),1,45);
  N.mood=clamp(Math.round(N.mood+( (N.ekonomi-50)/12 - (N.kemiskinan-12)/8 + (N.kebebasan-50)/25 - N.inflasi/8 - N.pengangguran/12 + (N.perang?-3:0) + ri(-2,2) )),0,100);
  /* program MBG tahunan */
  if(N.mbg){
    N.mbgThn++;
    N.kas-=200;
    if(r()<0.85)addLog('MBG masih jalan: kotak makan dibagi ke jutaan anak sekolah. Vendor catering bertambah kaya. Anggaran '+rpT(200)+' menguap.','sys');
    N.pendidikan=clamp(N.pendidikan+1,0,100);N.keswa=clamp(N.keswa+1,0,100);
    N.mood=clamp(N.mood+2,0,100);N.kemiskinan=clamp(+(N.kemiskinan-0.2).toFixed(1),1,45);
  }
  /* IKN ongoing */
  if(N.iknFase>0&&N.iknFase<3){
    N.kas-=40;N.utang+=ri(0,20);
    if(r()<0.4){N.iknFase++;addLog('Pembangunan IKN naik ke fase '+N.iknFase+' — sebagian gedung dipakai, sebagian masih hutan.','sys');
      if(N.iknFase>=3){ach('iknJadi');stamp('IKN BERFUNGSI','gold');leg(2,8);}}
  }
  /* sanksi negara berlanjut */
  if(N.sanksi){N.sanksiThn--;if(N.sanksiThn<=0){N.sanksi=false;addLog('Sanksi internasional dicabut. Investor mulai berani lagi menelepon.','sys');}}
  /* perang aktif: terus berdarah */
  if(N.perang){
    N.perang.thn++;
    N.kas-=120;N.utang+=80;
    addLog('Perang dengan '+N.perang.dengan+' memasuki tahun ke-'+N.perang.thn+'. Biaya militer '+rpT(120)+' bulan ini.','sys');
    if(N.perang.thn>=3&&!isPres()){
      /* resolusi otomatis kalau bukan presiden Anda */
      if(N.militer>50){N.perang=null;addLog('Setelah 3 tahun, perang berakhir dengan gencatan senjata. Tidak ada pihak yang benar-benar menang.','sys');}
      else {N.perang=null;N.ekonomi=clamp(N.ekonomi-5,5,100);N.kemiskinan=clamp(N.kemiskinan+2,1,45);
        addLog('Nusantara terpaksa menyerah dalam perang. Wilayah perbatasan jadi sengketa.','bad');}
    }
  }
  /* separatis */
  if(N.separatis){
    N.separatis.thn++;
    N.kas-=30;N.keamanan=clamp(N.keamanan-2,0,100);
    if(N.separatis.thn>=4&&r()<0.4){const w=N.separatis.wilayah;N.separatis=null;addLog('Gerakan separatis di '+w+' berhasil diredam lewat dialog dan operasi militer.','good');leg(2,4);}
  }
  /* rezim NPC (kalau bukan Anda presidennya) */
  if(!isPres()){
    const z=N.rezim;
    if(z==='reformis'){N.korupsi=clamp(N.korupsi-1,0,100);N.kebebasan=clamp(N.kebebasan+1,0,100);N.demokrasi=clamp(N.demokrasi+1,0,100);}
    else if(z==='pembangunan'){N.infra=clamp(N.infra+1,0,100);N.lingkungan=clamp(N.lingkungan-1,0,100);N.utang+=ri(0,60);N.militer=clamp(N.militer+1,0,100);}
    else if(z==='korup'){N.korupsi=clamp(N.korupsi+1,0,100);N.kas-=ri(10,40);N.mood=clamp(N.mood-1,0,100);N.demokrasi=clamp(N.demokrasi-1,0,100);}
    else {N.mood=clamp(N.mood+1,0,100);N.kas-=ri(10,30);N.kemiskinan=clamp(N.kemiskinan-0.2,1,45);N.inflasi=clamp(+(N.inflasi+0.5).toFixed(1),0,80);}
  } else {
    /* tahun memerintah dicatat dua sisi: rakyat lihat mood, negara lihat ekonomi+stabilitas */
    leg((N.mood-55)/12,(N.ekonomi-52)/14+(N.demokrasi-50)/25);
    /* koalisi parlemen mengikuti kepuasan publik */
    N.koalisi=clamp(N.koalisi+(N.mood>=55?1:-1),0,100);
    /* kabinet: mutu menteri mengangkat (atau menggerus) kinerja sektor */
    if(N.kabinet.length){ const b=(N.kabinetMutu-50)/50;
      if(b>0){ N.ekonomi=clamp(N.ekonomi+1,5,100); if(b>=0.2){N.infra=clamp(N.infra+1,0,100);N.pendidikan=clamp(N.pendidikan+1,0,100);} }
      else if(b<=-0.2){ N.korupsi=clamp(N.korupsi+1,0,100); N.mood=clamp(N.mood-1,0,100); }
    }
  }
  /* standing pers menormal pelan ke 50 */
  N.pers=clamp(N.pers+(N.pers>50?-1:N.pers<50?1:0),0,100);
  /* transfer dana ke daerah (DAU) tiap tahun untuk kepala daerah */
  if(isKepda()&&P.jabData){
    P.jabData.apbd=+( (P.jabData.apbd||0)+(P.jab.k==='gubernur'?ri(12,20):ri(4,7)) ).toFixed(1);
  }
}

/* ================= DRIFT PRIBADI ================= */
function drift(){
  const s=P.st;
  P.sumPop+=s.popularitas; P.years++;
  /* alami */
  if(P.age>50)s.kesehatan=clamp(s.kesehatan-1,0,100);
  if(P.age>68)s.kesehatan=clamp(s.kesehatan-1,0,100);
  if(s.stres>70)s.kesehatan=clamp(s.kesehatan-3,0,100);
  s.stres=clamp(s.stres-2,0,100);
  s.popularitas=clamp(Math.round(s.popularitas+(28-s.popularitas)*0.05),0,100);
  s.pengaruh=clamp(s.pengaruh-(P.jab?0:1),0,100);
  P.heat=clamp(P.heat-(N.pers>=65?4:N.pers<=35?2:3),0,100);
  if(P.lsm)s.popularitas=clamp(s.popularitas+1,0,100);
  if(P.penjara>0){
    P.penjara--;
    addLog('Setahun lagi berlalu di balik jeruji. Sisa masa tahanan: '+P.penjara+' tahun.','sys');
    if(P.penjara<=0){
      addLog('<b>Anda BEBAS.</b> Di gerbang lapas, '+(P.st.popularitas>=55?'pendukung menyambut dengan karangan bunga. Negeri ini memang ajaib.':'hanya keluarga yang menunggu.'),P.st.popularitas>=55?'good':'sys');
      stamp('BEBAS','green'); milestone('Bebas dari lapas');
    }
    return;
  }
  /* studi S2/S3 berjalan */
  if(P.study){
    P.study.sisa--;
    if(P.study.sisa<=0){
      P.edu=P.study.target;
      addLog('Anda menuntaskan studi <b>'+P.edu+'</b>! Gelar baru, jejaring baru, wawasan bertambah.'+fx({kompetensi:+(P.study.komp||8),stres:-2}),'good');
      stamp(P.edu+' SELESAI','green'); milestone('Lulus '+P.edu);
      P.study=null;
    } else addLog('Studi '+P.study.target+' berjalan — sisa '+P.study.sisa+' tahun.','sys');
  }
  /* gaji & jabatan — yang tersisa jadi tabungan ±40% (sisanya biaya hidup, pajak, iuran partai & konstituen) */
  if(P.jab){
    const j=JAB[P.jab.k];
    P.money+=Math.round(j.gaji*0.4);
    P.jab.sisa--;
    if(P.jab.sisa<=0){
      if(P.jab.k==='menteri')endJab('kabinet dirombak seiring pergantian periode');
      else endJab(isPemilu()?'pemilu digelar tahun ini':'periode habis');
    }
  } else {
    if(P.petahana&&!isPemilu())P.petahana=null;
    /* di luar jabatan: hidup dari pekerjaan sesuai latar; pensiunan politik & yang sedang studi menabung lebih sedikit */
    if(!P.retired)P.money+=Math.round((NAFKAH[P.latar]||30e6)*(P.study?0.15:0.3));
  }
  /* deposito */
  if(P.depo>0)P.depo=Math.round(P.depo*1.04);
  /* LHKPN: harta tak wajar */
  if(P.jab&&P.gelap>5e9&&r()<0.3){
    addLog('Media membandingkan LHKPN Anda dengan gaya hidup keluarga. Angkanya tidak ketemu.'+fx({heat:+8,popularitas:-3}),'bad');
  }
  if(P.mewah>0&&P.jab&&r()<0.2){
    addLog('Foto koleksi barang mewah keluarga Anda viral. Warganet menghitung harga jam tangan itu.'+fx({heat:+5,popularitas:-4}),'bad');
  }
}

/* ================= KASUS HUKUM ================= */
function kasusCheck(){
  if(P.penjara>0||G.over)return;
  /* tak pernah menerima uang gelap = tak ada "aliran dana" untuk ditemukan. Sorotan tinggi pada orang bersih berarti serangan balik
     dari pihak yang ia bongkar: laporan pencemaran nama / pasal karet, bukan vonis korupsi. */
  if(P.gelapTotal<=0){
    if(P.heat>=35&&r()<(P.heat-25)/220){
      ask({title:'DILAPORKAN BALIK',text:'Pihak-pihak yang Anda bongkar melawan: Anda dilaporkan ke polisi atas pencemaran nama baik dan "menyebarkan kabar bohong". Surat panggilan sudah di tangan.',opts:[
        {t:'Hadapi terbuka, buka semua data',e:()=>{ if(r()<0.45+P.st.integritas/250+N.kebebasan/400){ addLog('Publik dan pers berdiri di belakang Anda. Laporan itu dihentikan karena tidak cukup bukti — dan nama pelapornya justru makin disorot.'+fx({heat:-25,popularitas:+6,stres:+5})+nx({kebebasan:+1}),'good'); leg(4,0); }
          else { P.tapol=true; ach('tapol'); addLog('Proses berjalan cepat sekali untuk ukuran negeri ini. Anda ditahan beberapa bulan dengan pasal karet sebelum akhirnya dibebaskan.'+fx({heat:-20,popularitas:+8,stres:+12,kesehatan:-4})+nx({kebebasan:-2}),'bad'); milestone('Ditahan lewat pasal karet'); leg(5,-6); } }},
        {t:'Minta maaf & cabut pernyataan',e:()=>{ addLog('Anda menarik pernyataan demi keselamatan keluarga. Laporan dicabut, tetapi para pendukung kecewa.'+fx({heat:-30,popularitas:-8,integritas:-5,stres:-2}),'bad'); leg(-4,1); }}
      ]});
    }
    return;
  }
  const kpk=(100-N.korupsi)/100, pers=N.kebebasan/100;
  /* media yang bersahabat (N.pers tinggi) memperlambat terbukanya kasus; media galak mempercepat */
  const pelu=(P.heat-25)/130*(0.5+kpk*0.5+pers*0.3)*(1+(50-N.pers)/120);
  if(P.heat>=30&&r()<pelu){
    stamp('OPERASI TANGKAP TANGAN');
    ask({title:'PENYIDIK DI DEPAN PINTU',text:'Subuh. Penyidik antikorupsi menggeledah rumah Anda dan menemukan jejak aliran dana. Kamera media sudah menyala di halaman.',opts:[
      {t:'Kooperatif — hadapi persidangan',sub:'Sewa pengacara terbaik '+rp(2e9),e:()=>sidang(P.money>=2e9)},
      {t:'"Amankan" perkara lewat orang dalam',sub:'Butuh uang gelap '+rp(5e9),cond:()=>P.gelap>=5e9,e:()=>{
        P.gelap-=5e9;
        if(r()<0.5){
          addLog('Berkas perkara Anda mendadak "kurang bukti". Penyidik kunci dimutasi.'+fx({heat:-30,integritas:-10}),'bad');
          ach('licin'); leg(-8,0);
        } else {
          addLog('Suap Anda terendus — pasal bertambah: perintangan penyidikan.'+fx({heat:+10}),'bad');
          sidang(false,2);
        }}},
    ]});
  }
}
function sidang(pengacara,tambahan){
  if(pengacara)P.money-=2e9;
  ach('ott');
  let th=ri(3,8)+(tambahan||0)-(pengacara?2:0);
  th=Math.max(th,2);
  /* uang yang sudah dicuci (kas & deposito) tetap dilacak dan disita: 70% dari uang gelap yang pernah diterima */
  const cuci=Math.min(Math.max(P.money,0)+P.depo,Math.round(Math.max(0,P.gelapTotal-P.gelap)*0.7));
  const dariDepo=Math.min(P.depo,cuci); P.depo-=dariDepo; P.money-=(cuci-dariDepo);
  const sita=P.gelap+cuci; P.gelap=0;
  P.vonis=true; P.penjara=th;
  if(P.jab)endJab('dicopot karena status terdakwa');
  addLog('Palu hakim diketuk: <b>vonis '+th+' tahun penjara</b>, harta hasil korupsi '+rp(sita)+' disita negara. Rompi oranye menanti.'+fx({popularitas:-18,pengaruh:-25,stres:+15}),'bad');
  stamp('VONIS '+th+' TAHUN');
  milestone('Divonis korupsi '+th+' tahun');
  leg(-15,-20);
}

