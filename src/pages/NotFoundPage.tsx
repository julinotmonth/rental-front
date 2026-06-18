// src/pages/NotFoundPage.tsx

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl mb-4 opacity-30">🔍</p>
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">404 — Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 mb-6 max-w-sm">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <Link to="/" className="btn-primary px-5 py-2.5">Kembali ke Beranda</Link>
    </div>
  )
}
