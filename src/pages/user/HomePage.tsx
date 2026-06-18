import { useNavigate } from 'react-router-dom'
import { Gamepad2, Zap, BadgeDollarSign, ShieldCheck, Star, ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useConsolStore } from '@/store/consolStore'
import { useAuthStore } from '@/store/authStore'
import { formatRupiah } from '@/lib/utils'
import { useEffect } from 'react'

const features = [
  { icon: Zap, title: 'Booking Mudah 24/7', desc: 'Pesan slot gaming kapan saja. Konfirmasi instan, tanpa perlu telepon.' },
  { icon: BadgeDollarSign, title: 'Harga Terjangkau', desc: 'Mulai Rp 15.000/jam untuk PS4 hingga Rp 30.000/jam untuk PS5.' },
  { icon: ShieldCheck, title: 'Kualitas Terjamin', desc: 'Konsol dirawat rutin, controller bersih, game library lengkap.' },
]

const testimoni = [
  { nama: 'Ahmad R.', rating: 5, teks: 'Booking online-nya gampang banget! Konsolnya bersih dan terawat. Pasti balik lagi.' },
  { nama: 'Citra N.', rating: 5, teks: 'PS5-nya kenceng, nggak ada lag. Harganya masuk akal untuk kualitas segini.' },
  { nama: 'Dedi P.', rating: 4, teks: 'Praktis, langsung konfirmasi. Tempatnya nyaman dan sticknya masih oke.' },
]

