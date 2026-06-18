import { useEffect, useMemo, useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { useAuthStore } from '@/store/authStore'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import { StatusBadge, StatCard, EmptyState, FullPageSpinner, Modal } from '@/components/shared'
import { Search, Clock, CheckCircle2, Banknote, Timer, ImageIcon, ChevronDown, Calendar, Gamepad2 } from 'lucide-react'

export default function RiwayatPage() {
  const { user } = useAuthStore()
  const { bookings, fetchBookings, isLoading } = useBookingStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('terbaru')
  const [buktiModal, setBuktiModal] = useState<{ open: boolean; src: string | null }>({ open: false, src: null })

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const myBookings = useMemo(() => bookings.filter((b) => b.userId === user?.id), [bookings, user])
  const filtered = useMemo(() => {
    let list = myBookings.filter((b) => {
      const q = search.toLowerCase()
      return (!q || b.noBooking.toLowerCase().includes(q) || b.namaConsol.toLowerCase().includes(q)) && (!statusFilter || b.status === statusFilter)
    })
    if (sort === 'terbaru') list = [...list].sort((a, b) => b.tanggalBooking.localeCompare(a.tanggalBooking))
    else if (sort === 'terlama') list = [...list].sort((a, b) => a.tanggalBooking.localeCompare(b.tanggalBooking))
    else if (sort === 'termahal') list = [...list].sort((a, b) => b.totalBiaya - a.totalBiaya)
    return list
  }, [myBookings, search, statusFilter, sort])

  const stats = useMemo(() => ({
    total: myBookings.length,
    selesai: myBookings.filter((b) => b.status === 'selesai').length,
    pengeluaran: myBookings.filter((b) => b.status !== 'dibatalkan').reduce((s, b) => s + b.totalBiaya, 0),
    jamMain: myBookings.filter((b) => b.status === 'selesai').reduce((s, b) => s + b.durasi, 0),
  }), [myBookings])

  if (isLoading) return <FullPageSpinner />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Riwayat Booking</h1>
        <p className="text-sm mt-1" style={{ color: '#9590B4' }}>Semua transaksi booking Anda</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7 stagger">
        <StatCard label="Total Booking" value={stats.total} sub="semua waktu" icon={<Clock size={14} />} accent="from-violet-500 to-indigo-500" />
        <StatCard label="Selesai" value={stats.selesai} sub="transaksi" icon={<CheckCircle2 size={14} />} accent="from-emerald-500 to-teal-500" />
        <StatCard label="Total Pengeluaran" value={formatRupiah(stats.pengeluaran)} sub="tidak termasuk batal" icon={<Banknote size={14} />} accent="from-amber-500 to-orange-500" />
        <StatCard label="Jam Main" value={stats.jamMain + ' jam'} sub="waktu gaming" icon={<Timer size={14} />} accent="from-blue-500 to-indigo-500" />
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 flex-1 min-w-[180px] max-w-xs"
            style={{ background: '#F5F3FF', border: '1.5px solid #EAE6F8' }}>
            <Search size={14} style={{ color: '#A8A0C4' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. booking atau konsol..."
              className="bg-transparent text-sm outline-none w-full" style={{ color: '#1A1535' }}
              onFocus={e => (e.currentTarget.parentElement!.style.borderColor = '#7C3AED')}
              onBlur={e => (e.currentTarget.parentElement!.style.borderColor = '#EAE6F8')} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input w-auto text-sm">
            <option value="">Semua Status</option>
            {['pending','dikonfirmasi','selesai','dibatalkan'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="form-input w-auto text-sm">
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="termahal">Termahal</option>
          </select>
          <span className="text-xs font-semibold ml-auto" style={{ color: '#A8A0C4' }}>{filtered.length} booking</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🎮" title="Belum ada booking" desc="Yuk booking PlayStation favorit kamu!" />
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: '1.5px solid #EAE6F8' }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {['No. Booking','Konsol','Tanggal','Waktu','Durasi','Total','Bukti Bayar','Status'].map(h => (
                    <th key={h} className="tbl-head">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F5F3FF] transition-colors">
                    <td className="tbl-cell"><span className="font-mono text-xs font-bold" style={{ color: '#7C3AED' }}>{b.noBooking}</span></td>
                    <td className="tbl-cell"><span className="font-semibold" style={{ color: '#1A1535' }}>{b.namaConsol}</span></td>
                    <td className="tbl-cell text-sm" style={{ color: '#9590B4' }}>{formatTanggal(b.tanggalBooking)}</td>
                    <td className="tbl-cell text-sm" style={{ color: '#9590B4' }}>{b.waktuMulai}</td>
                    <td className="tbl-cell text-sm" style={{ color: '#9590B4' }}>{b.durasi} jam</td>
                    <td className="tbl-cell"><span className="font-bold text-sm text-gradient">{formatRupiah(b.totalBiaya)}</span></td>
                    <td className="tbl-cell">
                      {b.buktiPembayaran ? (
                        <button onClick={() => setBuktiModal({ open: true, src: b.buktiPembayaran! })}
                          className="flex items-center gap-1.5 group">
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 transition-all group-hover:ring-2"
                            style={{ border: '1.5px solid #EAE6F8' }}>
                            <img src={b.buktiPembayaran} alt="bukti" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#7C3AED' }}>Lihat</span>
                        </button>
                      ) : <span className="text-xs" style={{ color: '#C4BCE8' }}>—</span>}
                    </td>
                    <td className="tbl-cell"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={buktiModal.open} onClose={() => setBuktiModal({ open: false, src: null })} size="md" title="Bukti Pembayaran">
        {buktiModal.src && (
          <div className="flex flex-col gap-3">
            <img src={buktiModal.src} alt="Bukti" className="w-full max-h-80 object-contain rounded-xl" style={{ background: '#F5F3FF', border: '1.5px solid #EAE6F8' }} />
            <button onClick={() => setBuktiModal({ open: false, src: null })} className="btn-outline w-full py-2.5 text-sm">Tutup</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
