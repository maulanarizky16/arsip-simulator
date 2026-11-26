// Main semua game dengan DOM sungguhan (jsdom, window===global persis browser) + klik tombol.
// Menangkap error runtime, exception event-handler, console.error. node _play_all.js
'use strict';
const SEED=require('./_seed');
const fs=require('fs'), path=require('path'), vm=require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT=path.join(__dirname,'..');
const PLATFORM=fs.readFileSync(path.join(ROOT,'platform.js'),'utf8');

function loadGameJS(game){
  const dir=path.join(ROOT,game,'js');
  const artPath=path.join(ROOT,'assets','art.js');
  const art=fs.existsSync(artPath)?fs.readFileSync(artPath,'utf8')+'\n;\n':'';
  return SEED+art+fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort()
    .map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n;\n');
}
function isLimitation(msg){ return /Not implemented|Could not load|getComputedStyle|html2canvas|navigation|Navigation|scrollTo|\.focus|canvas|HTMLCanvas/i.test(msg); }

function makeCtx(shellFile){
  const shell=fs.readFileSync(path.join(ROOT,shellFile),'utf8');
  const errors=[], limits=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError', e=>{ const m=(e&&e.detail&&(e.detail.message||String(e.detail)))||(e&&e.message)||String(e); (isLimitation(m)?limits:errors).push('jsdomError: '+m); });
  vc.on('error', (...a)=>{ const m=a.map(x=>x&&x.message?x.message:String(x)).join(' '); (isLimitation(m)?limits:errors).push('console.error: '+m); });
  const dom=new JSDOM(shell,{ runScripts:'outside-only', pretendToBeVisual:true, virtualConsole:vc, url:'http://localhost/' });
  const win=dom.window;
  win.alert=()=>{}; win.confirm=()=>true; win.prompt=()=>null; win.scrollTo=()=>{};
  win.__ERR=errors;
  const vctx=dom.getInternalVMContext();
  return {dom,win,vctx,errors,limits};
}

/* ================= GAME (shell + modul JS, klik seperti pemain) ================= */
function playGame(game, shellFile, lives){
  const c=makeCtx(shellFile);
  try{ vm.runInContext(loadGameJS(game)+'\n;\n'+PLATFORM, c.vctx, {filename:game+'.bundle.js'}); }
  catch(e){ c.errors.push('LOAD/BOOT: '+(e&&e.stack||e)); return {game, errors:c.errors, limits:c.limits, advances:0, lives:0}; }

  const stats=vm.runInContext(`(function(){
    function qa(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
    function q(s){ return document.querySelector(s); }
    function click(el){ if(!el)return false; try{ el.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true})); }catch(e){ window.__ERR.push('dispatch click: '+e.message); } return true; }
    function creator(){   // pop-up buat karakter: pilih gender & warna kulit acak, lalu Mulai
      const ok=q('.aa-creator [data-cr="ok"]'); if(!ok)return false;
      const gs=qa('.aa-creator [data-g]'), ts=qa('.aa-creator [data-tone]');
      if(gs.length)click(gs[Math.floor(Math.random()*gs.length)]);
      if(ts.length)click(ts[Math.floor(Math.random()*ts.length)]);
      if(Math.random()<0.3)click(q('.aa-creator [data-cr="dice"]'));
      click(ok); return true;
    }
    function drain(){ let g=0; while((q('.aa-creator')||q('#kartu button[data-i]')) && g++<500){ if(creator())continue; const b=qa('#kartu button[data-i]'); click(b[Math.floor(Math.random()*b.length)]); } }
    let advances=0, livesDone=0, guard=0;
    drain();
    while(livesDone<${lives} && guard++<8000){
      const tabs=qa('#tabs button[data-tab]'); for(const t of tabs){ click(t); drain(); }   // render tiap laci
      const acts=qa('#acts button[data-act]:not([disabled])');
      const n=Math.floor(Math.random()*3);
      for(let i=0;i<n&&acts.length;i++){ click(acts[Math.floor(Math.random()*acts.length)]); drain(); }
      const ov=q('#overlay');
      if(ov && !ov.classList.contains('hidden')){
        const go=q('#overlay [data-go="new"]')||q('#overlay [data-go="lanjut"]')||q('#overlay [data-go="barubaru"]');
        if(go){ click(go); livesDone++; drain(); continue; }
      }
      const nb=q('#nextBtn');
      if(nb && !nb.disabled){ click(nb); advances++; }
      else { drain(); }
    }
    click(q('#caraBtn')); drain();        // uji tombol Cara Main
    if(window.ArsipArt){   // uji kartu hasil untuk dibagikan
      const el=ArsipArt.buildShareCard({game:'${game}',nama:'Uji Coba',age:60,lahir:1980,kota:'Balikpapan',skor:100,julukan:'Uji',
        skorRakyat:1,skorNegara:2,skorAdil:3,skorKarier:4,skorKarya:5,skorCuan:6,skorHarta:7,skorNama:8,achievements:['A','B','C','D','E']});
      if(!el||!el.querySelector('.aa-sh-name'))window.__ERR.push('kartu hasil gagal dibuat'); else el.remove();
      if(!document.querySelector('#aaAvatar .aa-who[src]'))window.__ERR.push('avatar tidak tampil');
    }
    return {advances, livesDone};
  })();`, c.vctx);

  return {game, errors:c.errors, limits:c.limits, advances:stats.advances, lives:stats.livesDone};
}

