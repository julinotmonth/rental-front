import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { StatusBooking, StatusConsol } from '@/types'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

export const formatTanggal = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr))
}

export const todayStr = (): string => new Date().toISOString().split('T')[0]

export const statusBookingLabel: Record<StatusBooking, string> = {
  pending: 'Pending', dikonfirmasi: 'Dikonfirmasi', selesai: 'Selesai', dibatalkan: 'Dibatalkan',
}

export const statusBookingColor: Record<StatusBooking, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  dikonfirmasi: 'bg-violet-50 text-violet-700 border-violet-200',
  selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  dibatalkan: 'bg-red-50 text-red-600 border-red-200',
}

export const statusConsolColor: Record<StatusConsol, string> = {
  tersedia: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  maintenance: 'bg-slate-100 text-slate-500 border-slate-200',
}

export const statusConsolLabel: Record<StatusConsol, string> = {
  tersedia: 'Tersedia', maintenance: 'Maintenance',
}
