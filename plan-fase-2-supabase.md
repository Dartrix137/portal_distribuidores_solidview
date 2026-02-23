# Plan Detallado - FASE 2: Integración con Supabase

## Contexto Técnico

### Infraestructura
- **Supabase**: Autoalojado en VPS de Hostinger
- **Gestión**: Dokploy
- **Base de datos**: PostgreSQL con el schema SQL proporcionado
- **Autenticación**: Supabase Auth

### Consideraciones Importantes
- El administrador es el ÚNICO que puede crear usuarios
- El administrador asigna las contraseñas iniciales
- Solo el administrador puede actualizar contraseñas
- Los distribuidores NO pueden cambiar su propia contraseña
- RLS (Row Level Security) ya configurado en el SQL

---

## 1. CONFIGURACIÓN INICIAL DE SUPABASE

### 1.1 Verificación de Infraestructura
**Checklist previo**:
- [ ] Confirmar que Supabase está corriendo en el VPS
- [ ] Obtener URL del proyecto Supabase
- [ ] Obtener anon key (clave pública)
- [ ] Obtener service_role key (clave privada para operaciones admin)
- [ ] Verificar que PostgreSQL está accesible

### 1.2 Variables de Entorno
Crear archivo `.env` en la raíz del proyecto React:

```env
VITE_SUPABASE_URL=https://tu-supabase-url.com
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**IMPORTANTE**: 
- La `service_role_key` solo debe usarse en operaciones administrativas
- NUNCA exponer la `service_role_key` en el cliente
- Considerar crear un edge function o API endpoint para operaciones que requieran service_role

### 1.3 Instalación de Dependencias
```bash
npm install @supabase/supabase-js
```

### 1.4 Configuración del Cliente Supabase
Crear archivo `/src/services/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente con privilegios de servicio (SOLO para operaciones admin)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

---

## 2. EJECUCIÓN DEL SCHEMA SQL

### 2.1 Aplicar el Schema
Conectarse a la base de datos de Supabase y ejecutar el SQL proporcionado:

**Opción 1: Desde el Panel de Supabase**
1. Acceder al panel de administración de Supabase
2. Ir a SQL Editor
3. Copiar y pegar el contenido del archivo SQL
4. Ejecutar

**Opción 2: Desde CLI**
```bash
psql -h tu-host -U postgres -d postgres -f schema.sql
```

### 2.2 Verificar Tablas Creadas
```sql
-- Verificar que las tablas existen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 3. CONFIGURACIÓN DE AUTENTICACIÓN SUPABASE

### 3.1 Configuración en Dashboard de Supabase
**Autenticación por Email/Password**:
1. Ir a Authentication > Settings
2. Habilitar "Email" como proveedor
3. **CRÍTICO**: Deshabilitar "Enable email confirmations" 
   - Los usuarios son creados por el admin
   - No deben confirmar por email
4. **CRÍTICO**: Deshabilitar "Enable email change confirmations"
5. Configurar "Site URL" (URL de tu aplicación React)

### 3.2 Desactivar Auto-registro
**IMPORTANTE**: Los usuarios NO deben poder registrarse por sí mismos.

En el panel de Supabase:
1. Authentication > Settings
2. En "Auth Providers" > Email
3. Desmarcar "Enable sign ups"

Esto asegura que SOLO el administrador puede crear cuentas.

---

## 4. MIGRACIÓN DE AUTENTICACIÓN (De Mock a Supabase)

### 4.1 Crear Servicio de Autenticación
Archivo: `/src/services/authService.js`

```javascript
import { supabase } from './supabase'

