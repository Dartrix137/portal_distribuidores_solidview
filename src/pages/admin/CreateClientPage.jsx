import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { userService } from '../../services/userService'

const SECTORES = [
    'Manufactura y Hardware',
    'Logística y Transporte',
    'Software y SaaS',
    'Servicios Financieros',
    'Retail y Comercio',
    'Telecomunicaciones',
]

const CreateClientPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        nombre: '',
        sector: SECTORES[0],
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('Todos los campos son obligatorios')
            return
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            // Crear usuario con rol distribuidor via Edge Function
            // Esto creará el usuario en Auth, tabla users Y tabla distribuidores
            await userService.createUser({
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                role: 'distribuidor',
                region: formData.sector, // Usar sector como región
            })

            navigate('/admin/clientes')
        } catch (err) {
            console.error('Error creando cliente:', err)
            setError(err.message || 'Error al crear el cliente')
        } finally {
            setLoading(false)
        }
    }

    const isValid = formData.nombre.trim().length > 0 && formData.email.trim().length > 0 && formData.password.trim().length >= 6

    return (
        <AdminLayout
            breadcrumb="Nuevo Cliente"
            actions={
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/clientes')}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined text-lg">save</span>
                        )}
                        Crear Cliente
                    </button>
                </div>
            }
        >
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/clientes')}
                        className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-text-secondary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Registrar Nuevo Cliente</h2>
                        <p className="text-text-secondary">Ingrese los datos del nuevo cliente / distribuidor</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <section className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-text-primary">Información del Cliente</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Nombre de entidad legal
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    className="form-input-base"
                                    required
                                    placeholder="Ej. Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Sector industrial
                                </label>
                                <select
                                    value={formData.sector}
                                    onChange={(e) => handleChange('sector', e.target.value)}
                                    className="form-input-base"
                                >
                                    {SECTORES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-text-primary">Credenciales de Acceso</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="form-input-base"
                                    required
                                    placeholder="usuario@empresa.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Contraseña temporal
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="form-input-base"
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>
                    </section>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-600">info</span>
                            <div>
                                <p className="text-sm font-medium text-blue-800">Objetivos de ingresos</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Los objetivos anuales y trimestrales se configuran después de crear el cliente,
                                    en la página de detalle del cliente.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}

export default CreateClientPage
