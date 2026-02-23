import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { userService } from '../../services/userService'
import { distribuidorService } from '../../services/distribuidorService'

const ROLES = [
    { id: 'admin', label: 'Administrador Corporativo' },
    { id: 'distribuidor', label: 'Distribuidor / Cliente' },
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
    const [error, setError] = useState('')
    const [clientes, setClientes] = useState([])
    const [loadingClientes, setLoadingClientes] = useState(true)

    // Cargar lista de clientes (distribuidores) existentes
    useEffect(() => {
        const loadClientes = async () => {
            try {
                const data = await distribuidorService.getAll()
                setClientes(data)
            } catch (err) {
                console.error('Error cargando clientes:', err)
            } finally {
                setLoadingClientes(false)
            }
        }
        loadClientes()
    }, [])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)

        try {
            await userService.createUser({
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre,
                role: formData.rol,
            })
            navigate('/admin/usuarios')
        } catch (err) {
            console.error('Error creando usuario:', err)
            setError(err.message || 'Error al crear el usuario')
        } finally {
            setLoading(false)
        }
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

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

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
                                    >
                                        <option value="">Nuevo cliente (se creará automáticamente)</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                                        ))}
                                    </select>
                                    {loadingClientes && (
                                        <p className="text-xs text-text-secondary mt-1">Cargando clientes...</p>
                                    )}
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
                                El administrador asigna la contraseña. Solo un administrador puede cambiarla.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}

export default CreateUserPage
