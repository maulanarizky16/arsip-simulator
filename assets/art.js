/* ARSIP Art — ikon & karakter berwarna (Microsoft Fluent Emoji 3D, lisensi MIT, lihat assets/fluent/LICENSE).
   Dipakai bersama oleh beranda dan kelima game. Tidak mengubah logika game: hanya menghias DOM.
   API:
     ArsipArt.img(key, cls?, alt?)   -> string <img> aset
     ArsipArt.update(game, P)        -> dipanggil di akhir render() tiap game (avatar + ikon stat/tab/kartu)
     ArsipArt.SIM_ART[game]          -> komposisi thumbnail beranda
*/
(function(){
'use strict';

const BASE=(function(){
  const s=document.currentScript;
  try{ return new URL('fluent/', s&&s.src?s.src:location.href.replace(/[^/]*$/,'')+'assets/').href; }
  catch(e){ return 'assets/fluent/'; }
})();
/* karakter yang punya varian warna kulit: <slug>--<tone>.webp (file tanpa akhiran = tone medium) */
const PEOPLE=new Set('baby,boy,flexed-biceps,girl,man,man-artist,man-construction-worker,man-cook,man-detective,man-factory-worker,man-farmer,man-firefighter,man-health-worker,man-in-tuxedo,man-judge,man-mechanic,man-office-worker,man-pilot,man-police-officer,man-raising-hand,man-student,man-teacher,man-technologist,man-tipping-hand,ninja,old-man,old-woman,person-in-lotus-position,person-in-suit-levitating,person-lifting-weights,person-running,person-shrugging,pregnant-woman,woman,woman-artist,woman-cook,woman-detective,woman-factory-worker,woman-farmer,woman-firefighter,woman-health-worker,woman-in-tuxedo,woman-judge,woman-office-worker,woman-pilot,woman-police-officer,woman-raising-hand,woman-student,woman-teacher,woman-technologist,woman-tipping-hand,woman-with-headscarf'.split(','));
const TONES=[
  {k:'light',n:'Terang',c:'#f7d7bd'},{k:'medium-light',n:'Kuning langsat',c:'#e3b48a'},
  {k:'medium',n:'Sawo matang',c:'#c08354'},{k:'medium-dark',n:'Cokelat',c:'#8f5b36'},{k:'dark',n:'Gelap',c:'#5a3a26'}
];
const NPC_TONES=['medium-light','medium','medium','medium-dark'];
function src(k,tone){
  if(tone&&tone!=='medium'&&PEOPLE.has(k))return BASE+k+'--'+tone+'.webp';
  return BASE+k+'.webp';
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function img(k,cls,alt,tone){
  return '<img class="aa-'+(cls||'ic')+'" src="'+src(k,tone)+'" alt="'+esc(alt||'')+'" decoding="async" draggable="false">';
}
function toneOf(P){ return (P&&P.skin)||'medium'; }

/* ---------- ikon statistik (berdasarkan label bar) ---------- */
const STAT={
  'kesehatan':'red-heart','kebahagiaan':'smiling-face-with-smiling-eyes','kecerdasan':'brain',
  'karisma':'sparkles','relasi':'handshake','relasi & koneksi':'handshake',
  'daya tahan mental':'flexed-biceps','stres':'face-with-steam-from-nose',
  'integritas':'gem-stone','popularitas':'megaphone','pengaruh':'crown','kompetensi':'graduation-cap',
  'sorotan hukum':'police-car-light','sorotan ky/kpk':'police-car-light',
  'reputasi':'glowing-star','reputasi teknis':'glowing-star','nyali':'fire',
  'coding & scripting':'laptop','server & cloud':'desktop-computer','jaringan & iot':'satellite-antenna',
  'keamanan siber':'shield','soft skill':'speech-balloon','on-call fatigue':'alarm-clock',
  'naluri bisnis':'light-bulb','operasional':'gear','pemasaran':'megaphone','finansial':'chart-increasing',
  'kedekatan dgn anak':'baby-bottle', 'budaya tim':'people-hugging',
  'kewarasan':'brain','gengsi':'smiling-face-with-sunglasses','nrimo':'person-in-lotus-position','skill':'books'
};
function statKey(label){
  const l=label.trim().toLowerCase();
  if(STAT[l])return STAT[l];
  if(l.indexOf('hubungan')===0)return 'two-hearts';
  return null;
}

/* ---------- ikon tab meja aksi ---------- */
const TAB={
  diri:'bust-in-silhouette', asmara:'two-hearts', karier:'briefcase', politik:'classical-building',
  usaha:'convenience-store', uang:'money-bag', hobi:'artist-palette', gerakan:'megaphone',
  kebijakan:'scroll', siasat:'chess-pawn', skill:'laptop', infra:'desktop-computer', siber:'shield',
  ekspansi:'rocket', pribadi:'money-bag', kerja:'briefcase', sosial:'people-hugging', warga:'identification-card'
};
const TAB_GAME={ hakim:{karier:'balance-scale'}, niaga:{usaha:'factory', siasat:'bank'} };

/* ---------- ikon judul kartu samping ---------- */
const H3={
  'kartu identitas':'identification-card','profil tokoh':'identification-card','profil hakim':'identification-card',
  'profil engineer':'identification-card','profil pengusaha':'identification-card',
  'kondisi diri':'bar-chart','pekerjaan & usaha':'briefcase','keluarga & asmara':'house-with-garden',
  'hobi':'artist-palette','portofolio & aset':'chart-increasing','pencapaian':'trophy','tanda jasa':'sports-medal',
  'republik nusantara':'globe-showing-asia-australia','riwayat & keluarga':'scroll','riwayat':'scroll',
  'meja hakim':'balance-scale','wibawa peradilan':'classical-building','sistem & aset dikelola':'desktop-computer',
  'skena & pasar teknologi':'globe-showing-asia-australia','portofolio usaha':'factory','ekonomi & pasar':'chart-increasing',
  'ktp warga':'identification-card','dompet & cicilan':'credit-card','kondisi hidup':'house'
};

/* ---------- warna latar foto per game ---------- */
const TINT={kehidupan:'#f2a37f',negara:'#e0625a',hakim:'#4fa293',it:'#6b84e6',niaga:'#f0b43c',wni:'#ef6b6b'};

/* ---------- komposisi thumbnail beranda ---------- */
const SIM_ART={
  kehidupan:{bg:'linear-gradient(135deg,#ffcf9e 0%,#f28b6b 100%)', main:'woman', left:'baby', right:'old-man', deco:['birthday-cake','two-hearts']},
  negara:   {bg:'linear-gradient(135deg,#ff8a7a 0%,#c7362f 100%)', main:'man-in-tuxedo', left:'ballot-box-with-ballot', right:'classical-building', deco:['megaphone','crown']},
  hakim:    {bg:'linear-gradient(135deg,#8fd8c6 0%,#2f8a79 100%)', main:'woman-judge', left:'scroll', right:'balance-scale', deco:['hammer','gem-stone']},
  it:       {bg:'linear-gradient(135deg,#9fb2ff 0%,#4b5fd1 100%)', main:'man-technologist', left:'laptop', right:'shield', deco:['satellite-antenna','gear']},
  niaga:    {bg:'linear-gradient(135deg,#ffe08a 0%,#e29a1e 100%)', main:'man-office-worker', left:'money-bag', right:'chart-increasing', deco:['coin','factory']},
  wni:      {bg:'linear-gradient(180deg,#ff8a80 0%,#f25c54 52%,#fff5f0 52%,#ffe4dc 100%)', main:'woman-raising-hand', left:'motorcycle', right:'shopping-cart', deco:['money-with-wings','light-bulb']},
  startup:  {bg:'linear-gradient(135deg,#d4b6ff 0%,#7b4fd0 100%)', main:'woman-technologist', left:'light-bulb', right:'rocket', deco:['sparkles','coin']},
  petani:   {bg:'linear-gradient(135deg,#c8ef9c 0%,#5aa83a 100%)', main:'man-farmer', left:'sheaf-of-rice', right:'tractor', deco:['seedling','sparkles']}
};
function thumb(game){
  const a=SIM_ART[game]; if(!a)return '';
  return '<div class="aa-thumb" style="background:'+a.bg+'">'+
    '<span class="aa-ring"></span>'+
    img(a.deco[0],'deco d1')+img(a.deco[1],'deco d2')+
    img(a.left,'side l')+img(a.main,'hero')+img(a.right,'side r')+
  '</div>';
}

/* ---------- penentuan karakter (avatar) per game ---------- */
function g2(P){ return P&&P.gender==='P'?'woman':'man'; }
function oldOf(P){ return P&&P.gender==='P'?'old-woman':'old-man'; }

function moodOf(P,game){
  if(P.alive===false)return {k:'headstone',t:'Berkas ditutup'};
  if((P.penjara||0)>0)return {k:'locked',t:'Di balik jeruji'};
  const st=P.st||{};
  const health=st.health!=null?st.health:st.kesehatan;
  const stress=st.stress!=null?st.stress:st.stres;
  if(health!=null&&health<25)return {k:'face-with-thermometer',t:'Sakit-sakitan'};
  if(stress!=null&&stress>=75)return {k:'face-with-steam-from-nose',t:'Stres berat'};
  if((P.heat||0)>=60)return {k:'anxious-face-with-sweat',t:'Diincar aparat'};
  let s;
  if(st.happy!=null)s=st.happy;
  else s=100-(stress||0)*0.7+((health!=null?health:60)-60)*0.4;
  if(s>=72)return {k:'smiling-face-with-smiling-eyes',t:'Bahagia'};
  if(s>=50)return {k:'slightly-smiling-face',t:'Baik-baik saja'};
  if(s>=32)return {k:'neutral-face',t:'Datar'};
  return {k:'pensive-face',t:'Murung'};
}

const WHO={
  kehidupan:function(P){
    const g=g2(P), a=P.age||0;
    if(a<3)return {who:'baby',role:'Bayi'};
    if(a<13)return {who:g==='woman'?'girl':'boy',role:'Anak-anak'};
    const pol=P.politik&&typeof PJAB!=='undefined'?PJAB[P.politik.idx]:null;
    if(pol&&P.politik.idx>=3)return {who:g+'-in-tuxedo',role:pol.n,badge:'classical-building'};
    if(P.retired||(a>=65&&!P.job))return {who:oldOf(P),role:P.retired?'Pensiunan':'Lansia'};
    if(P.job){
      const j=P.job, t=(j.title||'').toLowerCase();
      let pk=''; try{ pk=typeof pangkatNama==='function'?pangkatNama():''; }catch(e){}
      const role=pk?pk+' · '+j.title.split(' (')[0]:j.title;
      const old=a>=60?oldOf(P):null;
      const by={polisi:[g+'-police-officer'],tentara:[g,'military-helmet'],intel:[g+'-detective'],
        pns:[g+'-office-worker'],pilot:[g+'-pilot'],pelaut:[g,'ship'],damkar:[g+'-firefighter']}[j.bidang];
      if(by)return {who:old||by[0],role:role,badge:by[1]};
      if(/guru|dosen/.test(t))return {who:old||g+'-teacher',role:role};
      if(/perawat|dokter/.test(t))return {who:old||g+'-health-worker',role:role};
      if(/programmer/.test(t))return {who:old||g+'-technologist',role:role};
      if(/desainer/.test(t))return {who:old||g+'-artist',role:role};
      if(/barista|kasir/.test(t))return {who:old||g+'-cook',role:role};
      if(/pengacara/.test(t))return {who:old||g+'-office-worker',role:role,badge:'balance-scale'};
      return {who:old||g+'-office-worker',role:role};
    }
    if(pol)return {who:g+'-raising-hand',role:pol.n};
    if(P.kuliah)return {who:g+'-student',role:'Mahasiswa'};
    if(a<18)return {who:g+'-student',role:'Pelajar'};
    if(P.biz&&P.biz.length)return {who:g+'-cook',role:'Wirausaha',badge:'convenience-store'};
    return {who:g,role:'Belum bekerja'};
  },
  negara:function(P){
    const g=g2(P);
    if((P.penjara||0)>0)return {who:g,role:'Warga binaan lapas'};
    if(P.jab){
      const k=P.jab.k, n=(typeof JAB!=='undefined'&&JAB[k])?JAB[k].n:'Pejabat';
      return {who:g+'-in-tuxedo',role:n,badge:k==='presiden'?'crown':k==='menteri'?'briefcase':'classical-building'};
    }
    if(P.retired)return {who:oldOf(P),role:'Pensiunan politik'};
    const lat={aktivis:[g+'-raising-hand','megaphone','Aktivis'],jurnalis:[g,'camera-with-flash','Jurnalis'],
      pengusaha:[g+'-office-worker','money-bag','Pengusaha'],guru:[g+'-teacher',null,'Guru'],
      dinasti:[g+'-in-tuxedo','crown','Anak pejabat']}[P.latar];
    if(lat)return {who:(P.age||0)>=65?oldOf(P):lat[0],role:P.partai?'Kader partai':lat[2],badge:lat[1]};
    return {who:g,role:'Warga sipil'};
  },
  hakim:function(P){
    const g=g2(P);
    const sing=(typeof JAB!=='undefined'&&JAB[P.jab])?JAB[P.jab].sing:'Hakim';
    if((P.penjara||0)>0)return {who:g,role:'Terpidana'};
    if(P.dipecat)return {who:g,role:'Eks-hakim'};
    if(P.retired)return {who:oldOf(P),role:'Pensiunan '+sing,badge:'balance-scale'};
    return {who:g+'-judge',role:sing+(P.tipikor?' · Tipikor':''),badge:P.jab==='ketua'?'crown':null};
  },
  it:function(P){
    const g=g2(P);
    const jab=(typeof JAB!=='undefined'&&JAB[P.jab])?JAB[P.jab].n:'';
    const role=(jab?jab+' ':'')+(P.spesN&&P.spesN!=='—'?P.spesN:'Engineer');
    if((P.penjara||0)>0)return {who:g,role:'Terpidana siber'};
    if(P.dipecat)return {who:g,role:'Eks-engineer'};
    if(P.retired)return {who:oldOf(P),role:'Pensiunan',badge:'laptop'};
    if(P.topi==='hitam')return {who:'ninja',role:role,badge:'anxious-face-with-sweat'};
    const badge=P.jab==='cto'?'crown':P.spes==='security'?'shield':P.spes==='iot'?'satellite-antenna':P.spes==='network'?'satellite-antenna':null;
    return {who:g+'-technologist',role:role,badge:badge};
  },
  wni:function(P){
    const g=g2(P);
    if(P.ending==='diaspora')return {who:g+'-technologist',role:'Diaspora',badge:'airplane'};
    if(P.ending==='pulang')return {who:g,role:'Pulang kampung',badge:'house-with-garden'};
    const by={karyawan:[g+'-office-worker',null],ojol:[g,'motorcycle'],guru:[g+'-teacher',P.pppk?'sports-medal':null],
      outsourcing:[g+'-factory-worker',null],freelancer:[g+'-artist','laptop'],olshop:[g,'shopping-bags'],
      staf:[g+'-in-tuxedo','briefcase'],penerus:[g+'-office-worker','factory'],kreator:[g+'-artist','video-camera'],pns:[g+'-office-worker','identification-card']}[P.profesi];
    if(!by)return {who:'person-shrugging',role:'Pencari kerja',badge:'magnifying-glass-tilted-left'};
    return {who:by[0],role:P.profesiN,badge:P.utang>0?'money-with-wings':by[1]};
  },
  niaga:function(P){
    const g=g2(P);
    if((P.penjara||0)>0)return {who:g,role:'Terpidana'};
    if(P.retired)return {who:oldOf(P),role:'Pensiunan pengusaha',badge:'money-bag'};
    const sk=(P.usaha||[]).reduce((m,u)=>Math.max(m,u.skala||0),0);
    const lbl=(typeof SKALA_LBL!=='undefined'&&SKALA_LBL[sk])?'Pengusaha '+SKALA_LBL[sk].toLowerCase():'Calon pengusaha';
    if(sk>=6)return {who:'person-in-suit-levitating',role:'Konglomerat',badge:'crown'};
    if(sk>=5)return {who:g+'-in-tuxedo',role:lbl,badge:'bank'};
    if(sk>=3)return {who:g+'-office-worker',role:lbl,badge:'factory'};
    if(sk>=1)return {who:g+'-cook',role:lbl,badge:'convenience-store'};
    return {who:g,role:lbl};
  }
};

/* ---------- dekorasi DOM ---------- */
function decorateH3(root){
  (root||document).querySelectorAll('aside .card > h3').forEach(h=>{
    if(h.dataset.aa)return;
    const k=H3[h.textContent.trim().toLowerCase()];
    h.dataset.aa='1';
    if(k)h.insertAdjacentHTML('afterbegin',img(k,'h3'));
  });
}
function decorateStats(){
  document.querySelectorAll('.stat .sl > span:first-child').forEach(s=>{
    if(s.querySelector('.aa-st'))return;
    const k=statKey(s.textContent); if(k)s.insertAdjacentHTML('afterbegin',img(k,'st'));
  });
}
function decorateTabs(game){
  const over=TAB_GAME[game]||{};
  document.querySelectorAll('#tabs button[data-tab]').forEach(b=>{
    if(b.querySelector('.aa-tab'))return;
    const k=over[b.dataset.tab]||TAB[b.dataset.tab]; if(k)b.insertAdjacentHTML('afterbegin',img(k,'tab'));
  });
}
function mountAvatar(game){
  let box=document.getElementById('aaAvatar');
  if(box)return box;
  const nama=document.getElementById('iNama');
  const card=nama&&nama.closest('.card');
  if(!card)return null;
  const h=card.querySelector('h3');
  box=document.createElement('div');
  box.id='aaAvatar'; box.className='aa-id';
  box.innerHTML='<div class="aa-photo" style="--aa-tint:'+(TINT[game]||'#d6bd84')+'">'+
    '<img class="aa-who" alt=""><span class="aa-badge"><img alt=""></span><span class="aa-mood"><img alt=""></span></div>'+
    '<div class="aa-cap"><span class="aa-lab">PASFOTO</span><b class="aa-role"></b><span class="aa-feel"></span></div>';
  if(h)h.after(box); else card.prepend(box);
  return box;
}
function setImg(el,k,tone){
  if(!el)return;
  const want=k?src(k,tone):'';
  if(el.getAttribute('src')!==want){ if(want)el.setAttribute('src',want); else el.removeAttribute('src'); }
}
function resolve(game,P){
  let w; try{ w=(WHO[game]||WHO.kehidupan)(P); }catch(e){ w={who:g2(P),role:''}; }
  if(P.alive===false){
    w={who:(P.age||0)>=60?oldOf(P):w.who, role:'Almarhum'+(P.gender==='P'?'ah':''), badge:null};
  }
  return w;
}
function avatar(game,P){
  const box=mountAvatar(game); if(!box||!P)return;
  const w=resolve(game,P);
  const m=moodOf(P,game);
  const who=box.querySelector('.aa-who');
  if(who.getAttribute('src')!==src(w.who,toneOf(P))){
    setImg(who,w.who,toneOf(P));
    who.classList.remove('aa-pop'); void who.offsetWidth; who.classList.add('aa-pop');
  }
  who.alt='Karakter: '+(w.role||'');
  const b=box.querySelector('.aa-badge');
  b.hidden=!w.badge; if(w.badge)setImg(b.querySelector('img'),w.badge);
  setImg(box.querySelector('.aa-mood img'),m.k);
  box.querySelector('.aa-role').textContent=w.role||'';
  box.querySelector('.aa-feel').textContent='Suasana hati: '+m.t;
}
/* ================= KARAKTER DI SETIAP INTERAKSI =================
   Pop-up keputusan (#kartu) diberi ikon/karakter besar berdasarkan kata kunci judul+isi.
   Aturan pertama yang cocok menang; urutan dari yang paling spesifik. */
function hash(s){ let h=0; for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }
const opp=c=>c.P&&c.P.gender==='P'?'man':'woman';
const gv=base=>c=>(c.h%2?'man-':'woman-')+base;
const pick=(...a)=>c=>a[c.h%a.length];
/* tokoh = pemain sendiri: pakai jenis kelamin & warna kulit pemain */
const selfv=base=>c=>({k:(c.P&&c.P.gender==='P'?'woman-':'man-')+base,self:true});
const KARTU_RULES=[
  [/cara main|selamat datang|panduan/, c=>({k:(c.P&&c.P.gender==='P'?'woman':'man')+'-tipping-hand',self:true})],
  [/berkas lama|lanjutkan|tersimpan/, 'open-file-folder'],
  /* simulator IT */
  [/latar belakang/, c=>({k:(c.P&&c.P.gender==='P'?'woman':'man')+'-technologist',self:true})],
  [/kompetisi ctf/, 'lady-beetle'], [/wawancara teknis/, gv('technologist')], [/postmortem/, 'clipboard'],
  [/penilaian kinerja|performance improvement/, 'chart-increasing'], [/1-on-1/, gv('office-worker')],
  [/anak it/, gv('mechanic')], [/deploy jumat/, 'rocket'], [/production down/, 'fire'], [/logonya/, 'artist-palette'],
  [/pakai ai/, 'robot'], [/kode warisan/, 'scroll'], [/hack ig/, 'ninja'], [/minimal s1/, 'graduation-cap'], [/impostor/, 'thinking-face'],
  [/haji|umroh|ibadah/, 'kaaba'],
  [/judi|slot|taruhan/, 'game-die'],
  [/pinjol|kredit tanpa agunan|rentenir|debt collector/, 'money-with-wings'],
  [/bodong|penipu|skema ponzi/, 'warning'],
  [/ransom|peretas|hacker|ddos|breach|phishing|dibobol|malware|kebocoran data|secret|supply.?chain|topi hitam/, 'ninja'],
  [/korupsi|amplop|suap|gratifikasi|uang ketok|mafia|kartel|kemplang|pungli|setor ke|mark.?up|cuci uang/, 'dollar-banknote'],
  [/kpk|penyidik|ditangkap|razia|ott\b|tersangka|polisi/, gv('police-officer')],
  [/penyamaran|intelijen|misi |operasi di lapangan|baku tembak|penugasan operasi/, gv('detective')],
  [/kebakaran/, 'fire-engine'],
  [/banjir|badai|cuaca|bencana|gempa|longsor|tsunami/, 'cloud-with-lightning-and-rain'],
  [/di laut|kapal|berlayar/, 'ship'],
  [/\bperang\b|militer|separatis|kudeta/, 'military-helmet'],   /* \b: jangan cocok di "perangkat" */
  [/pemilihan|pemilu|kampanye|dicalonkan|pilkada|debat|elektabilitas|ketua rt|ketua rw|koalisi/, 'ballot-box-with-ballot'],
  [/demo|keluhan warga|aspirasi|unjuk rasa|mogok/, pick('man-raising-hand','woman-raising-hand')],
  [/wartawan|jurnalis|media|viral|trending|tagar|skandal/, 'video-camera'],
  [/kebijakan|anggaran|apbn|apbd|ruu|undang-undang|reshuffle|program /, 'scroll'],
  [/menteri|presiden|kabinet|gubernur|wali kota|bupati|dpr/, pick('man-in-tuxedo','woman-in-tuxedo')],
  /* hakim: karakter terdakwa */
  [/perkara|sidang|terdakwa|gugatan|dakwa|vonis|putusan/, c=>{
    const t=c.t;
    if(/pejabat|anggota dewan|kepala daerah/.test(t))return pick('man-in-tuxedo','woman-in-tuxedo')(c);
    if(/pengusaha|korporasi|direktur|perusahaan/.test(t))return gv('office-worker')(c);
    if(/preman|bandar|jaringan|residivis|geng/.test(t))return 'pouting-face';
    if(/artis|selebritas|influencer/.test(t))return 'microphone';
    if(/rakyat|petani|warga|buruh|nenek|kakek|nelayan|ibu rumah/.test(t))return gv('farmer')(c);
    return 'balance-scale'; }],
  /* it */
  [/insiden|outage|server|latensi|database|disk|deploy|dns|vpn|sertifikat|load balancer|pipeline|antrean|sensor|firmware/, c=>/jaringan|dns|vpn|load balancer|sensor|iot|firmware/.test(c.t)?'satellite-antenna':'desktop-computer'],
  /* niaga */
  [/due diligence|peluang|memeriksa|audit/, 'magnifying-glass-tilted-left'],
  [/tender|proyek/, 'building-construction'],
  [/ipo|bursa|investor|pendanaan|valuasi/, 'chart-increasing'],
  [/bangkrut|resesi|krisis ekonomi|rugi|gulung tikar/, 'chart-decreasing'],
  [/serikat|buruh|phk massal|karyawan/, gv('factory-worker')],
  [/ekspansi|cabang|waralaba/, 'cityscape'],
  /* mini-game */
  [/skd cpns|seleksi cpns|daftar cpns/, 'identification-card'], [/wawancara kerja/, gv('office-worker')], [/cek fakta/, 'mobile-phone'],
  [/atur gaji|atur anggaran/, 'money-bag'], [/ujian teori sim|ujian praktik sim|gagal ujian sim/, gv('police-officer')],
  [/tawar-menawar/, 'handshake'], [/calon mertua/, pick('old-man','old-woman')],
  /* sekolah & kuliah */
  [/latihan soal|uas semester|ujian|ebtanas|uasbn|usbn|unbk|asesmen nasional/, 'books'],
  [/snbt|sbmptn|snmptn|spmb|umptn|utbk|jalur masuk|coba jalur|tes beasiswa/, 'graduation-cap'],
  [/pilih jurusan/, selfv('student')], [/semester/, selfv('student')], [/ospek|orientasi kampus/, 'megaphone'],
  [/kkn/, 'house-with-garden'], [/skripsi|sidang/, 'scroll'],
  /* wni: kehidupan sehari-hari warga +62 */
  [/token listrik/, 'light-bulb'],
  [/gas melon/, 'fire'],
  [/razia|tilang/, gv('police-officer')],
  [/ban motor|mudik/, 'motorcycle'],
  [/bos chat|handle ini/, gv('office-worker')],
  [/undangan nikah|kondangan/, 'wedding'],
  [/peluang bisnis|robot trading/, 'money-with-wings'],
  [/pinjam uang|saudara/, pick('man-raising-hand','woman-raising-hand')],
  [/sinyal|kuota|grup wa|hoax/, 'mobile-phone'],
  [/karaoke/, 'microphone'],
  [/flexing/, 'beach-with-umbrella'],
  [/hp jatuh|lcd/, 'mobile-phone'],
  [/kapan nikah|kapan punya|dihalalkan|pertanyaan wajib/, pick('old-woman','old-man')],
  [/bukber|ramadan/, 'hot-beverage'],
  [/spt|pajak/, 'clipboard'],
  [/lomba 17|agustus/, 'party-popper'],
  [/harbolnas|flash sale/, 'shopping-bags'],
  [/saldo minus/, 'money-with-wings'],
  [/debt collector/, 'pouting-face'],
  [/pppk/, selfv('teacher')],
  [/klien/, 'laptop'],
  [/harga kos/, 'house'],
  [/transfer nyasar/, 'credit-card'],
  [/kantor pelayanan/, 'identification-card'],
  [/kaburajadulu/, 'airplane'],
  [/nasib lahir/, c=>({k:(c.P&&c.P.gender==='P'?'woman':'man')+(c.P&&(c.P.latar==='pejabat'||c.P.latar==='sultan')?'-in-tuxedo':c.P&&c.P.latar==='petani'?'-farmer':''),self:true})],
  [/kpk|ott|spill/, 'police-car-light'], [/orang dalam|om bisa bantu/, 'handshake'], [/terusin usaha|usaha keluarga/, 'factory'],
  [/biaya sekolah/, pick('boy','girl')], [/rumah sakit/, gv('health-worker')], [/gagal panen/, gv('farmer')], [/cpns/, 'identification-card'],
  [/perantauan|kota orang/, 'cityscape'],
  [/pekerjaan sekarang/, c=>({k:(c.P&&c.P.gender==='P'?'woman':'man')+'-raising-hand',self:true})],
  /* kehidupan: hubungan */
  [/melamar|meminang|lamaran diterima|cincin/, c=>opp(c)],
  [/menikah|pernikahan|pesta nikah|resepsi/, 'wedding'],
  [/cerai|retak|ujung tanduk|pengkhianatan|selingkuh|akhiri hubungan|masa lalu|pasangan berubah/, 'broken-heart'],
  [/pacar|pasangan|jodoh|cinta|kencan|godaan hadir|asmara|naksir/, c=>opp(c)],
  [/hamil|kelahiran|bayi/, 'baby'],
  [/anak mau kuliah/, gv('student')],
  [/hak asuh|didik anak|anak |remaja/, pick('boy','girl')],
  [/warisan|silsilah/, 'scroll'],
  [/orang tua|ayah|ibu /, pick('old-man','old-woman')],
  [/burnout|kolaps/, 'face-with-steam-from-nose'],
  [/sakit|batuk|demam|kanker|jantung|dirawat|rumah sakit|operasi|berobat/, gv('health-worker')],
  [/teman|reuni|sahabat|kenalan|pertemuan|ajakan/, 'people-hugging'],
  [/profesi|panggilan kerja|tawaran kerja|tawaran promosi|resign|dibajak|kantor|atasan|rekrut|lamaran|kerja/, selfv('office-worker')],
  [/kuliah|jurusan|sekolah|belajar|beasiswa|wisuda/, selfv('student')],
  [/usaha|bisnis|toko|dagang|warung/, 'convenience-store'],
  [/beli|jual|aset|kpr|rumah|properti|tanah/, 'house'],
  [/investasi|instrumen|saham|cairkan|kripto|emas|deposito/, 'chart-increasing'],
  [/hobi/, 'artist-palette'],
  [/merantau|luar negeri|pindah kota/, 'airplane'],
  [/krisis paruh baya|persimpangan|jati diri|mundur|gaya hidup|pilih/, 'thinking-face'],
  [/tak aman|kekerasan|ancaman/, 'warning']
];
const ACT_RULES=[
  [/freelance global/, 'laptop'], [/mengajar di bootcamp/, 'speech-balloon'], [/1-on-1/, 'speech-balloon'], [/upskill/, 'books'],
  [/seleksi cpns/, 'identification-card'], [/anggaran/, 'money-bag'], [/bikin sim/, 'identification-card'], [/motor bekas/, 'motorcycle'],
  [/rebahan/, 'bed'], [/scroll medsos/, 'mobile-phone'], [/meal prep|masak sendiri/, 'shopping-cart'], [/narik/, 'motorcycle'],
  [/live jualan|bikin konten/, 'video-camera'], [/arisan/, 'coin'], [/video call/, 'mobile-phone'], [/kencan/, 'two-hearts'],
  [/ktp|sim\/dokumen/, 'identification-card'], [/bpjs/, 'hospital'], [/jalan rusak/, 'video-camera'], [/bansos/, 'shopping-bags'],
  [/kaburajadulu/, 'airplane'], [/kerja bakti|ronda/, 'people-hugging'], [/slot/, 'game-die'], [/kpr/, 'house'],
  [/umroh|haji|ibadah/, 'kaaba'], [/judi|taruhan/, 'game-die'], [/rokok|nikotin/, 'cigarette'],
  [/kucing|hewan/, 'cat'], [/olahraga|kebugaran|gym|lari/, 'person-running'],
  [/me time|istirahat|cuti|tidur/, 'person-in-lotus-position'], [/nongkrong|ngopi/, 'hot-beverage'],
  [/check-up|medical|kontrol penyakit|berobat|dokter/, 'stethoscope'], [/konseling|terapi|psikolog|curhat/, 'speech-balloon'],
  [/donasi|sedekah|bantu warga|amal|santuni/, 'wrapped-gift'], [/liburan|wisata|pensiun/, 'beach-with-umbrella'],
  [/silsilah|memoar|tulis|jurnal/, 'notebook'], [/merantau|pindah kota|luar negeri/, 'airplane'],
  [/lamar|nikah|menikah|jenjang serius/, 'ring'], [/cerai|putus|akhiri/, 'broken-heart'],
  [/pacar|pasangan|kencan|jodoh|asmara|romantis/, 'smiling-face-with-hearts'],
  [/anak|adopsi|didik|momongan/, 'baby-bottle'], [/keluarga|istri|suami|ortu|orang tua/, 'house-with-garden'],
  [/hack|exploit|topi hitam|retas/, 'ninja'], [/bug bounty|ctf|pentest/, 'lady-beetle'],
  [/open source|kontribusi|komunitas tek/, 'robot'], [/homelab|server|infra|cloud|deploy|monitoring|backup/, 'desktop-computer'],
  [/suap|amplop|korupsi|gelap|cuci uang|mark-up|kemplang|pungli|setoran|kartel|tender gelap/, 'money-with-wings'],
  [/kampanye|pidato|blusukan|orasi|media|branding|pencitraan|iklan|pemasaran|promo/, 'megaphone'],
  [/pemilihan|maju |calon|pilkada|partai|elektabilitas/, 'ballot-box-with-ballot'],
  [/demo|aksi massa|gerakan|petisi|advokasi|mogok/, 'man-raising-hand'],
  [/kebijakan|ruu|regulasi|program|anggaran|apbn|apbd|perda/, 'scroll'],
  [/lobi|koalisi|negosiasi|mitra|kerja sama|jejaring|relasi|koneksi/, 'handshake'],
  [/sidang|perkara|putus|vonis/, 'balance-scale'], [/mediasi|damai/, 'dove'],
  [/lapor|ky|kpk|whistle/, 'clipboard'], [/riset|analisis|audit|due diligence|selidik/, 'magnifying-glass-tilted-left'],
  [/ekspansi|cabang|waralaba/, 'cityscape'], [/pabrik|produksi|operasional|efisiensi/, 'factory'],
  [/ekspor|impor|logistik|distribusi|rantai pasok/, 'delivery-truck'],
  [/karyawan|rekrut|staf|tim |sdm/, 'busts-in-silhouette'],
  [/komunitas|reuni|teman|nongkrong bareng|bantuan teman/, 'people-hugging'],
  [/promosi|naik jabatan|pangkat|ajukan/, 'chart-increasing'], [/resign|berhenti kerja|mundur/, 'white-flag'],
  [/kuliah|s2|sekolah|beasiswa|kursus/, 'graduation-cap'], [/belajar|upskill|sertifikasi|baca|les|skill/, 'books'],
  [/kerja|lowongan|profesi|sambilan|freelance|karier|pivot/, 'briefcase'],
  [/usaha|bisnis|warung|toko/, 'convenience-store'],
  [/saham|kripto|emas|deposito|instrumen|investasi/, 'chart-increasing'],
  [/mobil/, 'automobile'], [/motor/, 'motorcycle'], [/beli|aset|properti|rumah|tanah|kpr/, 'house'],
  [/jual|cairkan|lunasi/, 'dollar-banknote'], [/pinjam|kredit|kta|pinjol|utang/, 'credit-card'],
  [/asuransi/, 'shield'], [/tabung|nabung/, 'coin'], [/hobi/, 'artist-palette'],
  [/gaya hidup|belanja/, 'shopping-bags'], [/kesehatan|jaga/, 'red-heart']
];
function matchRule(rules,text,ctx){
  for(const r of rules){ if(r[0].test(text)){ return typeof r[1]==='function'?r[1](ctx):r[1]; } }
  return null;
}
const ACRO=/^(RT|RW|DPR|DPRD|KPK|KY|MA|PN|PT|IT|SD|SMP|SMA|KPR|KTA|ASN|PNS|TNI|POLRI|CTO|IPO|API|VPN|DNS|SSL|IOT|UKM|APBN|APBD|HAM|OTT|CEO|BUMN|SIP|PHK|ABK|S1|S2|S3|DDOS|LN|RI|MBG|IKN|NPL|SDM|UMKM|PKH|BPK|OJK|BI|IPA|IPS|SMK|UAS|UTS|KKN|UTBK|SNBT|SNBP|SBMPTN|SNMPTN|SPMB|UMPTN|UNBK|USBN|UASBN|EBTANAS|UAN|PTN|PTS|D3|PKM|BEM|PPPK|KPK|NIK|CPNS|SKD|TWK|TIU|TKP|SKB|CTF|SIM|CCST|CCNA|CCNP|CCIE|KCNA|CKAD|CKA|CKS|RHCSA|RHCE|RHCA|OSCP|OSCE|EJPT|PCEP|PCAP|PCPP1|PCPP2|CAPM|PSM|PMP|PGMP|ITIL|ITSM|LPIC|SAA|SQL|ISA)$/;
function titleCase(s){
  if(s!==s.toUpperCase())return s;
  return s.split(/(\s+|[—\-\/:])/).map(w=>{
    const core=w.replace(/[^A-Za-z0-9]/g,'');
    if(!core||ACRO.test(core.toUpperCase())||!/[AIUEO]/.test(core))return w;
    return w.charAt(0)+w.slice(1).toLowerCase();
  }).join('').replace(/\bIOT\b/g,'IoT').replace(/\bPGMP\b/g,'PgMP').replace(/\bEJPT\b/g,'eJPT').replace(/ (Of|And|Dan|Di|Ke|Dari|Yang|Untuk|Atau) /g,m=>m.toLowerCase());
}
let lastKartuSig='';
function decorateKartu(game){
  const k=document.querySelector('#kartu .kartu');
  if(!k||k.dataset.aa)return;
  k.dataset.aa='1';
  const sig=k.textContent.slice(0,160);
  if(sig!==lastKartuSig){ lastKartuSig=sig; play('pop'); }
  k.setAttribute('role','dialog'); k.setAttribute('aria-modal','true');
  const kh=k.querySelector('.kh'), kt=k.querySelector('.kt');
  let title=kh?kh.textContent:'';
  const parts=title.split(' — ');
  if(parts.length>1){ parts.shift(); title=parts.join(' — '); }
  if(kh){ kh.textContent=titleCase(title); k.setAttribute('aria-label',titleCase(title)); }
  const body=(kt?kt.textContent:'');
  if(body.length>220||(kt&&kt.querySelectorAll('br').length>3))k.classList.add('aa-long');
  const P=last&&last.P;
  const ctx={P:P,game:game,t:(title+' '+body).toLowerCase()};
  ctx.h=hash(ctx.t);
  let key=matchRule(KARTU_RULES,title.toLowerCase(),ctx)||matchRule(KARTU_RULES,ctx.t,ctx);
  let tone=NPC_TONES[ctx.h%NPC_TONES.length];          /* tokoh lain: warna kulit beragam */
  if(key&&typeof key==='object'){ tone=toneOf(P); key=key.k; }
  if(!key&&P){ try{ key=resolve(game,P).who; tone=toneOf(P); }catch(e){} }
  if(key)k.insertAdjacentHTML('afterbegin','<div class="aa-kicon" aria-hidden="true">'+img(key,'kimg','',tone)+'</div>');
  k.querySelectorAll('button').forEach((b,i)=>{ if(i<2)b.classList.add('aa-b'+(i+1)); });
  /* game memfokuskan tombol pertama → pop-up panjang ikut tergulung ke bawah. Kembalikan ke atas supaya judul terbaca;
     di form soal, tombol "Kumpulkan" jangan disorot (Enter/spasi tak sengaja mengumpulkan). */
  k.scrollTop=0;
  if(k.querySelector('.kz')&&document.activeElement&&k.contains(document.activeElement))document.activeElement.blur();
}
function watchKartu(game){
  const el=document.getElementById('kartu');
  if(!el||el.dataset.aaWatch)return;
  el.dataset.aaWatch='1';
  new MutationObserver(()=>decorateKartu(game)).observe(el,{childList:true});
  decorateKartu(game);
}
function decorateActs(game){
  const over=TAB_GAME[game]||{};
  document.querySelectorAll('.agrid button').forEach(b=>{
    if(b.querySelector('.aa-act'))return;
    const lbl=(b.querySelector('b')||b).textContent.toLowerCase()+' '+((b.querySelector('span')||{}).textContent||'').toLowerCase();
    const tab=(document.querySelector('#tabs button.on')||{dataset:{}}).dataset.tab;
    const k=matchRule(ACT_RULES,lbl,{h:hash(lbl)})||over[tab]||TAB[tab]||'sparkles';
    b.insertAdjacentHTML('afterbegin',img(k,'act'));
  });
}
const LOGO={kehidupan:'house-with-garden',negara:'classical-building',hakim:'balance-scale',it:'laptop',niaga:'money-bag',wni:'identification-card'};
function decorateHeader(game){
  const h=document.querySelector('header h1');
  if(!h||h.querySelector('.aa-logo'))return;
  h.insertAdjacentHTML('afterbegin',img(LOGO[game]||'open-file-folder','logo'));
}

/* ================= BUAT KARAKTER (di awal tiap hidup/karier baru) =================
   Game memanggil ArsipArt.creator(game, newGame) di baris pertama newGame(): kalau belum ada
   identitas terpilih, pop-up dibuka & newGame dibatalkan; tombol "Mulai" lalu memanggil newGame lagi.
   newGame mengambil pilihan lewat ArsipArt.identity() → {gender, nama, skin}. */
const PREF_KEY='arsip_identity_pref_v1';
const CR_SUB={kehidupan:'Siapa yang akan lahir hari ini?',negara:'Siapa tokoh yang akan terjun ke politik?',
  hakim:'Siapa hakim baru yang dilantik hari ini?',it:'Siapa engineer yang memulai karier hari ini?',niaga:'Siapa calon pengusaha kita?',wni:'Siapa warga +62 yang akan berjuang bulan ini?'};
const CR_WHO={kehidupan:g=>g==='L'?'boy':'girl',negara:g=>g==='L'?'man':'woman',hakim:g=>(g==='L'?'man':'woman')+'-judge',
  it:g=>(g==='L'?'man':'woman')+'-technologist',niaga:g=>(g==='L'?'man':'woman')+'-office-worker',wni:g=>(g==='L'?'man':'woman')+'-raising-hand'};
let pendingId=null, creatorOpen=false;
function loadPref(){ try{ return JSON.parse(localStorage.getItem(PREF_KEY))||{}; }catch(e){ return {}; } }
function savePref(p){ try{ localStorage.setItem(PREF_KEY,JSON.stringify(p)); }catch(e){} }
function rnd(a){ return a[Math.floor(Math.random()*a.length)]; }
function randomName(g){
  try{
    if(typeof namaOrang==='function')return namaOrang(g);
    if(typeof NAMA_L!=='undefined'&&typeof BLK!=='undefined')return (g==='L'?rnd(NAMA_L):rnd(NAMA_P))+' '+rnd(BLK);
  }catch(e){}
  return g==='L'?'Budi Santoso':'Siti Rahayu';
}
function cleanName(s){ return String(s||'').replace(/[<>&"'`]/g,'').replace(/\s+/g,' ').trim().slice(0,28); }
function creator(game,startFn){
  if(pendingId)return false;
  try{ if(typeof G!=='undefined'&&G&&G._continuing)return false; }catch(e){}
  if(!document.body)return false;
  if(!creatorOpen)openCreator(game,startFn);
  return true;
}
function identity(){
  const id=pendingId; pendingId=null;
  if(id)return id;
  return {skin:(last&&last.P&&last.P.skin)||loadPref().skin||'medium'};   /* lanjut sebagai anak: warisi warna kulit */
}
function openCreator(game,startFn){
  creatorOpen=true;
  const pref=loadPref();
  let g=pref.gender==='P'?'P':pref.gender==='L'?'L':(Math.random()<.5?'L':'P');
  let skin=TONES.some(t=>t.k===pref.skin)?pref.skin:'medium';
  let edited=false;
  const canCancel=(()=>{ try{ return typeof P!=='undefined'&&!!P; }catch(e){ return false; } })();
  const wrap=document.createElement('div');
  wrap.className='aa-creator';
  wrap.innerHTML='<div class="aa-cr-card" role="dialog" aria-modal="true" aria-labelledby="aaCrTitle">'+
    '<div class="aa-cr-photo" style="--aa-tint:'+(TINT[game]||'#d6bd84')+'"><img class="aa-cr-who" alt=""></div>'+
    '<h2 id="aaCrTitle">Buat Karaktermu</h2><p class="aa-cr-sub">'+esc(CR_SUB[game]||'Siapa yang akan kamu mainkan?')+'</p>'+
    '<label class="aa-cr-lab" for="aaCrName">Nama</label>'+
    '<div class="aa-cr-name"><input id="aaCrName" maxlength="28" autocomplete="off" spellcheck="false">'+
      '<button type="button" data-cr="dice" title="Nama acak" aria-label="Nama acak">'+img('game-die')+'</button></div>'+
    '<span class="aa-cr-lab">Jenis kelamin</span>'+
    '<div class="aa-cr-seg" role="radiogroup" aria-label="Jenis kelamin">'+
      '<button type="button" data-g="L" role="radio">'+img('man','cr-g','',skin)+'Laki-laki</button>'+
      '<button type="button" data-g="P" role="radio">'+img('woman','cr-g','',skin)+'Perempuan</button></div>'+
    '<span class="aa-cr-lab">Warna kulit</span>'+
    '<div class="aa-cr-tones" role="radiogroup" aria-label="Warna kulit">'+
      TONES.map(t=>'<button type="button" role="radio" data-tone="'+t.k+'" title="'+t.n+'" aria-label="'+t.n+'" style="--sw:'+t.c+'"></button>').join('')+'</div>'+
    '<button type="button" class="aa-cr-ok" data-cr="ok">Mulai »</button>'+
    (canCancel?'<button type="button" class="aa-cr-cancel" data-cr="cancel">Batal</button>':'')+
  '</div>';
  document.body.appendChild(wrap);
  const input=wrap.querySelector('#aaCrName');
  input.value=randomName(g);
  function paint(){
    wrap.querySelector('.aa-cr-who').src=src((CR_WHO[game]||CR_WHO.negara)(g),skin);
    wrap.querySelectorAll('[data-g]').forEach(b=>{ const on=b.dataset.g===g; b.classList.toggle('on',on); b.setAttribute('aria-checked',on); });
    wrap.querySelectorAll('[data-g] img').forEach((im,i)=>{ im.src=src(i?'woman':'man',skin); });
    wrap.querySelectorAll('[data-tone]').forEach(b=>{ const on=b.dataset.tone===skin; b.classList.toggle('on',on); b.setAttribute('aria-checked',on); });
  }
  function close(){ wrap.remove(); creatorOpen=false; }
  function go(){
    const nama=cleanName(input.value)||randomName(g);
    savePref({gender:g,skin:skin});
    pendingId={gender:g,nama:nama,skin:skin};
    close();
    startFn();
  }
  input.addEventListener('input',()=>{ edited=true; });
  input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); go(); } });
  wrap.addEventListener('click',e=>{
    const b=e.target.closest('button'); if(!b)return;
    if(b.dataset.g){ g=b.dataset.g; if(!edited)input.value=randomName(g); paint(); }
    else if(b.dataset.tone){ skin=b.dataset.tone; paint(); }
    else if(b.dataset.cr==='dice'){ input.value=randomName(g); edited=false; }
    else if(b.dataset.cr==='ok')go();
    else if(b.dataset.cr==='cancel')close();
  });
  wrap.addEventListener('keydown',e=>{ if(e.key==='Escape'&&canCancel){ e.stopPropagation(); close(); } });
  paint();
  /* layar sentuh: jangan langsung fokus (keyboard HP akan menutupi setengah pop-up) */
  const sentuh=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
  if(!sentuh)setTimeout(()=>{ try{ input.focus(); input.select(); }catch(e){} },30);
}

/* ================= EFEK SUARA (disintesis Web Audio, tanpa file) =================
   Bisa dimatikan lewat tombol 🔊 di header game; pilihan disimpan di localStorage. */
const SND_KEY='arsip_sound_v1';
let actx=null;
function soundOn(){ try{ return localStorage.getItem(SND_KEY)!=='off'; }catch(e){ return true; } }
function audio(){
  const C=window.AudioContext||window.webkitAudioContext; if(!C)return null;
  if(!actx){ try{ actx=new C(); }catch(e){ return null; } }
  if(actx.state==='suspended'){ try{ actx.resume(); }catch(e){} }
  return actx;
}
function tone(f1,f2,at,dur,type,vol){
  const a=audio(); if(!a)return;
  const t=a.currentTime+at, o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f1,t); if(f2!==f1)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+0.03);
}
const SFX={
  good:()=>{ tone(784,784,0,.13,'triangle',.07); tone(1175,1175,.09,.2,'triangle',.07); },     /* ting-ting naik */
  bad:()=>{ tone(392,330,0,.16,'sine',.09); tone(294,220,.12,.24,'sine',.09); },              /* bong turun */
  mixed:()=>{ tone(660,660,0,.1,'triangle',.05); tone(520,520,.08,.12,'triangle',.05); },
  coin:()=>{ tone(988,988,0,.07,'square',.035); tone(1319,1319,.06,.18,'square',.035); },      /* bunyi koin */
  pop:()=>{ tone(380,900,0,.12,'sine',.07); },                                                  /* pop-up muncul */
  tap:()=>{ tone(600,420,0,.05,'triangle',.04); }                                               /* klik tombol */
};
function play(n){ if(!soundOn())return; try{ SFX[n]&&SFX[n](); }catch(e){} }
function setSound(on){
  try{ localStorage.setItem(SND_KEY,on?'on':'off'); }catch(e){}
  document.querySelectorAll('.aa-sound').forEach(b=>{ b.textContent=on?'🔊':'🔇'; b.setAttribute('aria-pressed',on); b.title=on?'Suara: nyala (klik untuk matikan)':'Suara: mati (klik untuk nyalakan)'; });
  if(on)play('tap');
}
function mountSoundBtn(){
  const bar=document.querySelector('header .hdr-actions');
  if(!bar||bar.querySelector('.aa-sound'))return;
  const b=document.createElement('button');
  b.type='button'; b.className='aa-sound'; b.setAttribute('aria-label','Efek suara');
  bar.prepend(b);
  b.addEventListener('click',e=>{ e.stopPropagation(); setSound(!soundOn()); });
  setSound(soundOn());
}
/* bunyi klik untuk tombol-tombol permainan (sekali dipasang, lewat delegasi) */
document.addEventListener('click',e=>{
  if(e.target.closest('.aa-sound'))return;
  if(e.target.closest('#acts button:not(:disabled), #kartu button, #nextBtn, #tabs button, .aa-creator button, #epilog button'))play('tap');
},true);

