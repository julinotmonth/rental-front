# PS Rental Pro — Full Stack App

Aplikasi manajemen rental PlayStation berbasis **React + Express.js + PostgreSQL**.

## Struktur Proyek

```
ps-rental-pro/
├── ps-rental-backend/    ← Express.js + TypeScript + PostgreSQL
└── ps-rental-frontend/   ← React + Vite + TypeScript + Tailwind
```

## Prasyarat

- Node.js v18+  |  PostgreSQL v14+  |  npm v9+

## 1. Setup Database

```sql
CREATE DATABASE ps_rental_pro;
```

## 2. Setup Backend

```bash
cd ps-rental-backend
npm install
```

Edit `.env` sesuai PostgreSQL lokal Anda (minimal ubah `DB_PASSWORD`).

```bash
npm run db:migrate   # buat tabel
npm run db:seed      # isi data awal
npm run dev          # jalankan server → http://localhost:5000
```

## 3. Setup Frontend

```bash
cd ps-rental-frontend
npm install
npm run dev          # → http://localhost:5173
```

## Akun Demo

| Role  | Username | Password  |
|-------|----------|-----------|
| User  | user1    | user123   |
| Admin | admin    | admin123  |

## API Endpoints

| Method | Endpoint                         | Deskripsi                    | Auth  |
|--------|----------------------------------|------------------------------|-------|
| POST   | /api/auth/register               | Daftar akun baru             | -     |
| POST   | /api/auth/login                  | Login                        | -     |
| GET    | /api/auth/me                     | Data user aktif              | JWT   |
| GET    | /api/consoles                    | List semua konsol            | -     |
| POST   | /api/consoles                    | Tambah konsol                | Admin |
| PUT    | /api/consoles/:id                | Update konsol                | Admin |
| DELETE | /api/consoles/:id                | Hapus konsol                 | Admin |
| GET    | /api/bookings                    | List booking (scope by role) | JWT   |
| POST   | /api/bookings                    | Buat booking baru            | User  |
| PATCH  | /api/bookings/:id/status         | Update status                | Admin |
| PATCH  | /api/bookings/:id/bukti          | Upload bukti pembayaran      | User  |
| GET    | /api/bookings/dashboard/stats    | Statistik dashboard          | Admin |
| GET    | /api/bookings/laporan/summary    | Ringkasan laporan            | Admin |
