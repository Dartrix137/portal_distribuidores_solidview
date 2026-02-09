import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.webp'

const AccessDeniedPage = () => {
    const { user, isAdmin } = useAuth()

    const getDashboardLink = () => {
        if (isAdmin) return '/admin/clientes'
        if (user) return '/dashboard'
        return '/login'
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-200 px-10 py-3 bg-white">
                <div className="flex items-center">
                    <img src={logo} alt="Solidview Logo" className="h-8 w-auto" />
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-text-primary hover:bg-gray-200 transition-colors">
                        <span className="material-symbols-outlined">help_outline</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300"></div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-[640px] bg-white p-10 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col items-center text-center gap-8">
                        {/* Icon */}
                        <div className="relative flex items-center justify-center w-48 h-48 rounded-full bg-primary/10">
                            <div className="flex items-center justify-center w-32 h-32 rounded-full bg-primary/20">
                                <span className="material-symbols-outlined text-primary text-7xl">lock_person</span>
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">priority_high</span>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="flex flex-col items-center gap-4">
                            <h1 className="text-3xl font-bold text-text-primary">Acceso Denegado</h1>
                            <p className="text-text-secondary text-base max-w-[440px] leading-relaxed">
                                No tienes permisos para acceder a esta página. Esta área está restringida a administradores corporativos autorizados de Solidview.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col w-full gap-4 mt-2">
                            <Link
                                to={getDashboardLink()}
                                className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold transition-all hover:brightness-110 shadow-md active:scale-[0.98]"
                            >
                                Volver al Dashboard
                            </Link>
                            <button className="flex w-full items-center justify-center rounded-lg h-12 px-6 bg-gray-100 text-text-primary text-sm font-bold hover:bg-gray-200 transition-colors">
                                Solicitar Acceso
                            </button>
                        </div>

                        {/* Help link */}
                        <div className="pt-6 border-t border-gray-100 w-full">
                            <p className="text-text-secondary text-sm">
                                ¿Crees que esto es un error?{' '}
                                <a href="#" className="text-primary hover:underline font-medium">
                                    Contactar Soporte IT
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 flex items-center justify-center">
                <p className="text-text-secondary text-xs">
                    © 2024 Solidview. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    )
}

export default AccessDeniedPage
