# ARSIP — Koleksi Simulator (v1)

Situs statis. Tinggal upload folder ini ke VPS, serve dengan nginx/Apache/Caddy/any static server. Nggak butuh database atau backend.

## Struktur file

```
arsip/
├── index.html          # Landing page (cards + leaderboard preview)
├── leaderboard.html    # Tabel papan peringkat per game
├── donasi.html         # Halaman donasi/sedekah
├── kehidupan.html      # Simulator Kehidupan      (+ folder kehidupan/)
├── negara.html         # Simulator Karier Politik (+ folder negara/)
├── hakim.html          # Simulator Hakim          (+ folder hakim/)
├── it.html             # Simulator Karier IT      (+ folder it/)
├── niaga.html          # Simulator Pengusaha      (+ folder niaga/)
├── platform.js         # Modul bersama (identitas, leaderboard, share, capture)
├── platform.css        # Style bersama (modal, dialog, share block)
├── donasi/data.js      # Config GoPay + daftar donatur
└── README.md           # File ini
```

**5 game**, tiap game = 1 shell HTML tipis + folder modul JS/CSS (`<nama>/js/00-core.js` … `09-boot.js`). Pure static, tanpa build step. html2canvas dimuat dari CDN saat dibutuhkan. Untuk detail arsitektur & cara nambah game, lihat `ARSIP_Project_Handoff.md`.

## Flow pemakai

1. **Landing** (`index.html`) — list card simulator yang tersedia + 3 skor teratas
2. **Lihat Detail** — modal dengan deskripsi panjang yang persuasif + fitur + tombol "Mulai Simulasi"
3. **Handle dialog** (kalau belum punya) — input username IG/Threads, opsional
4. **Game** (`kehidupan.html` / `negara.html`) — game jalan seperti biasa
5. **Akhir game** — `Platform.handleResult()` dipanggil otomatis:
   - Catat skor ke `localStorage` (leaderboard)
   - Inject blok share buttons ke epilog yang sudah tampil
6. **Share** — tombol `📸 Simpan / salin gambar` pakai html2canvas (dimuat lazy dari CDN) untuk:
   - Web Share API (HP modern) — langsung buka share sheet bawaan
   - Clipboard API — copy gambar ke clipboard (Chrome/Edge desktop)
   - Download fallback (browser lain)
7. **Leaderboard** (`leaderboard.html`) — tabel top 100 per game, tab antar game, export JSON, hapus data

## Deploy ke VPS

### Opsi 1: nginx
Letakkan folder di `/var/www/arsip/`, lalu config nginx:

```nginx
server {
    listen 80;
    server_name arsip.example.com;
    root /var/www/arsip;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(html|css|js)$ {
        add_header Cache-Control "public, max-age=3600";
    }
}
```

Reload: `sudo nginx -t && sudo systemctl reload nginx`. Untuk HTTPS pakai Certbot/Let's Encrypt seperti biasa.

### Opsi 2: Caddy (paling simpel)
```caddy
arsip.example.com {
    root * /var/www/arsip
    file_server
}
```
HTTPS otomatis.

### Opsi 3: Quick test lokal
```bash
cd arsip/
python3 -m http.server 8080
# Buka http://localhost:8080
```

## Catatan penting

- **localStorage only di v1.** Papan peringkat tersimpan di browser tiap user — bukan global. Bagus untuk privasi, jelek untuk leaderboard "publik". Lihat bagian Roadmap untuk migrasi backend.
- **Image capture pakai html2canvas dari CDN** (cdnjs.cloudflare.com). Kalau VPS dipasang air-gap, pindahkan ke local file dan ganti URL di `platform.js`.
- **CORS**: karena semua serve dari same-origin, gak ada masalah.
- **Mobile-friendly**: semua sudah responsive (CSS breakpoint ≤640px).

## Menambah simulator baru

1. Buat file `[nama].html` baru dengan struktur mirip kehidupan.html / negara.html
2. Pastikan ada element `<div id="epilog">` di mana hasil akhir muncul
3. Di akhir fungsi showEpilog game, panggil:
   ```js
   if(window.Platform){
     Platform.handleResult({
       game: '[nama]',  // unique key
       nama: P.nama,
       // ...field hasil game (skor, dll)
     });
   }
   ```
4. Pasang `<script src="platform.js"></script>` sebelum `</body>`
5. Tambahkan entry baru ke array `SIM` di `index.html`
6. Tambahkan handler render di `leaderboard.html` untuk game baru
7. Update sort logic di `platform.js` `submitEntry()` untuk game baru

## Roadmap (kalau mau lanjut)

- **Backend leaderboard global**: ganti `localStorage.setItem(STORE_LB,...)` di `platform.js` jadi `fetch('/api/score', {method:'POST', ...})`. Backend Node.js + SQLite cukup. Tambah validasi anti-tampering (server-side score recalc, atau JWT sesi).
- **User profile pages**: `/u/maulana` → tampilkan semua skor user.
- **Daily challenge**: seed RNG harian, semua orang main skenario sama, leaderboard harian.
- **Auth**: kalau mau cegah pemalsuan handle, integrasi OAuth IG/Threads.

## Lisensi & kredit

Saya kasih ke kamu untuk dipakai sendiri. Tweak sesuka hati.

— Disusun di Balikpapan, untuk Maulana.

## Aset visual

Ikon & karakter berwarna di `assets/fluent/` berasal dari [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (versi 3D, warna kulit *Medium*), lisensi MIT — lihat `assets/fluent/LICENSE`. File asli 256px diperkecil jadi WebP 192px (total ±620 KB).

- `assets/art.js` — modul bersama: thumbnail beranda, pasfoto karakter di kartu identitas (berubah sesuai umur, profesi/jabatan, dan suasana hati), ikon tab/stat/judul kartu, potret di layar akhir. Tiap game cukup memanggil `ArsipArt.update('<game>', P)` di akhir `render()`.
- `assets/art.css` — gaya untuk semua elemen di atas.
- `assets/theme.css` — tema kasual cerah (kartu krem membulat, tombol tebal hijau/kuning, font Baloo 2 + Nunito, latar langit-rumput). Dimuat paling akhir sebagai lapisan penimpa; hapus `<link>`-nya di tiap HTML untuk kembali ke tema arsip lama.
- Pop-up keputusan otomatis menampilkan karakter/ikon sesuai kata kunci judul & isi kejadian (`KARTU_RULES` di `art.js`), dan tiap tombol aksi dapat ikon (`ACT_RULES`).

Untuk menambah aset baru: ambil PNG dari repo Fluent Emoji, perkecil ke WebP, simpan sebagai `assets/fluent/<nama-kebab>.webp`, lalu rujuk lewat `ArsipArt.img('<nama-kebab>')`.
