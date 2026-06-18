// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { useConsolStore } from '@/store/consolStore'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import { StatCard, StatusBadge, TableWrapper, Th, Td, PageHeader, FullPageSpinner } from '@/components/shared'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { CalendarCheck, DollarSign, Gamepad2, TrendingUp } from 'lucide-react'
import api from '@/lib/api'

const PIE_COLORS: Record<string, string> = {
  pending: '#D97706', dikonfirmasi: '#7C3AED', selesai: '#059669', dibatalkan: '#DC2626',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', dikonfirmasi: 'Dikonfirmasi', selesai: 'Selesai', dibatalkan: 'Dibatalkan',
}

interface DashboardData {
  todayCount: number
  todayRevenue: number
  consolTerlaris: string
  consolTerlarisCount: number
  availConsoles: number
  totalConsoles: number
  recentBookings: any[]
  pendapatanChart: { hari: string; pendapatan: number }[]
  statusCount: Record<string, number>
}

export default function AdminDashboard() {
  const { bookings, fetchBookings } = useBookingStore()
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await fetchBookings()
        const res: any = await api.get('/bookings/dashboard/stats')
        setStats(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !stats) return <FullPageSpinner />

  const pieData = Object.entries(stats.statusCount).map(([name, value]) => ({ name, value }))

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
      <PageHeader title="Dashboard" desc="Ringkasan aktivitas dan statistik rental hari ini" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 stagger">
        <StatCard label="Booking Hari Ini"     value={stats.todayCount}                           sub="transaksi masuk"     icon={<CalendarCheck size={15} />} accent="from-violet-500 to-indigo-500" />
        <StatCard label="Pendapatan Hari Ini"  value={formatRupiah(stats.todayRevenue)}           sub="estimasi"            icon={<DollarSign size={15} />}    accent="from-emerald-500 to-teal-500" />
        <StatCard label="Konsol Terpopuler"    value={stats.consolTerlaris.replace('PlayStation ', 'PS ')} sub={stats.consolTerlarisCount + ' booking'} icon={<TrendingUp size={15} />}   accent="from-amber-500 to-orange-500" />
        <StatCard label="Konsol Tersedia"      value={`${stats.availConsoles}/${stats.totalConsoles}`} sub="unit aktif"     icon={<Gamepad2 size={15} />}      accent="from-blue-500 to-indigo-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <p className="text-sm font-bold mb-0.5" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Pendapatan 7 Hari</p>
          <p className="text-xs mb-5" style={{ color: '#9590B4' }}>dalam Rupiah</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={stats.pendapatanChart} barSize={22}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
              <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#A8A0C4', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => (v / 1000) + 'k'} tick={{ fontSize: 11, fill: '#A8A0C4' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)', radius: 8 } as any} />
              <Bar dataKey="pendapatan" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="text-sm font-bold mb-5" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Distribusi Status Booking</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#9ca3af'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, STATUS_LABEL[name as string] || name]}
                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1.5px solid #EAE6F8' }} />
              <Legend formatter={(v) => STATUS_LABEL[v] || v} wrapperStyle={{ fontSize: 12, color: '#6B6590' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <p className="text-sm font-bold mb-5" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Booking Terbaru</p>
        <TableWrapper>
          <thead>
            <tr><Th>No. Booking</Th><Th>Pelanggan</Th><Th>Konsol</Th><Th>Tanggal</Th><Th>Total</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {stats.recentBookings.map((b) => (
              <tr key={b.id} className="hover:bg-[#F5F3FF] transition-colors">
                <Td><span className="font-mono text-xs font-bold" style={{ color: '#7C3AED' }}>{b.noBooking}</span></Td>
                <Td><span className="font-semibold text-sm" style={{ color: '#1A1535' }}>{b.namaUser}</span></Td>
                <Td className="text-sm" style={{ color: '#5B5486' }}>{b.namaConsol}</Td>
                <Td className="text-sm" style={{ color: '#9590B4' }}>{formatTanggal(b.tanggalBooking)}</Td>
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
