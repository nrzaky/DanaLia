import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import AddTransactionPage from '@/pages/AddTransactionPage'
import EditTransactionPage from '@/pages/EditTransactionPage'
import HistoryPage from '@/pages/HistoryPage'
import TargetsPage from '@/pages/TargetsPage'
import GalleryPage from '@/pages/GalleryPage'
import ExportPage from '@/pages/ExportPage'
import LoginPage from '@/pages/LoginPage'
import SettingsPage from '@/pages/SettingsPage'
import ActivityPage from '@/pages/ActivityPage'
import HistoryDetailPage from '@/pages/HistoryDetailPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/setor', element: <AddTransactionPage /> },
          { path: '/edit/:id', element: <EditTransactionPage /> },
          { path: '/riwayat', element: <HistoryPage /> },
          { path: '/history/:id', element: <HistoryDetailPage /> },
          { path: '/target', element: <TargetsPage /> },
          { path: '/galeri', element: <GalleryPage /> },
          { path: '/ekspor', element: <ExportPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/settings/activity', element: <ActivityPage /> },
        ],
      },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