/* ================= HALAMAN HUB (skrip src + inline dijalankan urut) ================= */
function playHub(file){
  const c=makeCtx(file);
  const scripts=vm.runInContext(`Array.prototype.slice.call(document.querySelectorAll('script')).map(function(s){return {src:s.getAttribute('src'),code:s.textContent};});`, c.vctx);
  for(const s of scripts){
    try{
      if(s.src){ const p=path.join(ROOT,s.src); if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'), c.vctx, {filename:s.src}); }
      else if(s.code&&s.code.trim()){ vm.runInContext(s.code, c.vctx, {filename:file+'#inline'}); }
    }catch(e){ c.errors.push('SCRIPT('+(s.src||'inline')+'): '+(e&&e.message||e)); }
  }
  try{ vm.runInContext(`(function(){
    function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
    function click(el){ if(el)try{ el.dispatchEvent(new window.MouseEvent('click',{bubbles:true,cancelable:true})); }catch(e){ window.__ERR.push('hub click: '+e.message); } }
    qa('#tabs button[data-game]').forEach(click);                 // leaderboard: pindah antar game
    qa('.arsip-card.avail').slice(0,3).forEach(click);            // index: buka detail simulator
    qa('#modalRoot [data-close]').forEach(click);                 // tutup modal
  })();`, c.vctx); }catch(e){ c.errors.push('HUB-INTERAKSI: '+(e&&e.message||e)); }
  return {game:file, errors:c.errors, limits:c.limits};
}

/* ================= JALANKAN ================= */
const GAMES=[['kehidupan','kehidupan.html'],['negara','negara.html'],['hakim','hakim.html'],['it','it.html'],['niaga','niaga.html'],['wni','wni.html']];
const HUBS=['index.html','leaderboard.html','donasi.html'];
let totalErr=0;
console.log('=== MAIN SEMUA GAME (DOM jsdom, klik tombol seperti pemain) ===\n');
for(const [g,shell] of GAMES){
  const r=playGame(g,shell,6); totalErr+=r.errors.length;
  console.log('▶ '+g.toUpperCase().padEnd(10)+' | '+r.lives+' hidup tamat, '+r.advances+' kali maju tahun | '+(r.errors.length?('❌ '+r.errors.length+' ERROR'):'✅ tidak ada error')+(r.limits.length?(' (· '+r.limits.length+' keterbatasan jsdom, diabaikan)'):''));
  if(r.errors.length) r.errors.slice(0,8).forEach(e=>console.log('     - '+e.slice(0,220)));
}
console.log('\n=== HALAMAN HUB (landing, leaderboard, donasi) ===\n');
for(const f of HUBS){
  const r=playHub(f); totalErr+=r.errors.length;
  console.log('▶ '+f.padEnd(18)+' | '+(r.errors.length?('❌ '+r.errors.length+' ERROR'):'✅ tidak ada error')+(r.limits.length?(' (· '+r.limits.length+' keterbatasan jsdom)'):''));
  if(r.errors.length) r.errors.slice(0,8).forEach(e=>console.log('     - '+e.slice(0,220)));
}
console.log('\n=== HASIL: '+(totalErr?('❌ ADA '+totalErr+' ERROR'):'✅ SEMUA BERSIH, TIDAK ADA ERROR')+' ===');
process.exit(totalErr?1:0);
