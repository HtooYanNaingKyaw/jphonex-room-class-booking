import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './pages/App'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'

const qc = new QueryClient()
const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/rooms', element: <Rooms /> },
  { path: '/bookings', element: <Bookings /> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
