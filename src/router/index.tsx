// src/router/index.tsx

import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import RootLayout from '@/components/layout/RootLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// User pages
import HomePage from '@/pages/user/HomePage'
import LoginPage from '@/pages/user/LoginPage'
import RegisterPage from '@/pages/user/RegisterPage'
import BookingPage from '@/pages/user/BookingPage'
import RiwayatPage from '@/pages/user/RiwayatPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminBooking from '@/pages/admin/AdminBooking'
import AdminKonsol from '@/pages/admin/AdminKonsol'
import AdminLaporan from '@/pages/admin/AdminLaporan'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'booking',
        element: (
          <ProtectedRoute role="user">
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'riwayat',
        element: (
          <ProtectedRoute role="user">
            <RiwayatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'booking', element: <AdminBooking /> },
      { path: 'konsol', element: <AdminKonsol /> },
      { path: 'laporan', element: <AdminLaporan /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