export const authService = {
  // Login de usuarios
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // Obtener información adicional del usuario desde la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (userError) throw userError
      
      return {
        user: data.user,
        userData: userData,
        role: userData.role
      }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      if (!session) return null
      
      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (userError) throw userError
      
      return {
        user: session.user,
        userData: userData,
        role: userData.role
      }
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Listener de cambios de auth
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
```

### 4.2 Crear Hook de Autenticación
Archivo: `/src/hooks/useAuth.js`

```javascript
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión al cargar
    checkSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const sessionData = await authService.getSession()
          setUser(sessionData?.user || null)
          setUserData(sessionData?.userData || null)
        } else {
          setUser(null)
          setUserData(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    try {
      const session = await authService.getSession()
      if (session) {
        setUser(session.user)
        setUserData(session.userData)
      }
    } catch (error) {
      console.error('Error verificando sesión:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data.user)
    setUserData(data.userData)
    return data
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setUserData(null)
  }

  return {
    user,
    userData,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: userData?.role === 'admin',
    isDistribuidor: userData?.role === 'distribuidor'
  }
}
```

### 4.3 Actualizar Protección de Rutas
Archivo: `/src/components/ProtectedRoute.jsx`

```javascript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return <div>Cargando...</div> // O un componente de loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
```

---

## 5. GESTIÓN DE USUARIOS (SOLO ADMINISTRADOR)

### 5.1 Consideraciones Críticas
- **La creación de usuarios en Supabase Auth requiere service_role_key**
- **NUNCA exponer service_role_key en el frontend**
- **Opciones de implementación**:
  - **Opción A**: Crear Edge Function en Supabase (RECOMENDADO)
  - **Opción B**: Crear API middleware Node.js (alternativa)
  - **Opción C**: Usar service_role desde cliente (NO RECOMENDADO, solo para desarrollo)

### 5.2 OPCIÓN RECOMENDADA: Edge Function en Supabase

#### Crear Edge Function para gestión de usuarios
**Ubicación**: En el dashboard de Supabase > Edge Functions

**Archivo**: `create-user.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Verificar que quien llama es admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401 
      })
    }

    // Crear cliente Supabase con service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar que el usuario es admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401 
      })
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403 
      })
    }

    // Obtener datos del body
    const { email, password, nombre, role, region, objetivo_anual } = await req.json()

    // Crear usuario en Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nombre,
        role
      }
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), { 
        status: 400 
      })
    }

    // Insertar en tabla users
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email,
        role,
        nombre,
        activo: true
      })
      .select()
      .single()

    if (userError) {
      // Si falla, eliminar usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(JSON.stringify({ error: userError.message }), { 
        status: 400 
      })
    }

    // Si es distribuidor, crear registro en tabla distribuidores
    if (role === 'distribuidor') {
      const { error: distError } = await supabaseAdmin
        .from('distribuidores')
        .insert({
          user_id: newUser.user.id,
          nombre,
          region: region || null,
          objetivo_anual: objetivo_anual || 0
        })

      if (distError) {
        // Rollback: eliminar usuario
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        await supabaseAdmin.from('users').delete().eq('id', newUser.user.id)
        return new Response(JSON.stringify({ error: distError.message }), { 
          status: 400 
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userRecord 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    )
  }
})
```

**Archivo**: `update-user-password.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401 
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 401 
      })
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { 
        status: 403 
      })
    }

    // Obtener datos
    const { userId, newPassword } = await req.json()

    // Actualizar contraseña
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400 
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    )
  }
})
```

### 5.3 Servicio de Usuario en el Frontend
Archivo: `/src/services/userService.js`

```javascript
import { supabase } from './supabase'

export const userService = {
  // Crear usuario (llama a Edge Function)
  async createUser(userData) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error creando usuario')
      }

      return data
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  // Actualizar contraseña (llama a Edge Function)
  async updatePassword(userId, newPassword) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId, newPassword })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error actualizando contraseña')
      }

      return data
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  },

  // Listar usuarios (admin)
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        distribuidores (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Actualizar usuario (datos básicos, NO contraseña)
  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Desactivar usuario
  async deactivateUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .update({ activo: false })
      .eq('id', userId)

    if (error) throw error
    return data
  }
}
```

---

## 6. MIGRACIÓN DE DATOS Y OPERACIONES

### 6.1 Servicio de Distribuidores
Archivo: `/src/services/distribuidorService.js`

```javascript
import { supabase } from './supabase'

