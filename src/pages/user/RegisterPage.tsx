import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gamepad2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/shared'

const schema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, underscore'),
  email: z.string().email('Format email tidak valid'),
  noHp: z.string().regex(/^[0-9]{10,13}$/, 'Nomor HP tidak valid (10–13 digit)'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  konfirmasi: z.string(),
}).refine((d) => d.password === d.konfirmasi, { message: 'Password tidak cocok', path: ['konfirmasi'] })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const passwordVal = watch('password', '')
  const passStrength = passwordVal.length === 0 ? 0 : passwordVal.length < 6 ? 1 : passwordVal.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat'][passStrength]
  const strengthColor = ['', '#DC2626', '#D97706', '#059669'][passStrength]

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({ nama: data.nama, username: data.username, email: data.email, noHp: data.noHp, password: data.password })
      toast.success('Akun berhasil dibuat!')
      navigate('/')
    } catch (err: any) { toast.error(err.message || 'Pendaftaran gagal') }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #EEF2FF 0%, #F8F7FF 50%, #F0EDFB 100%)' }}>

      <div className="absolute top-24 right-[8%] w-56 h-56 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4F46E5, transparent)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-24 left-[8%] w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(50px)' }} />

      <div className="w-full max-w-md animate-scale-in relative">
        <div className="bg-white rounded-2xl p-8" style={{ border: '1.5px solid #EAE6F8', boxShadow: '0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(79,70,229,0.08)' }}>
          
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
              <Gamepad2 size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Buat Akun Baru</h1>
            <p className="text-sm mt-1" style={{ color: '#9590B4' }}>Daftar dan mulai booking PlayStation</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Nama Lengkap</label>
                <input {...register('nama')} type="text" placeholder="Budi Santoso" className="form-input" />
                {errors.nama && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{errors.nama.message}</p>}
              </div>
              <div>
                <label className="field-label">Username</label>
                <input {...register('username')} type="text" placeholder="budisan" className="form-input" />
                {errors.username && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{errors.username.message}</p>}
              </div>
            </div>
            <div>
              <label className="field-label">Email</label>
              <input {...register('email')} type="email" placeholder="budi@gmail.com" className="form-input" />
              {errors.email && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{errors.email.message}</p>}
            </div>
            <div>
              <label className="field-label">Nomor HP</label>
              <input {...register('noHp')} type="tel" placeholder="08123456789" className="form-input" />
              {errors.noHp && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{errors.noHp.message}</p>}
            </div>
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 karakter" className="form-input pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg" style={{ color: '#A8A0C4' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passStrength > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= passStrength ? strengthColor : '#EAE6F8' }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
              {errors.password && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.password.message}</p>}
            </div>
            <div>
              <label className="field-label">Konfirmasi Password</label>
              <input {...register('konfirmasi')} type="password" placeholder="Ulangi password" className="form-input" />
              {errors.konfirmasi && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.konfirmasi.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary py-3 text-sm mt-1">
              {isSubmitting ? <><Spinner className="text-white/70" /> Memproses...</> : <><span>Buat Akun</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-5 pt-4" style={{ borderTop: '1.5px solid #EAE6F8' }}>
            <p className="text-center text-sm" style={{ color: '#9590B4' }}>
              Sudah punya akun?{' '}
              <Link to="/login" className="font-bold hover:text-violet-500 transition-colors" style={{ color: '#7C3AED' }}>Masuk</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
