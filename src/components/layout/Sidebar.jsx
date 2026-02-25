import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import logo from '../../assets/logo.webp'

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleNavClick = () => {
        if (onClose) onClose()
    }

    const sidebarContent = (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-full flex flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
                {/* Logo */}
                <div className="flex items-center justify-between px-2">
                    <a href="https://solidview.com.co/" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
                        <img src={logo} alt="Solidview Logo" className="h-10 w-auto" />
                    </a>
                    {/* Close button — mobile only */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1">
                    <NavLink
                        to="/admin/clientes"
                        onClick={handleNavClick}
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
                        onClick={handleNavClick}
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
                        onClick={handleNavClick}
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

    return (
        <>
            {/* Desktop sidebar — always visible */}
            <div className="hidden md:block h-full">
                {sidebarContent}
            </div>

            {/* Mobile drawer */}
            <div className="md:hidden">
                {/* Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                    />
                )}

                {/* Sliding panel */}
                <div
                    className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {sidebarContent}
                </div>
            </div>
        </>
    )
}

export default Sidebar
