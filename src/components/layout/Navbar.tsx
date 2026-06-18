import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Gamepad2, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => { logout(); toast.success('Berhasil keluar'); navigate('/') }

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link to={to}
      className={`relative text-sm font-semibold transition-all duration-200 px-1 py-0.5 ${
        isActive(to)
          ? 'text-violet-600'
          : 'text-[#6B6590] hover:text-[#1A1535]'
      }`}>
      {label}
      {isActive(to) && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
      )}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 glass" style={{ borderBottom: '1.5px solid #EAE6F8' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', boxShadow: '0 2px 8px rgba(124,58,237,0.4)' }}>
            <Gamepad2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>
            PS Rental <span className="text-gradient">Pro</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" label="Beranda" />
          {user?.role === 'user' && (<><NavLink to="/booking" label="Booking" /><NavLink to="/riwayat" label="Riwayat" /></>)}
          {user?.role === 'admin' && <NavLink to="/admin" label="Admin Panel" />}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: '#F0EDFB' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                  {user.nama[0]}
                </div>
                <span className="text-sm font-semibold" style={{ color: '#4B4580' }}>{user.nama.split(' ')[0]}</span>
              </div>
              <button onClick={handleLogout} className="btn-outline text-sm px-3 py-2">Keluar</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-sm px-4 py-2">Masuk</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Daftar</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-xl transition-colors hover:bg-violet-50" style={{ color: '#6B6590' }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-1 animate-slide-up" style={{ borderTop: '1.5px solid #EAE6F8', background: 'white' }}>
          {[['/', 'Beranda'], ...(user?.role === 'user' ? [['/booking','Booking'],['/riwayat','Riwayat']] : []), ...(user?.role === 'admin' ? [['/admin','Admin Panel']] : [])].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${isActive(to) ? 'bg-violet-50 text-violet-600' : 'text-[#6B6590]'}`}>
              {label}
            </Link>
          ))}
          <div className="pt-3 mt-1" style={{ borderTop: '1px solid #EAE6F8' }}>
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-red-500">Keluar</button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1 btn-outline text-center text-sm py-2.5" onClick={() => setMenuOpen(false)}>Masuk</Link>
                <Link to="/register" className="flex-1 btn-primary text-center text-sm py-2.5" onClick={() => setMenuOpen(false)}>Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
