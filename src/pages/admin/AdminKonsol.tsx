import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useConsolStore } from '@/store/consolStore'
import { Console } from '@/types'
import { formatRupiah } from '@/lib/utils'
import { ConsolBadge, Modal, ConfirmModal, PageHeader, FullPageSpinner, Spinner } from '@/components/shared'
import { Gamepad2, Pencil, Trash2, Power, Plus, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  nama: z.string().min(2),
  deskripsi: z.string().min(5),
  hargaPerJam: z.coerce.number().min(1000),
  stok: z.coerce.number().min(1),
  status: z.enum(['tersedia', 'maintenance']),
})
type FormData = z.infer<typeof schema>

const cardGrads = ['from-violet-500 to-indigo-600', 'from-indigo-500 to-blue-600', 'from-blue-500 to-cyan-600', 'from-purple-500 to-violet-600']

export default function AdminKonsol() {
  const { consoles, fetchConsoles, addConsole, updateConsole, deleteConsole, isLoading } = useConsolStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Console | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Console | null>(null)

  useEffect(() => { fetchConsoles() }, [fetchConsoles])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'tersedia' },
  })

  const openAdd = () => { setEditTarget(null); reset({ nama: '', deskripsi: '', hargaPerJam: undefined as any, stok: undefined as any, status: 'tersedia' }); setModalOpen(true) }
  const openEdit = (c: Console) => { setEditTarget(c); reset({ nama: c.nama, deskripsi: c.deskripsi, hargaPerJam: c.hargaPerJam, stok: c.stok, status: c.status }); setModalOpen(true) }

  const onSubmit = async (data: FormData) => {
    if (editTarget) { await updateConsole(editTarget.id, data); toast.success('Konsol diperbarui') }
    else { await addConsole(data); toast.success('Konsol ditambahkan') }
    setModalOpen(false); setEditTarget(null)
  }

  const handleToggleStatus = async (c: Console) => {
    const next = c.status === 'tersedia' ? 'maintenance' : 'tersedia'
    await updateConsole(c.id, { status: next }); toast.success(`Status: ${next}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteConsole(deleteTarget.id); toast.success('Konsol dihapus'); setDeleteTarget(null)
  }

  if (isLoading) return <FullPageSpinner />

  return (
    <div>
      <PageHeader title="Kelola Konsol" desc="Manajemen unit konsol PlayStation"
        action={<button onClick={openAdd} className="btn-primary text-sm px-4 py-2.5"><Plus size={15} />Tambah Konsol</button>} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
        {consoles.map((c, i) => (
          <div key={c.id} className="card animate-slide-up group hover:border-violet-200 transition-all duration-200 flex flex-col gap-4">
            <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${cardGrads[i % cardGrads.length]} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 40%, white, transparent)' }} />
              <Gamepad2 size={42} className="text-white relative z-10 drop-shadow-lg transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute top-2.5 right-2.5"><ConsolBadge status={c.status} /></div>
            </div>

            <div>
              <p className="font-bold" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>{c.nama}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9590B4' }}>{c.deskripsi}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[['Harga/jam', formatRupiah(c.hargaPerJam)], ['Stok', c.stok + ' unit']].map(([label, val]) => (
                <div key={label} className="rounded-xl px-3 py-2.5" style={{ background: '#F5F3FF' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#A8A0C4' }}>{label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: '#1A1535' }}>{val}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1" style={{ borderTop: '1.5px solid #EAE6F8' }}>
              <button onClick={() => openEdit(c)} className="btn-outline text-xs px-3 py-2 flex items-center gap-1.5"><Pencil size={12} />Edit</button>
              <button onClick={() => handleToggleStatus(c)} className="btn-ghost text-xs px-3 py-2 flex items-center gap-1.5"><Power size={12} />{c.status === 'tersedia' ? 'Nonaktif' : 'Aktifkan'}</button>
              <button onClick={() => setDeleteTarget(c)} className="btn-danger text-xs px-3 py-2 flex items-center gap-1.5 ml-auto"><Trash2 size={12} />Hapus</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Konsol' : 'Tambah Konsol'} subtitle="Isi informasi unit PlayStation">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {[['nama', 'Nama Konsol', 'text', 'PlayStation 5'], ['deskripsi', 'Deskripsi', 'text', 'Deskripsi singkat konsol']].map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label className="field-label">{label as string}</label>
              <input {...register(name as any)} type={type as string} placeholder={placeholder as string} className="form-input" />
              {(errors as any)[name] && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{(errors as any)[name]?.message}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Harga/Jam (Rp)</label>
              <input {...register('hargaPerJam')} type="number" className="form-input" placeholder="25000" />
              {errors.hargaPerJam && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{errors.hargaPerJam.message}</p>}
            </div>
            <div>
              <label className="field-label">Stok Unit</label>
              <input {...register('stok')} type="number" className="form-input" placeholder="2" />
              {errors.stok && <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>{errors.stok.message}</p>}
            </div>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select {...register('status')} className="form-input">
              <option value="tersedia">Tersedia</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline text-sm px-4 py-2.5">Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm px-5 py-2.5">
              {isSubmitting ? <><Spinner className="text-white/70" />Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} title="Hapus Konsol?" message={`"${deleteTarget?.nama}" akan dihapus permanen.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Hapus" danger />
    </div>
  )
}
