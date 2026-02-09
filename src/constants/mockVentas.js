// Mock sales history data

export const mockVentas = [
    {
        id: 'venta-1',
        distribuidorId: 'dist-acme',
        clienteNombre: 'Acme Corp',
        fecha: '2024-08-24',
        hora: '10:45 AM',
        trimestre: 'Q3',
        semana: 34,
        anio: 2024,
        monto: 124500.00,
        estado: 'verificado',
    },
    {
        id: 'venta-2',
        distribuidorId: 'dist-global',
        clienteNombre: 'Globex Corp',
        fecha: '2024-08-23',
        hora: '03:12 PM',
        trimestre: 'Q3',
        semana: 34,
        anio: 2024,
        monto: 89200.50,
        estado: 'verificado',
    },
    {
        id: 'venta-3',
        distribuidorId: 'dist-tech',
        clienteNombre: 'Soylent Corp',
        fecha: '2024-08-22',
        hora: '09:00 AM',
        trimestre: 'Q3',
        semana: 33,
        anio: 2024,
        monto: 215700.00,
        estado: 'pendiente',
    },
    {
        id: 'venta-4',
        distribuidorId: 'dist-acme',
        clienteNombre: 'Acme Corp',
        fecha: '2024-08-20',
        hora: '02:30 PM',
        trimestre: 'Q3',
        semana: 33,
        anio: 2024,
        monto: 87350.00,
        estado: 'verificado',
    },
    {
        id: 'venta-5',
        distribuidorId: 'dist-apex',
        clienteNombre: 'Intech Solutions',
        fecha: '2024-08-19',
        hora: '11:20 AM',
        trimestre: 'Q3',
        semana: 33,
        anio: 2024,
        monto: 156800.00,
        estado: 'verificado',
    },
]

// Helper to add a new sale (mock)
export const addVenta = (venta) => {
    const newVenta = {
        ...venta,
        id: `venta-${Date.now()}`,
        estado: 'pendiente',
    }
    mockVentas.unshift(newVenta)
    return newVenta
}

// Get sales by distributor
export const getVentasByDistribuidor = (distribuidorId) => {
    return mockVentas.filter(v => v.distribuidorId === distribuidorId)
}

// Get recent sales
export const getRecentVentas = (limit = 10) => {
    return mockVentas.slice(0, limit)
}
