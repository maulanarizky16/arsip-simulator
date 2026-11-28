'use strict';
/* ================= BASIS DATA NEGARA =================
   PERKIRAAN dari sumber terbuka (±2024), dibulatkan — bukan angka resmi dan bukan data rahasia.
   pop = penduduk (juta) · pdb & hankam = US$ miliar per tahun · aktif & cad = personel aktif & cadangan (ribu)
   tank = tank tempur utama · jet = pesawat tempur/serang · heli = helikopter serang · kapal = kapal perang permukaan utama
   selam = kapal selam · induk = kapal induk berpesawat tempur · nuklir = perkiraan hulu ledak
   tek = indeks teknologi & mutu alutsista 0–100 (penilaian kasar game ini) · geo = kepulauan / pulau / daratan / pegunungan */
const NEGARA=[
  {k:'idn',n:'Indonesia',     kaw:'Asia Tenggara & Oseania',geo:'kepulauan', pop:280, pdb:1400, hankam:9,   aktif:400, cad:400,  tank:330,  jet:100,  heli:15,  kapal:35,  selam:4,  induk:0,  nuklir:0,    tek:45, blok:[]},
  {k:'mys',n:'Malaysia',      kaw:'Asia Tenggara & Oseania',geo:'daratan',   pop:34,  pdb:420,  hankam:4.2, aktif:113, cad:52,   tank:48,   jet:40,   heli:0,   kapal:16,  selam:2,  induk:0,  nuklir:0,    tek:45, blok:[]},
  {k:'sgp',n:'Singapura',     kaw:'Asia Tenggara & Oseania',geo:'pulau',     pop:6,   pdb:500,  hankam:13,  aktif:51,  cad:250,  tank:170,  jet:100,  heli:19,  kapal:14,  selam:4,  induk:0,  nuklir:0,    tek:75, blok:[]},
  {k:'phl',n:'Filipina',      kaw:'Asia Tenggara & Oseania',geo:'kepulauan', pop:115, pdb:440,  hankam:4.4, aktif:145, cad:131,  tank:10,   jet:12,   heli:4,   kapal:10,  selam:0,  induk:0,  nuklir:0,    tek:35, blok:['AS']},
  {k:'vnm',n:'Vietnam',       kaw:'Asia Tenggara & Oseania',geo:'daratan',   pop:100, pdb:430,  hankam:7,   aktif:480, cad:2500, tank:1400, jet:75,   heli:25,  kapal:15,  selam:6,  induk:0,  nuklir:0,    tek:40, blok:[]},
  {k:'tha',n:'Thailand',      kaw:'Asia Tenggara & Oseania',geo:'daratan',   pop:70,  pdb:515,  hankam:6,   aktif:360, cad:200,  tank:400,  jet:110,  heli:7,   kapal:17,  selam:0,  induk:0,  nuklir:0,    tek:45, blok:[]},
  {k:'aus',n:'Australia',     kaw:'Asia Tenggara & Oseania',geo:'pulau',     pop:26,  pdb:1700, hankam:32,  aktif:58,  cad:30,   tank:59,   jet:100,  heli:22,  kapal:11,  selam:6,  induk:0,  nuklir:0,    tek:80, blok:['AS']},
  {k:'jpn',n:'Jepang',        kaw:'Asia Timur',             geo:'kepulauan', pop:124, pdb:4200, hankam:50,  aktif:247, cad:56,   tank:520,  jet:320,  heli:70,  kapal:50,  selam:22, induk:0,  nuklir:0,    tek:85, blok:['AS']},
  {k:'kor',n:'Korea Selatan', kaw:'Asia Timur',             geo:'pegunungan',pop:52,  pdb:1700, hankam:48,  aktif:500, cad:3100, tank:2100, jet:400,  heli:110, kapal:28,  selam:19, induk:0,  nuklir:0,    tek:80, blok:['AS']},
  {k:'prk',n:'Korea Utara',   kaw:'Asia Timur',             geo:'pegunungan',pop:26,  pdb:30,   hankam:4,   aktif:1280,cad:600,  tank:3500, jet:400,  heli:20,  kapal:10,  selam:70, induk:0,  nuklir:50,   tek:20, blok:[]},
  {k:'chn',n:'Tiongkok',      kaw:'Asia Timur',             geo:'daratan',   pop:1410,pdb:17800,hankam:296, aktif:2035,cad:510,  tank:4700, jet:1900, heli:300, kapal:150, selam:60, induk:3,  nuklir:500,  tek:80, blok:[]},
  {k:'ind',n:'India',         kaw:'Asia Selatan',           geo:'daratan',   pop:1430,pdb:3550, hankam:84,  aktif:1450,cad:1155, tank:3700, jet:600,  heli:40,  kapal:45,  selam:18, induk:2,  nuklir:172,  tek:60, blok:[]},
  {k:'pak',n:'Pakistan',      kaw:'Asia Selatan',           geo:'pegunungan',pop:240, pdb:340,  hankam:10,  aktif:654, cad:550,  tank:2500, jet:400,  heli:50,  kapal:15,  selam:8,  induk:0,  nuklir:170,  tek:45, blok:[]},
  {k:'rus',n:'Rusia',         kaw:'Eropa',                  geo:'daratan',   pop:144, pdb:2000, hankam:109, aktif:1100,cad:1500, tank:2000, jet:1100, heli:330, kapal:60,  selam:60, induk:1,  nuklir:5580, tek:70, blok:[]},
  {k:'ukr',n:'Ukraina',       kaw:'Eropa',                  geo:'daratan',   pop:37,  pdb:180,  hankam:65,  aktif:800, cad:400,  tank:1000, jet:70,   heli:30,  kapal:2,   selam:0,  induk:0,  nuklir:0,    tek:55, blok:[]},
  {k:'gbr',n:'Inggris',       kaw:'Eropa',                  geo:'pulau',     pop:68,  pdb:3340, hankam:75,  aktif:144, cad:70,   tank:213,  jet:170,  heli:45,  kapal:18,  selam:10, induk:2,  nuklir:225,  tek:85, blok:['NATO','AS']},
  {k:'fra',n:'Prancis',       kaw:'Eropa',                  geo:'daratan',   pop:68,  pdb:3030, hankam:61,  aktif:203, cad:40,   tank:220,  jet:250,  heli:65,  kapal:22,  selam:9,  induk:1,  nuklir:290,  tek:85, blok:['NATO']},
  {k:'deu',n:'Jerman',        kaw:'Eropa',                  geo:'daratan',   pop:84,  pdb:4460, hankam:67,  aktif:181, cad:34,   tank:300,  jet:210,  heli:55,  kapal:16,  selam:6,  induk:0,  nuklir:0,    tek:85, blok:['NATO']},
  {k:'tur',n:'Turki',         kaw:'Timur Tengah',           geo:'pegunungan',pop:85,  pdb:1100, hankam:16,  aktif:355, cad:380,  tank:2200, jet:290,  heli:100, kapal:28,  selam:12, induk:0,  nuklir:0,    tek:65, blok:['NATO']},
  {k:'irn',n:'Iran',          kaw:'Timur Tengah',           geo:'pegunungan',pop:89,  pdb:400,  hankam:10,  aktif:610, cad:350,  tank:1500, jet:250,  heli:12,  kapal:7,   selam:19, induk:0,  nuklir:0,    tek:45, blok:[]},
  {k:'isr',n:'Israel',        kaw:'Timur Tengah',           geo:'daratan',   pop:10,  pdb:510,  hankam:27,  aktif:170, cad:465,  tank:1300, jet:340,  heli:45,  kapal:7,   selam:5,  induk:0,  nuklir:90,   tek:90, blok:['AS']},
  {k:'sau',n:'Arab Saudi',    kaw:'Timur Tengah',           geo:'daratan',   pop:36,  pdb:1070, hankam:76,  aktif:257, cad:0,    tank:1000, jet:280,  heli:35,  kapal:11,  selam:0,  induk:0,  nuklir:0,    tek:65, blok:['AS']},
  {k:'egy',n:'Mesir',         kaw:'Timur Tengah',           geo:'daratan',   pop:110, pdb:395,  hankam:5,   aktif:440, cad:480,  tank:2400, jet:300,  heli:90,  kapal:20,  selam:8,  induk:0,  nuklir:0,    tek:50, blok:[]},
  {k:'usa',n:'Amerika Serikat',kaw:'Amerika',               geo:'daratan',   pop:335, pdb:27400,hankam:916, aktif:1330,cad:800,  tank:2600, jet:2700, heli:900, kapal:120, selam:67, induk:11, nuklir:5044, tek:95, blok:['NATO','AS']},
  {k:'bra',n:'Brasil',        kaw:'Amerika',                geo:'daratan',   pop:216, pdb:2170, hankam:23,  aktif:367, cad:1340, tank:290,  jet:60,   heli:12,  kapal:12,  selam:5,  induk:0,  nuklir:0,    tek:55, blok:[]}
];
const NEG=Object.fromEntries(NEGARA.map(c=>[c.k,c]));
/* ===== PETA DUNIA (skematis) =====
   Letak tiap negara pada bidang 360×150 (kira-kira bujur & lintang, digeser sedikit supaya tidak bertumpuk).
   Ini peta skema berbentuk petak, bukan peta batas wilayah. */
