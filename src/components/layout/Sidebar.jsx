import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import logo from '../../assets/logo.webp'

const Sidebar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const navItems = [
        { path: '/admin/clientes', icon: 'group', label: 'Clientes' },
        { path: '/admin/ventas', icon: 'cloud_upload', label: 'Carga de Ventas' },
        { path: '/admin/usuarios', icon: 'person', label: 'Usuarios' },
    ]

    return (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-full flex flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
                {/* Logo */}
                <div className="flex items-center px-2">
                    <img src={logo} alt="Solidview Logo" className="h-10 w-auto" />
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1">
                    <NavLink
                        to="/admin/clientes"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-text-secondary hover:bg-gray-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                                    group
                                </span>
                                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    Clientes
                                </span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/admin/ventas"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-text-secondary hover:bg-gray-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                                    analytics
                                </span>
                                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    Ventas
                                </span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/admin/usuarios"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-text-secondary hover:bg-gray-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                                    person
                                </span>
                                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    Usuarios
                                </span>
                            </>
                        )}
                    </NavLink>
                </nav>
            </div>

            {/* User info & logout */}
            <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {getInitials(user?.nombre || 'Admin')}
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                        <p className="text-sm font-bold text-text-primary truncate">{user?.nombre || 'Admin'}</p>
                        <p className="text-xs text-text-secondary truncate">Administrador</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="Cerrar sesión"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
