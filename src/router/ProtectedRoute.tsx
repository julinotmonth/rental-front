// src/router/ProtectedRoute.tsx

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: ReactNode
  role: 'user' | 'admin'
}

export function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }

  return <>{children}</>
}
