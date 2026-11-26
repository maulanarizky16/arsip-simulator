'use strict';
/* ================= STATE ================= */
let P=null, N=null;
const G={current:null, queue:[], over:false, feed:[], tab:'diri', acted:0};

function newGame(){
  if(window.ArsipArt&&ArsipArt.creator('negara',newGame))return;   /* pop-up buat karakter dulu */
  const ID=window.ArsipArt?ArsipArt.identity():{};
  const g=ID.gender||(r()<0.6?'L':'P');
  N={
    tahun:2004, ekonomi:55, kas:120, utang:1300, pajak:11,
    kemiskinan:16, pendidikan:50, keswa:50, infra:45, lingkungan:55,
    keamanan:60, kebebasan:60, korupsi:65, mood:50,
    militer:45, diplomasi:50, demokrasi:55, inflasi:5, pengangguran:8,
    hubLN:'netral', perang:null, sanksi:false, sanksiThn:0,
    iknFase:0, mbg:false, mbgThn:0, separatis:null,
    rezim:pick(REZIM),
    koalisi:50, pers:50, kabinet:[], kabinetMutu:0
  };
  P={
    nama:(g==='L'?pick(NAMA_L):pick(NAMA_P))+' '+pick(BLK), gender:g, kota:pick(KOTA),
    age:22, lahir:1982, alive:true, sebab:null,
    st:{kesehatan:ri(75,92),stres:ri(8,20),integritas:50,popularitas:20,pengaruh:10,kompetensi:50},
    money:0, gelap:0, depo:0,
    partai:null, jab:null, terms:{}, petahana:null, lastLv:0, maxLv:0,
    keluarga:false, anak:0, anakKader:false,
    legR:0, legN:0, sumPop:0, years:0,
    cDemo:0, cEkspos:0, cWhistle:0, gelapTotal:0, korupsiTurun:0,
    heat:0, penjara:0, vonis:false, tapol:false, tigaOk:false, retired:false, lsm:false, buzzed:0, mewah:0,
    pandemi:false, ikn:false,
    edu:'S1', study:null, jabData:null, bersihAksi:0, wapres:null, _cawapres:null, rival:null, cukong:false,
    riwayat:[], ach:{}, used:{}, latar:null,
    janji:null, janjiSnap:null, pendingJanji:null, _perangBaru:false, wawancaraCount:0,
    evDataBocor:false, evDinasti:false,
    _lawan:null, _lawanKuat:0, _debatBonus:0
  };
  if(ID.nama)P.nama=ID.nama;
  if(ID.skin)P.skin=ID.skin;
  P.arsipNo='Berkas No. '+ri(10000,99999)+'/POL/'+N.tahun;
  G.current=null; G.queue=[]; G.over=false; G.feed=[]; G.tab='diri'; G.acted=0;
  if(hasDoc){
    $('feed').innerHTML=''; $('kartu').innerHTML='';
    $('overlay').classList.add('hidden');
    $('noArsip').textContent=P.arsipNo;
  }
  yearHeader();
  addLog('Republik Nusantara, tahun '+N.tahun+'. Di '+P.kota+', seorang anak muda bernama <b>'+P.nama+'</b> ('+P.age+' th) menatap negeri yang penuh masalah — dan penuh peluang.');
  milestone('Memulai perjalanan dari '+P.kota);
  arahanNegara();
  ask({title:'LATAR BELAKANG',text:'Dari mana cerita Anda dimulai? Latar menentukan modal awal Anda:',
    opts:LATAR.map(l=>({t:l.n,sub:l.d,e:()=>{
      P.latar=l.k; Object.assign(P.st,l.st); P.money=l.money;
      addLog('Anda memulai sebagai <b>'+l.n.toLowerCase()+'</b>. '+l.d+'.');
      milestone('Latar: '+l.n);
    }}))});
  render();
}
function arahanNegara(){
  try{ if(localStorage.getItem('arsip_arahan_neg_v1'))return; localStorage.setItem('arsip_arahan_neg_v1','1'); }catch(e){}
  caraMain();
}
function caraMain(){
  ask({title:'CARA MAIN',text:'Selamat datang. Kamu meniti karier politik dari nol, mungkin sampai presiden.<br><br>'+
    '<b>1.</b> Tiap tahun, pilih aksi di <b>Meja Aksi</b> (laci Gerakan, Politik, Kebijakan, Siasat, Uang).<br>'+
    '<b>2.</b> Gabung partai, lalu <b>Maju Pemilu</b> di tahun politik untuk naik jabatan.<br>'+
    '<b>3.</b> Kalau sudah, tekan <b>"Jalani Tahun +1"</b> untuk maju setahun.<br>'+
    '<b>4.</b> Tiap keputusan dinilai dua sisi: <b>Mata Rakyat</b> dan <b>Catatan Negara</b>. Bisa dicintai rakyat tapi tercoreng di arsip resmi, atau sebaliknya.<br><br>'+
    'Sekarang, pilih dulu latar belakangmu.',
    opts:[{t:'Mengerti, lanjut »',e:()=>{}}]});
}