const POS={
  usa:[78,52],  bra:[126,110], gbr:[168,33], fra:[175,46], deu:[193,35], ukr:[214,41], rus:[240,27],
  tur:[214,53], isr:[205,64],  egy:[199,76], sau:[226,76], irn:[234,56], pak:[254,63], ind:[256,76],
  chn:[284,54], prk:[306,47],  kor:[312,60], jpn:[331,53], vnm:[294,69], tha:[277,80], phl:[313,79],
  mys:[277,92], sgp:[285,103], idn:[304,106],aus:[322,128]
};
const KODE={idn:'IDN',mys:'MYS',sgp:'SGP',phl:'PHL',vnm:'VNM',tha:'THA',aus:'AUS',jpn:'JPN',kor:'KOR',prk:'PRK',chn:'CHN',ind:'IND',pak:'PAK',rus:'RUS',ukr:'UKR',gbr:'GBR',fra:'FRA',deu:'DEU',tur:'TUR',irn:'IRN',isr:'ISR',sau:'SAU',egy:'EGY',usa:'USA',bra:'BRA'};
/* pasangan yang berbatasan darat; selain ini dianggap terpisah laut (maju ke wilayah lawan butuh penguasaan laut) */
const BATAS_DARAT=['idn-mys','mys-tha','mys-sgp','vnm-chn','ind-pak','ind-chn','chn-rus','chn-prk','prk-kor','prk-rus','rus-ukr','deu-fra','tur-irn','irn-pak','isr-egy','chn-pak'];
function berbatasan(a,b){ return BATAS_DARAT.includes(a+'-'+b)||BATAS_DARAT.includes(b+'-'+a); }
/* bonus bertahan menurut medan negara yang diserbu */
const MEDAN={daratan:1, pegunungan:1.25, kepulauan:1.15, pulau:1.2};
const MEDAN_N={daratan:'dataran terbuka',pegunungan:'pegunungan',kepulauan:'kepulauan',pulau:'negara pulau'};
/* indeks kekuatan gabungan (untuk membandingkan dua negara secara kasar) */
function daya(c){
  const t=0.55+c.tek/110;
  return Math.round((c.aktif + c.cad*0.15 + c.tank*0.15 + c.jet*1.6 + c.heli*0.5 + c.kapal*2.5 + c.selam*3 + c.induk*40)*t + Math.sqrt(c.hankam)*18);
}
/* ===== POSTUR tiap matra: a = daya serang · d = daya tahan · i = intensitas serangan · am = amunisi/minggu · loss = pengali kerugian ===== */
const DARAT={
  ofensif: {n:'Ofensif besar',     s:'Serbu habis-habisan · boros amunisi & nyawa', a:1.25,d:0.9, i:1,   am:7,loss:1.4},
  tekan:   {n:'Tekanan terbatas',  s:'Maju hati-hati di titik lemah lawan',         a:1.0, d:1.1, i:0.55,am:4,loss:1},
  bertahan:{n:'Bertahan berlapis', s:'Gali parit, biarkan lawan menghantam tembok', a:0.5, d:1.45,i:0.12,am:2,loss:0.75},
  mundur:  {n:'Mundur teratur',    s:'Tukar wilayah dengan waktu & nyawa prajurit', a:0.2, d:1.15,i:0,   am:1,loss:0.45}
};
const UDARA={
  rebut:    {n:'Rebut keunggulan udara', s:'Buru pesawat & radar lawan',                    k:1.25,loss:1.2},
  cas:      {n:'Dukung pasukan darat',   s:'Pesawat jadi artileri terbang',                 k:0.85,loss:1},
  strategis:{n:'Serangan strategis',     s:'Hantam depot, jembatan, pabrik · warga sipil terancam', k:0.7, loss:1.1},
  hemat:    {n:'Hemat pesawat',          s:'Terbang seperlunya, jaga armada',               k:0.45,loss:0.35}
};
const LAUT={
  blokade:  {n:'Blokade laut',        s:'Cekik pelabuhan & suplai lawan',          k:1.1,loss:1.1},
  kawal:    {n:'Kawal jalur suplai',  s:'Logistik sendiri lancar',                 k:1,  loss:0.8},
  amfibi:   {n:'Operasi amfibi',      s:'Pendaratan pantai · butuh penguasaan laut',k:0.9,loss:1.5},
  pangkalan:{n:'Armada di pangkalan', s:'Simpan kapal, lepas kendali laut',        k:0.5,loss:0.25}
};
const TUJUAN={
  bertahan:{n:'Mempertahankan tanah air', d:'Lawan sudah menerobos perbatasan. Usir mereka dan pulihkan wilayah.'},
  sengketa:{n:'Merebut wilayah sengketa', d:'Perang terbatas: kuasai wilayah sengketa, lalu paksa lawan berunding.'},
  total:   {n:'Perang total',             d:'Tundukkan lawan sepenuhnya sampai ibu kotanya jatuh atau ia menyerah.'}
};
const SIFAT=[
  {k:'agresif', n:'agresif',     d:'gemar menyerang walau mahal'},
  {k:'hati',    n:'hati-hati',   d:'bertahan dulu, menunggu Anda lelah'},
  {k:'licik',   n:'licik',       d:'mengincar logistik & laut Anda'}
];
const HASIL={
  menang:        {n:'KEMENANGAN TOTAL',        d:'lawan menyerah tanpa syarat'},
  menangTerbatas:{n:'KEMENANGAN TERBATAS',     d:'tujuan perang tercapai lewat perundingan'},
  damai:         {n:'DAMAI TANPA PEMENANG',    d:'garis kembali mendekati perbatasan lama'},
  damaiRugi:     {n:'DAMAI YANG PAHIT',        d:'sebagian wilayah lepas di meja perundingan'},
  beku:          {n:'KONFLIK MEMBEKU',         d:'perang berlarut tanpa keputusan'},
  jatuh:         {n:'PEMERINTAH JATUH',        d:'rakyat tak sanggup lagi menanggung perang'},
  kalah:         {n:'KEKALAHAN',               d:'ibu kota jatuh ke tangan lawan'},
  kiamat:        {n:'KIAMAT NUKLIR',           d:'tidak ada pemenang, hanya abu'}
};
const ACH_DEF={
  menang:'Panglima Pemenang', terbatas:'Menang Tanpa Menghancurkan', kilat:'Perang Kilat', daud:'Daud Melawan Jalut',
  bertahan:'Benteng Tanah Air', udara:'Penguasa Langit', laut:'Penguasa Samudra', amfibi:'Pendaratan Bersejarah',
  hemat:'Hemat Nyawa Prajurit', logistik:'Juru Logistik', intel:'Mata-mata Ulung', sekutu:'Diplomat Senjata',
  koridor:'Koridor Kemanusiaan', jenewa:'Penjaga Konvensi Jenewa', damai:'Pembawa Damai', bersih:'Perang Tanpa Noda',
  penjahat:'Penjahat Perang', karpet:'Pembom Kota', ambang:'Di Ambang Kiamat', kiamat:'Menekan Tombol Merah',
  beku:'Perang Tak Berujung', bangkrut:'Kas Perang Kering', gerilya:'Bertahan dari Raksasa', mobilisasi:'Mobilisasi Umum'
};
