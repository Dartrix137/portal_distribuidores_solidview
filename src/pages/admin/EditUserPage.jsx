import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { userService } from '../../services/userService'
import { distribuidorService } from '../../services/distribuidorService'

const ROLES = [
    { id: 'admin', label: 'Administrador Corporativo' },
    { id: 'distribuidor', label: 'Distribuidor / Cliente' },
]

const EditUserPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: 'distribuidor',
        clienteId: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [clientes, setClientes] = useState([])

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true)
                const [userData, clientesData] = await Promise.all([
                    userService.getUserById(id),
                    distribuidorService.getAll()
                ])

                setFormData({
                    nombre: userData.nombre,
                    email: userData.email,
                    rol: userData.role,
                    clienteId: userData.distribuidor_id || '',
                })
                setClientes(clientesData)
            } catch (err) {
                console.error('Error cargando datos del usuario:', err)
                setError('No se pudo cargar la información del usuario')
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [id])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)

        try {
            await userService.updateUser(id, {
                nombre: formData.nombre,
                role: formData.rol,
                distribuidor_id: formData.rol === 'distribuidor' ? formData.clienteId : null,
            })
            navigate('/admin/usuarios')
        } catch (err) {
            console.error('Error actualizando usuario:', err)
            setError(err.message || 'Error al actualizar el usuario')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout breadcrumb="Editar Usuario">
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            breadcrumb="Editar Usuario"
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
                        disabled={saving || !formData.nombre || !formData.email}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-outlined text-lg">save</span>
                        )}
                        Guardar Cambios
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
                        <h2 className="text-2xl font-bold text-text-primary">Editar Usuario</h2>
                        <p className="text-text-secondary">Modifique los datos y permisos del usuario</p>
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
                                readOnly
                                className="form-input-base bg-gray-50 cursor-not-allowed opacity-75"
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
                                        <option value="">Seleccione un cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

            </div>
        </AdminLayout>
    )
}

export default EditUserPage