/* ================= ANGKA MELAYANG SAAT STAT BERUBAH ================= */
const INVERT=new Set(['stres','sorotan hukum','sorotan ky/kpk','on-call fatigue']);
let snap=null;
function readStats(){
  const m={};
  document.querySelectorAll('.stat .sl').forEach(sl=>{
    const sp=sl.querySelectorAll('span');
    if(sp.length<2)return;
    const lab=sp[0].textContent.trim(), v=parseFloat(sp[sp.length-1].textContent);
    if(lab&&!isNaN(v))m[lab]=v;
  });
  return m;
}
function moneyOf(P){ const a=P.money!=null?P.money:(P.kas!=null?P.kas:(P.saldo!=null?P.saldo:0)); return a+(P.depo||0); }
function rpShort(v){
  const a=Math.abs(v), s=v<0?'−':'+';
  const f=(x,u)=>s+'Rp '+(x>=100?Math.round(x):x.toFixed(1).replace('.',',').replace(',0',''))+' '+u;
  if(a>=1e12)return f(a/1e12,'T'); if(a>=1e9)return f(a/1e9,'M'); if(a>=1e6)return f(a/1e6,'jt');
  return s+'Rp '+Math.round(a/1e3)+' rb';
}
function tray(){
  let t=document.getElementById('aaDeltas');
  if(!t){ t=document.createElement('div'); t.id='aaDeltas'; t.setAttribute('aria-hidden','true'); document.body.appendChild(t); }
  return t;
}
/* perubahan dari beberapa render berdekatan digabung (dijumlahkan per label), lalu tampil sebagai satu gelombang */
let pend={}, pendT=null;
function queueDeltas(list){
  for(const d of list){
    const p=pend[d.lab];
    if(p){ p.v+=d.v; } else pend[d.lab]=Object.assign({},d);
  }
  clearTimeout(pendT);
  pendT=setTimeout(flushDeltas,140);
}
function flushDeltas(){
  const list=Object.values(pend).filter(d=>Math.round(d.v)!==0||d.money); pend={};
  const out=list.map(d=>{
    if(d.money)return {k:d.v>0?'money-bag':'money-with-wings',txt:rpShort(d.v),lab:'Uang',good:d.v>0,w:1e9,skip:Math.abs(d.v)<1e5};
    const v=Math.round(d.v);
    return {k:d.k,txt:(v>0?'+':'−')+Math.abs(v),lab:d.lab,good:d.inv?v<0:v>0,w:Math.abs(v)};
  }).filter(d=>!d.skip).sort((a,b)=>b.w-a.w);
  if(!out.length)return;
  const t=tray();
  t.innerHTML='';                       /* gelombang baru menggantikan yang lama */
  const nGood=out.filter(d=>d.good).length, nBad=out.length-nGood, money=out.find(d=>d.lab==='Uang');
  play(nBad===0?(money&&money.good?'coin':'good'):nGood===0?'bad':(nGood>=nBad?'good':'mixed'));
  out.slice(0,5).forEach((d,i)=>{
    const c=document.createElement('span');
    c.className='aa-dchip '+(d.good?'good':'bad');
    c.style.animationDelay=(i*40)+'ms';
    c.innerHTML=img(d.k,'dimg')+'<b>'+esc(d.txt)+'</b><small>'+esc(d.lab)+'</small>';
    c.addEventListener('animationend',()=>c.remove());
    t.appendChild(c);
  });
}
function trackDeltas(P){
  const cur={P:P,stats:readStats(),money:moneyOf(P)};
  if(snap&&snap.P===P&&P.alive!==false){
    const out=[];
    const dm=cur.money-snap.money;
    if(dm)out.push({money:true,lab:'Uang',v:dm});
    for(const lab in cur.stats){
      if(!(lab in snap.stats))continue;
      const d=cur.stats[lab]-snap.stats[lab];
      if(Math.abs(d)<0.5)continue;
      const inv=INVERT.has(lab.toLowerCase());
      out.push({k:statKey(lab)||'sparkles',lab:lab,v:d,inv:inv});
      document.querySelectorAll('.stat .sl > span:first-child').forEach(s=>{
        if(s.textContent.trim()===lab){ const row=s.closest('.stat'); row.classList.remove('aa-bump','aa-up','aa-down'); void row.offsetWidth; row.classList.add('aa-bump','aa-'+((inv?d<0:d>0)?'up':'down')); setTimeout(()=>row.classList.remove('aa-bump','aa-up','aa-down'),1100); }
      });
    }
    queueDeltas(out);
  }
  snap=cur;
}