const consolGradients = [
  'from-violet-500 to-indigo-600',
  'from-indigo-500 to-blue-600',
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-violet-600',
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { consoles, fetchConsoles } = useConsolStore()

  useEffect(() => { fetchConsoles() }, [fetchConsoles])

  const handleBooking = () => navigate(user ? '/booking' : '/login')

  return (
    <div style={{ background: '#F8F7FF' }}>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)', filter: 'blur(80px)' }} />
          <div className="absolute top-20 left-[5%] w-4 h-4 rounded-full opacity-30" style={{ background: '#A78BFA' }} />
          <div className="absolute top-40 right-[8%] w-3 h-3 rounded-full opacity-20" style={{ background: '#6366F1' }} />
          <div className="absolute bottom-20 left-[15%] w-2 h-2 rounded-full opacity-25" style={{ background: '#7C3AED' }} />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: '#EDE9FE', color: '#7C3AED', border: '1px solid #C4B5FD' }}>
            <span className="dot-live" />
            Surabaya, Jawa Timur · Buka Setiap Hari
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5"
            style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}>
            Rental PlayStation<br />
            <span className="text-gradient">Terbaik</span> & <span className="text-gradient">Terpercaya</span>
          </h1>

          <p className="text-base max-w-md mx-auto mb-10 leading-relaxed" style={{ color: '#7B7498' }}>
            Nikmati gaming bersama dengan PS4 & PS5 terawat. Booking online mudah, harga bersahabat, tersedia 7 hari seminggu.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={handleBooking} className="btn-primary px-7 py-3.5 text-base">
              Booking Sekarang <ArrowRight size={18} />
            </button>
            <a href="#katalog" className="btn-outline px-7 py-3.5 text-base">Lihat Katalog</a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 justify-center mt-14 stagger">
            {[['4+', 'Jenis Konsol'], ['500+', 'Pelanggan Puas'], ['24/7', 'Booking Online'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label} className="text-center animate-slide-up">
                <p className="text-2xl font-bold text-gradient">{val}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#9590B4' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strips */}
      <section style={{ background: 'white', borderTop: '1.5px solid #EAE6F8', borderBottom: '1.5px solid #EAE6F8' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ '--tw-divide-opacity': 1 } as any}>
            {features.map((f, i) => (
              <div key={f.title} className="py-10 px-7 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                  <f.icon size={18} className="text-white" />
                </div>
                <p className="font-bold mb-2" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#7B7498' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog */}
      <section id="katalog" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A78BFA' }}>Katalog</p>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Pilih Konsol Anda</h2>
            <p className="text-sm" style={{ color: '#9590B4' }}>Semua unit terawat dan siap pakai</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {consoles.map((c, i) => (
              <div key={c.id} className="card-hover animate-slide-up flex flex-col gap-4">
                <div className={`w-full h-28 rounded-xl bg-gradient-to-br ${consolGradients[i % consolGradients.length]} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white, transparent)' }} />
                  <Gamepad2 size={36} className="text-white relative z-10 drop-shadow-lg" />
                  {c.status === 'tersedia' && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                      <span className="dot-live w-1.5 h-1.5" />
                      <span className="text-white text-[10px] font-bold">Live</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>{c.nama}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9590B4' }}>{c.deskripsi}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gradient">{formatRupiah(c.hargaPerJam)}</p>
                    <p className="text-[11px]" style={{ color: '#A8A0C4' }}>per jam</p>
                  </div>
                  <span className={`badge ${c.status === 'tersedia' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {c.status === 'tersedia' ? 'Tersedia' : 'Maintenance'}
                  </span>
                </div>
                <button
                  onClick={() => c.status === 'tersedia' ? handleBooking() : null}
                  disabled={c.status !== 'tersedia'}
                  className={`btn-primary w-full text-sm py-2.5 ${c.status !== 'tersedia' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {c.status === 'tersedia' ? 'Booking Sekarang' : 'Tidak Tersedia'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="py-20 px-4" style={{ background: 'white', borderTop: '1.5px solid #EAE6F8', borderBottom: '1.5px solid #EAE6F8' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#A78BFA' }}>Testimoni</p>
            <h2 className="text-3xl font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Kata Mereka</h2>
            <p className="text-sm mt-2" style={{ color: '#9590B4' }}>Pengalaman nyata dari pelanggan setia kami</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 stagger">
            {testimoni.map((t, i) => (
              <div key={t.nama} className="card animate-slide-up group hover:border-violet-200 transition-all duration-200">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} fill={j < t.rating ? '#F59E0B' : 'none'} className={j < t.rating ? 'text-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#5B5486' }}>"{t.teks}"</p>
                <div className="flex items-center gap-2.5 pt-4" style={{ borderTop: '1px solid #EAE6F8' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${['#7C3AED','#4F46E5','#6366F1'][i]}, ${['#4F46E5','#2563EB','#7C3AED'][i]})` }}>
                    {t.nama[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1A1535' }}>{t.nama}</p>
                    <p className="text-xs" style={{ color: '#A8A0C4' }}>Pelanggan Setia</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', boxShadow: '0 20px 60px rgba(124,58,237,0.3)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08), transparent)' }} />
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Siap Main Bareng?
            </h2>
            <p className="text-violet-200 mb-8 text-sm">Booking sekarang dan dapatkan pengalaman gaming terbaik</p>
            <button onClick={handleBooking}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{ background: 'white', color: '#7C3AED', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              Booking Sekarang <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-14" style={{ background: '#1A1535' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                  <Gamepad2 size={16} className="text-white" />
                </div>
                <span className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>PS Rental Pro</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#9590B4' }}>
                Rental PlayStation terpercaya di Surabaya. Hadirkan pengalaman gaming terbaik untuk semua.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6B6590' }}>Kontak</p>
              <div className="flex flex-col gap-2.5">
                {[[Phone, '0812-3456-7890'], [Mail, 'info@psrentalpro.id'], [MapPin, 'Surabaya, Jawa Timur']].map(([Icon, val]) => (
                  <div key={val as string} className="flex items-center gap-2.5">
                    <Icon size={14} style={{ color: '#7C3AED' }} />
                    <span className="text-sm" style={{ color: '#9590B4' }}>{val as string}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6B6590' }}>Jam Operasional</p>
              <div className="flex flex-col gap-1.5 text-sm">
                {[['Senin – Jumat', '10:00 – 22:00'], ['Sabtu – Minggu', '09:00 – 23:00']].map(([day, time]) => (
                  <div key={day} className="flex items-center gap-2">
                    <Clock size={12} style={{ color: '#7C3AED' }} />
                    <span style={{ color: '#6B6590' }}>{day}</span>
                    <span className="font-semibold ml-auto" style={{ color: '#A78BFA' }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 text-xs text-center" style={{ color: '#4B4580', borderTop: '1px solid #2D2A50' }}>
            © 2024 PS Rental Pro · Skripsi S1 Informatika UMSIDA · Rivky Adhitya Nugroho (221080200039)
          </div>
        </div>
      </footer>
    </div>
  )
}
