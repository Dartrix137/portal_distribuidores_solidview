// Mock users for authentication
// Password field is only for mock authentication - will be removed in Phase 2

export const mockUsers = [
    {
        id: 'admin-1',
        email: 'admin@solidview.com',
        password: 'admin123',
        role: 'admin',
        nombre: 'Alex Director',
        activo: true,
        ultimaActividad: 'Hace 2 horas',
        avatar: null,
    },
    {
        id: 'admin-2',
        email: 'emily@solidview.com',
        password: 'admin123',
        role: 'admin',
        nombre: 'Emily Davis',
        activo: true,
        ultimaActividad: 'Hace 3 días',
        avatar: null,
    },
    {
        id: 'dist-1',
        email: 'distribuidor@acme.com',
        password: 'dist123',
        role: 'distribuidor',
        nombre: 'Usuario Corporativo',
        distribuidorId: 'dist-acme',
        activo: true,
        ultimaActividad: 'Hace 5 min',
        clienteNombre: 'Acme Corp',
    },
    {
        id: 'dist-2',
        email: 'sarah@acme.com',
        password: 'dist123',
        role: 'distribuidor',
        nombre: 'Sarah Jenkins',
        distribuidorId: 'dist-acme',
        activo: true,
        ultimaActividad: 'Hace 5 min',
        clienteNombre: 'Acme Corp',
    },
    {
        id: 'dist-3',
        email: 'michael@global.inc',
        password: 'dist123',
        role: 'distribuidor',
        nombre: 'Michael Chen',
        distribuidorId: 'dist-global',
        activo: true,
        ultimaActividad: 'Hace 1 día',
        clienteNombre: 'Global Industries',
    },
    {
        id: 'dist-4',
        email: 'robert@tech-sol.io',
        password: 'dist123',
        role: 'distribuidor',
        nombre: 'Robert Wilson',
        distribuidorId: 'dist-tech',
        activo: true,
        ultimaActividad: 'Activo ahora',
        clienteNombre: 'Tech Solutions',
    },
]

export const getUserById = (id) => mockUsers.find(u => u.id === id)
export const getUsersByRole = (role) => mockUsers.filter(u => u.role === role)
