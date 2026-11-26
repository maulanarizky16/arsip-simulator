'use strict';
/* ============================================================
   FILE INI YANG KAMU EDIT untuk donasi.
   Cukup ubah angka & daftar di bawah — nggak perlu sentuh donasi.html.
   ============================================================ */

/* --- Nomor & identitas penerima donasi --- */
const DONASI_CONFIG = {
  gopayNomor: '0812-XXXX-XXXX',   // GANTI: nomor GoPay kamu
  gopayNama : 'Maulana',          // nama akun GoPay (biar donatur yakin nggak salah transfer)
  qrFile    : 'donasi/gopay-qr.png', // (opsional) taruh gambar QR GoPay di sini. Kalau nggak ada, otomatis disembunyikan.
  waNomor   : '',                 // (opsional) nomor WhatsApp format internasional tanpa "+", contoh: 628123456789. Kosongkan kalau nggak pakai.
  ig        : ''                  // (opsional) handle IG/Threads buat DM request, tanpa @. Kosongkan kalau nggak pakai.
};

/* --- DAFTAR DONATUR (kurasi manual) ---
   Tambahkan HANYA donatur yang sudah konfirmasi transfer.
   Urutan ranking dihitung otomatis dari "total" terbesar.
   Format tiap baris:
     { nama:'Nama/Handle', total: 50000, pesan:'request simulasi (opsional)', tanggal:'2026-06-11' }
*/
const DONATUR = [
  // { nama:'Budi Santoso', total:100000, pesan:'Bikin Simulator Nelayan dong', tanggal:'2026-06-10' },
  // { nama:'@rina',        total:50000,  pesan:'',                              tanggal:'2026-06-09' },
];
