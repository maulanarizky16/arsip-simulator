'use strict';
/* ================= STATE ================= */
let P=null, N=null;
const G={current:null, queue:[], over:false, feed:[], tab:'skill', acted:0};

function newGame(){
  if(window.ArsipArt&&ArsipArt.creator('it',newGame))return;   /* pop-up buat karakter dulu */
  const ID=window.ArsipArt?ArsipArt.identity():{};
  const g=ID.gender||(r()<0.62?'L':'P');
  N={ tahun:2008, pasar:'normal', tren:pick(TREN), ancaman:ri(40,60) };
  P={
    nama:namaOrang(g), gender:g, kota:pick(KOTA),
    age:22, lahir:1986, alive:true, sebab:null,
    spes:null, spesN:'—', tempat:null, tempatN:'—',
    jab:'junior', tahunJab:0, maxLv:1, lastLv:1,
    st:{ngoding:ri(28,42),sistem:ri(28,42),jaringan:ri(25,40),keamanan:ri(18,32),soft:ri(25,45),kesehatan:ri(80,95),stres:ri(8,20)},
    reputasi:ri(12,24),
    money:0, gelap:0, gelapTotal:0, saham:0,
    topi:'putih',
    insidenTotal:0, beres:0, gagal:0, outageBesar:0, dataHilang:0, eskalasi:0,
    deployTotal:0, deployGagal:0,
    hackWhite:0, hackBlack:0, ctfMenang:0, bugBounty:0, exploitJual:0,
    burnoutKali:0, lembur:0,
    infra:[], uptime:99,
    legK:0, legC:0, sumRep:0, years:0,
    heat:0, vonis:false, penjara:0, retired:false, dipecat:false, buronan:false,
    keluarga:false, anak:0, sertifikat:[], openSource:false, mentorKali:0, startupSaham:false,
    pelatihanAI:false,
    tenure:0, jobHops:0, coverUps:0, uptimeStreak:0, saasMRR:0, bluTeam:0, usedSkill:{},
    evAkuisisi:false, evMoonlight:false, evCounterOffer:false,
    riwayat:[], ach:{}, used:{}
  };
  if(ID.nama)P.nama=ID.nama;
  if(ID.skin)P.skin=ID.skin;
  P.arsipNo='Berkas No. '+ri(10000,99999)+'/SIB/'+N.tahun;
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='skill'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  yearHeader();
  addLog('Tahun '+N.tahun+', di '+P.kota+'. <b>'+P.nama+'</b> ('+P.age+' th) baru lulus dan menatap layar terminal yang berkedip. Karier di dunia IT dimulai dari nol.');
  milestone('Fresh graduate, mulai dari nol');
  arahanSiber();
  /* pilih spesialisasi */
  ask({title:'PILIH JALUR (SPESIALISASI)',text:'Dunia IT luas. Dari mana Anda memulai? Pilihan ini menentukan skill awal dan jenis masalah yang akan Anda hadapi tiap hari:',
    opts:SPES.map(s=>({t:s.n,sub:s.d,e:()=>{
      P.spes=s.k; P.spesN=s.short;
      for(const k in s.boost)P.st[k]=clamp(P.st[k]+s.boost[k],0,100);
      addLog('Anda menapaki jalur <b>'+s.n+'</b>. '+s.d,'sys');
      milestone('Spesialisasi: '+s.short);
      pilihTempat();
    }}))});
  render();
}
function pilihTempat(){
  ask({title:'TEMPAT KERJA PERTAMA',text:'Tawaran kerja pertama datang. Tempat kerja menentukan gaji, gaya hidup, dan tekanan:',
    opts:TEMPAT.map(t=>({t:t.n,sub:t.d,e:()=>{
      P.tempat=t.k; P.tempatN=t.n;
      if(t.k==='startup'||t.sahamX>0)P.startupSaham=t.k==='startup';
      P.infra=(INFRA_AWAL[P.spes]||['server','app','jaringan']).map(k=>({k,n:INFRA_DEF[k].n,sehat:ri(78,95),nilai:ri(2,6)*1e8,kritis:true,debt:ri(0,15)}));
      addLog('Anda diterima di <b>'+t.n+'</b> sebagai '+JAB.junior.n+' '+P.spesN+'. '+t.d,'good');
      milestone('Kerja di '+t.n);
      ach('junior');
    }}))});
}
function arahanSiber(){
  try{ if(localStorage.getItem('arsip_arahan_it_v1'))return; localStorage.setItem('arsip_arahan_it_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Selamat datang. Kamu meniti karier IT dari Junior sampai (mungkin) CTO — atau hilang jadi buronan siber.<br><br>'+
    '<b>1.</b> Tiap tahun ada <b>INSIDEN</b>: server tumbang, armada IoT mati, deploy gagal, sistem diretas. <b>Diagnosa</b> dulu (baca log, cek monitoring), lalu <b>terapkan perbaikan</b>. Diagnosa yang teliti menaikkan peluang fix-mu benar.<br>'+
    '<b>2.</b> Pilih aksi di Meja (Diri, Skill & Karier, Sistem & Aset, Siber & Siasat, Uang), lalu tekan <b>"Jalani Tahun +1"</b>.<br>'+
    '<b>3.</b> Skill IT cepat usang — kalau tak belajar, kemampuanmu meluruh tiap tahun.<br>'+
    '<b>4.</b> Di akhir kamu dinilai dua sisi: <b>Karya & Integritas</b> (sistem andal, etika, kontribusi) dan <b>Cuan & Karier</b> (gaji, saham, posisi). Bisa jadi legenda yang dihormati, atau kaya raya lewat jalan gelap sampai diburu.',
    opts:[{t:'Mengerti, mulai »',e:()=>{}}]});
}

