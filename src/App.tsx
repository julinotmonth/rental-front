// src/App.tsx

import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { router } from './router'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111827',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '8px',
            padding: '10px 16px',
          },
          success: { style: { background: '#166534' } },
          error: { style: { background: '#991B1B' } },
        }}
      />
    </>
  )
}
