import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { mockDistribuidores, calcularVentaAnual, calcularPorcentajeCumplimiento } from '../../constants/mockDistribuidores'
import { formatCurrency } from '../../utils/formatters'

const SECTORES = [
    'Manufactura y Hardware',
    'Logística y Transporte',
    'Software y SaaS',
    'Servicios Financieros',
    'Retail y Comercio',
    'Telecomunicaciones',
]

const REGIONES = [
    'Norteamérica (Global HQ)',
    'NY, USA',
    'Londres, UK',
    'Austin, USA',
    'Ciudad de México, MX',
    'São Paulo, BR',
]

const ClientDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const originalDistribuidor = mockDistribuidores.find(d => d.id === id)

    const [formData, setFormData] = useState({
        nombre: '',
        sector: '',
        kam: '',
        region: '',
        objetivoAnual: 0,
        trimestres: {
            Q1: { meta: 0 },
            Q2: { meta: 0 },
            Q3: { meta: 0 },
            Q4: { meta: 0 },
        },
    })
    const [hasChanges, setHasChanges] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (originalDistribuidor) {
            setFormData({
                nombre: originalDistribuidor.nombre,
                sector: originalDistribuidor.sector,
                kam: originalDistribuidor.kam?.nombre || '',
                region: originalDistribuidor.region,
                objetivoAnual: originalDistribuidor.objetivoAnual,
                trimestres: {
                    Q1: { meta: originalDistribuidor.trimestres.Q1.meta },
                    Q2: { meta: originalDistribuidor.trimestres.Q2.meta },
                    Q3: { meta: originalDistribuidor.trimestres.Q3.meta },
                    Q4: { meta: originalDistribuidor.trimestres.Q4.meta },
                },
            })
        }
    }, [originalDistribuidor])

    if (!originalDistribuidor) {
        return (
            <AdminLayout breadcrumb="Error">
                <div className="text-center py-12">
                    <p className="text-text-secondary">Cliente no encontrado</p>
                    <Link to="/admin/clientes" className="text-primary hover:underline mt-4 inline-block">
                        Volver a lista de clientes
                    </Link>
                </div>
            </AdminLayout>
        )
    }

    const ventaAnual = calcularVentaAnual(originalDistribuidor.trimestres)
    const porcentaje = calcularPorcentajeCumplimiento(ventaAnual, originalDistribuidor.objetivoAnual)
    const sumaTrimestres = Object.values(formData.trimestres).reduce((sum, t) => sum + t.meta, 0)
    const validacion = sumaTrimestres === formData.objetivoAnual

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setHasChanges(true)
        setSaved(false)
    }

    const handleTrimestreChange = (quarter, value) => {
        const numValue = Number(value) || 0
        setFormData(prev => ({
            ...prev,
            trimestres: {
                ...prev.trimestres,
                [quarter]: { meta: numValue },
            },
        }))
        setHasChanges(true)
        setSaved(false)
    }

    const handleSave = () => {
        if (!validacion) return
        // Mock save - in Phase 2 this would update Supabase
        console.log('Guardando:', formData)
        setHasChanges(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const handleDiscard = () => {
        setFormData({
            nombre: originalDistribuidor.nombre,
            sector: originalDistribuidor.sector,
            kam: originalDistribuidor.kam?.nombre || '',
            region: originalDistribuidor.region,
            objetivoAnual: originalDistribuidor.objetivoAnual,
            trimestres: {
                Q1: { meta: originalDistribuidor.trimestres.Q1.meta },
                Q2: { meta: originalDistribuidor.trimestres.Q2.meta },
                Q3: { meta: originalDistribuidor.trimestres.Q3.meta },
                Q4: { meta: originalDistribuidor.trimestres.Q4.meta },
            },
        })
        setHasChanges(false)
    }

    return (
        <AdminLayout
            breadcrumb={originalDistribuidor.nombreCorto}
            actions={
                <div className="flex items-center gap-3">
                    {saved && (
                        <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Guardado
                        </span>
                    )}
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || !validacion}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        Guardar cambios
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Header with status badge */}
                <div className="flex items-start gap-4 mb-6">
                    <button
                        onClick={() => navigate('/admin/clientes')}
                        className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-text-secondary transition-colors shrink-0"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-2xl font-bold text-text-primary">{originalDistribuidor.nombre}</h2>
                            <span className={`badge ${porcentaje >= 80 ? 'badge-success' : porcentaje >= 50 ? 'badge-warning' : 'badge-error'}`}>
                                {porcentaje}% cumplimiento
                            </span>
                        </div>
                        <p className="text-text-secondary">
                            Venta actual: {formatCurrency(ventaAnual)} / {formatCurrency(originalDistribuidor.objetivoAnual)}
                        </p>
                    </div>
                </div>

                {/* Basic Info Section */}
                <section className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-bold text-text-primary">Información Básica</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Nombre de entidad legal
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                className="form-input-base"
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
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                KAM asignado
                            </label>
                            <input
                                type="text"
                                value={formData.kam}
                                onChange={(e) => handleChange('kam', e.target.value)}
                                className="form-input-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Región
                            </label>
                            <select
                                value={formData.region}
                                onChange={(e) => handleChange('region', e.target.value)}
                                className="form-input-base"
                            >
                                {REGIONES.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Revenue Targets Section */}
                <section className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-bold text-text-primary">Objetivos de Ingresos (FY 2024)</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Annual target */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Objetivo anual total (USD)
                            </label>
                            <input
                                type="number"
                                value={formData.objetivoAnual}
                                onChange={(e) => handleChange('objetivoAnual', Number(e.target.value))}
                                className="form-input-base max-w-xs"
                            />
                        </div>

                        {/* Quarterly targets */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-semibold text-text-primary">
                                    Desglose trimestral
                                </label>
                                {!validacion && (
                                    <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">warning</span>
                                        La suma de trimestres debe ser igual al objetivo anual
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                    <div key={q}>
                                        <label className="block text-xs font-medium text-text-secondary mb-1">
                                            {q} ({q === 'Q1' ? 'Ene-Mar' : q === 'Q2' ? 'Abr-Jun' : q === 'Q3' ? 'Jul-Sep' : 'Oct-Dic'})
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.trimestres[q].meta}
                                            onChange={(e) => handleTrimestreChange(q, e.target.value)}
                                            className="form-input-base text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                                <span className="text-text-secondary">Suma de trimestres:</span>
                                <span className={`font-bold ${validacion ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {formatCurrency(sumaTrimestres)} / {formatCurrency(formData.objetivoAnual)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer with audit info */}
                <footer className="flex items-center justify-between py-4 text-xs text-text-secondary">
                    <span>Última edición: 15 mayo 2025, Admin</span>
                    <span>Creado: {originalDistribuidor.createdAt}</span>
                </footer>
            </div>
        </AdminLayout>
    )
}

export default ClientDetailPage
