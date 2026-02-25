import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.webp'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, user, loading: authLoading, isAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Redirect authenticated users away from login page
    useEffect(() => {
        if (!authLoading && user) {
            const from = location.state?.from?.pathname
            if (from && !from.includes('login')) {
                navigate(from, { replace: true })
            } else if (isAdmin) {
                navigate('/admin/clientes', { replace: true })
            } else {
                navigate('/dashboard', { replace: true })
            }
        }
    }, [user, authLoading, isAdmin, navigate, location])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Por favor complete todos los campos')
            return
        }

        setLoading(true)

        try {
            const user = await login(email, password)

            // Redirect based on role
            const from = location.state?.from?.pathname
            if (from && !from.includes('login')) {
                navigate(from, { replace: true })
            } else if (user.role === 'admin') {
                navigate('/admin/clientes', { replace: true })
            } else {
                navigate('/dashboard', { replace: true })
            }
        } catch (err) {
            // Mapear errores comunes de Supabase a español
            const msg = err.message || ''
            if (msg.includes('Invalid login credentials')) {
                setError('Credenciales inválidas. Verifique su correo y contraseña.')
            } else if (msg.includes('desactivado')) {
                setError(err.message)
            } else if (msg.includes('Email not confirmed')) {
                setError('El correo no ha sido confirmado.')
            } else {
                setError(err.message || 'Error al iniciar sesión. Intente de nuevo.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="flex items-center justify-center border-b border-gray-200 px-10 py-6 bg-white">
                <div className="flex items-center">
                    <img src={logo} alt="Solidview Logo" className="h-12 w-auto" />
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-[440px] bg-white p-10 rounded-xl shadow-lg border border-gray-200">
                    <div className="mb-8">
                        <h2 className="text-[28px] font-bold text-center text-text-primary pb-2">
                            Iniciar sesión
                        </h2>
                        <p className="text-text-secondary text-sm text-center">
                            Ingrese sus credenciales para acceder al panel de rendimiento
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email field */}
                        <div className="flex flex-col gap-2">
                            <label className="flex flex-col w-full">
                                <span className="text-text-primary text-sm font-semibold pb-1">
                                    Correo electrónico
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-text-primary placeholder:text-text-secondary/60 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="nombre@empresa.com"
                                    required
                                    autoComplete="email"
                                />
                            </label>
                        </div>

                        {/* Password field */}
                        <div className="flex flex-col gap-2">
                            <label className="flex flex-col w-full">
                                <span className="text-text-primary text-sm font-semibold pb-1">
                                    Contraseña
                                </span>
                                <div className="flex w-full items-stretch rounded-lg group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex-1 h-12 px-4 rounded-l-lg border border-r-0 border-gray-300 bg-white text-text-primary placeholder:text-text-secondary/60 text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="flex items-center justify-center px-4 border border-l-0 border-gray-300 bg-white rounded-r-lg cursor-pointer text-text-secondary hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg h-12 px-4 bg-primary text-white text-base font-bold transition-all hover:brightness-110 shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span>Iniciar sesión</span>
                            )}
                        </button>
                    </form>

                    {/* Footer info */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-text-secondary text-center">
                            Si no puede acceder, contacte al administrador del sistema.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 px-10 border-t border-gray-200 flex flex-col md:flex-row justify-center items-center gap-4 text-text-secondary text-xs">
                <p>© 2026. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}

export default LoginPage
