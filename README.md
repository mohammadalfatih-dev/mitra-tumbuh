# Mitra Tumbuh — Aquaculture Management System (MVP)

Mitra Tumbuh adalah software manajemen operasional budidaya perikanan modern yang dirancang untuk membantu pembudidaya ikan mengelola siklus budidaya dari skala rumahan (seperti sistem ember Budikdamber 80 liter) hingga peternak komersial multi-kolam (kolam terpal, kolam beton, dan bioflok).

Aplikasi ini mengedepankan akurasi pencatatan, integritas pergerakan stok tanpa selisih ganda (*zero stock discrepancy*), pemantauan jadwal pakan & estimasi FCR (*Feed Conversion Ratio*), pencatatan mortalitas, kualitas air, jurnal harian, dan pembukuan arus kas (P&L).

---

## 1. Modul & Fitur Utama

1. **Dashboard Operasional**: Ringkasan stok hidup saat ini, tebar awal, total kematian, panen, saldo kas, unit aktif, pengingat pakan berikutnya, dan grafik tren 7 hari.
2. **Manajemen Data Budidaya (Batch)**: Penebaran benih, jenis ikan kustom, umur budidaya, pelacakan stok otomatis berbasis *Event Ledger*.
3. **Manajemen Unit Wadah Budidaya**: Pengelolaan identitas wadah (Ember 80L, kolam terpal, beton, bioflok) beserta kapasitas volume (liter) dan riwayat siklus.
4. **Jadwal Pakan & Estimasi FCR**: Penjadwalan jam pakan, takaran gram/kg, checklist status (selesai, terlewat), serta kalkulasi FCR otomatis terhadap pertambahan biomassa.
5. **Pencatatan Mortalitas**: Log kematian ikan dengan dugaan penyebab (kualitas air, kanibalisme, loncat, jamur, stres cuaca) yang langsung memperbarui stok hidup.
6. **Pembukuan Keuangan**: Arus kas pengeluaran operasional (bibit, pakan, obat/probiotik, peralatan) vs pemasukan penjualan panen.
7. **Pemantauan Kualitas Air**: Pencatatan parameter fisik/kimia (suhu, pH, warna air, aroma, kejernihan, persentase kuras air) dengan rentang aman baku.
8. **Jurnal Budidaya**: Catatan harian aktivitas perawatan, aplikasi probiotik/garam krosok, kondisi cuaca, dan respons perilaku ikan.
9. **Laporan & Ekspor**: Ringkasan performa siklus panen, *Survival Rate* (SR%), dan ekspor file CSV.
10. **Pengaturan & Cloudflare D1 Sync**: Backup/Restore JSON, reset data contoh, dan generator skrip SQL Cloudflare D1.

---

## 2. Struktur Folder Project

```text
mitra-tumbuh/
├── functions/                     # Cloudflare Pages Functions (Serverless API)
│   └── api/
│       └── sync.ts                # Endpoint sinkronisasi data ke Cloudflare D1
├── migrations/                    # File Migrasi SQL untuk Cloudflare D1 (SQLite)
│   └── 0001_initial_schema.sql    # DDL 10 tabel database relasional
├── src/
│   ├── components/                # Komponen UI modular
│   │   ├── Navbar.tsx             # Top bar 3-zone contract
│   │   ├── Sidebar.tsx            # Navigasi 10 modul desktop
│   │   ├── BottomNav.tsx          # Navigasi sentuh mobile-first
│   │   ├── OnboardingModal.tsx    # Wizard setup pertama kali
│   │   └── QuickLogModal.tsx      # Modal cepat catat lapangan
│   ├── services/
│   │   └── storage.ts             # Repository engine, kalkulator FCR & D1 generator
│   ├── types/
│   │   └── index.ts               # Definisi tipe data TypeScript
│   ├── views/                     # Tampilan 10 modul aplikasi
│   │   ├── DashboardView.tsx
│   │   ├── BatchesView.tsx
│   │   ├── UnitsView.tsx
│   │   ├── FeedingView.tsx
│   │   ├── MortalityView.tsx
│   │   ├── FinanceView.tsx
│   │   ├── WaterQualityView.tsx
│   │   ├── JournalView.tsx
│   │   ├── ReportsView.tsx
│   │   └── SettingsView.tsx
│   ├── App.tsx                    # Root routing & state listener
│   ├── index.css                  # Tailwind CSS v4 styling
│   └── main.tsx                   # Entry point aplikasi React
├── index.html                     # HTML5 shell & Google Fonts
├── metadata.json                  # Metadata aplikasi AI Studio
├── package.json                   # Dependensi project
├── tsconfig.json                  # Konfigurasi TypeScript
├── vite.config.ts                 # Konfigurasi bundler Vite
└── README.md                      # Dokumentasi teknis & deployment
```

