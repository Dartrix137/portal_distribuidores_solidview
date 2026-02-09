import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { mockDistribuidores, calcularVentaAnual, calcularPorcentajeCumplimiento, getMensajeEstado, getColorBadge } from '../constants/mockDistribuidores'
import { formatCurrency } from '../utils/formatters'
import logo from '../assets/logo.webp'

const DashboardPage = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Get distributor data - for demo we use the first one
    const distribuidor = mockDistribuidores.find(d => d.id === user?.distribuidorId) || mockDistribuidores[0]

    // In a real app we would fetch data for selectedYear here
    // For mock, we'll just use the static data but pretend it matches the year

    const ventaAnual = calcularVentaAnual(distribuidor.trimestres)
    const porcentajeAnual = calcularPorcentajeCumplimiento(ventaAnual, distribuidor.objetivoAnual)
    const faltanteAnual = distribuidor.objetivoAnual - ventaAnual
    const estadoAnual = getMensajeEstado(porcentajeAnual)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

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
                            Dashboard {distribuidor.nombre}
                        </h2>
                        <p className="text-text-secondary">
                            Informe Ejecutivo de Desempeño Comercial • Año Fiscal {selectedYear}
                        </p>
                    </div>
                    <div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="form-input-base w-32 py-2 text-sm font-bold text-text-primary"
                        >
                            <option value={2024}>2024</option>
                            <option value={2023}>2023</option>
                            <option value={2022}>2022</option>
                        </select>
                    </div>
                </div>

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
                                    / {formatCurrency(distribuidor.objetivoAnual, { compact: true })} Meta
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

                {/* Quarterly Goals Section */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-text-primary">Metas Trimestrales</h3>
                    <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> &lt; 80%
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> 80-99%
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 100%+
                        </span>
                    </div>
                </div>

                {/* Quarterly Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                        const data = distribuidor.trimestres[quarter]
                        const porcentaje = calcularPorcentajeCumplimiento(data.venta, data.meta)
                        const faltante = data.meta - data.venta
                        const colorBadge = getColorBadge(porcentaje)
                        const estado = getMensajeEstado(porcentaje)

                        return (
                            <div
                                key={quarter}
                                className={`bg-white border p-6 rounded-xl relative ${data.enCurso ? 'border-2 border-primary/20' : 'border-gray-200'
                                    }`}
                            >
                                {data.enCurso && (
                                    <div className="absolute -top-2 right-4 bg-primary text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">
                                        En curso
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-black text-xl text-text-primary">{quarter}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-black ${colorBadge === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                        colorBadge === 'warning' ? 'bg-amber-50 text-amber-600' :
                                            data.enCurso ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {data.enCurso ? `Est. ${porcentaje}%` : `${porcentaje}%`}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Meta</span>
                                        <span className="font-bold text-text-primary">
                                            {formatCurrency(data.meta, { compact: true })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Venta Real</span>
                                        <span className={`font-bold ${data.enCurso ? 'text-primary' : 'text-text-primary'}`}>
                                            {formatCurrency(data.venta, { compact: true })}
                                        </span>
                                    </div>
                                    <div className="pt-3 mt-3 border-t border-gray-100">
                                        {data.enCurso ? (
                                            <p className="text-xs font-bold text-text-secondary uppercase">
                                                Proyectado: {formatCurrency(data.proyectado, { compact: true })}
                                            </p>
                                        ) : porcentaje >= 100 ? (
                                            <p className="text-xs font-bold text-emerald-600">Objetivo alcanzado</p>
                                        ) : (
                                            <p className="text-xs font-bold text-red-600 italic">
                                                Faltante: {formatCurrency(faltante, { compact: true })}
                                            </p>
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
                                ? ` Se requiere un incremento en las operaciones de cierre para el último trimestre para alcanzar la meta anual de ${formatCurrency(distribuidor.objetivoAnual, { compact: true })}. El rendimiento del Q4 muestra una tendencia de recuperación positiva.`
                                : ' ¡Felicidades! Has alcanzado tu objetivo anual de ventas.'
                            }
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-text-secondary text-xs border-t border-gray-100">
                <p>© 2024 Solidview. Información corporativa confidencial. Todos los derechos reservados.</p>
            </footer>
        </div>
    )
}

export default DashboardPage
