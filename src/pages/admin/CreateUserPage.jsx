import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'

const ROLES = [
    { id: 'admin', label: 'Administrador Corporativo' },
    { id: 'distribuidor', label: 'Distribuidor / Cliente' },
]

const CLIENTES = [
    { id: 'dist-acme', nombre: 'Acme Corp' },
    { id: 'dist-global', nombre: 'Global Logistics' },
    { id: 'dist-tech', nombre: 'Techstream' },
]

const CreateUserPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: 'distribuidor',
        clienteId: '',
        password: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // In a real app we would save to DB/Auth provider
        console.log('Creating user:', formData)

        setLoading(false)
        navigate('/admin/usuarios')
    }

    return (
        <AdminLayout
            breadcrumb="Nuevo Usuario"
            actions={
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/usuarios')}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.nombre || !formData.email || !formData.password}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined text-lg">save</span>
                        )}
                        Crear Usuario
                    </button>
                </div>
            }
        >
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/usuarios')}
                        className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-text-secondary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Registrar Nuevo Usuario</h2>
                        <p className="text-text-secondary">Configure las credenciales y permisos de acceso</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                className="form-input-base"
                                required
                                placeholder="Ej. María González"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Correo Electrónico
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Rol de Sistema
                                </label>
                                <select
                                    value={formData.rol}
                                    onChange={(e) => handleChange('rol', e.target.value)}
                                    className="form-input-base"
                                >
                                    {ROLES.map(role => (
                                        <option key={role.id} value={role.id}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.rol === 'distribuidor' && (
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        Cliente Asociado
                                    </label>
                                    <select
                                        value={formData.clienteId}
                                        onChange={(e) => handleChange('clienteId', e.target.value)}
                                        className="form-input-base"
                                        required
                                    >
                                        <option value="">Seleccione un cliente...</option>
                                        {CLIENTES.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-text-primary mb-4">Seguridad</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        Contraseña Temporal
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className="form-input-base pr-10"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className="form-input-base"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-text-secondary mt-2">
                                El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}

export default CreateUserPage
