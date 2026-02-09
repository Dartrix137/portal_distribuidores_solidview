import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AccessDeniedPage from './pages/AccessDeniedPage'
import ClientListPage from './pages/admin/ClientListPage'
import ClientDetailPage from './pages/admin/ClientDetailPage'
import CreateUserPage from './pages/admin/CreateUserPage'
import CreateClientPage from './pages/admin/CreateClientPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import SalesEntryPage from './pages/admin/SalesEntryPage'

const App = () => {
    return (
        <AuthProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/acceso-denegado" element={<AccessDeniedPage />} />

                {/* Distributor routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['distribuidor']}>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Navigate to="/admin/clientes" replace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/clientes"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ClientListPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/clientes/nuevo"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <CreateClientPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/clientes/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ClientDetailPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/usuarios"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UserManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/usuarios/nuevo"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <CreateUserPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/ventas"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <SalesEntryPage />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
