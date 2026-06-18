import React, { ReactNode } from 'react'
// src/components/shared/index.tsx
import { X, Loader2 } from 'lucide-react'
import { cn, statusBookingColor, statusBookingLabel, statusConsolColor, statusConsolLabel } from '@/lib/utils'
import { StatusBooking, StatusConsol } from '@/types'

export function StatusBadge({ status }: { status: StatusBooking }) {
  return <span className={cn('badge', statusBookingColor[status])}>{statusBookingLabel[status]}</span>
}

export function ConsolBadge({ status }: { status: StatusConsol }) {
  return <span className={cn('badge', statusConsolColor[status])}>{statusConsolLabel[status]}</span>
}

interface StatCardProps { label: string; value: string | number; sub?: string; icon?: ReactNode; accent?: string }
export function StatCard({ label, value, sub, icon, accent = 'from-violet-500 to-indigo-500' }: StatCardProps) {
  return (
    <div className="card animate-slide-up group hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9590B4' }}>{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} text-white`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: '#1A1535', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: '#9590B4' }}>{sub}</p>}
    </div>
  )
}

interface ModalProps { open: boolean; onClose: () => void; title?: string; subtitle?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }
export function Modal({ open, onClose, title, subtitle, children, size = 'md' }: ModalProps) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(26,21,53,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn('bg-white rounded-2xl p-6 w-full shadow-2xl animate-scale-in', widths[size])}
        style={{ border: '1.5px solid #EAE6F8', boxShadow: '0 24px 64px rgba(79,70,229,0.18), 0 4px 16px rgba(124,58,237,0.1)' }}>
        {(title || subtitle) && (
          <div className="mb-5 flex items-start justify-between">
            <div>
              {title && <h2 className="text-base font-bold" style={{ color: '#1A1535' }}>{title}</h2>}
              {subtitle && <p className="text-sm mt-0.5" style={{ color: '#9590B4' }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} className="btn-ghost ml-4 shrink-0 p-1.5 rounded-lg"><X size={16} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

interface ConfirmModalProps { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; danger?: boolean }
export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Ya, Lanjutkan', danger }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <h2 className="text-base font-bold mb-1" style={{ color: '#1A1535' }}>{title}</h2>
      <p className="text-sm mb-5" style={{ color: '#7B7498' }}>{message}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-outline text-sm px-3 py-2">Batal</button>
        <button onClick={onConfirm} className={cn('text-sm px-4 py-2', danger ? 'btn-danger' : 'btn-primary')}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 size={16} className={cn('animate-spin', className)} style={{ color: '#A78BFA' }} />
}

export function FullPageSpinner() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
        <Loader2 size={20} className="animate-spin text-white" />
      </div>
      <p className="text-sm font-medium" style={{ color: '#9590B4' }}>Memuat data...</p>
    </div>
  )
}

export function EmptyState({ icon, title, desc }: { icon?: string; title: string; desc?: string }) {
  return (
    <div className="text-center py-16 px-6 animate-fade-in">
      {icon && <div className="text-5xl mb-4 opacity-40">{icon}</div>}
      <p className="text-sm font-semibold mb-1" style={{ color: '#4B4580' }}>{title}</p>
      {desc && <p className="text-xs mt-1" style={{ color: '#A8A0C4' }}>{desc}</p>}
    </div>
  )
}

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1A1535' }}>{title}</h1>
        {desc && <p className="text-sm mt-1" style={{ color: '#9590B4' }}>{desc}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1.5px solid #EAE6F8' }}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  )
}

export function Th({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <th className={cn('tbl-head', className)} style={style}>{children}</th>
}

export function Td({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <td className={cn('tbl-cell', className)} style={style}>{children}</td>
}
