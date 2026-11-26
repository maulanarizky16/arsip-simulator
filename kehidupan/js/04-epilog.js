'use strict';
/* ================= MATI & EPILOG ================= */
function die(sebab){
  P.alive=false; P.sebab=sebab; G.current=null; G.queue=[]; G.over=true;
  addLog('<b>'+P.nama+' menghembuskan napas terakhir di usia '+P.age+' tahun.</b> Penyebab: '+sebab+'.','bad');
  stamp('WAFAT');
  showEpilog();
}
function deathCheck(){
  let p=0; const a=P.age,h=P.st.health;
  if(h<=5)p+=0.6; else if(h<20)p+=0.12; else if(h<35)p+=0.03;
  if(a>55)p+=(a-55)*0.006;
  if(P.rokok)p+=a>40?0.02:0.004;
  if(a>90)p+=0.18;
  if(r()<p)die(h<35?'sakit yang sudah lama digerogoti':pick(SEBAB_TUA));
}
function checkAch(){
  if(P.eduLevel>=4)ach('sarjana');
  if(P.s2)ach('magister');
  if(P.job&&P.job.level>=4)ach('direktur');
  const nw=netWorth();
  if(nw>=1e9)ach('miliarder');
  if(nw>=5e9)ach('sultan');
  if(P.biz.reduce((s,b)=>s+b.level,0)>=5)ach('juragan');
  if(P.aset.filter(a=>a.kelas==='properti').length>=3)ach('properti');
  if(P.love&&P.love.married&&P.kids.length>=2)ach('keluarga');
  if(P.cucu>0)ach('kakek');
  if(P.age>=85)ach('sepuh');
  if(P.age>=70&&P.st.health>=65)ach('bugar');
  if(P.hobi.some(h=>h.level>=5))ach('hobiis');
  if(P.viral)ach('viral');
  if(P.biz.reduce((s,b)=>s+b.kary,0)>=20)ach('bos');
  if(P.gen>=3)ach('dinasti');
  if(P.st.relasi>=90)ach('supel');
  if(P.kids.length>=1&&P.dekatAnak>=85)ach('teladan');
  if(P.teman.some(t=>t.dekat>=92))ach('sahabat');
  if(P.pernahRantau&&netWorth()>=1e9)ach('perantau');
  if(P.age>=55&&P.st.stress<=20&&P.st.happy>=60)ach('waras');
  if(P.politik&&P.politik.idx>=3)ach('pejabat');
  if(P.politik&&P.politik.idx>=4)ach('penguasa');
  if(P.politik&&P.politik.idx>=2&&P.korupTotal===0&&P.pamor>=80)ach('negarawan');
}
function showEpilog(){
  const avgH=Math.round(P.sumHappy/Math.max(P.age,1));
  const nAch=Object.keys(P.ach).length;
  const lvl=P.job?P.job.level:(P.riwayat.some(x=>x.t.startsWith('Promosi'))?2:0);
  const hobLv=P.hobi.reduce((s,h)=>s+h.level,0);
  /* aset dinilai per kelas (properti bernilai, kendaraan dibatasi) agar tak bisa di-spam aset murah */
  const skorAset=P.aset.filter(a=>a.kelas==='properti').length*10+Math.min(P.aset.filter(a=>a.kelas==='kendaraan').length,3)*3;
  const skor=Math.round(P.eduLevel*8+lvl*10+(P.riwayat.some(x=>x.t.startsWith('Menikah'))?15:0)
    +P.kids.length*8+skorAset+clamp(P.maxNet/8e7,0,45)+avgH/4+P.age/2+nAch*4+hobLv*2
    +(P.ipk>=3.5?6:P.ipk>=3?3:0)
    +(P.politik?(P.politik.idx+1)*12:0));
  const grade=skor>=130?'S — Hidup Legendaris':skor>=100?'A — Hidup yang Penuh':skor>=70?'B — Hidup yang Layak':skor>=45?'C — Hidup yang Berjuang':'D — Hidup yang Berat';
  let julukan='Orang Baik-Baik';
  if(P.politik&&P.politik.idx>=4)julukan='Orang Nomor Satu '+P.kota;
  else if(P.politik&&P.politik.idx>=3)julukan='Wakil Rakyat';
  else if(P.korupTotal>=1e9)julukan='Pejabat Penuh Skandal';
  else if(P.maxNet>=5e9)julukan='Sultan '+P.kota;
  else if(P.maxNet>=1e9)julukan='Miliarder Kampung';
  else if(P.biz.some(b=>b.level>=3))julukan='Juragan '+P.biz.find(b=>b.level>=3).nama;
  else if(P.hajiDone)julukan=P.gender==='L'?'Pak Haji':'Bu Hajjah';
  else if(P.viral)julukan='Seleb Medsos';
  else if(P.bukuTerbit)julukan='Sang Penulis';
  else if(P.st.smart>=85)julukan='Sang Cendekia';
  else if(P.kids.length>=3)julukan='Kepala Keluarga Sejati';
  else if(P.hobi.some(h=>h.level>=5))julukan='Maestro '+HOBI.find(x=>x.k===P.hobi.find(h=>h.level>=5).k).n;
  else if(P.dekatAnak>=85&&P.kids.length)julukan='Orang Tua Teladan';
  else if(P.st.relasi>=90)julukan='Orang Paling Dikenal';
  else if(P.st.charm>=85)julukan='Idola Kampung';
  else if(avgH>=70)julukan='Jiwa yang Bahagia';
  const rw=P.riwayat.map(x=>'<li>Umur '+x.age+' — '+x.t+'</li>').join('');
  const achs=Object.keys(P.ach).map(k=>'<span class="chip au">'+ACH_DEF[k]+'</span>').join('')||'<span class="muted">—</span>';
  if(!hasDoc)return;
  $('epilog').innerHTML=
    '<h2>IN MEMORIAM</h2>'+
    '<div class="sub">'+P.nama+' · '+P.lahir+'–'+(P.lahir+P.age)+' · '+P.kota+'<br>Wafat usia '+P.age+' tahun, '+P.sebab+'</div>'+
    '<div class="jdl">"'+julukan+'"</div>'+
    '<div class="achr">'+achs+'</div>'+
    '<ul>'+rw+'</ul>'+
    '<div class="skor">SKOR HIDUP: '+skor+'<br>'+grade+'</div>'+
    '<div class="sub">'+(P.gen>1?'Generasi ke-'+P.gen+' · ':'')+'Kekayaan puncak '+rp(P.maxNet)+' · Rata-rata kebahagiaan '+avgH+'/100 · '+P.kids.length+' anak · '+P.cucu+' cucu</div>'+
    (P.kids.length?'<button data-go="anak">Lanjut sebagai '+P.kids[0].nama+' (Generasi '+(P.gen+1)+') »</button>':'')+
    '<button data-go="new"'+(P.kids.length?' class="ghost"':'')+'>Jalani Hidup Baru »</button>';
  $('overlay').classList.remove('hidden');
  if(window.Platform){
    try{ Platform.handleResult({
      game:'kehidupan',
      nama:P.nama, skor:skor, grade:grade, julukan:julukan,
      age:P.age, lahir:P.lahir, kota:P.kota, sebab:P.sebab,
      gen:P.gen, maxNet:P.maxNet,
      kids:P.kids.length, cucu:P.cucu, avgHappy:avgH,
      achievements:Object.keys(P.ach).map(function(k){return ACH_DEF[k];})
    }); }catch(e){}
  }
}
function contAsChild(){
  const k=P.kids[0];
  const gen=P.gen+1;
  const liquid=P.money+P.inv.depo+P.inv.emas+P.inv.saham+P.inv.kripto;
  const warisan=Math.max(0,Math.round(liquid*0.6/P.kids.length));
  /* sebagian aset (yang paling bernilai) diturunkan ke anak yang dimainkan, dibagi jumlah anak, bebas KPR */
  const parentAset=P.aset.slice().sort((a,b)=>b.nilai-a.nilai);
  const shareN=Math.ceil(parentAset.length/Math.max(P.kids.length,1));
  const warisanAset=parentAset.slice(0,shareN).map(a=>({k:a.k,n:a.n,nilai:Math.round(a.nilai),kpr:null,sewa:a.sewa||0,tumbuh:a.tumbuh||0,kelas:a.kelas}));
  const prevSilsilah=(P.silsilah||[]).slice();
  const ortuKorup=P.korupTotal||0, ortuIntegritas=P.integritas!=null?P.integritas:60, ortuRepKerja=P.reputasiKerja||50;
  const ortuRingkas={gen:P.gen,nama:P.nama,age:P.age,sebab:P.sebab,maxNet:P.maxNet,kota:P.kota,edu:P.edu,kids:P.kids.length,ach:Object.keys(P.ach).length};
  const marga=P.nama.split(' ')[1]||'';
  const info={nama:(k.nama+' '+marga).trim(), g:k.jk, kota:P.kota, lahir:P.lahir+k.lahirAt,
    umur:P.age-k.lahirAt, kuliah:!!k.kuliah, ortuG:P.gender, ortuNama:P.nama,
    pasanganAda:!!(P.love&&P.love.married), lahirAt:k.lahirAt};
  G._continuing=true; newGame(); G._continuing=false;
  P.nama=info.nama; P.gender=info.g; P.kota=info.kota; P.lahir=info.lahir; P.gen=gen;
  P.age=clamp(Math.max(info.umur,18),18,35);
  if(info.kuliah){const j=pick(JURUSAN);P.eduLevel=4;P.jur=j.k;P.edu='S1 '+j.n;}
  else{P.eduLevel=3;P.track=pick(['ipa','ips','smk']);P.edu='Lulus '+(P.track==='smk'?'SMK':'SMA');}
  P.money=warisan;
  P.aset=warisanAset;
  P.silsilah=prevSilsilah.concat([ortuRingkas]);
  const warisTotal=warisan+warisanAset.reduce((s,a)=>s+a.nilai,0);
  P.kelas=warisTotal>=500e6?'kaya':warisTotal>=50e6?'menengah':'miskin';
  const didik=(k.didik||40), bonus=Math.round((didik-40)/5); /* −8..+12 dari pola asuh */
  P.st.smart=clamp(P.st.smart+5+bonus,0,100); P.st.charm=clamp(P.st.charm+5+Math.round(bonus/2),0,100);
  if(bonus>0)P.st.health=clamp(P.st.health+Math.round(bonus/2),0,100);
  /* bayang-bayang rekam jejak orang tua menurun ke anak (warisan tak kasat mata) */
  if(ortuKorup>=1e9||ortuIntegritas<35){ P.st.charm=clamp(P.st.charm-4,0,100); P.st.relasi=clamp(P.st.relasi-6,0,100); P.integritas=clamp(P.integritas-8,0,100); P._ortuScandal=true; }
  else if(ortuIntegritas>=75&&ortuRepKerja>=60){ P.st.relasi=clamp(P.st.relasi+5,0,100); P.integritas=clamp(P.integritas+6,0,100); P._ortuHormat=true; }
  P.ortu.ayahOff=info.lahirAt; P.ortu.ibuOff=info.lahirAt;
  if(info.ortuG==='L'){P.ortu.ayah=false;P.ortu.ibu=info.pasanganAda;}
  else{P.ortu.ibu=false;P.ortu.ayah=info.pasanganAda;}
  P.riwayat=[{age:0,t:'Lahir di '+P.kota+', anak dari '+info.ortuNama}];
  G.feed=[];
  P.arsipNo='No. Arsip '+ri(100000,999999)+'/'+P.lahir;
  if(hasDoc){$('feed').innerHTML='';$('noArsip').textContent=P.arsipNo;}
  yearHeader();
  addLog('<b>GENERASI KE-'+gen+'.</b> Arsip berlanjut ke <b>'+P.nama+'</b>, kini '+P.age+' tahun. Warisan yang diterima: '+rp(warisan)+'.');
  addLog(didik>=70?'Dibesarkan dengan didikan penuh perhatian, '+P.nama+' tumbuh cerdas dan percaya diri.':didik>=45?P.nama+' tumbuh dengan bekal yang cukup dari orang tuanya.':'Masa kecil '+P.nama+' kurang terurus — ia harus berjuang lebih keras dari nol.',didik>=70?'good':didik<45?'bad':'');
  if(P._ortuScandal){addLog('Nama keluarga sempat tercoreng skandal generasi sebelumnya — '+P.nama+' harus bekerja ekstra membersihkannya.','bad');P._ortuScandal=false;}
  else if(P._ortuHormat){addLog('Nama baik orang tua membuka banyak pintu — '+P.nama+' disambut hangat di mana-mana.','good');P._ortuHormat=false;}
  if(warisanAset.length){
    const g={}; for(const a of warisanAset)g[a.n]=(g[a.n]||0)+1;
    addLog('Selain uang, '+P.nama+' mewarisi aset: '+Object.keys(g).map(n=>n+(g[n]>1?' ×'+g[n]:'')).join(', ')+' (bebas cicilan).','good');
  }
  stamp('GENERASI '+gen,'green'); milestone('Mewarisi '+rp(warisan)+(warisanAset.length?' + '+warisanAset.length+' aset':'')+' (Generasi '+gen+')');
  if(P.gen>=3)ach('dinasti');
  render();
}

