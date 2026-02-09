import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'

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

const CreateClientPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        nombre: '',
        sector: SECTORES[0],
        kam: '',
        region: REGIONES[0],
        objetivoAnual: 0,
        trimestres: {
            Q1: { meta: 0 },
            Q2: { meta: 0 },
            Q3: { meta: 0 },
            Q4: { meta: 0 },
        },
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        // In a real app we would save to DB
        console.log('Creating client:', formData)

        setLoading(false)
        navigate('/admin/clientes')
    }

    const sumaTrimestres = Object.values(formData.trimestres).reduce((sum, t) => sum + t.meta, 0)
    const validacion = sumaTrimestres === formData.objetivoAnual

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
                        disabled={!validacion || loading}
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
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/clientes')}
                        className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-text-secondary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Registrar Nuevo Cliente</h2>
                        <p className="text-text-secondary">Ingrese los datos corporativos y objetivos financieros</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <section className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-text-primary">Información Corporativa</h3>
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
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    KAM asignado
                                </label>
                                <input
                                    type="text"
                                    value={formData.kam}
                                    onChange={(e) => handleChange('kam', e.target.value)}
                                    className="form-input-base"
                                    required
                                    placeholder="Ej. Juan Pérez"
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

                    {/* Goals */}
                    <section className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-bold text-text-primary">Objetivos Financieros (FY 2024)</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Objetivo anual total (USD)
                                </label>
                                <input
                                    type="number"
                                    value={formData.objetivoAnual}
                                    onChange={(e) => handleChange('objetivoAnual', Number(e.target.value))}
                                    className="form-input-base max-w-xs"
                                    placeholder="0.00"
                                    min="0"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-semibold text-text-primary">
                                        Desglose trimestral
                                    </label>
                                    {!validacion && (
                                        <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            La suma debe coincidir con el objetivo anual
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                        <div key={q}>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                {q}
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.trimestres[q].meta}
                                                onChange={(e) => handleTrimestreChange(q, e.target.value)}
                                                className="form-input-base text-sm"
                                                min="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                                    <span className="text-text-secondary">Suma actual:</span>
                                    <span className={`font-bold ${validacion ? 'text-emerald-600' : 'text-red-500'}`}>
                                        ${sumaTrimestres.toLocaleString()} / ${formData.objetivoAnual.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </AdminLayout>
    )
}

export default CreateClientPage
