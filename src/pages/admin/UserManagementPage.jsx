import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { mockUsers } from '../../constants/mockUsers'
import { getInitials } from '../../utils/formatters'

const UserManagementPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [users, setUsers] = useState(mockUsers)

    // Filter users
    const filteredUsers = users.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Stats
    const totalUsers = users.length
    const cuentasClientes = users.filter(u => u.role === 'distribuidor').length

    const toggleUserActive = (id) => {
        setUsers(prev =>
            prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u)
        )
    }

    return (
        <AdminLayout
            breadcrumb="Gestión de Usuarios"
            actions={
                <>
                    <div className="relative w-36 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary placeholder:text-text-secondary"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/admin/usuarios/nuevo')}
                        className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span className="hidden md:inline">Nuevo Usuario</span>
                    </button>
                </>
            }
        >
            {/* Title & Stats */}
            <div className="mb-8">
                <div className="mb-6">
                    <h2 className="text-3xl font-black tracking-tight text-text-primary mb-2">
                        Panel de Administración de Usuarios
                    </h2>
                    <p className="text-text-secondary">
                        Gestione los accesos y permisos de usuarios del portal.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">group</span>
                            </div>
                        </div>
                        <p className="text-text-secondary text-sm font-medium mb-1">Total de usuarios</p>
                        <span className="text-2xl font-bold text-text-primary">{totalUsers}</span>
                    </div>
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600">apartment</span>
                            </div>
                        </div>
                        <p className="text-text-secondary text-sm font-medium mb-1">Cuentas clientes</p>
                        <span className="text-2xl font-bold text-text-primary">{cuentasClientes}</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    Cliente asignado
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                                                {getInitials(user.nombre)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary">{user.nombre}</p>
                                                <p className="text-xs text-text-secondary">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Cliente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-text-primary">
                                            {user.clienteNombre || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                                title="Editar usuario"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                className="p-2 text-text-secondary hover:text-amber-600 hover:bg-amber-50 transition-colors rounded-lg"
                                                title="Restablecer contraseña"
                                            >
                                                <span className="material-symbols-outlined text-xl">lock_reset</span>
                                            </button>
                                            <button
                                                onClick={() => toggleUserActive(user.id)}
                                                className={`p-2 transition-colors rounded-lg ${user.activo
                                                    ? 'text-text-secondary hover:text-red-600 hover:bg-red-50'
                                                    : 'text-emerald-600 hover:bg-emerald-50'
                                                    }`}
                                                title={user.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                                            >
                                                <span className="material-symbols-outlined text-xl">
                                                    {user.activo ? 'block' : 'check_circle'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-xs text-text-secondary font-medium">
                        Mostrando 1 a {filteredUsers.length} de {users.length} usuarios
                    </p>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 bg-white text-text-secondary hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white font-bold text-xs">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 bg-white text-text-secondary hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default UserManagementPage
