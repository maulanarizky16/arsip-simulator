# Review QA/QC — Simulator WNI

Gabungan **data** (`node qa/analis.js wni 150`, lihat `wni.md`) dan **review logika & realisme** kode `wni/js/`.
Status: temuan bernomor **sudah diperbaiki**.

WNI adalah game yang paling sedikit masalahnya: berlatar 2026–2028 (tidak ada anakronisme), angka-angkanya (UMR, kos, bunga pinjol 5%/bulan, THR, rumah subsidi) sudah dekat dengan kenyataan, dan tidak ada aksi berpenghasilan yang bisa diulang tanpa batas.

## Angka sebelum → sesudah
| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Lama bertahan median (acak / wajar), dari 36 bulan | 15 / 18 | 16 / 16 |
| Tanda jasa yang tak punya pemicu | 1 (Tolak Serangan Fajar) | 0 |
| Selisih biaya hidup terhadap gaji UMR, Solo ↔ Jakarta | 65% ↔ 110% | ±105% ↔ 106% |

Tidak ada error dan tidak ada teks rusak, sebelum maupun sesudah.

## P2 — Tidak realistis
1. **Gaji sama di semua kota.** "Karyawan Swasta (UMR)" bergaji Rp 5,2 jt baik di Jakarta maupun di Solo dan Yogyakarta, padahal UMR Solo/Yogya kurang dari separuh Jakarta. Akibatnya kota berbiaya murah menjadi mode mudah: di Solo biaya hidup hanya 65% gaji.
   → Tiap kota punya UMR sendiri (Jakarta 5,4 jt, Bekasi 5,7 jt, Bandung 4,2 jt, Semarang 3,5 jt, Yogyakarta 2,7 jt, Solo 2,4 jt, dan seterusnya) dan gaji mengikutinya. PNS, staf titipan, dan kreator tidak ikut UMR; guru honorer hanya sedikit. Indeks biaya hidup Semarang, Yogyakarta, Solo, dan Balikpapan diturunkan supaya biaya hidup lajang tetap sekitar 0,9–1,1× UMR setempat.
2. **Kiriman wajib ke keluarga flat** (generasi sandwich Rp 800 rb, anak petani Rp 300 rb) berapa pun gajinya. → Menyesuaikan upah kota.

## P3 — Konten mati
3. **Tanda jasa "Tolak Serangan Fajar" tidak punya pemicu sama sekali** (tidak ada pemilu nasional di 2026–2028). → Kartu baru **Serangan Fajar** (pemilihan kepala desa / ketua RW): tolak, ambil saja, atau ambil dan menurut.

## Catatan keseimbangan (tidak diubah)
- Pemain acak dan pemain "opsi pertama" rata-rata hanya bertahan 16 dari 36 bulan, kebanyakan karena kewarasan habis. Ini sesuai tema ("semoga beruntung, kamu akan butuh itu"), tetapi saya belum mengukurnya dengan bot yang bermain hemat seperti di Niaga dan Negara. Kalau terasa terlalu berat bagi pemain sungguhan, tuas pertamanya ada di `drift()` (`wni/js/02-state.js`): penurunan kewarasan dasar −2 per bulan.
- Setelah perubahan UMR, pemain acak yang bertahan 36 bulan turun (41 → 12 dari 300 di `tests/test-wni.js`) karena kota murah tidak lagi jadi mode mudah.
- Tanda jasa yang jarang didapat pemain acak: Healing Garis Keras, Jago Tawar, Mandiri Sejati. Semuanya punya pemicu.
