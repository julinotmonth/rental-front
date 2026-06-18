// src/lib/mockData.ts

import { User, Console, Booking, PendapatanData } from '@/types'

export const mockUsers: User[] = [
  {
    id: 'u1',
    nama: 'Budi Santoso',
    username: 'user1',
    email: 'budi@gmail.com',
    noHp: '08111111111',
    role: 'user',
    createdAt: '2024-11-01',
    password: 'user123',
  },
  {
    id: 'u2',
    nama: 'Sari Dewi',
    username: 'sari',
    email: 'sari@gmail.com',
    noHp: '08222222222',
    role: 'user',
    createdAt: '2024-11-05',
    password: 'sari123',
  },
  {
    id: 'adm',
    nama: 'Admin PS Rental',
    username: 'admin',
    email: 'admin@psrentalpro.id',
    noHp: '08000000000',
    role: 'admin',
    createdAt: '2024-01-01',
    password: 'admin123',
  },
]

export const mockConsoles: Console[] = [
  {
    id: 'c1',
    nama: 'PlayStation 4',
    deskripsi: 'Konsol gaming PS4 standar dengan library game yang luas.',
    hargaPerJam: 15000,
    stok: 3,
    status: 'tersedia',
  },
  {
    id: 'c2',
    nama: 'PlayStation 4 Pro',
    deskripsi: 'PS4 Pro dengan performa grafis 4K dan HDR yang memukau.',
    hargaPerJam: 20000,
    stok: 2,
    status: 'tersedia',
  },
  {
    id: 'c3',
    nama: 'PlayStation 5',
    deskripsi: 'Konsol next-gen PS5 dengan SSD ultra-cepat dan DualSense.',
    hargaPerJam: 30000,
    stok: 2,
    status: 'tersedia',
  },
  {
    id: 'c4',
    nama: 'PlayStation 5 Digital',
    deskripsi: 'PS5 Digital Edition tanpa disc drive, harga lebih terjangkau.',
    hargaPerJam: 25000,
    stok: 1,
    status: 'maintenance',
  },
]

export const mockBookings: Booking[] = [
  {
    id: 'b1', noBooking: 'BKA1B2C3D4', userId: 'u1', namaUser: 'Budi Santoso',
    emailUser: 'budi@gmail.com', noHpUser: '08111111111',
    consolId: 'c1', namaConsol: 'PlayStation 4', jumlahStick: 2,
    tanggalBooking: '2024-12-10', waktuMulai: '14:00', durasi: 3,
    totalBiaya: 45000, status: 'selesai', createdAt: '2024-12-10',
  },
  {
    id: 'b2', noBooking: 'BKE5F6G7H8', userId: 'u1', namaUser: 'Budi Santoso',
    emailUser: 'budi@gmail.com', noHpUser: '08111111111',
    consolId: 'c3', namaConsol: 'PlayStation 5', jumlahStick: 2,
    tanggalBooking: '2024-12-12', waktuMulai: '10:00', durasi: 2,
    totalBiaya: 60000, status: 'dikonfirmasi', createdAt: '2024-12-12',
  },
  {
    id: 'b3', noBooking: 'BKI9J0K1L2', userId: 'u1', namaUser: 'Budi Santoso',
    emailUser: 'budi@gmail.com', noHpUser: '08111111111',
    consolId: 'c2', namaConsol: 'PlayStation 4 Pro', jumlahStick: 1,
    tanggalBooking: '2024-12-15', waktuMulai: '16:00', durasi: 4,
    totalBiaya: 80000, status: 'pending', createdAt: '2024-12-15',
  },
  {
    id: 'b4', noBooking: 'BKM3N4O5P6', userId: 'u2', namaUser: 'Sari Dewi',
    emailUser: 'sari@gmail.com', noHpUser: '08222222222',
    consolId: 'c3', namaConsol: 'PlayStation 5', jumlahStick: 2,
    tanggalBooking: '2024-12-13', waktuMulai: '18:00', durasi: 3,
    totalBiaya: 90000, status: 'selesai', createdAt: '2024-12-13',
  },
  {
    id: 'b5', noBooking: 'BKQ7R8S9T0', userId: 'u2', namaUser: 'Sari Dewi',
    emailUser: 'sari@gmail.com', noHpUser: '08222222222',
    consolId: 'c1', namaConsol: 'PlayStation 4', jumlahStick: 2,
    tanggalBooking: '2024-12-14', waktuMulai: '12:00', durasi: 2,
    totalBiaya: 30000, status: 'dibatalkan', createdAt: '2024-12-14',
  },
  {
    id: 'b6', noBooking: 'BKU1V2W3X4', userId: 'u1', namaUser: 'Budi Santoso',
    emailUser: 'budi@gmail.com', noHpUser: '08111111111',
    consolId: 'c3', namaConsol: 'PlayStation 5', jumlahStick: 2,
    tanggalBooking: '2024-12-16', waktuMulai: '09:00', durasi: 5,
    totalBiaya: 150000, status: 'selesai', createdAt: '2024-12-16',
  },
  {
    id: 'b7', noBooking: 'BKY5Z6A7B8', userId: 'u2', namaUser: 'Sari Dewi',
    emailUser: 'sari@gmail.com', noHpUser: '08222222222',
    consolId: 'c2', namaConsol: 'PlayStation 4 Pro', jumlahStick: 1,
    tanggalBooking: '2024-12-17', waktuMulai: '13:00', durasi: 3,
    totalBiaya: 60000, status: 'dikonfirmasi', createdAt: '2024-12-17',
  },
  {
    id: 'b8', noBooking: 'BKC9D0E1F2', userId: 'u1', namaUser: 'Budi Santoso',
    emailUser: 'budi@gmail.com', noHpUser: '08111111111',
    consolId: 'c1', namaConsol: 'PlayStation 4', jumlahStick: 2,
    tanggalBooking: '2024-12-18', waktuMulai: '11:00', durasi: 2,
    totalBiaya: 30000, status: 'selesai', createdAt: '2024-12-18',
  },
  {
    id: 'b9', noBooking: 'BKG3H4I5J6', userId: 'u2', namaUser: 'Sari Dewi',
    emailUser: 'sari@gmail.com', noHpUser: '08222222222',
    consolId: 'c3', namaConsol: 'PlayStation 5', jumlahStick: 2,
    tanggalBooking: '2024-12-19', waktuMulai: '15:00', durasi: 4,
    totalBiaya: 120000, status: 'pending', createdAt: '2024-12-19',
  },
  {
    id: 'b10', noBooking: 'BKK7L8M9N0', userId: 'u1', namaUser: 'Budi Santoso',
    emailUser: 'budi@gmail.com', noHpUser: '08111111111',
    consolId: 'c2', namaConsol: 'PlayStation 4 Pro', jumlahStick: 2,
    tanggalBooking: '2024-12-20', waktuMulai: '20:00', durasi: 3,
    totalBiaya: 60000, status: 'dikonfirmasi', createdAt: '2024-12-20',
  },
]

export const pendapatanMingguIni: PendapatanData[] = [
  { hari: 'Sen', pendapatan: 145000 },
  { hari: 'Sel', pendapatan: 210000 },
  { hari: 'Rab', pendapatan: 180000 },
  { hari: 'Kam', pendapatan: 320000 },
  { hari: 'Jum', pendapatan: 290000 },
  { hari: 'Sab', pendapatan: 410000 },
  { hari: 'Min', pendapatan: 380000 },
]

export const generateNoBooking = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'BK'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
