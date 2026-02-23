import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { distribuidorService } from '../../services/distribuidorService'
import { ventasService } from '../../services/ventasService'
import { formatCurrency, formatDate } from '../../utils/formatters'

const SalesEntryPage = () => {
    const [distribuidores, setDistribuidores] = useState([])
    const [ventas, setVentas] = useState([])
    const [loadingData, setLoadingData] = useState(true)
    const [formData, setFormData] = useState({
        distribuidorId: '',
        anio: new Date().getFullYear().toString(),
        trimestre: 'Q1',
        semana: '1',
        monto: '',
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoadingData(true)
            const [distData, ventasData] = await Promise.all([
                distribuidorService.getAll(),
                ventasService.getAll(),
            ])
            setDistribuidores(distData)
            setVentas(ventasData)
        } catch (err) {
            console.error('Error cargando datos:', err)
        } finally {
            setLoadingData(false)
        }
    }

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value }

            if (field === 'anio') {
                newState.trimestre = 'Q1'
                newState.semana = '1'
            }

            if (field === 'trimestre') {
                const startWeek = {
                    'Q1': 1, 'Q2': 14, 'Q3': 27, 'Q4': 40
                }[value] || 1
                newState.semana = startWeek.toString()
            }

            return newState
        })
    }

    // Dynamic weeks based on quarter
    const getWeeksForQuarter = (q) => {
        const ranges = {
            'Q1': { start: 1, end: 13 },
            'Q2': { start: 14, end: 26 },
            'Q3': { start: 27, end: 39 },
            'Q4': { start: 40, end: 52 },
        }
        const range = ranges[q] || ranges['Q1']
        return Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i)
    }

    const availableWeeks = getWeeksForQuarter(formData.trimestre)

    // Generate year options dynamically
    const currentYear = new Date().getFullYear()
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2]

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.distribuidorId || !formData.monto) return

        setLoading(true)
        setError('')

        try {
            const newVenta = await ventasService.create({
                distribuidor_id: formData.distribuidorId,
                trimestre: formData.trimestre,
                semana: parseInt(formData.semana),
                monto: parseFloat(formData.monto),
                fecha: new Date().toISOString().split('T')[0],
            })

            // Enriquecer con nombre del distribuidor para la tabla
            const dist = distribuidores.find(d => d.id === formData.distribuidorId)
            const enrichedVenta = {
                ...newVenta,
                distribuidores: { id: dist?.id, nombre: dist?.nombre || 'Cliente' },
            }

            setVentas(prev => [enrichedVenta, ...prev])

            // Reset form
            setFormData(prev => ({ ...prev, distribuidorId: '', monto: '' }))
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error('Error registrando venta:', err)
            setError(err.message || 'Error al registrar la venta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminLayout breadcrumb="Carga de Ventas">
            {/* Title */}
            <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-text-primary mb-2">
                        Carga Semanal de Ventas
                    </h2>
                    <p className="text-text-secondary">
                        Ingrese y audite los datos de desempeño de ventas B2B para sus clientes.
                    </p>
                </div>
            </div>

            {/* Entry Form */}
            <div className="card mb-10 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-text-primary">Nueva entrada de datos de ventas</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Cliente
                            </label>
                            <select
                                value={formData.distribuidorId}
                                onChange={(e) => handleChange('distribuidorId', e.target.value)}
                                className="form-input-base"
                                required
                                disabled={loadingData}
                            >
                                <option value="">
                                    {loadingData ? 'Cargando clientes...' : 'Seleccione cliente corporativo'}
                                </option>
                                {distribuidores.map(d => (
                                    <option key={d.id} value={d.id}>{d.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Año
                            </label>
                            <select
                                value={formData.anio}
                                onChange={(e) => handleChange('anio', e.target.value)}
                                className="form-input-base"
                            >
                                {yearOptions.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Trimestre
                            </label>
                            <select
                                value={formData.trimestre}
                                onChange={(e) => handleChange('trimestre', e.target.value)}
                                className="form-input-base"
                            >
                                <option value="Q1">Q1 (Ene - Mar)</option>
                                <option value="Q2">Q2 (Abr - Jun)</option>
                                <option value="Q3">Q3 (Jul - Sep)</option>
                                <option value="Q4">Q4 (Oct - Dic)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Semana
                            </label>
                            <select
                                value={formData.semana}
                                onChange={(e) => handleChange('semana', e.target.value)}
                                className="form-input-base"
                            >
                                {availableWeeks.map(week => (
                                    <option key={week} value={week}>Semana {week}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Valor vendido (COP)
                            </label>
                            <input
                                type="number"
                                value={formData.monto}
                                onChange={(e) => handleChange('monto', e.target.value)}
                                className="form-input-base"
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:brightness-110 text-white font-bold h-12 px-8 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">add_task</span>
                                        Registrar venta
                                    </>
                                )}
                            </button>
                            {success && (
                                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    Venta registrada
                                </span>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* History Table */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-bold text-text-primary">Histórico de ventas</h3>
                </div>

                {loadingData ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                            Periodo
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
                                            Valor de Venta
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {ventas.slice(0, 15).map((venta) => (
                                        <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-text-primary">
                                                    {formatDate(venta.fecha)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-text-primary">
                                                    {venta.distribuidores?.nombre || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-1 rounded">
                                                    {venta.trimestre}
                                                    {venta.semana ? ` / S${venta.semana}` : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-text-primary">
                                                {formatCurrency(venta.monto)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {ventas.length === 0 && (
                            <div className="p-8 text-center text-text-secondary">
                                No hay ventas registradas aún
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default SalesEntryPage
