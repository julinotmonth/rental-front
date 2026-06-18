import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Gamepad2, BarChart2, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Navbar from './Navbar'
import toast from 'react-hot-toast'

const sidebarItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/booking', label: 'Kelola Booking', icon: ClipboardList },
  { to: '/admin/konsol', label: 'Kelola Konsol', icon: Gamepad2 },
  { to: '/admin/laporan', label: 'Laporan', icon: BarChart2 },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); toast.success('Berhasil keluar'); navigate('/') }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F7FF' }}>
      <Navbar />
      <div className="flex flex-1">
        <aside className="w-60 flex flex-col sticky top-16 self-start min-h-[calc(100vh-64px)] animate-fade-in"
          style={{ background: 'white', borderRight: '1.5px solid #EAE6F8' }}>
          <div className="px-4 py-5" style={{ borderBottom: '1.5px solid #EAE6F8' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#A8A0C4' }}>Admin Panel</p>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                {user?.nama[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#1A1535' }}>{user?.nama}</p>
                <p className="text-xs" style={{ color: '#A8A0C4' }}>Administrator</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }>
                {({ isActive }) => (
                  <>
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="opacity-60" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-4" style={{ borderTop: '1.5px solid #EAE6F8' }}>
            <button onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-semibold transition-all duration-150"
              style={{ color: '#DC2626' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </aside>

        <main className="flex-1 p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
