'use strict';
/* ================= MEJA KOMANDO =================
   Postur (gratis, berlaku terus) + perintah khusus (maks. MAKS_PERINTAH per minggu, bertanda ◆). */
const TABS=[['darat','DARAT'],['udara','UDARA'],['laut','LAUT'],['negeri','LOGISTIK & NEGERI'],['diplomasi','DIPLOMASI & SIASAT']];
function pilihPostur(m,tabel,judul){
  ask({title:judul,text:'Postur berlaku mulai minggu ini sampai Anda ubah. Sekarang: <b>'+tabel[P.post[m]].n+'</b>.',
    opts:Object.keys(tabel).map(k=>({t:tabel[k].n+(P.post[m]===k?' (sekarang)':''),sub:tabel[k].s,e:()=>{
      if(P.post[m]!==k){ P.post[m]=k; addLog('Perintah '+({d:'darat',u:'udara',l:'laut'}[m])+': <b>'+tabel[k].n+'</b>.','sys'); }
    }}))});
}
function biayaSkala(x){ return Math.round(Math.max(20,biayaMinggu()*x)); }     /* biaya ikut besar angkatan */
function hargaPasar(){ return P.st.dunia<30?2:P.st.dunia>=65?0.85:1; }         /* dikucilkan = harus lewat pasar gelap */

