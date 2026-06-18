import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gamepad2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/shared'

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
  remember: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.usernameOrEmail, data.password)
      const user = useAuthStore.getState().user
      toast.success('Selamat datang, ' + user?.nama + '!')
      navigate(user?.role === 'admin' ? '/admin' : '/')
    } catch (err: any) { toast.error(err.message || 'Login gagal') }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #F0EDFB 0%, #F8F7FF 50%, #EEF2FF 100%)' }}>
      
      {/* Decorative blobs */}
      <div className="absolute top-32 left-[10%] w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-32 right-[10%] w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4F46E5, transparent)', filter: 'blur(50px)' }} />

      <div className="w-full max-w-sm animate-scale-in relative">
        <div className="bg-white rounded-2xl p-8" style={{ border: '1.5px solid #EAE6F8', boxShadow: '0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(79,70,229,0.08)' }}>
          
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
              <Gamepad2 size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>Selamat Datang</h1>
            <p className="text-sm mt-1" style={{ color: '#9590B4' }}>Masuk ke akun PS Rental Pro Anda</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="field-label">Username atau Email</label>
              <input {...register('usernameOrEmail')} type="text" placeholder="Masukkan username atau email" className="form-input" />
              {errors.usernameOrEmail && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.usernameOrEmail.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Masukkan password" className="form-input pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ color: '#A8A0C4' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5 font-medium" style={{ color: '#DC2626' }}>{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: '#6B6590' }}>
                <input {...register('remember')} type="checkbox" className="rounded accent-violet-600" />
                Ingat saya
              </label>
              <button type="button" className="text-xs font-semibold transition-colors hover:text-violet-600" style={{ color: '#9590B4' }}>Lupa password?</button>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary py-3 text-sm mt-1">
              {isSubmitting ? <><Spinner className="text-white/70" /> Memproses...</> : <><span>Masuk</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-5 pt-4" style={{ borderTop: '1.5px solid #EAE6F8' }}>
            <p className="text-center text-sm" style={{ color: '#9590B4' }}>
              Belum punya akun?{' '}
              <Link to="/register" className="font-bold hover:text-violet-500 transition-colors" style={{ color: '#7C3AED' }}>Daftar sekarang</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 rounded-xl p-3" style={{ background: '#F5F3FF', border: '1px dashed #C4B5FD' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#8B5CF6' }}>Demo Akun</p>
            <div className="flex flex-col gap-1">
              {[['👤 User', 'user1', 'user123'], ['🔑 Admin', 'admin', 'admin123']].map(([role, user, pass]) => (
                <p key={role} className="text-xs" style={{ color: '#7B7498' }}>
                  {role}: <span className="font-mono font-semibold" style={{ color: '#4B4580' }}>{user}</span> / <span className="font-mono font-semibold" style={{ color: '#4B4580' }}>{pass}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
