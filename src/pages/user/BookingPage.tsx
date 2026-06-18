import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useConsolStore } from '@/store/consolStore'
import { useBookingStore } from '@/store/bookingStore'
import { useAuthStore } from '@/store/authStore'
import { formatRupiah, todayStr } from '@/lib/utils'
import { Spinner, Modal } from '@/components/shared'
import {
  CheckCircle2, Upload, X, AlertCircle, Gamepad2,
  Clock, Calendar, Users, RefreshCw, Info, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

const schema = z.object({
  consolId: z.string().min(1, 'Pilih konsol terlebih dahulu'),
  jumlahStick: z.coerce.number().min(1).max(4),
  tanggalBooking: z.string().min(1, 'Tanggal wajib diisi'),
  waktuMulai: z.string().min(1, 'Waktu wajib diisi'),
  durasi: z.coerce.number().min(1, 'Minimal 1 jam').max(12, 'Maksimal 12 jam'),
  noHpUser: z.string().regex(/^[0-9]{10,13}$/, 'Nomor HP tidak valid'),
  emailUser: z.string().email('Email tidak valid'),
})
type FormData = z.infer<typeof schema>

interface SlotInfo {
  jam: string
  tersedia: boolean
  sisaUnit: number
  totalUnit: number
  lewatWaktu?: boolean
}

interface AvailabilityData {
  stok: number
  slots: SlotInfo[]
  bookedSlots: { waktuMulai: string; durasi: number; waktuSelesai: string; status: string }[]
  jamBuka: string
  jamTutup: string
  serverTime?: string
  isToday?: boolean
}

export default function BookingPage() {
  const { consoles, fetchConsoles } = useConsolStore()
  const { createBooking } = useBookingStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [successModal, setSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState({ noBooking: '', konsol: '', tanggal: '', total: 0 })
  const [buktiFile, setBuktiFile] = useState<File | null>(null)
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [waktuConflict, setWaktuConflict] = useState<string | null>(null)

  useEffect(() => { fetchConsoles() }, [fetchConsoles])

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tanggalBooking: todayStr(), waktuMulai: '10:00', durasi: 2,
      jumlahStick: 2, noHpUser: user?.noHp || '', emailUser: user?.email || ''
    },
  })

  const watchConsolId = watch('consolId')
  const watchDurasi = watch('durasi')
  const watchTgl = watch('tanggalBooking')
  const watchWaktu = watch('waktuMulai')
  const watchStick = watch('jumlahStick')

  const availableConsoles = consoles.filter((c) => c.status === 'tersedia')
  const selectedConsole = consoles.find((c) => c.id === watchConsolId)
  const total = selectedConsole ? selectedConsole.hargaPerJam * (watchDurasi || 0) : 0

  // Fetch availability whenever consolId or tanggal changes
  const fetchAvailability = useCallback(async (consolId: string, tanggal: string) => {
    if (!consolId || !tanggal) return
    setLoadingAvail(true)
    setAvailability(null)
    try {
      const res: any = await api.get(
        `/bookings/availability?consolId=${consolId}&tanggal=${tanggal}`,
        false
      )
      setAvailability(res.data)
    } catch {
      // silent
    } finally {
      setLoadingAvail(false)
    }
  }, [])

  useEffect(() => {
    if (watchConsolId && watchTgl) {
      fetchAvailability(watchConsolId, watchTgl)
    } else {
      setAvailability(null)
    }
    setWaktuConflict(null)
  }, [watchConsolId, watchTgl, fetchAvailability])

  // Re-validate waktu ketika durasi atau waktu berubah
  useEffect(() => {
    if (!availability || !watchWaktu || !watchDurasi) {
      setWaktuConflict(null)
      return
    }
    const [h, m] = watchWaktu.split(':').map(Number)
    const mulai = h * 60 + m
    const selesai = mulai + (watchDurasi || 0) * 60
    const selesaiH = Math.floor(selesai / 60)
    const selesaiM = selesai % 60
    const waktuSelesaiStr = `${selesaiH.toString().padStart(2, '0')}:${selesaiM.toString().padStart(2, '0')}`

    // Cek jam buka & tutup operasional
    const [bukaH, bukaM] = (availability.jamBuka || '08:00').split(':').map(Number)
    const [tutupH, tutupM] = (availability.jamTutup || '22:00').split(':').map(Number)
    const bukaMin = bukaH * 60 + bukaM
    const tutupMin = tutupH * 60 + tutupM

    if (mulai < bukaMin) {
      setWaktuConflict(`Waktu booking tidak boleh sebelum jam buka (${availability.jamBuka}).`)
      return
    }
    if (selesai > tutupMin) {
      setWaktuConflict(`Sesi ${watchWaktu}–${waktuSelesaiStr} melewati jam tutup (${availability.jamTutup}). Kurangi durasi atau pilih waktu mulai lebih awal.`)
      return
    }

    // Cek apakah waktu mulai sudah lewat (hanya relevan jika tanggal booking = hari ini)
    if (availability.isToday && availability.serverTime) {
      const serverNow = new Date(availability.serverTime)
      const nowMin = serverNow.getHours() * 60 + serverNow.getMinutes()
      if (mulai < nowMin) {
        setWaktuConflict(`Jam ${watchWaktu} sudah lewat. Silakan pilih waktu yang masih akan datang.`)
        return
      }
    }

    // Cek apakah ada slot dalam rentang ini yang habis
    let konflikt = false
    for (let t = mulai; t < selesai; t += 60) {
      const slotJam = Math.floor(t / 60)
      const slotKey = slotJam.toString().padStart(2, '0') + ':00'
      const slot = availability.slots.find(s => s.jam === slotKey)
      if (slot && !slot.tersedia) {
        konflikt = true
        break
      }
    }

    if (konflikt) {
      setWaktuConflict(`Waktu ${watchWaktu}–${waktuSelesaiStr} tidak tersedia. Semua unit konsol sudah terpesan pada jam tersebut.`)
    } else {
      setWaktuConflict(null)
    }
  }, [watchWaktu, watchDurasi, availability])

  // Slot warna
  const getSlotStyle = (slot: SlotInfo, isSelected: boolean) => {
    if (isSelected) return { bg: '#EDE9FE', border: '#7C3AED', text: '#5B21B6', dot: '#7C3AED' }
    if (slot.lewatWaktu) return { bg: '#F4F4F5', border: '#E4E4E7', text: '#9CA3AF', dot: '#A1A1AA' }
    if (!slot.tersedia) return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', dot: '#DC2626' }
    if (slot.sisaUnit === 1) return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', dot: '#F59E0B' }
    return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669', dot: '#10B981' }
  }

  const isSlotInRange = (slotJam: string, waktuMulai: string, durasi: number) => {
    if (!waktuMulai || !durasi) return false
    const [sh] = slotJam.split(':').map(Number)
    const [mh, mm] = waktuMulai.split(':').map(Number)
    const mulaiH = mh + mm / 60
    return sh >= mulaiH && sh < mulaiH + durasi
  }

  const handleSlotClick = (slot: SlotInfo) => {
    if (!slot.tersedia) return
    setValue('waktuMulai', slot.jam)

    // Clamp durasi yang sudah dipilih agar tidak melewati jam tutup dari slot baru ini
    const jamTutupStr = availability?.jamTutup || '22:00'
    const [sh] = slot.jam.split(':').map(Number)
    const [tutupH, tutupM] = jamTutupStr.split(':').map(Number)
    const sisaJam = Math.max(1, Math.min(12, Math.floor(((tutupH * 60 + tutupM) - sh * 60) / 60)))
    if ((watchDurasi || 0) > sisaJam) {
      setValue('durasi', sisaJam)
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Maksimal 5MB'); return }
    setBuktiFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setBuktiPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormData) => {
    if (waktuConflict) {
      toast.error('Pilih waktu yang tersedia terlebih dahulu')
      return
    }
    if (!user || !selectedConsole) return
    try {
      const noBooking = await createBooking({
        consolId: data.consolId, jumlahStick: data.jumlahStick,
        tanggalBooking: data.tanggalBooking, waktuMulai: data.waktuMulai,
        durasi: data.durasi, noHpUser: data.noHpUser, emailUser: data.emailUser,
        buktiPembayaran: buktiPreview || undefined,
      })
      setSuccessData({ noBooking, konsol: selectedConsole.nama, tanggal: data.tanggalBooking, total })
      setSuccessModal(true)
      // Refresh availability setelah booking berhasil
      fetchAvailability(data.consolId, data.tanggalBooking)
    } catch (err: any) {
      if (err.message?.includes('tidak tersedia')) {
        toast.error(err.message)
        fetchAvailability(data.consolId, data.tanggalBooking)
      } else {
        toast.error('Booking gagal, coba lagi')
      }
    }
  }

  const SectionCard = ({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) => (
    <div className="card">
      <div className="flex items-center justify-between mb-5 pb-3" style={{ borderBottom: '1.5px solid #EAE6F8' }}>
        <p className="text-sm font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>{title}</p>
        {badge}
      </div>
      {children}
    </div>
  )

  const waktuSelesai = (() => {
    if (!watchWaktu || !watchDurasi) return null
    const [h, m] = watchWaktu.split(':').map(Number)
    const selesai = h * 60 + m + (watchDurasi || 0) * 60
    return `${Math.floor(selesai / 60).toString().padStart(2, '0')}:${(selesai % 60).toString().padStart(2, '0')}`
  })()

  // Durasi maksimum yang masih masuk dalam jam operasional, dihitung dari waktu mulai
  const maxDurasi = (() => {
    const jamTutupStr = availability?.jamTutup || '22:00'
    if (!watchWaktu) return 12
    const [h, m] = watchWaktu.split(':').map(Number)
    const [tutupH, tutupM] = jamTutupStr.split(':').map(Number)
    const sisaMenit = (tutupH * 60 + tutupM) - (h * 60 + m)
    const sisaJam = Math.floor(sisaMenit / 60)
    return Math.max(1, Math.min(12, sisaJam))
  })()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Form Booking</h1>
        <p className="text-sm mt-1" style={{ color: '#9590B4' }}>Isi detail booking konsol PlayStation Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-[1fr_290px] gap-5 items-start">
          <div className="flex flex-col gap-4">

            {/* ── Detail Booking ── */}
            <SectionCard title="Detail Booking">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="field-label">Pilih Konsol</label>
                  <select {...register('consolId')} className="form-input">
                    <option value="">-- Pilih konsol --</option>
                    {availableConsoles.map((c) => (
                      <option key={c.id} value={c.id}>{c.nama} — {formatRupiah(c.hargaPerJam)}/jam</option>
                    ))}
                  </select>
                  {errors.consolId && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.consolId.message}</p>}
                </div>

                <div>
                  <label className="field-label">Jumlah Stick Controller</label>
                  <select {...register('jumlahStick')} className="form-input">
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n} Stick</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Tanggal Booking</label>
                    <input {...register('tanggalBooking')} type="date" min={todayStr()} className="form-input" />
                    {errors.tanggalBooking && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.tanggalBooking.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Durasi (jam)</label>
                    <input {...register('durasi')} type="number" min={1} max={maxDurasi} className="form-input" />
                    {errors.durasi && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.durasi.message}</p>}
                  </div>
                </div>

                {/* Waktu Mulai input */}
                <div>
                  <label className="field-label">Waktu Mulai</label>
                  <input {...register('waktuMulai')} type="time"
                    min={availability?.jamBuka || '08:00'} max={availability?.jamTutup || '22:00'}
                    className={`form-input ${waktuConflict ? 'border-red-400' : ''}`}
                    style={waktuConflict ? { borderColor: '#F87171', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' } : {}}
                  />
                  {waktuConflict && (
                    <div className="flex items-start gap-2 mt-2 rounded-lg px-3 py-2" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <XCircle size={13} style={{ color: '#DC2626' }} className="mt-0.5 shrink-0" />
                      <p className="text-xs font-medium" style={{ color: '#DC2626' }}>{waktuConflict}</p>
                    </div>
                  )}
                  {!waktuConflict && watchWaktu && waktuSelesai && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#7C3AED' }}>
                      Sesi: {watchWaktu} — {waktuSelesai} ({watchDurasi} jam)
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ── Ketersediaan Jadwal ── */}
            {watchConsolId && watchTgl && (
              <SectionCard
                title="Ketersediaan Jadwal"
                badge={
                  <button type="button" onClick={() => fetchAvailability(watchConsolId, watchTgl)}
                    className="btn-ghost text-xs px-2 py-1 flex items-center gap-1">
                    <RefreshCw size={11} className={loadingAvail ? 'animate-spin' : ''} /> Refresh
                  </button>
                }
              >
                {loadingAvail ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Spinner />
                    <span className="text-sm" style={{ color: '#9590B4' }}>Mengecek ketersediaan...</span>
                  </div>
                ) : availability ? (
                  <>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {[
                        { color: '#10B981', label: 'Tersedia' },
                        { color: '#F59E0B', label: 'Sisa 1 unit' },
                        { color: '#DC2626', label: 'Penuh' },
                        { color: '#7C3AED', label: 'Dipilih' },
                        { color: '#A1A1AA', label: 'Sudah lewat' },
                      ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                          <span className="text-xs font-medium" style={{ color: '#6B6590' }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Slot grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {availability.slots.map((slot) => {
                        const isSelected = isSlotInRange(slot.jam, watchWaktu, watchDurasi || 0)
                        const s = getSlotStyle(slot, isSelected)
                        return (
                          <button
                            key={slot.jam}
                            type="button"
                            onClick={() => handleSlotClick(slot)}
                            disabled={!slot.tersedia}
                            className="rounded-xl py-2 px-1 text-center transition-all duration-150 relative"
                            style={{
                              background: s.bg,
                              border: `1.5px solid ${s.border}`,
                              cursor: slot.tersedia ? 'pointer' : 'not-allowed',
                              transform: isSelected ? 'scale(1.04)' : undefined,
                            }}
                            title={
                              slot.lewatWaktu
                                ? `${slot.jam} — Sudah lewat`
                                : slot.tersedia
                                  ? `${slot.jam} — ${slot.sisaUnit}/${slot.totalUnit} unit tersedia`
                                  : `${slot.jam} — Penuh (${slot.totalUnit}/${slot.totalUnit} terpakai)`
                            }
                          >
                            <div className="w-1.5 h-1.5 rounded-full mx-auto mb-1" style={{ background: s.dot }} />
                            <p className="text-xs font-bold leading-none" style={{ color: s.text }}>{slot.jam}</p>
                            <p className="text-[9px] mt-0.5 font-medium" style={{ color: s.text, opacity: 0.75 }}>
                              {slot.lewatWaktu ? 'Lewat' : slot.tersedia ? `${slot.sisaUnit}/${slot.totalUnit}` : 'Penuh'}
                            </p>
                          </button>
                        )
                      })}
                    </div>

                    {/* Info stok */}
                    <div className="flex items-center gap-2 mt-4 rounded-xl px-3 py-2.5" style={{ background: '#F5F3FF' }}>
                      <Info size={13} style={{ color: '#7C3AED' }} className="shrink-0" />
                      <p className="text-xs" style={{ color: '#5B5486' }}>
                        Konsol ini memiliki <strong>{availability.stok} unit</strong>.
                        Klik slot waktu untuk memilih. Angka menunjukkan sisa unit tersedia per jam.
                      </p>
                    </div>

                    {/* Booking aktif hari ini */}
                    {availability.bookedSlots.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#A8A0C4' }}>
                          Booking Aktif Hari Ini
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {availability.bookedSlots.map((b, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2"
                              style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                              <Clock size={12} style={{ color: '#D97706' }} />
                              <span className="text-xs font-semibold" style={{ color: '#92400E' }}>
                                {b.waktuMulai} — {b.waktuSelesai}
                              </span>
                              <span className="text-xs ml-auto" style={{ color: '#B45309' }}>
                                {b.durasi} jam · {b.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm" style={{ color: '#A8A0C4' }}>Gagal memuat jadwal. Coba refresh.</p>
                  </div>
                )}
              </SectionCard>
            )}

            {/* ── Info Pelanggan ── */}
            <SectionCard title="Informasi Pelanggan">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="field-label">Nama Lengkap</label>
                  <input value={user?.nama || ''} readOnly className="form-input cursor-default" style={{ background: '#F5F3FF' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Nomor HP</label>
                    <input {...register('noHpUser')} type="tel" placeholder="08123456789" className="form-input" />
                    {errors.noHpUser && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.noHpUser.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <input {...register('emailUser')} type="email" placeholder="email@contoh.com" className="form-input" />
                    {errors.emailUser && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.emailUser.message}</p>}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Bukti Pembayaran ── */}
            <SectionCard title="Bukti Pembayaran"
              badge={<span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F5F3FF', color: '#9590B4', border: '1px solid #EAE6F8' }}>Opsional</span>}>
              <div className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 mb-4" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                <AlertCircle size={14} style={{ color: '#4F46E5' }} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: '#3730A3' }}>
                  Upload bukti transfer agar admin bisa konfirmasi lebih cepat. Bisa juga bayar langsung di tempat.
                </p>
              </div>
              {!buktiPreview ? (
                <div
                  className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                  style={{ background: isDragging ? '#F0EDFB' : '#F8F7FF', border: `2px dashed ${isDragging ? '#7C3AED' : '#D4CEEE'}` }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                  onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: isDragging ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#EDE9FE' }}>
                    <Upload size={20} style={{ color: isDragging ? 'white' : '#7C3AED' }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#4B4580' }}>Klik atau seret file ke sini</p>
                  <p className="text-xs" style={{ color: '#A8A0C4' }}>PNG, JPG · Maks. 5MB</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #EAE6F8' }}>
                  <img src={buktiPreview} alt="Bukti" className="w-full max-h-56 object-contain" style={{ background: '#F5F3FF' }} />
                  <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: 'white', borderTop: '1px solid #EAE6F8' }}>
                    <CheckCircle2 size={14} style={{ color: '#059669' }} />
                    <span className="text-xs font-semibold flex-1 truncate">{buktiFile?.name}</span>
                    <button type="button" onClick={() => { setBuktiFile(null); setBuktiPreview(null) }}
                      className="p-1 rounded-lg hover:bg-red-50" style={{ color: '#DC2626' }}><X size={13} /></button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Ringkasan ── */}
          <div className="sticky top-[80px] rounded-2xl overflow-hidden" style={{ border: '1.5px solid #EAE6F8', boxShadow: '0 8px 32px rgba(124,58,237,0.1)' }}>
            <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              <p className="text-sm font-bold text-white/90">Ringkasan Pesanan</p>
            </div>
            <div className="bg-white p-5">
              <div className="flex flex-col gap-3 mb-4">
                {[
                  [<Gamepad2 size={13} />, 'Konsol', selectedConsole?.nama || '—'],
                  [<span className="text-xs">Rp</span>, 'Harga/jam', selectedConsole ? formatRupiah(selectedConsole.hargaPerJam) : '—'],
                  [<Calendar size={13} />, 'Tanggal', watchTgl || '—'],
                  [<Clock size={13} />, 'Sesi', watchWaktu && waktuSelesai ? `${watchWaktu} – ${waktuSelesai}` : '—'],
                  [<Clock size={13} />, 'Durasi', watchDurasi ? watchDurasi + ' jam' : '—'],
                  [<Users size={13} />, 'Stick', watchStick ? watchStick + ' stick' : '—'],
                ].map(([icon, label, val]) => (
                  <div key={label as string} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: '#9590B4' }}>
                      <span style={{ color: '#C4B5FD' }}>{icon}</span>{label as string}
                    </span>
                    <span className="font-semibold text-xs text-right max-w-[130px] truncate" style={{ color: '#1A1535' }}>{val as string}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: '#9590B4' }}>Bukti Bayar</span>
                  <span className="font-bold" style={{ color: buktiPreview ? '#059669' : '#C4B5FD' }}>
                    {buktiPreview ? '✓ Terupload' : 'Belum upload'}
                  </span>
                </div>
              </div>

              {/* Availability indicator di summary */}
              {waktuConflict ? (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
                  <XCircle size={14} style={{ color: '#DC2626' }} />
                  <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>Waktu tidak tersedia</p>
                </div>
              ) : watchWaktu && availability && !loadingAvail && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4" style={{ background: '#ECFDF5', border: '1.5px solid #A7F3D0' }}>
                  <CheckCircle2 size={14} style={{ color: '#059669' }} />
                  <p className="text-xs font-semibold" style={{ color: '#059669' }}>Waktu tersedia</p>
                </div>
              )}

              <div className="flex items-center justify-between py-3 mb-4" style={{ borderTop: '1.5px solid #EAE6F8', borderBottom: '1.5px solid #EAE6F8' }}>
                <span className="text-sm font-bold" style={{ color: '#1A1535' }}>Total</span>
                <span className="text-xl font-bold text-gradient">{total ? formatRupiah(total) : '—'}</span>
              </div>

              <button type="submit" disabled={isSubmitting || !!waktuConflict} className="btn-primary w-full py-3 text-sm">
                {isSubmitting ? <><Spinner className="text-white/70" />Memproses...</> : 'Konfirmasi Booking'}
              </button>
              <p className="text-center text-xs mt-3" style={{ color: '#A8A0C4' }}>
                {buktiPreview ? 'Bukti akan dikirim ke admin' : 'Pembayaran bisa di tempat'}
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      <Modal open={successModal} onClose={() => { setSuccessModal(false); navigate('/riwayat') }} size="sm">
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
            <CheckCircle2 size={30} className="text-white" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Booking Berhasil!</h2>
          <p className="text-sm mt-1" style={{ color: '#9590B4' }}>
            {buktiPreview ? 'Bukti pembayaran terkirim. Admin akan segera konfirmasi.' : 'Silakan datang sesuai jadwal.'}
          </p>
        </div>
        <div className="rounded-xl p-4 mb-5 flex flex-col gap-2.5" style={{ background: '#F5F3FF' }}>
          {[['No. Booking', successData.noBooking], ['Konsol', successData.konsol],
            ['Tanggal', successData.tanggal], ['Total', formatRupiah(successData.total)]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span style={{ color: '#9590B4' }}>{l}</span>
              <span className={`font-bold ${l === 'No. Booking' ? 'font-mono text-xs text-gradient' : ''}`}
                style={l !== 'No. Booking' ? { color: '#1A1535' } : {}}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccessModal(false); navigate('/riwayat') }} className="btn-primary w-full py-3">
          Lihat Riwayat
        </button>
      </Modal>
    </div>
  )
}