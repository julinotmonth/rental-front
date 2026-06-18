// src/types/index.ts

export interface User {
  id: string
  nama: string
  username: string
  email: string
  noHp: string
  role: 'user' | 'admin'
  createdAt: string
  password: string
}

export interface Console {
  id: string
  nama: string
  deskripsi: string
  hargaPerJam: number
  stok: number
  status: 'tersedia' | 'maintenance'
  gambar?: string
}

export interface Booking {
  id: string
  noBooking: string
  userId: string
  namaUser: string
  emailUser: string
  noHpUser: string
  consolId: string
  namaConsol: string
  jumlahStick: number
  tanggalBooking: string
  waktuMulai: string
  durasi: number
  totalBiaya: number
  status: 'pending' | 'dikonfirmasi' | 'selesai' | 'dibatalkan'
  buktiPembayaran?: string // base64 data URL
  createdAt: string
}

export interface LaporanSummary {
  totalTransaksi: number
  totalPendapatan: number
  consolTerlaris: string
  rataRataDurasi: number
}

export interface PendapatanData {
  hari: string
  pendapatan: number
}

export type StatusBooking = Booking['status']
export type StatusConsol = Console['status']
