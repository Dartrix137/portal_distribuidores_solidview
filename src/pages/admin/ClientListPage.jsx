import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { distribuidorService } from '../../services/distribuidorService'
import { ventasService } from '../../services/ventasService'
import { objetivosService } from '../../services/objetivosService'
import { formatCurrency, getInitials } from '../../utils/formatters'

const ClientListPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [distribuidores, setDistribuidores] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const currentYear = new Date().getFullYear()

    useEffect(() => {
        loadDistribuidores()
    }, [])

    const loadDistribuidores = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await distribuidorService.getAll()

            // Cargar ventas y objetivos para cada distribuidor
            const enriched = await Promise.all(
                data.map(async (dist) => {
                    try {
                        const [resumenVentas, objetivos] = await Promise.all([
                            ventasService.getResumenTrimestral(dist.id, currentYear),
                            objetivosService.getByDistribuidor(dist.id, currentYear),
                        ])

                        const ventaAnual = Object.values(resumenVentas).reduce((sum, v) => sum + v, 0)
                        const porcentaje =
                            dist.objetivo_anual > 0
                                ? Math.round((ventaAnual / dist.objetivo_anual) * 100)
                                : 0

                        return {
                            ...dist,
                            ventaAnual,
                            porcentaje,
                            objetivos,
                        }
                    } catch {
                        return { ...dist, ventaAnual: 0, porcentaje: 0, objetivos: [] }
                    }
                })
            )

            setDistribuidores(enriched)
        } catch (err) {
            console.error('Error cargando distribuidores:', err)
            setError('Error al cargar los distribuidores')
        } finally {
            setLoading(false)
        }
    }

    // Filter distributors by search term
    const filteredDistribuidores = distribuidores.filter((d) =>
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Stats
    const totalClientes = distribuidores.length
    const clientesActivos = distribuidores.filter((d) => d.users?.activo !== false).length

    return (
        <AdminLayout
            breadcrumb="Lista de Clientes"
            actions={
                <>
                    <div className="relative w-36 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary placeholder:text-text-secondary"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/admin/clientes/nuevo')}
                        className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span className="hidden md:inline">Crear cliente</span>
                    </button>
                </>
            }
        >
            {/* Title & Stats */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-text-primary mb-2">
                            Directorio de Clientes
                        </h2>
                        <p className="text-text-secondary">
                            Resumen de todas las cuentas corporativas y su estado de rendimiento de ventas.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <p className="text-text-secondary text-sm font-medium mb-1">Total de Clientes</p>
                        <span className="text-2xl font-bold text-text-primary">{totalClientes}</span>
                    </div>
                    <div className="card p-6">
                        <p className="text-text-secondary text-sm font-medium mb-1">Cuentas Activas</p>
                        <span className="text-2xl font-bold text-text-primary">{clientesActivos}</span>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                    {error}
                    <button onClick={loadDistribuidores} className="ml-2 underline font-medium">
                        Reintentar
                    </button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Nombre del cliente
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Año actual
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredDistribuidores.map((distribuidor) => (
                                    <tr key={distribuidor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm bg-primary/10 text-primary">
                                                    {getInitials(distribuidor.nombre)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary">{distribuidor.nombre}</p>
                                                    <p className="text-xs text-text-secondary">
                                                        {distribuidor.region || 'Sin región'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-text-primary">
                                                {formatCurrency(distribuidor.ventaAnual, { compact: true })}
                                            </p>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className="bg-primary h-full rounded-full"
                                                    style={{
                                                        width: `${Math.min(distribuidor.porcentaje, 100)}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`badge ${distribuidor.users?.activo !== false
                                                        ? 'badge-success'
                                                        : 'badge-neutral'
                                                    }`}
                                            >
                                                {distribuidor.users?.activo !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/clientes/${distribuidor.id}`)
                                                    }
                                                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                                    title="Ver detalles"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        visibility
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/clientes/${distribuidor.id}`)
                                                    }
                                                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
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
                            Mostrando 1 a {filteredDistribuidores.length} de {distribuidores.length} resultados
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
            )}
        </AdminLayout>
    )
}

export default ClientListPage
