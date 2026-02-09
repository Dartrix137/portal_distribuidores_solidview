// Mock distributors data with quarterly sales information

export const mockDistribuidores = [
    {
        id: 'dist-acme',
        nombre: 'Acme Corporation Ltd.',
        nombreCorto: 'Acme Corp',
        iniciales: 'AC',
        region: 'Norteamérica (Global HQ)',
        tipo: 'Corporativo',
        sector: 'Manufactura y Hardware',
        objetivoAnual: 12500000,
        activo: true,
        color: 'primary',
        kam: { id: 'kam-1', nombre: 'Jane Doe', iniciales: 'JD' },
        trimestres: {
            Q1: { meta: 2500000, venta: 2600000 },
            Q2: { meta: 3000000, venta: 2760000 },
            Q3: { meta: 3500000, venta: 2730000 },
            Q4: { meta: 3500000, venta: 660000, enCurso: true, proyectado: 3320000 },
        },
        createdAt: '2023-01-15',
    },
    {
        id: 'dist-global',
        nombre: 'Global Logistics Corp',
        nombreCorto: 'Global Logistics',
        iniciales: 'GL',
        region: 'NY, USA',
        tipo: 'Corporativo',
        sector: 'Logística y Transporte',
        objetivoAnual: 8000000,
        activo: true,
        color: 'primary',
        kam: { id: 'kam-2', nombre: 'John Smith', iniciales: 'JS' },
        trimestres: {
            Q1: { meta: 2000000, venta: 2100000 },
            Q2: { meta: 2000000, venta: 1950000 },
            Q3: { meta: 2000000, venta: 1750000 },
            Q4: { meta: 2000000, venta: 400000, enCurso: true, proyectado: 1900000 },
        },
        createdAt: '2023-03-22',
    },
    {
        id: 'dist-tech',
        nombre: 'Techstream Solutions',
        nombreCorto: 'Techstream',
        iniciales: 'TS',
        region: 'Londres, UK',
        tipo: 'Pyme',
        sector: 'Software y SaaS',
        objetivoAnual: 5000000,
        activo: true,
        color: 'purple',
        kam: { id: 'kam-1', nombre: 'Jane Doe', iniciales: 'JD' },
        trimestres: {
            Q1: { meta: 1250000, venta: 1300000 },
            Q2: { meta: 1250000, venta: 1280000 },
            Q3: { meta: 1250000, venta: 1100000 },
            Q4: { meta: 1250000, venta: 280000, enCurso: true, proyectado: 1200000 },
        },
        createdAt: '2023-05-10',
    },
    {
        id: 'dist-apex',
        nombre: 'Apex Ventures',
        nombreCorto: 'Apex',
        iniciales: 'AV',
        region: 'Austin, USA',
        tipo: 'Venture',
        sector: 'Servicios Financieros',
        objetivoAnual: 3000000,
        activo: false,
        color: 'orange',
        kam: { id: 'kam-3', nombre: 'Maria Garcia', iniciales: 'MG' },
        trimestres: {
            Q1: { meta: 750000, venta: 600000 },
            Q2: { meta: 750000, venta: 550000 },
            Q3: { meta: 750000, venta: 420000 },
            Q4: { meta: 750000, venta: 0, enCurso: true, proyectado: 500000 },
        },
        createdAt: '2023-07-01',
    },
]

// Helper functions
export const getDistribuidorById = (id) => mockDistribuidores.find(d => d.id === id)

export const calcularVentaAnual = (trimestres) => {
    return Object.values(trimestres).reduce((sum, t) => sum + t.venta, 0)
}

export const calcularPorcentajeCumplimiento = (venta, objetivo) => {
    if (objetivo === 0) return 0
    return Math.round((venta / objetivo) * 100)
}

export const getMensajeEstado = (porcentaje) => {
    if (porcentaje >= 100) return { mensaje: 'Objetivo alcanzado', tipo: 'success' }
    if (porcentaje >= 80) return { mensaje: `Faltante para meta`, tipo: 'warning' }
    return { mensaje: 'No ha logrado el objetivo', tipo: 'error' }
}

export const getColorBadge = (porcentaje) => {
    if (porcentaje >= 100) return 'success'
    if (porcentaje >= 80) return 'warning'
    return 'error'
}
