import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { distribuidorService } from '../services/distribuidorService'
import { ventasService } from '../services/ventasService'
import { objetivosService } from '../services/objetivosService'
import { formatCurrency } from '../utils/formatters'
import logo from '../assets/logo.webp'

// Helper functions (migrated from mockDistribuidores)
const calcularPorcentajeCumplimiento = (venta, objetivo) => {
    if (objetivo === 0) return 0
    return Math.round((venta / objetivo) * 100)
}

const getMensajeEstado = (porcentaje) => {
    if (porcentaje >= 100) return { mensaje: 'Cumpliste. ¿Te atreves a ir por mas?', tipo: 'success' }
    if (porcentaje > 80) return { mensaje: 'Lo bueno puede ser excelente. Ve por el 100%.', tipo: 'warning' }
    return { mensaje: 'Aún estás a tiempo de cambiar el resultado', tipo: 'error' }
}

const getColorBadge = (porcentaje) => {
    if (porcentaje >= 100) return 'success'
    if (porcentaje > 80) return 'warning'
    return 'error'
}

// Determinar trimestre actual basado en la fecha
const getCurrentQuarter = () => {
    const month = new Date().getMonth() + 1
    if (month <= 3) return 'Q1'
    if (month <= 6) return 'Q2'
    if (month <= 9) return 'Q3'
    return 'Q4'
}