/* ================= LOG ================= */
function yearHeader(){
  const h='TAHUN '+N.tahun+' — USIA '+P.age;
  G.feed.push({yr:h});
  if(hasDoc){
    const d=document.createElement('div'); d.className='yr'; d.textContent=h;
    $('feed').appendChild(d); $('feed').scrollTop=$('feed').scrollHeight;
  }
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
const LBL={kesehatan:'Kesehatan',stres:'Stres',integritas:'Integritas',popularitas:'Popularitas',pengaruh:'Pengaruh',kompetensi:'Kompetensi'};
function fx(o){
  const parts=[];
  for(const k in o){
    if(k==='money'){ P.money+=o[k]; parts.push('Uang '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='gelap'){ P.gelap+=o[k]; if(o[k]>0)P.gelapTotal+=o[k]; parts.push('Uang gelap '+(o[k]>=0?'+':'')+rp(o[k]).replace('Rp ','')); }
    else if(k==='heat'){ P.heat=clamp(P.heat+o[k],0,100); parts.push('Sorotan hukum '+(o[k]>=0?'+':'')+o[k]); }
    else { P.st[k]=clamp(P.st[k]+o[k],0,100); parts.push(LBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  }
  return ' <span class="d">('+parts.join(', ')+')</span>';
}
/* efek ke indikator negara + teks delta */
const NLBL={ekonomi:'Ekonomi',kemiskinan:'Kemiskinan',pendidikan:'Pendidikan',keswa:'Kesehatan publik',infra:'Infrastruktur',lingkungan:'Lingkungan',keamanan:'Keamanan',kebebasan:'Kebebasan sipil',korupsi:'Indeks korupsi',mood:'Kepuasan publik',pajak:'Pajak',kas:'Kas negara',utang:'Utang',militer:'Militer',diplomasi:'Diplomasi',demokrasi:'Indeks demokrasi',inflasi:'Inflasi',pengangguran:'Pengangguran'};
function nx(o){
  const parts=[];
  for(const k in o){
    if(k==='kas'||k==='utang'){ N[k]=Math.round(N[k]+o[k]); parts.push(NLBL[k]+' '+(o[k]>=0?'+':'')+rpT(o[k]).replace('Rp ','')); }
    else if(k==='pajak'){ N.pajak=clamp(N.pajak+o[k],5,40); parts.push('Pajak '+(o[k]>=0?'+':'')+o[k]+'%'); }
    else if(k==='kemiskinan'){ N.kemiskinan=clamp(+(N.kemiskinan+o[k]).toFixed(1),1,45); parts.push('Kemiskinan '+(o[k]>=0?'+':'')+o[k]+'%'); }
    else if(k==='inflasi'){ N.inflasi=clamp(+(N.inflasi+o[k]).toFixed(1),0,80); parts.push('Inflasi '+(o[k]>=0?'+':'')+o[k]+'%'); }
    else if(k==='pengangguran'){ N.pengangguran=clamp(+(N.pengangguran+o[k]).toFixed(1),1,35); parts.push('Pengangguran '+(o[k]>=0?'+':'')+o[k]+'%'); }
    else if(k==='korupsi'&&o[k]<0){ N.korupsi=clamp(N.korupsi+o[k],0,100); P.korupsiTurun+=-o[k]; parts.push(NLBL[k]+' '+o[k]); }
    else { N[k]=clamp(N[k]+o[k],0,100); parts.push(NLBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  }
  return ' <span class="d">['+parts.join(', ')+']</span>';
}
/* efek ke indikator DAERAH (khusus kepala daerah) + teks delta */
const DLBL={infra:'Infrastruktur daerah',ekonomi:'Ekonomi daerah',sejahtera:'Kesejahteraan',layanan:'Layanan publik',kepuasan:'Kepuasan warga'};
function dx(o){
  if(!P.jabData||!P.jabData.daerah)return '';
  const D=P.jabData.daerah, parts=[];
  for(const k in o){ D[k]=clamp((D[k]||50)+o[k],0,100); parts.push(DLBL[k]+' '+(o[k]>=0?'+':'')+o[k]); }
  return ' <span class="d">{'+parts.join(', ')+'}</span>';
}
function daerahRata(){ const D=P.jabData&&P.jabData.daerah; if(!D)return 0; return Math.round((D.infra+D.ekonomi+D.sejahtera+D.layanan+D.kepuasan)/5); }
/* legasi ganda: cara rakyat vs negara mengingat Anda */
function leg(rk,ng){ P.legR=clamp(P.legR+rk,-70,70); P.legN=clamp(P.legN+ng,-70,70); }
/* skala kebutuhan: kebijakan lebih dihargai saat memang dibutuhkan */
function need(v){ return clamp((100-v)/50,0.4,1.7); }
function needK(){ return clamp(N.kemiskinan/14,0.4,1.7); }

/* ================= KARTU ================= */
function ask(d){
  d.opts=d.opts.filter(o=>!o.cond||o.cond());
  if(!d.opts.length)d.opts=[{t:'Lewati',e:()=>{}}];
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

