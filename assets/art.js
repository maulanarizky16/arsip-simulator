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
function src(k){ return BASE+k+'.webp'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function img(k,cls,alt){
  return '<img class="aa-'+(cls||'ic')+'" src="'+src(k)+'" alt="'+esc(alt||'')+'" decoding="async" draggable="false">';
}

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
  'kedekatan dgn anak':'baby-bottle'
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
  ekspansi:'rocket', pribadi:'money-bag'
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
  'skena & pasar teknologi':'globe-showing-asia-australia','portofolio usaha':'factory','ekonomi & pasar':'chart-increasing'
};

/* ---------- warna latar foto per game ---------- */
const TINT={kehidupan:'#f2a37f',negara:'#e0625a',hakim:'#4fa293',it:'#6b84e6',niaga:'#f0b43c'};

/* ---------- komposisi thumbnail beranda ---------- */
const SIM_ART={
  kehidupan:{bg:'linear-gradient(135deg,#ffcf9e 0%,#f28b6b 100%)', main:'woman', left:'baby', right:'old-man', deco:['birthday-cake','two-hearts']},
  negara:   {bg:'linear-gradient(135deg,#ff8a7a 0%,#c7362f 100%)', main:'man-in-tuxedo', left:'ballot-box-with-ballot', right:'classical-building', deco:['megaphone','crown']},
  hakim:    {bg:'linear-gradient(135deg,#8fd8c6 0%,#2f8a79 100%)', main:'woman-judge', left:'scroll', right:'balance-scale', deco:['hammer','gem-stone']},
  it:       {bg:'linear-gradient(135deg,#9fb2ff 0%,#4b5fd1 100%)', main:'man-technologist', left:'laptop', right:'shield', deco:['satellite-antenna','gear']},
  niaga:    {bg:'linear-gradient(135deg,#ffe08a 0%,#e29a1e 100%)', main:'man-office-worker', left:'money-bag', right:'chart-increasing', deco:['coin','factory']},
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
function setImg(el,k){
  if(!el)return;
  const want=k?src(k):'';
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
  if(who.getAttribute('src')!==src(w.who)){
    setImg(who,w.who);
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
const KARTU_RULES=[
  [/cara main|selamat datang|panduan/, c=>(c.P&&c.P.gender==='P'?'woman':'man')+'-tipping-hand'],
  [/berkas lama|lanjutkan|tersimpan/, 'open-file-folder'],
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
  [/perang|militer|separatis|kudeta/, 'military-helmet'],
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
  [/profesi|panggilan kerja|tawaran kerja|tawaran promosi|resign|dibajak|kantor|atasan|rekrut|lamaran|kerja/, gv('office-worker')],
  [/kuliah|jurusan|sekolah|belajar|beasiswa|wisuda/, gv('student')],
  [/usaha|bisnis|toko|dagang|warung/, 'convenience-store'],
  [/beli|jual|aset|kpr|rumah|properti|tanah/, 'house'],
  [/investasi|instrumen|saham|cairkan|kripto|emas|deposito/, 'chart-increasing'],
  [/hobi/, 'artist-palette'],
  [/merantau|luar negeri|pindah kota/, 'airplane'],
  [/krisis paruh baya|persimpangan|jati diri|mundur|gaya hidup|pilih/, 'thinking-face'],
  [/tak aman|kekerasan|ancaman/, 'warning']
];
const ACT_RULES=[
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
const ACRO=/^(RT|RW|DPR|DPRD|KPK|KY|MA|PN|PT|IT|SD|SMP|SMA|KPR|KTA|ASN|PNS|TNI|POLRI|CTO|IPO|API|VPN|DNS|SSL|IOT|UKM|APBN|APBD|HAM|OTT|CEO|BUMN|SIP|PHK|ABK|S1|S2|S3|DDOS|LN|RI|MBG|IKN|NPL|SDM|UMKM|PKH|BPK|OJK|BI)$/;
function titleCase(s){
  if(s!==s.toUpperCase())return s;
  return s.split(/(\s+|[—\-\/:])/).map(w=>{
    const core=w.replace(/[^A-Za-z0-9]/g,'');
    if(!core||ACRO.test(core.toUpperCase())||!/[AIUEO]/.test(core))return w;
    return w.charAt(0)+w.slice(1).toLowerCase();
  }).join('');
}
function decorateKartu(game){
  const k=document.querySelector('#kartu .kartu');
  if(!k||k.dataset.aa)return;
  k.dataset.aa='1';
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
  if(!key&&P){ try{ key=resolve(game,P).who; }catch(e){} }
  if(key)k.insertAdjacentHTML('afterbegin','<div class="aa-kicon" aria-hidden="true">'+img(key,'kimg')+'</div>');
  k.querySelectorAll('button').forEach((b,i)=>{ if(i<2)b.classList.add('aa-b'+(i+1)); });
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
const LOGO={kehidupan:'house-with-garden',negara:'classical-building',hakim:'balance-scale',it:'laptop',niaga:'money-bag'};
function decorateHeader(game){
  const h=document.querySelector('header h1');
  if(!h||h.querySelector('.aa-logo'))return;
  h.insertAdjacentHTML('afterbegin',img(LOGO[game]||'open-file-folder','logo'));
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
      img(w.who,'who')+'<span class="aa-mood">'+img('headstone')+'</span></div></div>');
  }).observe(ep,{childList:true});
}
function update(game,P){
  last={game:game,P:P};
  try{ decorateHeader(game); decorateH3(); avatar(game,P); decorateStats(); decorateTabs(game); decorateActs(game); watchKartu(game); watchEpilog(); }
  catch(e){ console.error('ArsipArt',e); }
}

/* favicon bersama */
(function(){
  if(document.querySelector('link[rel="icon"]'))return;
  const l=document.createElement('link'); l.rel='icon'; l.type='image/webp'; l.href=src('open-file-folder');
  document.head.appendChild(l);
})();

window.ArsipArt={img:img,src:src,thumb:thumb,update:update,statKey:statKey,SIM_ART:SIM_ART,TINT:TINT};
})();
