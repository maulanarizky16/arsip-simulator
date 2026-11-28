# Sumber data Simulator Perang

Simulasi ini hipotetis. Angka di `js/01-data.js` adalah **perkiraan dari sumber terbuka, dibulatkan**, bukan angka resmi.

## Kekuatan militer (`js/01-data.js`)

Dicocokkan pada 28 November 2026 dengan empat halaman Wikipedia berbahasa Inggris (yang merangkum IISS *The Military Balance*, SIPRI, dan FAS):

- List of countries by number of military and paramilitary personnel
- List of countries by level of military equipment
- List of countries with highest military expenditures
- List of states with nuclear weapons

| Kolom | Status |
|---|---|
| `aktif`, `cad` (personel aktif & cadangan, ribu) | **Dicocokkan** untuk 25 negara (IISS, sebagian besar edisi 2025). Australia, Brasil, Tiongkok terbaca langsung; sisanya dari ringkasan halaman. |
| `hankam` (anggaran, US$ miliar) | **Dicocokkan** untuk 20 negara (data 2025). Malaysia, Filipina, Thailand, Korea Utara, Mesir tidak ada di daftar 40 besar: masih perkiraan lama. |
| `tank`, `jet`, `heli`, `kapal`, `selam`, `induk` | **Dicocokkan** hanya untuk Australia, Tiongkok, Prancis, Jerman, Brasil, Mesir. Negara lain masih perkiraan dari ingatan penyusun (±2024). |
| `nuklir` (hulu ledak) | AS terbaca langsung (3.700, stok militer). Lainnya perkiraan FAS/SIPRI ±2025. Di dalam game yang berpengaruh hanya ada/tidaknya senjata nuklir. |
| `pop`, `pdb` | Perkiraan ±2024, belum dicocokkan. |
| `tek` (0–100) | **Penilaian kasar game ini**, bukan data. |

Catatan:

- `kapal` = kapal perusak + fregat + korvet. Kapal induk helikopter (mis. Mesir, Jepang, Thailand) tidak dihitung sebagai `induk`.
- Dua angka di halaman sumber sengaja **tidak** dipakai karena tampak tidak wajar: tank Mesir 5.340 (kemungkinan termasuk yang disimpan; dipakai 2.400) dan helikopter serang Australia 45 (dipakai 22).
- Ukraina: halaman sumber tidak mencantumkan cadangan terpisah; game memakai 400 ribu supaya mobilisasi tetap mungkin.
- Halaman peralatan militer bertanda "perlu pemutakhiran" di Wikipedia, dan definisi "pesawat tempur" berbeda antarsumber (ada yang menghitung pesawat latih).

## Peta (`js/01b-peta.js`)

Garis batas negara berasal dari **Natural Earth**, Admin 0 – Countries skala 1:110 juta (naturalearthdata.com, domain publik), diambil dari repositori `nvkelso/natural-earth-vector` (`geojson/ne_110m_admin_0_countries.geojson`).

Diolah menjadi garis SVG: proyeksi equirectangular 3 px per derajat, koordinat dibulatkan, Antartika dibuang, danau dan enklave diabaikan. Singapura terlalu kecil untuk skala ini sehingga hanya berupa titik.

Peta ini skematis untuk permainan dan **tidak menyatakan sikap apa pun** tentang batas wilayah yang disengketakan.

Berkas `01b-peta.js` dibuat otomatis; jangan disunting tangan. Untuk membuat ulang, unduh GeoJSON di atas lalu ubah tiap poligon menjadi perintah path `M x y L x y … Z` dengan `x = (bujur + 180) × 3` dan `y = (90 − lintang) × 3`.