const DashboardPage = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Data from Supabase
    const [distribuidor, setDistribuidor] = useState(null)
    const [resumenVentas, setResumenVentas] = useState({ Q1: 0, Q2: 0, Q3: 0, Q4: 0 })
    const [objetivosMap, setObjetivosMap] = useState({ Q1: 0, Q2: 0, Q3: 0, Q4: 0 })
    const [objetivoAnual, setObjetivoAnual] = useState(0)

    useEffect(() => {
        loadDashboardData()
    }, [user, selectedYear])

    const loadDashboardData = async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)

            // Obtener distribuidor del usuario actual
            const dist = await distribuidorService.getByUserId(user.id)
            setDistribuidor(dist)

            // Cargar ventas y objetivos en paralelo
            const [ventas, objetivos] = await Promise.all([
                ventasService.getResumenTrimestral(dist.id, selectedYear),
                objetivosService.getByDistribuidor(dist.id, selectedYear),
            ])

            setResumenVentas(ventas)

            // Procesar objetivos
            const objMap = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
            let sumObjetivos = 0
            objetivos.forEach((o) => {
                const meta = parseFloat(o.meta) || 0
                objMap[o.trimestre] = meta
                sumObjetivos += meta
            })
            setObjetivosMap(objMap)
            setObjetivoAnual(sumObjetivos)
        } catch (err) {
            console.error('Error cargando dashboard:', err)
            setError('Error al cargar los datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    // Cálculos derivados
    const ventaAnual = Object.values(resumenVentas).reduce((sum, v) => sum + v, 0)
    const porcentajeAnual = calcularPorcentajeCumplimiento(ventaAnual, objetivoAnual)
    const faltanteAnual = objetivoAnual - ventaAnual
    const estadoAnual = getMensajeEstado(porcentajeAnual)

    // Trimestre actual
    const currentQuarterKey = getCurrentQuarter()
    const currentQuarterVenta = resumenVentas[currentQuarterKey] || 0
    const currentQuarterMeta = objetivosMap[currentQuarterKey] || 0
    const qPorcentaje = calcularPorcentajeCumplimiento(currentQuarterVenta, currentQuarterMeta)
    const qFaltante = currentQuarterMeta - currentQuarterVenta
    const qEstado = getMensajeEstado(qPorcentaje)

    // Year options (from current year down to 2025)
    const currentYear = new Date().getFullYear()
    const startYear = 2025
    const yearOptions = Array.from(
        { length: Math.max(1, currentYear - startYear + 1) },
        (_, i) => currentYear - i
    )

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="flex items-center justify-between bg-white px-6 md:px-12 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    <img src={logo} alt="Solidview Logo" className="h-10 w-auto" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-text-primary">{user?.nombre || 'Usuario Corporativo'}</p>
                        <p className="text-xs text-text-secondary mt-1">Cliente Premium</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        title="Cerrar sesión"
                    >
                        <span className="material-symbols-outlined text-text-secondary">logout</span>
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
                {/* Title */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-text-primary mb-2">
                            Dashboard {distribuidor?.nombre || ''}
                        </h2>
                        <p className="text-text-secondary">
                            Informe Ejecutivo de Desempeño Comercial • Año {selectedYear}
                        </p>
                    </div>
                    <div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="form-input-base w-32 py-2 text-sm font-bold text-text-primary"
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                        <button onClick={loadDashboardData} className="ml-2 underline font-medium">
                            Reintentar
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Annual Summary Card */}
                        <div className="card p-8 mb-8">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                                        Objetivo Anual
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-text-primary">
                                            {formatCurrency(ventaAnual, { compact: true })}
                                        </span>
                                        <span className="text-slate-400 text-xl font-medium">
                                            / {formatCurrency(objetivoAnual, { compact: true })} Meta
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-semibold text-text-primary">Venta real acumulada</span>
                                        <span className="text-primary font-black text-lg">{porcentajeAnual}% de cumplimiento</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(porcentajeAnual, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-text-secondary">
                                            Faltante: {formatCurrency(Math.max(faltanteAnual, 0))}
                                        </span>
                                        <span className={`font-bold italic ${estadoAnual.tipo === 'success' ? 'text-emerald-600' :
                                            estadoAnual.tipo === 'warning' ? 'text-amber-600' : 'text-red-500'
                                            }`}>
                                            {estadoAnual.mensaje}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Quarter Progress Section */}
                        {currentQuarterMeta > 0 && (
                            <div className="card p-8 mb-8 border-l-4 border-l-primary relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <span className="material-symbols-outlined text-9xl text-primary transform rotate-12 select-none">
                                        calendar_today
                                    </span>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">timelapse</span>
                                                Objetivo Trimestral Actual ({currentQuarterKey})
                                            </h3>
                                            <p className="text-sm text-text-secondary mt-1">
                                                Seguimiento en tiempo real del trimestre en curso
                                            </p>
                                        </div>
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                            En Curso
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-4xl font-black text-text-primary">
                                                    {formatCurrency(currentQuarterVenta, { compact: true })}
                                                </span>
                                                <span className="text-slate-400 text-lg font-medium">
                                                    / {formatCurrency(currentQuarterMeta, { compact: true })} Meta
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-semibold text-text-primary">Progreso del trimestre</span>
                                                <span className={`font-black text-lg ${qEstado.tipo === 'success' ? 'text-emerald-600' : qEstado.tipo === 'warning' ? 'text-amber-600' : 'text-primary'}`}>
                                                    {qPorcentaje}%
                                                </span>
                                            </div>

                                            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 relative ${qEstado.tipo === 'success' ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min(qPorcentaje, 100)}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-text-secondary">
                                                    {qFaltante > 0 ? (
                                                        <>Faltante: <span className="font-semibold text-text-primary">{formatCurrency(qFaltante)}</span></>
                                                    ) : (
                                                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                                            Meta superada por {formatCurrency(Math.abs(qFaltante))}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className={`font-bold italic ${qEstado.tipo === 'success' ? 'text-emerald-600' :
                                                    qEstado.tipo === 'warning' ? 'text-amber-600' : 'text-red-500'
                                                    }`}>
                                                    {qEstado.mensaje}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quarterly Goals Section */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-text-primary">Metas Trimestrales</h3>
                            <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> &lt; 80%
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> 81-99%
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 100%+
                                </span>
                            </div>
                        </div>

                        {/* Quarterly Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                                const venta = resumenVentas[quarter] || 0
                                const meta = objetivosMap[quarter] || 0
                                const porcentaje = calcularPorcentajeCumplimiento(venta, meta)
                                const faltante = meta - venta
                                const colorBadge = getColorBadge(porcentaje)
                                const isCurrentQ = quarter === currentQuarterKey && selectedYear === currentYear

                                return (
                                    <div
                                        key={quarter}
                                        className={`bg-white border p-6 rounded-xl relative ${isCurrentQ ? 'border-2 border-primary/20' : 'border-gray-200'
                                            }`}
                                    >
                                        {isCurrentQ && (
                                            <div className="absolute -top-2 right-4 bg-primary text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">
                                                En curso
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="font-black text-xl text-text-primary">{quarter}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-black ${colorBadge === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                colorBadge === 'warning' ? 'bg-amber-50 text-amber-600' :
                                                    isCurrentQ ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {isCurrentQ ? `Est. ${porcentaje}%` : `${porcentaje}%`}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Meta</span>
                                                <span className="font-bold text-text-primary">
                                                    {formatCurrency(meta, { compact: true })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-text-secondary">
                                                <span>Venta Real</span>
                                                <span className={`font-bold ${isCurrentQ ? 'text-primary' : 'text-text-primary'}`}>
                                                    {formatCurrency(venta, { compact: true })}
                                                </span>
                                            </div>
                                            <div className="pt-3 mt-3 border-t border-gray-100">
                                                {porcentaje >= 100 ? (
                                                    <p className="text-xs font-bold text-emerald-600">Meta alcanzada</p>
                                                ) : meta > 0 ? (
                                                    <p className="text-xs font-bold text-red-600 italic">
                                                        Pendiente: {formatCurrency(faltante, { compact: true })}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs font-bold text-text-secondary">Sin meta definida</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Status Alert */}
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
                            <div className="p-2 bg-primary rounded-lg text-white">
                                <span className="material-symbols-outlined">info</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary">Estado de Cuenta</h4>
                                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                                    Actualmente el cumplimiento general es del {porcentajeAnual}%.
                                    {faltanteAnual > 0
                                        ? ` Se requiere un incremento en las operaciones de cierre para alcanzar la meta anual de ${formatCurrency(objetivoAnual, { compact: true })}.`
                                        : ' ¡Felicidades! Has alcanzado tu objetivo anual de ventas.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Reglas de Comisión */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                Reglas de Comisión
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Tier 1 */}
                                <div className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${porcentajeAnual >= 80 && porcentajeAnual <= 89
                                    ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-100'
                                    : 'border-gray-200 bg-white'
                                    }`}>
                                    {porcentajeAnual >= 80 && porcentajeAnual <= 89 && (
                                        <div className="absolute -top-2.5 left-4 bg-amber-500 text-white text-[9px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                                            Tu nivel actual
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${porcentajeAnual >= 80 && porcentajeAnual <= 89
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <span className="material-symbols-outlined text-xl">trending_up</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-text-primary">1%</p>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">sobre facturación</p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-semibold rounded-lg py-2 px-3 text-center ${porcentajeAnual >= 80 && porcentajeAnual <= 89
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-50 text-text-secondary'
                                        }`}>
                                        80% – 89% de cumplimiento
                                    </div>
                                </div>

                                {/* Tier 2 */}
                                <div className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${porcentajeAnual >= 90 && porcentajeAnual <= 109
                                    ? 'border-blue-400 bg-blue-50 shadow-lg shadow-blue-100'
                                    : 'border-gray-200 bg-white'
                                    }`}>
                                    {porcentajeAnual >= 90 && porcentajeAnual <= 109 && (
                                        <div className="absolute -top-2.5 left-4 bg-blue-500 text-white text-[9px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                                            Tu nivel actual
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${porcentajeAnual >= 90 && porcentajeAnual <= 109
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <span className="material-symbols-outlined text-xl">rocket_launch</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-text-primary">2%</p>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">sobre facturación</p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-semibold rounded-lg py-2 px-3 text-center ${porcentajeAnual >= 90 && porcentajeAnual <= 109
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-50 text-text-secondary'
                                        }`}>
                                        90% – 109% de cumplimiento
                                    </div>
                                </div>

                                {/* Tier 3 */}
                                <div className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${porcentajeAnual >= 110
                                    ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100'
                                    : 'border-gray-200 bg-white'
                                    }`}>
                                    {porcentajeAnual >= 110 && (
                                        <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[9px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
                                            Tu nivel actual
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${porcentajeAnual >= 110
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <span className="material-symbols-outlined text-xl">emoji_events</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-text-primary">3%</p>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">sobre facturación</p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-semibold rounded-lg py-2 px-3 text-center ${porcentajeAnual >= 110
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-50 text-text-secondary'
                                        }`}>
                                        &gt;110% de cumplimiento
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-text-secondary mt-3 italic">
                                <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
                                Las comisiones se calculan sobre el total de facturación del período y están sujetas a las políticas comerciales vigentes.
                            </p>
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-text-secondary text-xs border-t border-gray-100">
                <p>© 2026. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}

export default DashboardPage