/* ================= STRIP STATISTIK RINGKAS (HP) =================
   Di layar sempit kartu profil berada jauh di bawah meja aksi. Strip kecil yang menempel di atas
   menampilkan uang + 3 stat terpenting tiap game; ketuk untuk melompat ke profil lengkap. */
const HUD={it:['stres','kesehatan','reputasi teknis'],wni:['kewarasan','kesehatan','skill'],kehidupan:['kebahagiaan','kesehatan','stres'],
  hakim:['integritas','reputasi','stres'],negara:['popularitas','integritas','stres'],niaga:['reputasi','kesehatan','stres']};
function rpPlain(v){ if(Math.abs(v)<1e3)return 'Rp '+Math.round(v); const t=rpShort(v); return v<0?t:t.slice(1); }
function mountHud(game,P){
  const keys=HUD[game]; if(!keys||!P)return;
  let h=document.getElementById('aaHud');
  if(!h){
    h=document.createElement('button'); h.id='aaHud'; h.type='button';
    h.addEventListener('click',()=>{ const a=document.querySelector('aside'); if(a)a.scrollIntoView({behavior:'smooth',block:'start'}); });
    document.body.insertBefore(h,document.body.firstChild);
  }
  const st={}; const raw=readStats(); for(const l in raw)st[l.toLowerCase()]=raw[l];
  const m=moneyOf(P);
  let html='<span class="aa-hc'+(m<0?' bad':'')+'">'+img(m<0?'money-with-wings':'money-bag','himg')+'<b>'+esc(rpPlain(m))+'</b></span>';
  const lbl=[];
  for(const k of keys){
    if(!(k in st))continue;
    const v=Math.round(st[k]), inv=INVERT.has(k), bad=inv?v>66:v<34;
    lbl.push(k+' '+v);
    html+='<span class="aa-hc'+(bad?' bad':'')+'" title="'+esc(k)+'">'+img(statKey(k)||'sparkles','himg')+'<b>'+v+'</b><small>'+esc(k)+'</small></span>';
  }
  html+='<span class="aa-hmore">profil ▾</span>';
  if(h.innerHTML!==html)h.innerHTML=html;
  h.setAttribute('aria-label','Ringkasan: uang '+rpPlain(m)+', '+lbl.join(', ')+'. Ketuk untuk melihat profil lengkap.');
}
/* ================= LOG DI HP: tanpa scroll ganda =================
   CSS di layar sempit hanya menampilkan beberapa catatan terakhir; tombol ini membuka/menutup sisanya. */
