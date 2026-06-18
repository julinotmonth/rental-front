import { useEffect, useMemo, useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { Booking, StatusBooking } from '@/types'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import { StatusBadge, PageHeader, TableWrapper, Th, Td, EmptyState, FullPageSpinner, ConfirmModal, Modal } from '@/components/shared'
import { Search, ImageIcon, ZoomIn, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type PendingAction = { id: string; status: StatusBooking; label: string } | null

export default function AdminBooking() {
  const { bookings, fetchBookings, updateStatus, isLoading } = useBookingStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [buktiModal, setBuktiModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return bookings.filter((b) =>
      (!q || b.noBooking.toLowerCase().includes(q) || b.namaUser.toLowerCase().includes(q) || b.namaConsol.toLowerCase().includes(q)) &&
      (!statusFilter || b.status === statusFilter)
    )
  }, [bookings, search, statusFilter])

  const handleAction = (b: Booking, status: StatusBooking, label: string) => setPendingAction({ id: b.id, status, label })
  const confirmAction = async () => {
    if (!pendingAction) return
    await updateStatus(pendingAction.id, pendingAction.status)
    toast.success(`Booking berhasil ${pendingAction.label.toLowerCase()}`)
    setPendingAction(null)
  }

  if (isLoading) return <FullPageSpinner />

  return (
    <div>
      <PageHeader title="Kelola Booking" desc="Manajemen semua transaksi booking pelanggan" />

      <div className="card">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 flex-1 min-w-[180px] max-w-xs"
            style={{ background: '#F5F3FF', border: '1.5px solid #EAE6F8' }}>
            <Search size={14} style={{ color: '#A8A0C4' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari booking, pelanggan..."
              className="bg-transparent text-sm outline-none w-full" style={{ color: '#1A1535' }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input w-auto text-sm">
            <option value="">Semua Status</option>
            {['pending','dikonfirmasi','selesai','dibatalkan'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <span className="text-xs font-semibold ml-auto" style={{ color: '#A8A0C4' }}>{filtered.length} booking</span>
        </div>

        {filtered.length === 0 ? <EmptyState icon="📋" title="Tidak ada booking ditemukan" /> : (
          <TableWrapper>
            <thead>
              <tr>{['No. Booking','Pelanggan','Konsol','Tanggal','Durasi','Total','Bukti Bayar','Status','Aksi'].map(h => <Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[#F5F3FF] transition-colors">
                  <Td><span className="font-mono text-xs font-bold" style={{ color: '#7C3AED' }}>{b.noBooking}</span></Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>{b.namaUser[0]}</div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A1535' }}>{b.namaUser}</p>
                        <p className="text-xs" style={{ color: '#A8A0C4' }}>{b.noHpUser}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-sm" style={{ color: '#5B5486' }}>{b.namaConsol}</Td>
                  <Td className="text-sm whitespace-nowrap" style={{ color: '#9590B4' }}>{formatTanggal(b.tanggalBooking)}</Td>
                  <Td className="text-sm" style={{ color: '#9590B4' }}>{b.durasi} jam</Td>
                  <Td><span className="font-bold text-sm text-gradient">{formatRupiah(b.totalBiaya)}</span></Td>
                  <Td>
                    {b.buktiPembayaran ? (
                      <button onClick={() => setBuktiModal({ open: true, booking: b })} className="flex items-center gap-1.5 group">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 transition-all group-hover:ring-2 ring-violet-300"
                          style={{ border: '1.5px solid #EAE6F8' }}>
                          <img src={b.buktiPembayaran} alt="bukti" className="w-full h-full object-cover" />
                        </div>
                        <ZoomIn size={12} style={{ color: '#7C3AED' }} />
                      </button>
                    ) : <span className="text-xs" style={{ color: '#C4BCE8' }}>—</span>}
                  </Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td>
                    <div className="flex gap-1.5">
                      {b.status === 'pending' && <button onClick={() => handleAction(b, 'dikonfirmasi', 'Dikonfirmasi')} className="btn-primary text-xs px-3 py-1.5">Konfirmasi</button>}
                      {b.status === 'dikonfirmasi' && <button onClick={() => handleAction(b, 'selesai', 'Diselesaikan')} className="btn-outline text-xs px-3 py-1.5">Selesai</button>}
                      {(b.status === 'pending' || b.status === 'dikonfirmasi') && <button onClick={() => handleAction(b, 'dibatalkan', 'Dibatalkan')} className="btn-danger text-xs px-3 py-1.5">Batal</button>}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrapper>
        )}
      </div>

      {/* Bukti Modal */}
      <Modal open={buktiModal.open} onClose={() => setBuktiModal({ open: false, booking: null })} size="md" title="Bukti Pembayaran"
        subtitle={buktiModal.booking ? `${buktiModal.booking.noBooking} — ${buktiModal.booking.namaUser}` : ''}>
        {buktiModal.booking && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl p-3" style={{ background: '#F5F3FF' }}>
              {[['Konsol', buktiModal.booking.namaConsol], ['Total', formatRupiah(buktiModal.booking.totalBiaya)],
                ['Tanggal', formatTanggal(buktiModal.booking.tanggalBooking)], ['Durasi', buktiModal.booking.durasi + ' jam']].map(([l, v]) => (
                <div key={l}><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#A8A0C4' }}>{l}</p>
                  <p className="text-sm font-bold" style={{ color: '#1A1535' }}>{v}</p></div>
              ))}
            </div>
            {buktiModal.booking.buktiPembayaran ? (
              <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #EAE6F8' }}>
                <img src={buktiModal.booking.buktiPembayaran} alt="Bukti" className="w-full max-h-72 object-contain" style={{ background: '#F8F7FF' }} />
                <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#ECFDF5', borderTop: '1px solid #D1FAE5' }}>
                  <CheckCircle2 size={14} style={{ color: '#059669' }} />
                  <span className="text-xs font-semibold" style={{ color: '#059669' }}>Bukti pembayaran terupload</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl" style={{ background: '#F5F3FF', border: '1.5px dashed #C4B5FD' }}>
                <ImageIcon size={28} style={{ color: '#C4B5FD' }} className="mb-2" />
                <p className="text-sm font-medium" style={{ color: '#A8A0C4' }}>Tidak ada bukti pembayaran</p>
              </div>
            )}
            {buktiModal.booking.status === 'pending' && (
              <div className="flex items-start gap-2.5 rounded-xl px-3 py-2.5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <AlertCircle size={14} style={{ color: '#D97706' }} className="mt-0.5 shrink-0" />
                <p className="text-xs" style={{ color: '#92400E' }}>Periksa bukti sebelum mengkonfirmasi booking ini.</p>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setBuktiModal({ open: false, booking: null })} className="btn-outline flex-1 py-2.5 text-sm">Tutup</button>
              {buktiModal.booking.status === 'pending' && (
                <>
                  <button onClick={() => { const b = buktiModal.booking!; setBuktiModal({ open: false, booking: null }); handleAction(b, 'dibatalkan', 'Dibatalkan') }} className="btn-danger flex-1 py-2.5 text-sm">Tolak</button>
                  <button onClick={() => { const b = buktiModal.booking!; setBuktiModal({ open: false, booking: null }); setPendingAction({ id: b.id, status: 'dikonfirmasi', label: 'Dikonfirmasi' }) }} className="btn-primary flex-1 py-2.5 text-sm">Konfirmasi</button>
                </>
              )}
              {buktiModal.booking.status === 'dikonfirmasi' && (
                <button onClick={() => { const b = buktiModal.booking!; setBuktiModal({ open: false, booking: null }); handleAction(b, 'selesai', 'Diselesaikan') }} className="btn-primary flex-1 py-2.5 text-sm">Tandai Selesai</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!pendingAction} title={`${pendingAction?.label} Booking?`}
        message="Tindakan ini tidak dapat diurungkan." onConfirm={confirmAction} onCancel={() => setPendingAction(null)}
        danger={pendingAction?.status === 'dibatalkan'} />
    </div>
  )
}