---

## 3. Cara Menjalankan Project (Lokal / Development)

### Prasyarat:
- Node.js versi 18 atau lebih baru.
- npm atau pnpm.

### Langkah Menjalankan:
```bash
# 1. Clone repository dari GitHub
git clone https://github.com/<username>/mitra-tumbuh.git
cd mitra-tumbuh

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Buka peramban Anda di `http://localhost:3000`.

---

## 4. Cara Membuat Database Cloudflare D1 (SQLite)

Mitra Tumbuh menggunakan **Cloudflare D1**, yaitu database relasional SQLite serverless berlatensi sangat rendah di edge network Cloudflare.

### Langkah-langkah:

1. **Install Cloudflare Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login ke Akun Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Buat Database D1 Baru**:
   ```bash
   wrangler d1 create mitra-tumbuh-db
   ```
   Wrangler akan menampilkan output konfigurasi database ID, misalnya:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "mitra-tumbuh-db"
   database_id = "xxxx-xxxx-xxxx-xxxx"
   ```

4. **Eksekusi File Migrasi SQL Skema**:
   Jalankan file migrasi yang telah disediakan di folder `/migrations`:
   ```bash
   # Eksekusi secara lokal untuk testing
   wrangler d1 execute mitra-tumbuh-db --local --file=./migrations/0001_initial_schema.sql

   # Eksekusi ke database produksi Cloudflare D1 di cloud
   wrangler d1 execute mitra-tumbuh-db --remote --file=./migrations/0001_initial_schema.sql
   ```

---

## 5. Cara Menghubungkan Cloudflare D1 ke Cloudflare Pages

1. Masuk ke **Cloudflare Dashboard** → **Workers & Pages**.
2. Pilih project **Mitra Tumbuh** yang Anda deploy.
3. Buka menu **Settings** → **Functions** → **D1 Database Bindings**.
4. Klik **Add binding**:
   - **Variable name**: `DB`
   - **D1 database**: Pilih `mitra-tumbuh-db`
5. Simpan pengaturan. Fungsi di `/functions/api/sync.ts` sekarang dapat mengakses database secara langsung melalui `context.env.DB`.

---

## 6. Cara Deployment Melalui GitHub dan Cloudflare Pages

### A. Push ke GitHub
```bash
git init
git add .
git commit -m "feat: inisialisasi MVP Mitra Tumbuh Aquaculture Management"
git branch -M main
git remote add origin https://github.com/<username>/mitra-tumbuh.git
git push -u origin main
```

### B. Hubungkan ke Cloudflare Pages
1. Di **Cloudflare Dashboard**, buka **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Pilih repository `mitra-tumbuh` dari akun GitHub Anda.
3. Konfigurasikan Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Klik **Save and Deploy**.
5. Cloudflare Pages akan otomatis mem-build aplikasi dan mengaktifkan deployment di domain `https://mitra-tumbuh.pages.dev`. Setiap Anda melakukan `git push` ke branch `main`, Cloudflare Pages akan otomatis melakukan pembaruan (CI/CD).

---

## 7. Integritas Data & Konsistensi Stok

Mitra Tumbuh menerapkan prinsip akuntansi buku besar (*double-entry event ledger*):
$$\text{Stok Hidup} = \text{Jumlah Awal} + \text{Penambahan} - \text{Kematian} - \text{Panen}$$
- Data penjualan panen tercatat di buku kas keuangan tanpa memotong stok ikan untuk kedua kalinya.
- Transaksi penyimpanan di lingkungan browser tersimpan secara persisten (*Local Storage Engine*) sehingga data tidak hilang saat halaman di-refresh.
- Fitur ekspor SQL di menu **Pengaturan** dapat digunakan kapan saja untuk menyinkronkan data aktif ke Cloudflare D1 secara langsung.
