# Review QA/QC — Arsip Niaga

Gabungan **data** (`node qa/analis.js niaga 200`, lihat `niaga.md`), **bot pengusaha tekun** (`node qa/bot-niaga.js 300 [kotor]`), dan **review logika & realisme** kode `niaga/js/`.
Status: semua temuan bernomor **sudah diperbaiki**, kecuali bagian "Sengaja tidak diubah".

Catatan metode: pemain acak di `analis.js` menjual usahanya sendiri dan mengambil semua deal, jadi hampir selalu berakhir minus. Untuk game strategi itu tidak berarti apa-apa, maka saya menambah bot yang bermain wajar: merawat usaha, menyuntik modal, memeriksa peluang, meminjam secukupnya.

## Angka bot pengusaha tekun, sebelum → sesudah (200–300 karier)
| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Pernah pailit | 80% | 0% |
| Kekayaan puncak median, latar modal kecil (nekat / eks-karyawan / online / warung) | Rp 57–138 jt | Rp 3,6–5,6 M |
| Kekayaan puncak, latar Anak Juragan (median / p90) | Rp 804 M / Rp 12,6 T | Rp 234 M / Rp 1,6 T |
| Kekayaan akhir median, semua latar | −Rp 185 jt | Rp 8,1 M |
| Skala tertinggi yang dicapai | 76% mentok Mikro, 19% langsung Konglomerasi | Kecil 37%, Menengah 42%, Besar 11%, Korporasi 7% |
| Bot kotor: kekayaan puncak p90 / masuk penjara | Rp 23,7 T / 16% | Rp 402 M / 28% |

Tidak ada error dan tidak ada teks rusak, sebelum maupun sesudah.

## P1 — Merusak ekonomi / alur
1. **Usaha kecil tidak bisa menghidupi pemiliknya.** Warung bermodal 30 jt hanya berlaba ±5 jt/tahun, padahal biaya hidup minimal 14 jt. Empat dari lima latar belakang pasti terjerat minus.
   → Pemilik usaha Mikro/Kecil mendapat **hasil kerja sendiri** (±20–35 jt/tahun, ikut kinerja usaha dan kemampuan), terpisah dari laba atas modal.
2. **Skala melipatgandakan laba per rupiah.** Faktor skala 1,0 → 2,75, dan "Naik kelas" bisa ditekan lima kali dalam setahun. Warung bermodal 173 jt bisa berlabel "Korporasi" dan IPO; pemain bermodal besar langsung ke Konglomerasi lalu meledak ke triliunan.
   → Skala mengikuti **besar modal** (Mikro < 150 jt, Kecil < 1 M, Menengah < 10 M, Besar < 60 M, Korporasi < 250 M, Konglomerasi di atasnya). Faktor skala kini 1,0 → 1,4. Suntik modal sekali per usaha per tahun.
3. **Suap tender mencetak uang.** Tanpa perlu punya usaha, bisa diulang tanpa batas dalam setahun, dan seluruh nilai kontrak (4–9× uang suap) langsung jadi kas.
   → Butuh usaha skala Kecil ke atas, sekali setahun, 20% gagal (uang hangus), dan yang masuk adalah laba proyek (1,5–3× suap).
4. **Jalan buntu.** Tanpa usaha dan kas di bawah 30 jt, pemain tidak bisa melakukan apa pun sampai umur 35 (baru boleh tutup berkas).
   → Aksi **Kerja dulu, kumpulkan modal** saat tidak punya usaha.
5. **Due diligence berbiaya flat 2–8 jt per pemeriksaan.** Untuk pemain bermodal 40 jt, memeriksa satu peluang menghabiskan separuh modal; untuk taipan tidak terasa.
   → 0,3–0,8% dari nilai deal.

## P2 — Tidak realistis
6. "Tekan upah" dan "Abaikan dampak lingkungan" bisa diulang tanpa batas dalam setahun, tiap kali mencairkan penghematan setahun penuh. → Sekali setahun.
7. Pinjaman bank minimal 80 jt walau kekayaan bersih hanya sejuta. → Plafon 40% kekayaan bersih.
8. Syarat ekspansi mengikuti skala baru: waralaba & cari investor dari skala Kecil, ekspor dari Menengah, IPO dari Besar, dan satu perusahaan hanya bisa IPO sekali.

## P3 — Keseimbangan
9. "Sultan Niaga" butuh Rp 20 T, tidak terjangkau. → Rp 5 T. Triliuner tetap Rp 1 T (±3% bot mencapainya).

## Sengaja tidak diubah
- Permainan mulai 2008 tetapi sudah ada "Fintech", "Startup", dan "jualan di medsos". Masih bisa diterima untuk 2008–2010.
- Pajak flat 11% dari laba.
- "Penakluk Segala Sektor" (18 sektor sekaligus) praktis mustahil; saya biarkan sebagai tanda jasa pamungkas.
- Jalur kotor masih jauh lebih menguntungkan (median Rp 79 M melawan Rp 8 M) dengan risiko penjara 28%. Itu memang tema gamenya: harta melawan nama baik.
