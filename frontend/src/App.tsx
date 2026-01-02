import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';
import { DepartemenPage } from './pages/DepartemenPage';
import { KepengurusanPage } from './pages/KepengurusanPage';
import { KegiatanPage } from './pages/KegiatanPage';
import { AbsensiTokenPage } from './pages/AbsensiTokenPage';
import { AbsensiPage } from './pages/AbsensiPage';
import { KasPage } from './pages/KasPage';
import { KasDetailPage } from './pages/KasDetailPage';
import { LaporanKasPage } from './pages/LaporanKasPage';
import { ArsipPage } from './pages/ArsipPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/absensi" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="roles" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RolesPage />
              </ProtectedRoute>
            } />
            <Route path="departemen" element={<DepartemenPage />} />
            <Route path="kepengurusan" element={
              <ProtectedRoute allowedRoles={['admin', 'pengurus']}>
                <KepengurusanPage />
              </ProtectedRoute>
            } />
            <Route path="kegiatan" element={<KegiatanPage />} />
            <Route path="absensi-token" element={
              <ProtectedRoute allowedRoles={['admin', 'pengurus']}>
                <AbsensiTokenPage />
              </ProtectedRoute>
            } />
            <Route path="absensi" element={<AbsensiPage />} />
            <Route path="kas" element={
              <ProtectedRoute allowedRoles={['admin', 'bendahara']}>
                <KasPage />
              </ProtectedRoute>
            } />
            <Route path="kas-detail" element={
              <ProtectedRoute allowedRoles={['admin', 'bendahara']}>
                <KasDetailPage />
              </ProtectedRoute>
            } />
            <Route path="laporan-kas" element={
              <ProtectedRoute allowedRoles={['admin', 'bendahara']}>
                <LaporanKasPage />
              </ProtectedRoute>
            } />
            <Route path="arsip" element={<ArsipPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
