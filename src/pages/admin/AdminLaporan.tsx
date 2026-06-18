// src/pages/admin/AdminLaporan.tsx
import { useEffect, useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import { StatCard, StatusBadge, TableWrapper, Th, Td, PageHeader, FullPageSpinner } from '@/components/shared'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FileDown, TableIcon, TrendingUp, DollarSign, Clock, Gamepad2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface LaporanData {
  totalTransaksi: number
  totalPendapatan: number
  rataRataDurasi: number
  consolTerlaris: string
  pendapatanChart: { hari: string; pendapatan: number }[]
}

export default function AdminLaporan() {
  const { bookings, fetchBookings, isLoading } = useBookingStore()
  const [laporan, setLaporan] = useState<LaporanData | null>(null)
  const [periode, setPeriode] = useState('mingguan')
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await fetchBookings()
        const res: any = await api.get('/bookings/laporan/summary')
        setLaporan(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingStats(false)
      }
    }
    load()
  }, [])

  if (isLoading || loadingStats || !laporan) return <FullPageSpinner />

  const chartData = periode === 'harian'
    ? laporan.pendapatanChart.slice(-5)
    : laporan.pendapatanChart

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="bg-white rounded-xl px-3 py-2.5 text-sm shadow-lg" style={{ border: '1.5px solid #EAE6F8' }}>
        <p className="font-semibold mb-0.5" style={{ color: '#1A1535' }}>{label}</p>
        <p className="font-bold text-gradient">{formatRupiah(payload[0].value)}</p>
      </div>
    )
    return null
  }

  return (
    <div>
      <PageHeader title="Laporan Transaksi" desc="Analisis pendapatan dan ringkasan transaksi"
        action={
          <div className="flex gap-2">
            <button onClick={() => toast.success('PDF sedang diunduh...')} className="btn-outline text-sm px-3 py-2.5"><FileDown size={14} />PDF</button>
            <button onClick={() => toast.success('Excel sedang diunduh...')} className="btn-outline text-sm px-3 py-2.5"><TableIcon size={14} />Excel</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 stagger">
        <StatCard label="Total Transaksi"    value={laporan.totalTransaksi}                          sub="tidak termasuk batal"  icon={<TrendingUp size={15} />} accent="from-violet-500 to-indigo-500" />
        <StatCard label="Total Pendapatan"   value={formatRupiah(laporan.totalPendapatan)}            sub="periode ini"           icon={<DollarSign size={15} />} accent="from-emerald-500 to-teal-500" />
        <StatCard label="Konsol Terlaris"    value={laporan.consolTerlaris.replace('PlayStation ','PS ')} sub="berdasarkan booking" icon={<Gamepad2 size={15} />}  accent="from-amber-500 to-orange-500" />
        <StatCard label="Rata-rata Durasi"   value={laporan.rataRataDurasi.toFixed(1) + ' jam'}      sub="per sesi"              icon={<Clock size={15} />}      accent="from-blue-500 to-indigo-500" />
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Grafik Pendapatan</p>
            <p className="text-xs mt-0.5" style={{ color: '#9590B4' }}>dalam Rupiah</p>
          </div>
          <select value={periode} onChange={(e) => setPeriode(e.target.value)} className="form-input w-auto text-sm">
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={26}>
            <defs>
              <linearGradient id="lapGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
            <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#A8A0C4', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => (v / 1000) + 'k'} tick={{ fontSize: 11, fill: '#A8A0C4' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)', radius: 8 } as any} />
            <Bar dataKey="pendapatan" fill="url(#lapGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <p className="text-sm font-bold mb-5" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Detail Transaksi</p>
        <TableWrapper>
          <thead>
            <tr><Th>No. Booking</Th><Th>Pelanggan</Th><Th>Konsol</Th><Th>Tanggal</Th><Th>Durasi</Th><Th>Total</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-[#F5F3FF] transition-colors">
                <Td><span className="font-mono text-xs font-bold" style={{ color: '#7C3AED' }}>{b.noBooking}</span></Td>
                <Td><span className="font-semibold text-sm" style={{ color: '#1A1535' }}>{b.namaUser}</span></Td>
                <Td className="text-sm" style={{ color: '#5B5486' }}>{b.namaConsol}</Td>
                <Td className="text-sm whitespace-nowrap" style={{ color: '#9590B4' }}>{formatTanggal(b.tanggalBooking)}</Td>
                <Td className="text-sm" style={{ color: '#9590B4' }}>{b.durasi} jam</Td>
                <Td><span className="font-bold text-sm text-gradient">{formatRupiah(b.totalBiaya)}</span></Td>
                <Td><StatusBadge status={b.status} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>
    </div>
  )
}
