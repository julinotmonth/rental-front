import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useConsolStore } from '@/store/consolStore'
import { useBookingStore } from '@/store/bookingStore'
import { useAuthStore } from '@/store/authStore'
import { formatRupiah, todayStr } from '@/lib/utils'
import { Spinner, Modal } from '@/components/shared'
import { CheckCircle2, Upload, X, ImageIcon, AlertCircle, Gamepad2, Clock, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

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

  useEffect(() => { fetchConsoles() }, [fetchConsoles])

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tanggalBooking: todayStr(), waktuMulai: '10:00', durasi: 2, jumlahStick: 2, noHpUser: user?.noHp || '', emailUser: user?.email || '' },
  })

  const watchConsolId = watch('consolId'); const watchDurasi = watch('durasi')
  const watchTgl = watch('tanggalBooking'); const watchWaktu = watch('waktuMulai'); const watchStick = watch('jumlahStick')

  const availableConsoles = consoles.filter((c) => c.status === 'tersedia')
  const selectedConsole = consoles.find((c) => c.id === watchConsolId)
  const total = selectedConsole ? selectedConsole.hargaPerJam * (watchDurasi || 0) : 0

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Maksimal 5MB'); return }
    setBuktiFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setBuktiPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: FormData) => {
    if (!user || !selectedConsole) return
    try {
      const noBooking = await createBooking({
        consolId: data.consolId,
        jumlahStick: data.jumlahStick,
        tanggalBooking: data.tanggalBooking,
        waktuMulai: data.waktuMulai,
        durasi: data.durasi,
        noHpUser: data.noHpUser,
        emailUser: data.emailUser,
        buktiPembayaran: buktiPreview || undefined,
      })
      setSuccessData({ noBooking, konsol: selectedConsole.nama, tanggal: data.tanggalBooking, total })
      setSuccessModal(true)
    } catch { toast.error('Booking gagal, coba lagi') }
  }

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card">
      <p className="text-sm font-bold mb-5 pb-3" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif', borderBottom: '1.5px solid #EAE6F8' }}>{title}</p>
      {children}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Form Booking</h1>
        <p className="text-sm mt-1" style={{ color: '#9590B4' }}>Isi detail booking konsol PlayStation Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-[1fr_290px] gap-5 items-start">
          <div className="flex flex-col gap-4">
            {/* Pilih Konsol */}
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
                    <label className="field-label">Waktu Mulai</label>
                    <input {...register('waktuMulai')} type="time" className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="field-label">Durasi (jam)</label>
                  <input {...register('durasi')} type="number" min={1} max={12} className="form-input" />
                  {errors.durasi && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.durasi.message}</p>}
                </div>
              </div>
            </SectionCard>

            {/* Info pelanggan */}
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

            {/* Upload Bukti */}
            <SectionCard title="Bukti Pembayaran">
              <div className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 mb-4" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                <AlertCircle size={14} style={{ color: '#4F46E5' }} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: '#3730A3' }}>
                  Upload bukti transfer agar admin bisa konfirmasi lebih cepat. Bisa juga bayar langsung di tempat.
                </p>
              </div>
              {!buktiPreview ? (
                <div
                  className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                  style={{
                    background: isDragging ? '#F0EDFB' : '#F8F7FF',
                    border: `2px dashed ${isDragging ? '#7C3AED' : '#D4CEEE'}`,
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
                  onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: isDragging ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#EDE9FE' }}>
                    <Upload size={20} style={{ color: isDragging ? 'white' : '#7C3AED' }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#4B4580' }}>{isDragging ? 'Lepaskan file di sini' : 'Klik atau seret file ke sini'}</p>
                  <p className="text-xs" style={{ color: '#A8A0C4' }}>PNG, JPG, JPEG · Maks. 5MB</p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #EAE6F8' }}>
                  <img src={buktiPreview} alt="Bukti pembayaran" className="w-full max-h-56 object-contain" style={{ background: '#F5F3FF' }} />
                  <div className="px-3 py-2.5 flex items-center gap-2" style={{ background: 'white', borderTop: '1px solid #EAE6F8' }}>
                    <CheckCircle2 size={14} style={{ color: '#059669' }} />
                    <span className="text-xs font-semibold flex-1 truncate" style={{ color: '#1A1535' }}>{buktiFile?.name}</span>
                    <span className="text-xs shrink-0" style={{ color: '#A8A0C4' }}>{buktiFile ? (buktiFile.size/1024).toFixed(0) + ' KB' : ''}</span>
                    <button type="button" onClick={() => { setBuktiFile(null); setBuktiPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="p-1 rounded-lg ml-1 hover:bg-red-50 transition-colors" style={{ color: '#DC2626' }}><X size={13} /></button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
                </div>
              )}
            </SectionCard>
          </div>

          {/* Ringkasan */}
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
                  [<Clock size={13} />, 'Waktu', watchWaktu || '—'],
                  [<Clock size={13} />, 'Durasi', watchDurasi ? watchDurasi + ' jam' : '—'],
                  [<Users size={13} />, 'Stick', watchStick ? watchStick + ' stick' : '—'],
                ].map(([icon, label, val]) => (
                  <div key={label as string} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: '#9590B4' }}><span style={{ color: '#C4B5FD' }}>{icon}</span>{label as string}</span>
                    <span className="font-semibold text-xs" style={{ color: '#1A1535' }}>{val as string}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: '#9590B4' }}>Bukti Bayar</span>
                  <span className="font-bold" style={{ color: buktiPreview ? '#059669' : '#C4B5FD' }}>
                    {buktiPreview ? '✓ Terupload' : 'Belum upload'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 mb-4" style={{ borderTop: '1.5px solid #EAE6F8', borderBottom: '1.5px solid #EAE6F8' }}>
                <span className="text-sm font-bold" style={{ color: '#1A1535' }}>Total</span>
                <span className="text-xl font-bold text-gradient">{total ? formatRupiah(total) : '—'}</span>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-sm">
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
          {[['No. Booking', successData.noBooking], ['Konsol', successData.konsol], ['Tanggal', successData.tanggal], ['Total', formatRupiah(successData.total)]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm">
              <span style={{ color: '#9590B4' }}>{l}</span>
              <span className={`font-bold ${l === 'No. Booking' ? 'font-mono text-xs text-gradient' : ''}`} style={l !== 'No. Booking' ? { color: '#1A1535' } : {}}>{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccessModal(false); navigate('/riwayat') }} className="btn-primary w-full py-3">Lihat Riwayat</button>
      </Modal>
    </div>
  )
}