const ACTS=[
/* ---- DARAT ---- */
{k:'posturD',tab:'darat',lbl:'Postur darat',get sub(){ return P&&P.f?'Sekarang: '+DARAT[P.post.d].n:''; },postur:true,multi:true,e:()=>pilihPostur('d',DARAT,'POSTUR DARAT')},
{k:'mobilisasi',tab:'darat',lbl:'Mobilisasi cadangan',get sub(){ return P&&P.f?'Sisa cadangan '+org(P.f.cad)+' · rakyat resah':''; },cond:()=>P.f.cad>=1,e:()=>{
  const x=Math.min(P.f.cad,Math.max(10,P.awal.pasukan*0.15)); P.f.cad-=x; P.f.pasukan+=x; P.mobil++; P.mobilJumlah=(P.mobilJumlah||0)+x;
  addLog('Surat panggilan dikirim ke seluruh negeri. '+org(x)+' pasukan cadangan masuk barak: kurang terlatih, tetapi mengisi parit yang kosong.'+fx({moral:-2,publik:P.agresor?-5:-2,dana:-biayaSkala(0.4)}),'sys');
  milestone('Mobilisasi '+org(x)+' cadangan'); }},
{k:'kubu',tab:'darat',lbl:'Bangun garis pertahanan',get sub(){ return P&&P.f?'Kubu '+P.fort+'/5 · '+usd(biayaSkala(0.5)):''; },cond:()=>P.fort<5&&P.dana>=biayaSkala(0.5),e:()=>{
  P.fort++; addLog('Zeni menggali parit berlapis, menanam ranjau, dan menuang beton. Garis pertahanan makin sukar ditembus.'+fx({dana:-biayaSkala(0.5)}),'sys'); }},
{k:'rotasi',tab:'darat',lbl:'Rotasi & istirahatkan pasukan',sub:'Moral pulih · gempuran minggu ini melemah',cond:()=>P.st.moral<85,e:()=>{
  N.jeda=true; addLog('Satuan terdepan ditarik bergantian untuk mandi air panas, surat dari rumah, dan tidur tanpa dentuman.'+fx({moral:+8,dana:-biayaSkala(0.15)}),'good'); }},
{k:'opsus',tab:'darat',lbl:'Operasi pasukan khusus',sub:'Sabotase depot & jembatan lawan · berisiko',e:()=>{
  if(r()<0.4+NEG[P.neg].tek/200){ addLog('Tim pasukan khusus menyusup lewat malam. Dua jembatan dan satu depot bahan bakar lawan rata dengan tanah.'+fx({mLog:-ri(9,16),mMoral:-2}),'good'); }
  else { P.f.pasukan=Math.max(0,P.f.pasukan-0.2); P.tewas+=0.1; addLog('Tim pasukan khusus terjebak penyergapan. Hanya separuh yang kembali.'+fx({moral:-3}),'bad'); } }},
/* ---- UDARA ---- */
{k:'posturU',tab:'udara',lbl:'Postur udara',get sub(){ return P&&P.f?'Sekarang: '+UDARA[P.post.u].n:''; },postur:true,multi:true,e:()=>pilihPostur('u',UDARA,'POSTUR UDARA')},
{k:'rudal',tab:'udara',lbl:'Serangan rudal presisi',get sub(){ return P&&P.f?'Pakai 10 rudal (sisa '+Math.round(P.f.rudal)+') · sasaran militer':''; },cond:()=>P.f.rudal>=10,e:()=>{
  P.f.rudal-=10; const jet=N.e.f.jet*0.03; N.e.f.jet=Math.max(0,N.e.f.jet-jet);
  addLog('Sepuluh rudal jelajah menghantam pangkalan udara dan gudang amunisi lawan sebelum fajar.'+fx({mLog:-6,mAmu:-7}),'good'); }},
{k:'drone',tab:'udara',lbl:'Serbuan kawanan drone',get sub(){ return P&&P.f?'Pakai 100 drone (sisa '+Math.round(P.f.drone)+')':''; },cond:()=>P.f.drone>=100,e:()=>{
  P.f.drone-=100; const t=N.e.f.tank*0.03, p=N.e.f.pasukan*0.004; N.e.f.tank-=t; N.e.f.pasukan-=p; P.tewasLawan+=p*0.4;
  addLog('Seratus drone murah menyapu parit dan kolom lapis baja lawan. '+Math.round(t)+' tank terbakar; operator Anda tidak beranjak dari kursinya.'+fx({mMoral:-3}),'good'); }},
{k:'karpet',tab:'udara',lbl:'Bom karpet kota lawan',sub:'Patahkan tekad lewat teror · KEJAHATAN PERANG',cond:()=>P.f.jet>=20&&N.udara>-20,e:()=>{
  const k=(2+r()*5)*clamp(P.f.jet/300,0.5,3); P.sipilLawan+=k; P.kejahatan++; P.bomKota=(P.bomKota||0)+1;
  const rally=N.e.st.tekad>70;
  addLog('Gelombang pengebom meratakan kawasan permukiman. Sekitar '+org(k)+' warga sipil tewas dalam semalam. '+(rally?'Alih-alih menyerah, rakyat lawan bersatu dalam amarah.':'Kota itu sunyi; yang selamat mengungsi ke segala arah.')+fx({tekad:rally?+5:-7,dunia:-12,publik:-3,moral:-2}),'bad');
  ach('karpet'); ach('penjahat'); milestone('Membom kota lawan');
  if(P.syaratSekutu){ P.syaratSekutu=false; P.pesanan=P.pesanan.filter(x=>!/sekutu/.test(x.n)); addLog('Sekutu membatalkan seluruh bantuan senjata karena Anda melanggar syaratnya.','bad'); } }},
/* ---- LAUT ---- */
{k:'posturL',tab:'laut',lbl:'Postur laut',get sub(){ return P&&P.f?'Sekarang: '+LAUT[P.post.l].n:''; },postur:true,multi:true,e:()=>pilihPostur('l',LAUT,'POSTUR LAUT')},
{k:'selam',tab:'laut',lbl:'Perburuan kapal selam',sub:'Incar kapal perang & tanker lawan · berisiko',cond:()=>P.f.selam>=2,e:()=>{
  if(r()<0.45+NEG[P.neg].tek/250){ const x=Math.max(1,N.e.f.kapal*0.07); N.e.f.kapal=Math.max(0,N.e.f.kapal-x); addLog('Kapal selam Anda menenggelamkan '+Math.round(x)+' kapal lawan dan satu tanker di jalur suplai mereka.'+fx({mLog:-5}),'good'); }
  else { P.f.selam-=1; P.tewas+=0.05; addLog('Satu kapal selam Anda tidak kembali ke pangkalan. Laut menyimpan jawabannya.'+fx({moral:-2}),'bad'); } }},
{k:'ranjau',tab:'laut',lbl:'Tebar ranjau laut',sub:'Persulit pendaratan & blokade lawan',cond:()=>siap('ranjau',6)&&P.dana>=biayaSkala(0.3),e:()=>{
  pakai('ranjau'); N.laut=clamp(N.laut+6,-100,100); addLog('Ladang ranjau ditebar di selat-selat sempit. Kapal lawan kini harus merayap.'+fx({dana:-biayaSkala(0.3)}),'sys'); }},
/* ---- LOGISTIK & NEGERI ---- */
{k:'amunisi',tab:'negeri',lbl:'Beli amunisi',get sub(){ return P&&P.f?usd(Math.round(biayaSkala(1.2)*hargaPasar()))+' · amunisi +25':''; },multi:true,cond:()=>P.st.amunisi<95&&P.dana>=biayaSkala(1.2)*hargaPasar(),e:()=>{
  addLog('Kontrak amunisi diteken; pabrik bekerja tiga gilir.'+fx({dana:-Math.round(biayaSkala(1.2)*hargaPasar()),amunisi:+25}),'sys'); }},
{k:'senjata',tab:'negeri',lbl:'Beli alutsista',sub:'Pesawat, tank, drone, rudal · tiba 3 minggu lagi',e:()=>{
  const c=NEG[P.neg], h=hargaPasar();
  const paket=[
    {n:Math.max(4,Math.round(c.jet*0.06))+' pesawat tempur',apa:{jet:Math.max(4,Math.round(c.jet*0.06))},harga:Math.max(4,Math.round(c.jet*0.06))*70},
    {n:Math.max(20,Math.round(c.tank*0.08))+' tank',apa:{tank:Math.max(20,Math.round(c.tank*0.08))},harga:Math.max(20,Math.round(c.tank*0.08))*5},
    {n:'300 drone serang',apa:{drone:300},harga:90},
    {n:'30 rudal jelajah',apa:{rudal:30},harga:75}
  ];
  ask({title:'BELI ALUTSISTA',text:'Kas perang: '+usd(P.dana)+'.'+(h>1?' Anda dikucilkan dunia — hanya pasar gelap yang mau menjual, harga dua kali lipat.':h<1?' Negara sahabat memberi harga khusus.':''),
    opts:paket.map(p=>({t:p.n,sub:usd(Math.round(p.harga*h)),cond:()=>P.dana>=p.harga*h,e:()=>{ P.dana-=Math.round(p.harga*h); P.pesanan.push({tiba:N.minggu+3,apa:p.apa,n:p.n}); addLog('Pesanan <b>'+p.n+'</b> diteken, tiba tiga minggu lagi.','sys'); }}))
      .concat([{t:'Batal',e:()=>{ G.acted=Math.max(0,G.acted-1); }}])}); }},
{k:'pajak',tab:'negeri',lbl:'Pajak & obligasi perang',sub:'Dana segar · rakyat mengeluh',cond:()=>siap('pajak',8),e:()=>{
  pakai('pajak'); const x=Math.round(NEG[P.neg].pdb*4); addLog('Parlemen mengesahkan pajak perang dan menjual obligasi patriotik.'+fx({dana:x,publik:P.agresor?-5:-3}),'sys'); }},
{k:'propaganda',tab:'negeri',lbl:'Pidato & siaran semangat',sub:'Dukungan rakyat naik',cond:()=>siap('propaganda',3),e:()=>{
  pakai('propaganda'); const g=P.kejahatan>=2?2:P.agresor?4:6; addLog('Pidato Anda disiarkan ke seluruh negeri. '+(P.kejahatan>=2?'Tetapi foto-foto dari garis depan berbicara lebih keras.':'Antrean donor darah dan relawan memanjang.')+fx({publik:+g,moral:+2}),'good'); }},
{k:'evakuasi',tab:'negeri',lbl:'Evakuasi warga & bunker',sub:'Korban sipil dari bom lawan turun 6 minggu',cond:()=>P.evakuasi<=0&&P.dana>=biayaSkala(0.4),e:()=>{
  P.evakuasi=6; addLog('Sirene diuji, bunker dibuka, anak-anak diungsikan ke pedalaman.'+fx({dana:-biayaSkala(0.4),publik:+3}),'good'); }},
/* ---- DIPLOMASI & SIASAT ---- */
{k:'intel',tab:'diplomasi',lbl:'Operasi intelijen',sub:'Baca postur & kekuatan lawan selama 3 minggu',e:()=>{
  P.intel=3; P.intelKali=(P.intelKali||0)+1; addLog('Satelit, penyadap, dan agen lapangan bekerja. Untuk tiga minggu ke depan, rencana lawan terbaca di meja Anda.'+fx({dana:-biayaSkala(0.2)}),'sys'); if(P.intelKali>=4)ach('intel'); }},
{k:'lobi',tab:'diplomasi',lbl:'Lobi PBB & negara sahabat',sub:'Dukungan dunia naik',cond:()=>siap('lobi',3),e:()=>{
  pakai('lobi'); const g=P.kejahatan>=2?2:P.agresor?4:7; addLog('Diplomat Anda berkeliling ibu kota dunia membawa peta dan foto.'+fx({dunia:+g,dana:-biayaSkala(0.1)}),'sys'); }},
{k:'sekutu',tab:'diplomasi',lbl:'Minta bantuan senjata',sub:'Butuh dukungan dunia ≥ 50',cond:()=>P.st.dunia>=50&&siap('sekutu',6),e:()=>{
  pakai('sekutu'); const c=NEG[P.neg];
  if(r()<0.35+P.st.dunia/160+(c.blok.length?0.15:0)){ const tank=Math.max(10,Math.round(c.tank*0.06)); P.pesanan.push({tiba:N.minggu+2,apa:{tank,rudal:15,drone:150},n:tank+' tank, 15 rudal & 150 drone dari negara sahabat'}); P.bantuan++;
    addLog('Negara sahabat menyetujui paket bantuan. Kapal pengangkut berangkat pekan ini.'+fx({moral:+2,amunisi:+10}),'good'); if(P.bantuan>=2)ach('sekutu'); }
  else addLog('Permintaan Anda "sedang dipertimbangkan". Dalam bahasa diplomasi, itu berarti belum.'+fx({dunia:-1})); }},
{k:'koridor',tab:'diplomasi',lbl:'Jeda kemanusiaan',sub:'Buka koridor bagi warga sipil · operasi melambat',cond:()=>siap('koridor',4),e:()=>{
  pakai('koridor'); P.koridor++; N.jeda=true; addLog('Anda mengumumkan jeda tembak-menembak 72 jam. Truk bantuan masuk, pengungsi keluar.'+fx({dunia:+5,publik:+1}),'good'); if(P.koridor>=3)ach('koridor'); }},
{k:'gencatan',tab:'diplomasi',lbl:'Tawarkan gencatan senjata',get sub(){ return P&&P.f?'Akhiri perang di garis sekarang ('+teksFront()+')':''; },cond:()=>N.minggu>=4&&siap('gencatan',3),e:()=>{
  pakai('gencatan'); P.tawarDamai++;
  const h=hasilDamai();
  ask({title:'TAWARKAN GENCATAN SENJATA?',text:'Bila lawan setuju, perang berakhir di garis saat ini ('+teksFront()+'). Bagi tujuan Anda, hasilnya: <b>'+HASIL[h].n+'</b>.',opts:[
    {t:'Kirim tawaran',e:()=>{ if(r()<peluangDamai()){ if(h!=='damaiRugi')ach('damai'); akhiri(h,'Tawaran gencatan senjata Anda diterima. Senjata diam mulai tengah malam.'); }
      else addLog(NEG[N.e.k].n+' menolak. Mereka masih yakin bisa menang di medan perang.'+fx({dunia:+2,moral:-1})); }},
    {t:'Batal',e:()=>{}}
  ]}); }},
{k:'nuklir',tab:'diplomasi',lbl:'Ancam dengan senjata nuklir',sub:'Paksa lawan berhenti · bisa mengakhiri segalanya',cond:()=>NEG[P.neg].nuklir>0&&siap('nuklir',4),e:()=>{
  pakai('nuklir'); const cB=NEG[N.e.k];
  if(cB.nuklir>0){ addLog('Anda menaikkan status siaga nuklir. '+cB.n+' membalas dengan langkah yang sama. Jam kiamat maju beberapa menit.'+fx({eskalasi:+40,dunia:-12,tekad:-3}),'bad'); }
  else { addLog('Anda mengingatkan dunia bahwa negeri Anda punya senjata pamungkas. '+cB.n+' menahan ofensifnya, dan seluruh dunia mengecam Anda.'+fx({eskalasi:+20,dunia:-14,tekad:-12}),'bad'); if(N.front<0)N.e.post.d='bertahan'; }
  milestone('Mengancam dengan senjata nuklir'); }},
{k:'menyerah',tab:'diplomasi',lbl:'Minta syarat damai (menyerah)',sub:'Akhiri perang sekarang, apa pun harganya',cond:()=>N.minggu>=4,postur:true,multi:true,e:()=>{
  ask({title:'MENYERAH?',text:'Anda akan meminta syarat damai dari lawan. Perang berakhir, dan Anda menerima apa pun garis yang ada sekarang ('+teksFront()+').',opts:[
    {t:'Ya, hentikan pertumpahan darah',e:()=>akhiri(N.front>=-8?'damai':N.front>-60?'damaiRugi':'kalah','Anda meminta syarat damai. Yang tersisa dari angkatan bersenjata pulang ke rumah.')},
    {t:'Belum',e:()=>{}}
  ]}); }}
];

function actAvail(a){
  if(!P||!P.f)return {ok:false,why:'Perang belum dimulai'};
  if(a.cond&&!a.cond())return {ok:false,why:'Syarat belum terpenuhi'};
  if(!a.multi&&P.used[a.k])return {ok:false,why:'Sudah dilakukan minggu ini',used:true};
  if(!a.postur&&G.acted>=MAKS_PERINTAH)return {ok:false,why:'Staf komando sudah penuh ('+MAKS_PERINTAH+' perintah/minggu)'};
  return {ok:true};
}
function doAct(k){
  if(!P||G.current||G.over||!P.alive)return;
  const a=ACTS.find(x=>x.k===k);
  if(!a)return;
  const av=actAvail(a);
  if(!av.ok)return;
  if(!a.multi)P.used[k]=true;
  if(!a.postur)G.acted++;
  a.e();
  checkAch(false);
  if(!G.over)cekAkhir();
  render();
}
