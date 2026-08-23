import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import KitchenPage from './pages/KitchenPage'
import AdminMenuPage from './pages/admin/AdminMenuPage'
import AdminTablesPage from './pages/admin/AdminTablesPage'

function KitchenPageWrapper() {
  const { user } = useAuth()
  return <KitchenPage storeSlug={user.storeSlug} />
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN']}>
            <KitchenPageWrapper />
          </ProtectedRoute>
        } />

        <Route path="/admin/menu" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminMenuPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/tables" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminTablesPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/kitchen" replace />} />
      </Routes>
    </>
  )
}