/* ================= LOG ================= */
function yearHeader(){
  const h='TAHUN '+N.tahun+' — USIA '+P.age;
  G.feed.push({yr:h});
  if(hasDoc){ const d=document.createElement('div'); d.className='yr'; d.textContent=h; $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight; }
}
function addLog(html,cls){
  G.feed.push({html,cls});
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='e'+(cls?' '+cls:''); d.innerHTML=html;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function stamp(t,kind){
  if(!hasDoc)return;
  const d=document.createElement('div'); d.className='stamp'+(kind?' '+kind:''); d.textContent=t;
  $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
}
function milestone(t){ P.riwayat.push({th:N?N.tahun:'-',t}); }
function ach(k){
  if(P.ach[k])return;
  P.ach[k]=true;
  addLog('TANDA JASA TERBUKA: <b>'+ACH_DEF[k]+'</b>','good');
  stamp(ACH_DEF[k].toUpperCase(),'gold');
}
const LBL={ngoding:'Coding & Scripting',sistem:'Server & Cloud',jaringan:'Jaringan & IoT',keamanan:'Keamanan Siber',soft:'Soft Skill',kesehatan:'Kesehatan',stres:'Stres'};
function fx(o){
  const parts=[];
  for(const k in o){
    if(k==='money'){ P.money+=o[k]; parts.push('Saldo '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='gelap'){ P.gelap+=o[k]; if(o[k]>0)P.gelapTotal+=o[k]; parts.push('Uang gelap '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='saham'){ P.saham=Math.max(0,P.saham+o[k]); parts.push('Saham '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='heat'){ P.heat=clamp(P.heat+o[k],0,100); parts.push('Sorotan '+(o[k]>=0?'+':'')+o[k]); }
    else if(k==='reputasi'){ P.reputasi=clamp(P.reputasi+o[k],0,100); parts.push('Reputasi '+(o[k]>=0?'+':'')+o[k]); }
    else { P.st[k]=clamp(P.st[k]+o[k],0,100); parts.push(LBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}
/* efek ke kesehatan satu/seluruh aset infra + teks delta */
function ix(item,delta){
  if(!item)return '';
  item.sehat=clamp(Math.round(item.sehat+delta),0,100);
  return ' <span class="d">['+item.n+' '+(delta>=0?'+':'')+delta+']</span>';
}
function ixAll(delta){
  for(const a of P.infra)a.sehat=clamp(Math.round(a.sehat+delta),0,100);
  return ' <span class="d">[semua sistem '+(delta>=0?'+':'')+delta+']</span>';
}
function infraGet(k){ return P.infra.find(a=>a.k===k); }
function uptimeRata(){ if(!P.infra.length)return 100; return Math.round(P.infra.reduce((s,a)=>s+a.sehat,0)/P.infra.length); }
/* legasi ganda: Karya & Integritas vs Cuan & Karier */
function leg(karya,cuan){ P.legK=clamp(P.legK+karya,-80,80); P.legC=clamp(P.legC+cuan,-80,80); }
function lvNow(){ return JAB[P.jab].lv; }
function setTopi(){
  if(P.hackBlack>0||P.exploitJual>0)P.topi=(P.hackWhite>=P.hackBlack)?'abu':'hitam';
  else if(P.hackWhite>0||P.bugBounty>0||P.ctfMenang>0)P.topi='putih';
  if(P.topi==='putih'&&(P.hackWhite>=3||P.bugBounty>=1))ach('topiPutih');
}
function gajiTahun(){
  let g=JAB[P.jab].gaji;
  const tm=TEMPAT.find(t=>t.k===P.tempat); if(tm)g*=tm.gajiX;
  g*= (N.pasar==='boom'?1.12:N.pasar==='krisis'?0.96:1);
  g*= (1+(P.reputasi-30)/300);
  return Math.round(g);
}

/* ================= KARTU ================= */
function ask(d){
  d.opts=d.opts.filter(o=>!o.cond||o.cond());
  if(!d.opts.length)d.opts=[{t:'Lanjut',e:()=>{}}];
  if(G.current)G.queue.push(d); else {G.current=d; renderKartu();}
}
function choose(i){
  if(!G.current||G.over)return;
  const cur=G.current; G.current=null;
  if(hasDoc)$('kartu').innerHTML='';
  (cur.opts[i]||cur.opts[0]).e();
  if(!G.current && G.queue.length){G.current=G.queue.shift(); renderKartu();}
  render();
}

/* ================= DRIFT ================= */
function rollPasar(){
  const x=r();
  if(x<0.12){ N.pasar='krisis'; addLog('<b>WINTER TEKNOLOGI.</b> Layoff massal melanda industri, pendanaan startup mengering.','bad'); }
  else if(x<0.32){ N.pasar='boom'; addLog('Industri sedang panas — perusahaan rebutan talenta, gaji naik, lowongan di mana-mana.','good'); }
  else N.pasar='normal';
  if(r()<0.6)N.tren=pick(TREN);
  N.ancaman=clamp(N.ancaman+ri(-6,8),20,95);
}
function drift(){
  const s=P.st;
  P.sumRep+=P.reputasi; P.years++;
  /* di penjara */
  if(P.penjara>0){
    P.penjara--;
    addLog('Setahun berlalu di balik jeruji kasus siber. Sisa masa tahanan: '+P.penjara+' tahun.','sys');
    if(P.penjara<=0){ addLog('<b>Anda bebas.</b> Tapi reputasi di industri sudah jadi puing — tiap recruiter mengetik nama Anda dan menemukan beritanya.','sys'); stamp('BEBAS','green'); milestone('Bebas dari lapas'); P.dipecat=true; }
    return;
  }
  /* gaji & saham + masa kerja (tenure) */
  if(!P.retired&&P.jab){ P.money+=gajiTahun(); P.tahunJab++; P.tenure=(P.tenure||0)+1; }
  if(P.saham>0){
    const pct=N.pasar==='boom'?ri(0,40):N.pasar==='krisis'?ri(-45,-5):ri(-12,28);
    const d=Math.round(P.saham*pct/100); P.saham=Math.max(0,P.saham+d);
  }
  /* pendapatan pasif produk sampingan (SaaS/MRR) — bisa tumbuh atau menyusut kalau ditelantarkan */
  if(P.saasMRR>0){
    P.money+=Math.round(P.saasMRR*12);
    if(!(P.usedSkill&&P.usedSkill.saas))P.saasMRR=Math.round(P.saasMRR*(0.78+r()*0.18));   /* churn (selalu menyusut) kalau tak dirawat */
    if(P.saasMRR<1e6)P.saasMRR=0;
  }
  /* skill rot — teknologi bergerak cepat; skill yang dipakai lebih awet, adopsi AI memperlambat keusangan */
  if(!P.retired){
    for(const k of ['ngoding','sistem','jaringan','keamanan']){
      if(s[k]<=20)continue;
      let p=0.7;
      if(P.usedSkill&&P.usedSkill[k])p=0.3;
      if(P.pelatihanAI&&(k==='ngoding'||k==='sistem'))p-=0.18;
      if(r()<p)s[k]=clamp(s[k]-(r()<0.3?2:1),0,100);
    }
  }
  /* reputasi condong turun pelan kalau pasif */
  P.reputasi=clamp(P.reputasi-(r()<0.5?1:0),0,100);
  /* aset menua: bit rot, beban trafik, entropi; utang teknis menumpuk diam-diam */
  for(const a of P.infra){ a.sehat=clamp(a.sehat-ri(1,4),0,100); a.debt=clamp((a.debt||0)+ri(1,3),0,100); }
  P.uptime=uptimeRata();
  /* on-call fatigue pulih perlahan; postur blue-team & sorotan meluruh */
  P.lembur=clamp((P.lembur||0)-4,0,100);
  P.bluTeam=clamp((P.bluTeam||0)-ri(1,3),0,100);
  /* stres & kesehatan */
  s.stres=clamp(s.stres-2,0,100);
  if(P.lembur>60)s.stres=clamp(s.stres+3,0,100);
  if(s.stres>72)s.kesehatan=clamp(s.kesehatan-3,0,100);
  if(P.age>50)s.kesehatan=clamp(s.kesehatan-1,0,100);
  if(P.age>62)s.kesehatan=clamp(s.kesehatan-1,0,100);
  P.heat=clamp(P.heat-3,0,100);
  /* harta tak wajar saat ada sorotan */
  if(P.gelap>3e9&&r()<0.3){
    addLog('Pola kekayaanmu mulai janggal — saldo crypto tak sebanding penghasilan resmi. Ada yang memperhatikan.'+fx({heat:+7}),'bad');
  }
  setTopi();
}