const FEED_N=6;
function mountFeedMore(){
  const f=document.getElementById('feed'); if(!f)return;
  let b=document.getElementById('aaFeedMore');
  if(!b){
    b=document.createElement('button'); b.id='aaFeedMore'; b.type='button';
    b.addEventListener('click',()=>{ f.classList.toggle('aa-all'); mountFeedMore(); });
    f.insertAdjacentElement('beforebegin',b);   /* catatan lama ada di atas → tombolnya juga di atas */
  }
  const sisa=f.children.length-FEED_N;
  b.hidden=sisa<=0;
  b.textContent=f.classList.contains('aa-all')?'Ringkas catatan ▾':'▴ Lihat '+Math.max(0,sisa)+' catatan sebelumnya';
}

/* ================= KARTU HASIL UNTUK DIBAGIKAN ================= */
const GAME_NAME={kehidupan:'Simulator Kehidupan',negara:'Simulator Karier Politik',hakim:'Simulator Hakim',it:'Simulator Karier IT',niaga:'Simulator Pengusaha',wni:'Simulator WNI'};
const SCORES={
  kehidupan:r=>[{l:'Skor hidup',v:r.skor}],
  negara:r=>[{l:'Rakyat',v:r.skorRakyat},{l:'Negara',v:r.skorNegara}],
  hakim:r=>[{l:'Keadilan',v:r.skorAdil},{l:'Karier',v:r.skorKarier}],
  it:r=>[{l:'Karya',v:r.skorKarya},{l:'Cuan',v:r.skorCuan}],
  niaga:r=>[{l:'Harta',v:r.skorHarta},{l:'Nama baik',v:r.skorNama}],
  wni:r=>[{l:'Dompet',v:r.skorDompet},{l:'Kewarasan',v:r.skorWaras}]
};
const TITLES={
  kehidupan:r=>[r.julukan,r.grade],negara:r=>[r.julukanRakyat,r.gelarNegara],hakim:r=>[r.julukanAdil,r.gelarKarier],
  it:r=>[r.julukanKarya,r.gelarCuan],niaga:r=>[r.julukanHarta,r.gelarNama],wni:r=>[r.julukanDompet,r.gelarWaras]
};
function buildShareCard(result){
  const game=result&&result.game; if(!game||!SIM_ART[game])return null;
  const P=last&&last.P;
  let w={who:'man',role:''};
  try{ if(P)w=(WHO[game]||WHO.kehidupan)(P); }catch(e){}
  const tone=toneOf(P);
  const sc=(SCORES[game]||(()=>[]))(result).filter(s=>s.v!=null);
  const tt=(TITLES[game]||(()=>[]))(result).filter(Boolean);
  const ach=(result.achievements||[]).filter(Boolean);
  let handle=''; try{ handle=window.Platform&&Platform.getHandle?Platform.getHandle():''; }catch(e){}
  const site=/^https?:/.test(location.protocol)?(location.host+location.pathname.replace(/[^/]*$/,'')).replace(/\/$/,''):'';
  const lahir=result.lahir, wafat=result.lahir!=null&&result.age!=null?result.lahir+result.age:null;
  const el=document.createElement('div');
  el.className='aa-share';
  el.style.background=SIM_ART[game].bg;
  el.innerHTML=
    '<div class="aa-sh-top">'+img(LOGO[game]||'open-file-folder','sh-logo')+'<div><b>ARSIP</b><span>'+esc(GAME_NAME[game]||'')+'</span></div></div>'+
    '<div class="aa-sh-paper">'+
      '<div class="aa-sh-photo" style="background:'+(TINT[game]||'#d6bd84')+'">'+img(w.who,'sh-who','',tone)+'</div>'+
      '<div class="aa-sh-name">'+esc(result.nama||'')+'</div>'+
      '<div class="aa-sh-meta">'+esc(result.meta||[lahir!=null&&wafat!=null?lahir+'–'+wafat:'',result.kota||'',result.age!=null?'usia '+result.age:''].filter(Boolean).join(' · '))+'</div>'+
      (w.role?'<div class="aa-sh-role">'+esc(w.role)+'</div>':'')+
      (tt[0]?'<div class="aa-sh-jul">“'+esc(tt[0])+'”</div>':'')+
      (tt[1]&&tt[1]!==tt[0]?'<div class="aa-sh-jul2">'+esc(tt[1])+'</div>':'')+
      (sc.length?'<div class="aa-sh-scores">'+sc.map(s=>'<div class="aa-sh-score"><b>'+esc(s.v)+'</b><span>'+esc(s.l)+'</span></div>').join('')+'</div>':'')+
      (ach.length?'<div class="aa-sh-ach">'+ach.slice(0,4).map(a=>'<span>'+img('trophy','sh-tro')+esc(a)+'</span>').join('')+(ach.length>4?'<span class="more">+'+(ach.length-4)+' lagi</span>':'')+'</div>':'')+
    '</div>'+
    '<div class="aa-sh-foot">'+(handle?'<b>@'+esc(handle)+'</b> · ':'')+(site?'Main gratis di '+esc(site):'Main gratis di ARSIP')+'</div>';
  document.body.appendChild(el);
  return el;
}

