'use strict';
/* ================= MAJU TAHUN ================= */
function advance(){
  if(!P||G.current||G.over)return;
  P.age++; N.tahun++;
  P.used={}; G.acted=0;
  yearHeader();
  rollPasar();
  drift();   /* membaca P.usedSkill yang dikumpulkan dari aksi & insiden tahun lalu */
  if(P.alive&&P.penjara<=0&&!P.retired)insiden();
  if(P.alive&&P.penjara<=0)events();
  if(P.alive)deathCheck();
  if(P.alive)checkAch();
  /* reliabilitas yang konsisten membangun reputasi (Raja Uptime) */
  if(P.alive&&!P.retired&&P.penjara<=0){
    if(uptimeRata()>=90){ P.uptimeStreak=(P.uptimeStreak||0)+1; if(P.uptimeStreak===3||P.uptimeStreak%4===0)P.reputasi=clamp(P.reputasi+1,0,100); if(P.uptimeStreak>=3)ach('rajaUptime'); }
    else P.uptimeStreak=0;
  }
  /* reset penanda skill-terpakai SETELAH drift mengonsumsinya, agar aksi tahun ini terhitung tahun depan */
  P.usedSkill={};
  render();
}

/* ================= RENDER ================= */
function renderKartu(){
  if(!hasDoc)return;
  const k=$('kartu');
  if(!G.current){k.innerHTML='';k._kartu=null;return;}
  const d=G.current;
  if(k._kartu===d&&k.firstChild)return;   /* kartu yang sama sudah tampil: jangan render ulang (centang jawaban form soal bisa hilang) */
  k._kartu=d;
  k.innerHTML='<div class="kartu"><div class="kh">LEMBAR KEPUTUSAN — '+d.title+'</div>'+
    '<div class="kt">'+d.text+'</div>'+
    d.opts.map((o,i)=>'<button data-i="'+i+'"><span class="num">'+(i+1)+'.</span> '+o.t+(o.sub?'<small>'+o.sub+'</small>':'')+'</button>').join('')+
    '</div>';
  if(G._kartuFocus!==d){ G._kartuFocus=d; const fb=k.querySelector('button'); if(fb)fb.focus(); }
}
function bar(label,val,invert){
  const pct=Math.round(clamp(val,0,100));
  const cls=invert?(pct>66?'low':pct>33?'mid':''):(pct<34?'low':pct<67?'mid':'');
  return '<div class="stat"><div class="sl"><span>'+label+'</span><span>'+pct+'</span></div>'+
    '<div class="sbar"><i class="'+cls+'" style="width:'+pct+'%"></i></div></div>';
}
function nbar(label,val,invert){
  const pct=Math.round(clamp(val,0,100));
  const cls=invert?(pct>66?'low':pct>33?'mid':''):(pct<34?'low':pct<67?'mid':'');
  return '<div class="ng"><div class="nl"><span>'+label+'</span><span>'+Math.round(val)+'</span></div>'+
    '<div class="sbar"><i class="'+cls+'" style="width:'+pct+'%"></i></div></div>';
}
function miniBar(val){
  const pct=Math.round(clamp(val,0,100));
  const cls=pct<34?'low':pct<67?'mid':'';
  return '<div class="sbar"><i class="'+cls+'" style="width:'+pct+'%"></i></div>';
}
function jabLabel(){
  if(P.penjara>0)return 'Terpidana siber ('+P.penjara+' th)';
  if(P.dipecat)return 'Tercoreng · eks-engineer';
  if(P.retired)return 'Pensiun · '+JAB[P.jab].n+' '+P.spesN;
  return JAB[P.jab].n+' '+P.spesN+' · '+P.tempatN;
}
const TOPI_LBL={putih:'Topi Putih',abu:'Topi Abu-abu',hitam:'Topi Hitam'};
const PASAR_LBL={boom:'Sedang panas (boom)',normal:'Biasa',krisis:'Beku (layoff)'};
function render(){
  if(!hasDoc||!P)return;
  $('hdrNow').textContent='TAHUN '+N.tahun+' • USIA '+P.age;
  $('iNama').textContent=P.nama;
  $('iUmur').textContent=P.age+' th / '+N.tahun;
  $('iSpes').textContent=P.spesN||'—';
  $('iLatar').textContent=P.latarN||'—';
  $('iJab').textContent=jabLabel();
  const u=$('iUang'); u.textContent=rp(P.money)+(P.saham>0?(' (+'+rp(P.saham)+' saham)'):'')+((P.saasMRR||0)>0?(' · MRR '+rp(P.saasMRR)+'/bln'):''); u.classList.toggle('neg',P.money<0);
  $('iGelap').textContent=P.gelap>0?rp(P.gelap):'—';
  $('stats').innerHTML=bar('Coding & Scripting',P.st.ngoding)+bar('Server & Cloud',P.st.sistem)+
    bar('Jaringan & IoT',P.st.jaringan)+bar('Keamanan Siber',P.st.keamanan)+bar('Soft Skill',P.st.soft)+bar('Budaya tim',P.budaya!=null?P.budaya:50)+
    bar('Reputasi teknis',P.reputasi)+bar('Kesehatan',P.st.kesehatan)+
    bar('Stres',P.st.stres,true)+bar('On-call fatigue',P.lembur||0,true)+bar('Sorotan hukum',P.heat,true);
  /* sistem & aset (utang teknis ditampilkan) */
  let il='';
  if(P.infra.length){
    for(const a of P.infra){const dbt=(a.debt||0)>=40?' <span style="color:var(--red)">⚠debt '+a.debt+'</span>':(a.debt||0)>=20?' <span class="d">debt '+a.debt+'</span>':'';
      il+='<div class="infra-row"><span class="inm">'+a.n+dbt+'</span><span class="ibar">'+miniBar(a.sehat)+'</span><b>'+a.sehat+'%</b></div>';}
  } else il='<span class="muted">Belum mengelola sistem apa pun.</span>';
  $('infraList').innerHTML=il;
  const up=uptimeRata();
  $('infraNote').textContent='Uptime '+up+'%'+((P.uptimeStreak||0)>0?(' · streak '+P.uptimeStreak+' th'):'')+((P.bluTeam||0)>=20?(' · blue-team '+P.bluTeam):'')+(P.obsv?' · monitoring✓':'')+(P.backupKuat?' · backup✓':'')+' — '+(up>=92?'sistem sehat & andal.':up>=75?'masih oke, tapi butuh perawatan.':'rapuh, satu insiden lagi bisa fatal.');
  /* skena & pasar */
  $('skena').innerHTML=
    '<div class="idrow"><span class="lab">Pasar kerja</span><b>'+(PASAR_LBL[N.pasar]||'—')+'</b></div>'+
    '<div class="idrow"><span class="lab">Tren panas</span><b>'+N.tren+'</b></div>'+
    '<div class="idrow"><span class="lab">Etika (topi)</span><b><span class="topi '+P.topi+'">'+(TOPI_LBL[P.topi]||'—')+'</span></b></div>'+
    '<div class="idrow"><span class="lab">Insiden beres/gagal</span><b>'+P.beres+' / '+P.gagal+'</b></div>'+
    nbar('Ancaman siber global',N.ancaman,true);
  $('butuh').textContent=N.pasar==='krisis'?'Hati-hati: gelombang PHK sedang melanda industri.':N.ancaman>=75?'Ancaman siber tinggi — perketat keamanan sistemmu.':'Industri berjalan seperti biasa.';
  /* riwayat */
  let f='';
  if(P.keluarga)f+='<div class="fr"><span>Keluarga</span><span>menikah'+(P.anak?' · '+P.anak+' anak':'')+'</span></div>';
  if(P.sertifikat.length){ const top=SERT_JALUR.map(j=>({j,g:sertGrade(j.k)})).filter(x=>x.g>=0).sort((a,b)=>b.g-a.g);
    f+='<div class="fr"><span>Sertifikasi</span><span>'+top.map(x=>x.j.gelar[x.g]+' <small>('+GRADE[x.g].n+')</small>').join(' · ')+'</span></div>'; }
  const rw=P.riwayat.slice(-6).reverse();
  for(const x of rw)f+='<div class="fr"><span>'+x.th+'</span><span>'+x.t+'</span></div>';
  $('riwayat').innerHTML=f||'<span class="muted">Belum ada catatan.</span>';
  const ak=Object.keys(P.ach);
  $('ach').innerHTML=ak.length?ak.map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join(''):'<span class="muted">Belum ada.</span>';
  /* tabs */
  $('tabs').innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(G.tab===t[0]?'on':'')+'" role="tab">'+t[1]+'</button>').join('');
  /* meja aksi */
  const busy=!!G.current||G.over;
  let html='';
  for(const a of ACTS.filter(a=>a.tab===G.tab)){
    const av=actAvail(a);
    if(!av.ok&&a.cond&&!a.cond()&&!av.used&&av.why==='Syarat belum terpenuhi')continue;
    const dis=busy||!av.ok;
    html+='<button data-act="'+a.k+'" '+(dis?'disabled':'')+' class="'+(av.used?'used':'')+'" title="'+(av.ok?'':av.why||'')+'">'+
      '<b>'+a.lbl+(a.multi?' ↻':'')+'</b><span>'+(a.sub||'')+'</span></button>';
  }
  if(!html)html='<div class="empty">Tidak ada aksi tersedia di laci ini.</div>';
  $('acts').innerHTML=html;
  $('actInfo').textContent=G.over?'':(P.penjara>0?'Anda di dalam lapas — hanya bisa menjalani waktu.':(G.acted>5?'Tahun yang padat — stres merayap naik.':'Aksi bertanda ↻ bisa diulang dalam setahun; lainnya sekali per tahun.'));
  $('nextBtn').disabled=!!G.current||G.over;
  if(window.ArsipArt)ArsipArt.update('it',P);
  renderKartu();
  saveGame();
}