export const distribuidorService = {
  // Obtener todos los distribuidores (admin)
  async getAll() {
    const { data, error } = await supabase
      .from('distribuidores')
      .select(`
        *,
        users (email, nombre, activo)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Obtener distribuidor por user_id
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('distribuidores')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Actualizar distribuidor
  async update(id, updates) {
    const { data, error } = await supabase
      .from('distribuidores')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```

### 6.2 Servicio de Ventas
Archivo: `/src/services/ventasService.js`

```javascript
import { supabase } from './supabase'

export const ventasService = {
  // Obtener ventas de un distribuidor
  async getByDistribuidor(distribuidorId) {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('distribuidor_id', distribuidorId)
      .order('fecha', { ascending: true })

    if (error) throw error
    return data
  },

  // Crear venta
  async create(ventaData) {
    const { data, error } = await supabase
      .from('ventas')
      .insert(ventaData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Actualizar venta
  async update(id, updates) {
    const { data, error } = await supabase
      .from('ventas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Eliminar venta
  async delete(id) {
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obtener resumen por trimestre
  async getResumenTrimestral(distribuidorId, año) {
    const { data, error } = await supabase
      .from('ventas')
      .select('trimestre, monto')
      .eq('distribuidor_id', distribuidorId)
      .gte('fecha', `${año}-01-01`)
      .lte('fecha', `${año}-12-31`)

    if (error) throw error

    // Agrupar por trimestre
    const resumen = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0
    }

    data.forEach(venta => {
      resumen[venta.trimestre] += parseFloat(venta.monto)
    })

    return resumen
  }
}
```

### 6.3 Servicio de Objetivos
Archivo: `/src/services/objetivosService.js`

```javascript
import { supabase } from './supabase'

export const objetivosService = {
  // Obtener objetivos de un distribuidor
  async getByDistribuidor(distribuidorId, año) {
    const { data, error } = await supabase
      .from('objetivos')
      .select('*')
      .eq('distribuidor_id', distribuidorId)
      .eq('año', año)

    if (error) throw error
    return data
  },

  // Crear o actualizar objetivo
  async upsert(objetivoData) {
    const { data, error } = await supabase
      .from('objetivos')
      .upsert(objetivoData, {
        onConflict: 'distribuidor_id,trimestre,año'
      })
      .select()

    if (error) throw error
    return data
  },

  // Crear objetivos para el año (los 4 trimestres)
  async createYearObjectives(distribuidorId, año, objetivos) {
    const data = [
      { distribuidor_id: distribuidorId, trimestre: 'Q1', año, meta: objetivos.Q1 },
      { distribuidor_id: distribuidorId, trimestre: 'Q2', año, meta: objetivos.Q2 },
      { distribuidor_id: distribuidorId, trimestre: 'Q3', año, meta: objetivos.Q3 },
      { distribuidor_id: distribuidorId, trimestre: 'Q4', año, meta: objetivos.Q4 },
    ]

    const { data: result, error } = await supabase
      .from('objetivos')
      .upsert(data)
      .select()

    if (error) throw error
    return result
  }
}
```

---

## 7. ACTUALIZACIÓN DE COMPONENTES

### 7.1 Página de Login
Reemplazar lógica mock por llamada real a `authService.login()`

```javascript
const handleLogin = async (e) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    const { role } = await login(email, password)
    
    // Redireccionar según rol
    if (role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  } catch (error) {
    setError('Credenciales inválidas')
  } finally {
    setLoading(false)
  }
}
```

### 7.2 Dashboard de Distribuidor
Cargar datos reales desde Supabase

```javascript
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Obtener distribuidor
      const distribuidor = await distribuidorService.getByUserId(user.id)
      
      // Obtener ventas del año actual
      const ventas = await ventasService.getByDistribuidor(distribuidor.id)
      
      // Obtener objetivos
      const objetivos = await objetivosService.getByDistribuidor(
        distribuidor.id, 
        new Date().getFullYear()
      )
      
      // Calcular resumen
      const resumen = calcularResumen(ventas, objetivos, distribuidor.objetivo_anual)
      
      setData(resumen)
    } catch (error) {
      console.error('Error cargando datos:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    loadData()
  }
}, [user])
```

### 7.3 Consola de Administración
Integrar servicios reales para todas las operaciones CRUD

---

## 8. MANEJO DE ESTADOS Y ERRORES

### 8.1 Estados de Carga
- Implementar spinners o skeletons durante las peticiones
- Deshabilitar botones mientras se procesa

### 8.2 Manejo de Errores
```javascript
try {
  // Operación
} catch (error) {
  if (error.code === 'PGRST116') {
    // No se encontró el registro
  } else if (error.message.includes('JWT')) {
    // Sesión expirada
    logout()
    navigate('/login')
  } else {
    // Error genérico
    showToast('Error al realizar la operación', 'error')
  }
}
```

---

## 9. TESTING Y VALIDACIÓN

### 9.1 Checklist de Validación

**Autenticación**:
- [ ] Login con credenciales correctas funciona
- [ ] Login con credenciales incorrectas muestra error
- [ ] Sesión persiste al recargar página
- [ ] Logout funciona correctamente
- [ ] Redirección según rol funciona

**RLS (Row Level Security)**:
- [ ] Distribuidor solo ve sus propios datos
- [ ] Distribuidor no puede acceder a rutas de admin
- [ ] Admin puede ver todos los datos
- [ ] Queries sin autorización fallan correctamente

**CRUD de Usuarios (Admin)**:
- [ ] Admin puede crear distribuidores
- [ ] Admin puede crear otros admins
- [ ] Edge Function valida que solo admin puede crear
- [ ] Contraseña se asigna correctamente
- [ ] Usuario creado puede iniciar sesión
- [ ] Admin puede actualizar contraseña de usuarios
- [ ] Usuario no puede cambiar su propia contraseña

**CRUD de Ventas**:
- [ ] Admin puede cargar ventas
- [ ] Admin puede editar ventas
- [ ] Distribuidor solo ve sus ventas
- [ ] Cálculos de porcentaje son correctos

**Dashboard Distribuidor**:
- [ ] Muestra datos correctos del distribuidor
- [ ] Cálculos de cumplimiento son precisos
- [ ] Mensajes dinámicos se generan correctamente
- [ ] No hay opciones de edición visibles

---

## 10. ORDEN DE IMPLEMENTACIÓN

### Semana 1: Infraestructura Base
1. Configurar variables de entorno
2. Ejecutar schema SQL en Supabase
3. Crear servicios base (supabase.js, authService.js)
4. Implementar useAuth hook
5. Actualizar protección de rutas

### Semana 2: Autenticación y Usuarios
6. Crear Edge Functions (create-user, update-password)
7. Implementar userService
8. Actualizar página de Login
9. Actualizar consola admin para gestión de usuarios
10. Testing de autenticación y RLS

### Semana 3: Datos y Dashboard
11. Implementar servicios de datos (distribuidores, ventas, objetivos)
12. Actualizar Dashboard de distribuidor con datos reales
13. Implementar formularios de carga de ventas en admin
14. Testing de operaciones CRUD

### Semana 4: Refinamiento
15. Manejo de errores y validaciones
16. Estados de carga
17. Optimización de queries
18. Testing completo end-to-end

---

## 11. CONSIDERACIONES DE SEGURIDAD

### Políticas RLS - Verificación
- Las políticas ya están en el SQL
- Verificar que funcionan correctamente
- NUNCA usar service_role desde el cliente para operaciones normales

### Variables de Entorno
- `.env` en `.gitignore`
- Documentar variables necesarias en README
- Usar diferentes keys para desarrollo/producción

### Validaciones
- Validar inputs en cliente
- Confiar en RLS para seguridad en servidor
- Sanitizar datos antes de insertar

---

## 12. DOCUMENTACIÓN REQUERIDA

Crear archivo `SUPABASE_SETUP.md` con:
- URL del proyecto Supabase
- Pasos para ejecutar schema SQL
- Configuración de Edge Functions
- Variables de entorno necesarias
- Comandos útiles de Supabase CLI

---

## RESUMEN DE ENTREGABLES FASE 2

✅ Schema SQL aplicado en base de datos  
✅ Edge Functions para gestión de usuarios  
✅ Servicios de Supabase configurados  
✅ Hook de autenticación implementado  
✅ Login con Supabase Auth  
✅ Protección de rutas con sesión real  
✅ CRUD de usuarios (solo admin)  
✅ CRUD de ventas  
✅ CRUD de objetivos  
✅ Dashboard con datos reales  
✅ Consola admin funcional  
✅ RLS verificado  
✅ Manejo de errores  
✅ Documentación completa  

---

**NOTA FINAL**: Esta fase requiere acceso al panel de administración de Supabase autoalojado. Confirmar credenciales y acceso antes de comenzar.