/* potret di layar akhir (In Memoriam / Berkas Ditutup) */
let last=null;
function watchEpilog(){
  const ep=document.getElementById('epilog');
  if(!ep||ep.dataset.aaWatch)return;
  ep.dataset.aaWatch='1';
  new MutationObserver(function(){
    if(!last||!last.P||last.P.alive!==false||ep.querySelector('.aa-epi')||!ep.firstElementChild)return;
    const w=resolve(last.game,last.P);
    ep.insertAdjacentHTML('afterbegin','<div class="aa-epi"><div class="aa-photo" style="--aa-tint:'+(TINT[last.game]||'#d6bd84')+'">'+
      img(w.who,'who','',toneOf(last.P))+'<span class="aa-mood">'+img('headstone')+'</span></div></div>');
  }).observe(ep,{childList:true});
}
function update(game,P){
  last={game:game,P:P};
  try{ decorateHeader(game); mountSoundBtn(); decorateH3(); avatar(game,P); decorateStats(); decorateTabs(game); decorateActs(game); watchKartu(game); watchEpilog(); trackDeltas(P); mountHud(game,P); mountFeedMore(); }
  catch(e){ console.error('ArsipArt',e); }
}

/* favicon bersama */
(function(){
  if(document.querySelector('link[rel="icon"]'))return;
  const l=document.createElement('link'); l.rel='icon'; l.type='image/webp'; l.href=src('open-file-folder');
  document.head.appendChild(l);
})();

window.ArsipArt={img:img,src:src,thumb:thumb,update:update,statKey:statKey,SIM_ART:SIM_ART,TINT:TINT,
  creator:creator,identity:identity,buildShareCard:buildShareCard};
})();
