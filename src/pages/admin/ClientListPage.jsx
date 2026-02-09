import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { mockDistribuidores, calcularVentaAnual, calcularPorcentajeCumplimiento } from '../../constants/mockDistribuidores'
import { formatCurrency, getInitials } from '../../utils/formatters'

const ClientListPage = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [distribuidores, setDistribuidores] = useState(mockDistribuidores)

    // Filter distributors by search term
    const filteredDistribuidores = distribuidores.filter(d =>
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.sector.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Stats
    const totalClientes = distribuidores.length
    const clientesActivos = distribuidores.filter(d => d.activo).length
    const nuevosEsteMes = 2 // Mock value

    const toggleActivo = (id) => {
        setDistribuidores(prev =>
            prev.map(d => d.id === id ? { ...d, activo: !d.activo } : d)
        )
    }

    const colorMap = {
        primary: 'bg-primary/10 text-primary',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        blue: 'bg-blue-100 text-blue-600',
    }

    return (
        <AdminLayout
            breadcrumb="Lista de Clientes"
            actions={
                <>
                    <div className="relative min-w-64">
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
                        Crear cliente
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card p-6">
                        <p className="text-text-secondary text-sm font-medium mb-1">Total de Clientes</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-text-primary">{totalClientes.toLocaleString()}</span>
                            <span className="text-emerald-600 text-sm font-semibold flex items-center">
                                <span className="material-symbols-outlined text-sm">arrow_upward</span>12%
                            </span>
                        </div>
                    </div>
                    <div className="card p-6">
                        <p className="text-text-secondary text-sm font-medium mb-1">Cuentas Activas</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-text-primary">{clientesActivos.toLocaleString()}</span>
                            <span className="text-emerald-600 text-sm font-semibold flex items-center">
                                <span className="material-symbols-outlined text-sm">arrow_upward</span>5%
                            </span>
                        </div>
                    </div>
                    <div className="card p-6">
                        <p className="text-text-secondary text-sm font-medium mb-1">Nuevos este mes</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-text-primary">{nuevosEsteMes}</span>
                            <span className="text-primary text-sm font-semibold">Nuevo</span>
                        </div>
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
                            {filteredDistribuidores.map((distribuidor) => {
                                const ventaAnual = calcularVentaAnual(distribuidor.trimestres)
                                const porcentaje = calcularPorcentajeCumplimiento(ventaAnual, distribuidor.objetivoAnual)

                                return (
                                    <tr key={distribuidor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${colorMap[distribuidor.color] || colorMap.primary}`}>
                                                    {distribuidor.iniciales}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary">{distribuidor.nombreCorto}</p>
                                                    <p className="text-xs text-text-secondary">{distribuidor.sector}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-text-primary">
                                                {formatCurrency(ventaAnual, { compact: true })}
                                            </p>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className="bg-primary h-full rounded-full"
                                                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={distribuidor.activo}
                                                    onChange={() => toggleActivo(distribuidor.id)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                <span className="ml-3 text-sm font-medium text-text-primary">
                                                    {distribuidor.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/clientes/${distribuidor.id}`)}
                                                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                                    title="Ver detalles"
                                                >
                                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/clientes/${distribuidor.id}`)}
                                                    className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
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
        </AdminLayout>
    )
}

export default ClientListPage
