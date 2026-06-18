// src/store/bookingStore.ts
import { create } from 'zustand'
import { Booking, StatusBooking } from '@/types'
import api from '@/lib/api'

interface CreateBookingData {
  consolId: string
  jumlahStick: number
  tanggalBooking: string
  waktuMulai: string
  durasi: number
  noHpUser: string
  emailUser: string
  buktiPembayaran?: string
}

interface BookingState {
  bookings: Booking[]
  isLoading: boolean
  fetchBookings: () => Promise<void>
  createBooking: (data: CreateBookingData) => Promise<string>
  updateStatus: (id: string, status: StatusBooking) => Promise<void>
  uploadBuktiPembayaran: (id: string, dataUrl: string) => Promise<void>
  getMyBookings: (userId: string) => Booking[]
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  isLoading: false,

  fetchBookings: async () => {
    set({ isLoading: true })
    try {
      const res: any = await api.get('/bookings')
      set({ bookings: res.data, isLoading: false })
    } catch (err) {
      console.error('fetchBookings error:', err)
      set({ isLoading: false })
    }
  },

  createBooking: async (data) => {
    const res: any = await api.post('/bookings', data)
    const newBooking: Booking = res.data
    set((state) => ({ bookings: [newBooking, ...state.bookings] }))
    return newBooking.noBooking
  },

  updateStatus: async (id, status) => {
    const res: any = await api.patch(`/bookings/${id}/status`, { status })
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? res.data : b)),
    }))
  },

  uploadBuktiPembayaran: async (id, dataUrl) => {
    const res: any = await api.patch(`/bookings/${id}/bukti`, { buktiPembayaran: dataUrl })
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? res.data : b)),
    }))
  },

  getMyBookings: (userId) => {
    return get().bookings.filter((b) => b.userId === userId)
  },
}))
