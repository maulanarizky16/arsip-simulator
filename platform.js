/* ARSIP Platform - shared module for all simulators
 * Handles: user handle, leaderboard persistence, share dialog, image capture
 * Storage: localStorage only (v1). Backend-ready: swap storage funcs.
 */
(function(){
  'use strict';

  const STORE_HANDLE = 'arsip_handle_v1';
  const STORE_LB     = 'arsip_leaderboard_v1';
  const STORE_CHOICE = 'arsip_identity_v1';   // '' belum pilih | 'set' pakai handle | 'anon' anonim
  const HOME_URL     = 'index.html';

  // ===== HANDLE =====
  function getHandle(){ try{ return localStorage.getItem(STORE_HANDLE) || ''; }catch(e){ return ''; } }
  function setHandle(h){
    try{
      h = (h||'').toString().trim().replace(/^@+/,'').slice(0,30);
      if(!h){ localStorage.removeItem(STORE_HANDLE); return ''; }
      localStorage.setItem(STORE_HANDLE,h);
      return h;
    }catch(e){ return ''; }
  }
  // ===== IDENTITY CHOICE (sudah pernah memilih handle / anonim?) =====
  function getIdentity(){ try{ return localStorage.getItem(STORE_CHOICE) || ''; }catch(e){ return ''; } }
  function markIdentity(v){ try{ localStorage.setItem(STORE_CHOICE, v); }catch(e){} return v; }

  // ===== LEADERBOARD =====
  function getLB(){
    try{
      const raw = localStorage.getItem(STORE_LB);
      if(!raw) return {kehidupan:[],negara:[],hakim:[],it:[],niaga:[]};
      const obj = JSON.parse(raw);
      return {kehidupan:obj.kehidupan||[],negara:obj.negara||[],hakim:obj.hakim||[],it:obj.it||[],niaga:obj.niaga||[]};
    }catch(e){ return {kehidupan:[],negara:[],hakim:[],it:[],niaga:[]}; }
  }
  function saveLB(lb){ try{ localStorage.setItem(STORE_LB,JSON.stringify(lb)); }catch(e){} }
  function submitEntry(game,entry){
    const lb = getLB();
    if(!lb[game]) lb[game]=[];
    entry.date = new Date().toISOString().slice(0,10);
    entry.ts = Date.now();
    lb[game].push(entry);
    if(game==='kehidupan')      lb[game].sort((a,b)=> (b.skor||0)-(a.skor||0));
    else if(game==='negara')    lb[game].sort((a,b)=> ((b.skorRakyat||0)+(b.skorNegara||0)) - ((a.skorRakyat||0)+(a.skorNegara||0)));
    else if(game==='hakim')     lb[game].sort((a,b)=> ((b.skorAdil||0)+(b.skorKarier||0)) - ((a.skorAdil||0)+(a.skorKarier||0)));
    else if(game==='it')        lb[game].sort((a,b)=> ((b.skorKarya||0)+(b.skorCuan||0)) - ((a.skorKarya||0)+(a.skorCuan||0)));
    else if(game==='niaga')     lb[game].sort((a,b)=> ((b.skorHarta||0)+(b.skorNama||0)) - ((a.skorHarta||0)+(a.skorNama||0)));
    lb[game] = lb[game].slice(0,100);
    saveLB(lb);
    return entry;
  }

  // ===== UI HELPERS =====
  function el(tag,cls,html){ const n=document.createElement(tag); if(cls) n.className=cls; if(html!==undefined) n.innerHTML=html; return n; }
  function ensureStyle(){
    if(document.getElementById('arsip-platform-style')) return;
    const link=document.createElement('link');
    link.id='arsip-platform-style'; link.rel='stylesheet'; link.href='platform.css';
    document.head.appendChild(link);
  }
  function escape(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  // ===== INJECT SHARE BLOCK INTO EXISTING EPILOG =====
  function injectShareBlock(result){
    ensureStyle();
    const epilog = document.getElementById('epilog');
    if(!epilog) return;
    if(epilog.querySelector('.arsip-share-inline')) return;
    const h = getHandle();
    const div = el('div','arsip-share-inline');
    div.innerHTML = ''
      +'<div class="arsip-share-head">'
      +'<h3>BERKAS TERSIMPAN DI PAPAN PERINGKAT</h3>'
      +'<p class="arsip-share-handle">'+(h?'Tersimpan sebagai <b>@'+escape(h)+'</b>':'<i>Belum pakai handle, masih bisa dimasukkan</i>')+'</p>'
      +'</div>'
      +'<div class="arsip-share-actions">'
      +(!h?'<button data-arsip="handle" class="arsip-btn">Masukkan handle</button>':'')
      +'<button data-arsip="capture" class="arsip-btn primary">📸 Simpan / salin gambar</button>'
      +'<button data-arsip="ig" class="arsip-btn">Buka Instagram</button>'
      +'<button data-arsip="threads" class="arsip-btn">Buka Threads</button>'
      +'<button data-arsip="leaderboard" class="arsip-btn ghost">Papan peringkat</button>'
      +'<button data-arsip="home" class="arsip-btn ghost">Beranda</button>'
      +'</div>';
    epilog.appendChild(div);
    div.addEventListener('click', async function(e){
      const b = e.target.closest('button[data-arsip]'); if(!b) return;
      const a = b.dataset.arsip;
      if(a==='handle'){ showHandleDialog(function(){ div.remove(); injectShareBlock(result); }); return; }
      if(a==='capture'){ await captureAndShare(result); return; }
      if(a==='ig'){ openSocial('instagram'); return; }
      if(a==='threads'){ openSocial('threads'); return; }
      if(a==='leaderboard'){ window.location.href='leaderboard.html'; return; }
      if(a==='home'){ window.location.href=HOME_URL; return; }
    });
  }

  function openSocial(net){
    const urls = {instagram:'https://www.instagram.com/', threads:'https://www.threads.net/'};
    window.open(urls[net], '_blank', 'noopener');
    setTimeout(function(){ alert('Tip: gambar yang kamu salin/unduh tadi bisa kamu paste/upload di aplikasi yang baru terbuka.'); },200);
  }

  // ===== IMAGE CAPTURE =====
  function loadHtml2Canvas(){
    return new Promise(function(res,rej){
      if(window.html2canvas) return res(window.html2canvas);
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload=function(){ res(window.html2canvas); };
      s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  async function captureAndShare(result){
    const epilog = document.getElementById('epilog');
    // kalau game menyediakan kartu khusus share (.arsip-sharecard), tangkap itu supaya satu card penuh & rapi
    const target = (epilog && epilog.querySelector('.arsip-sharecard')) || epilog;
    if(!target){ alert('Tidak menemukan area untuk diambil.'); return; }
    const btn = document.querySelector('[data-arsip="capture"]');
    const shareInline = target.querySelector('.arsip-share-inline');
    if(btn){ btn.disabled=true; btn.textContent='⏳ Menyiapkan gambar...'; }
    if(shareInline) shareInline.style.visibility='hidden';
    const gameButtons = target.querySelectorAll('button[data-go]');
    gameButtons.forEach(function(b){ b.style.visibility='hidden'; });
    const wm = el('div','arsip-wm','ARSIP · arsip-simulator');
    wm.style.cssText='text-align:center;margin-top:14px;font:400 11px "Special Elite",monospace;color:#7a7160;letter-spacing:.1em';
    target.appendChild(wm);
    function cleanup(){
      wm.remove();
      if(shareInline) shareInline.style.visibility='';
      gameButtons.forEach(function(b){ b.style.visibility=''; });
    }
    function resetBtn(){ if(btn){ btn.disabled=false; btn.textContent='📸 Simpan / salin gambar'; } }
    try{
      const h2c = await loadHtml2Canvas();
      await new Promise(function(r){ setTimeout(r,180); });
      const canvas = await h2c(target, {backgroundColor:'#ece5d4', scale:2, useCORS:true, logging:false});
      cleanup();
      canvas.toBlob(async function(blob){
        if(!blob){ alert('Gagal membuat gambar.'); resetBtn(); return; }
        try{
          const file = new File([blob],'arsip.png',{type:'image/png'});
          if(navigator.canShare && navigator.canShare({files:[file]})){
            await navigator.share({files:[file], title:'Hasil ARSIP', text:summaryText(result)});
            resetBtn(); return;
          }
        }catch(e){}
        try{
          await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
          alert('Gambar sudah disalin ke clipboard. Paste langsung di app tujuan.');
          resetBtn(); return;
        }catch(e){}
        const url = URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url; a.download='arsip-'+(result.game||'hasil')+'-'+Date.now()+'.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); },3000);
        alert('Gambar disimpan ke folder unduhan.');
        resetBtn();
      }, 'image/png');
    }catch(e){
      console.error(e);
      cleanup();
      alert('Tidak bisa membuat gambar di browser ini. Coba browser lain.');
      resetBtn();
    }
  }
  function summaryText(r){
    if(r.game==='kehidupan') return 'Skor '+r.skor+' · "'+(r.julukan||'-')+'" · ARSIP Kehidupan';
    if(r.game==='hakim') return 'Keadilan '+(r.skorAdil||0)+' / Karier '+(r.skorKarier||0)+' · "'+(r.julukanAdil||'-')+'" · ARSIP Keadilan';
    if(r.game==='it') return 'Karya '+(r.skorKarya||0)+' / Cuan '+(r.skorCuan||0)+' · "'+(r.julukanKarya||'-')+'" · ARSIP Siber';
    if(r.game==='niaga') return 'Harta '+(r.skorHarta||0)+' / Nama '+(r.skorNama||0)+' · "'+(r.julukanHarta||'-')+'" · ARSIP Niaga';
    return 'Rakyat '+(r.skorRakyat||0)+' / Negara '+(r.skorNegara||0)+' · ARSIP Negara';
  }

  // ===== HANDLE DIALOG =====
  function showHandleDialog(onDone, opts){
    ensureStyle();
    opts = opts || {};
    const cur = getHandle();
    const wrap = el('div','arsip-handle-wrap');
    wrap.innerHTML = ''
      +'<div class="arsip-handle">'
      +'<h3>'+(opts.welcome?'SELAMAT DATANG DI ARSIP':'IDENTITAS KAMU')+'</h3>'
      +'<p>'+(opts.welcome
          ? 'Mau jejakmu tercatat dengan nama, atau jalani diam-diam? Isi username IG / Threads kalau ingin skormu muncul di papan peringkat dengan nama yang bisa di-tag, atau main anonim, bebas saja.'
          : 'Username IG / Threads, biar skormu masuk papan peringkat dengan nama yang bisa di-tag. Tanpa @, contoh: <i>maulana</i>. Kosongkan kalau mau anonim.')+'</p>'
      +'<input type="text" id="arsip-handle-input" placeholder="username (tanpa @), boleh dikosongi" maxlength="30" value="'+escape(cur)+'" autocomplete="off">'
      +'<div class="arsip-handle-actions">'
      +'<button data-act="save" class="arsip-btn primary">Simpan & lanjut</button>'
      +'<button data-act="anon" class="arsip-btn ghost">Main anonim</button>'
      +'</div>'
      +'<p class="arsip-handle-privacy"><b>Privasi terjaga.</b> Handle & skormu cuma disimpan di browser ini (localStorage), tanpa akun, tanpa password, tidak dikirim ke server mana pun. Bisa kamu hapus kapan saja dari halaman papan peringkat.</p>'
      +'</div>';
    document.body.appendChild(wrap);
    const input = wrap.querySelector('#arsip-handle-input');
    setTimeout(function(){ input.focus(); input.select(); }, 50);
    function finish(){ wrap.remove(); if(onDone) onDone(getHandle()); }
    wrap.addEventListener('click', function(e){
      const b = e.target.closest('button[data-act]'); if(!b) return;
      if(b.dataset.act==='save'){ const h=setHandle(input.value); markIdentity(h?'set':'anon'); }
      else { setHandle(''); markIdentity('anon'); }
      finish();
    });
    input.addEventListener('keydown', function(e){
      if(e.key==='Enter'){ const h=setHandle(input.value); markIdentity(h?'set':'anon'); finish(); }
      if(e.key==='Escape'){ markIdentity(getHandle()?'set':'anon'); finish(); }
    });
  }

  // ===== PUBLIC: called by each game on end =====
  function handleResult(result){
    ensureStyle();
    const h = getHandle();
    submitEntry(result.game, Object.assign({handle:h||null}, result));
    setTimeout(function(){ injectShareBlock(result); }, 80);
  }

  window.Platform = { getHandle, setHandle, getIdentity, markIdentity, getLB, submitEntry, handleResult, showHandleDialog, captureAndShare };
})();
