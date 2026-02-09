# Prompt Final para Antigravity – Sistema de Distribuidores B2B

## Contexto del Proyecto

Desarrolla una **aplicación web B2B fullstack** para la gestión de distribuidores con dashboard informativo y consola administrativa. El sistema permitirá a los distribuidores visualizar sus métricas de ventas y cumplimiento, mientras que los administradores podrán gestionar usuarios y cargar datos de ventas.

---

## Stack Tecnológico Obligatorio

- **Frontend**: React
- **Backend y Autenticación**: Supabase
- **Desarrollo**: Por fases (mock primero, luego integración real)

---

## Fuente de Verdad Visual

Existe una carpeta `/screens` en la raíz del proyecto que contiene:
- Imágenes de referencia de los diseños
- Archivos HTML con layouts y estructura visual

**INSTRUCCIÓN CRÍTICA**: Debes tomar la carpeta `/screens` como fuente de verdad absoluta. Replica fielmente:
- Estructura del layout
- Jerarquía visual
- Componentes UI
- Distribución de información
- Estilos y presentación

---

## Roles y Permisos

### Distribuidor (Solo Lectura)
- Puede iniciar sesión con email y contraseña
- Accede únicamente a su dashboard personal
- **NO puede**: editar datos, ver otros distribuidores, ni cargar información
- Ve solo su información de ventas y cumplimiento

### Administrador (Control Total)
- Puede iniciar sesión con email y contraseña
- Accede a consola administrativa completa
- Puede: crear/editar distribuidores, cargar/editar ventas, gestionar usuarios

---

## Funcionalidades del Sistema

### 1. Autenticación
- Login con email y contraseña
- Manejo de sesión persistente
- Redirección automática según rol:
  - `admin` → Consola de administración
  - `distribuidor` → Dashboard informativo
- Logout funcional

### 2. Dashboard de Distribuidor (Solo Visualización)

Muestra exclusivamente la información presente en `/screens`. Debe incluir:

#### Resumen Anual
- Objetivo anual asignado
- Venta real acumulada anual
- Porcentaje de cumplimiento anual

#### Resumen por Trimestre (Q1, Q2, Q3, Q4)
Para cada trimestre mostrar:
- Meta del trimestre
- Venta real del trimestre
- Porcentaje de cumplimiento
- Valor faltante para alcanzar el 100%

#### Mensajes Automáticos de Estado
Generar mensajes dinámicos según desempeño:
- "No ha logrado el objetivo"
- "Faltante para meta trimestral: $[cantidad]"
- "¡Objetivo cumplido!"

#### Tabla de Comisiones (Informativa)
Mostrar las reglas de comisión (no calcular, solo informar):
- 80% – 89% cumplimiento → 1% sobre facturación
- 90% – 109% cumplimiento → 2% sobre facturación
- Más de 110% cumplimiento → 3% sobre facturación

**Restricciones del Distribuidor**:
- Sin botones de edición
- Sin formularios de carga
- Sin acceso a información de otros distribuidores
- Solo visualización de sus propios datos

### 3. Consola de Administración

El administrador tiene acceso a:

#### Gestión de Distribuidores
- Crear nuevos distribuidores (nombre, email, región, etc.)
- Editar información de distribuidores existentes
- Asignar credenciales de acceso
- Ver listado completo de distribuidores

#### Gestión de Ventas
- Cargar ventas por semana
- Cargar ventas totales por trimestre
- Editar ventas existentes
- Visualizar histórico de ventas por distribuidor
- Asignar objetivos anuales y trimestrales

#### Gestión de Usuarios
- Ver listado de usuarios del sistema
- Asignar o modificar rol (admin / distribuidor)
- Resetear contraseñas
- Activar / desactivar usuarios
- Eliminar usuarios (con confirmación)

---

## Desarrollo por Fases (OBLIGATORIO)

### **FASE 1 – UI y Lógica con Datos Mock**

**Objetivo**: Implementar toda la interfaz y lógica de negocio con datos simulados.

**Tareas**:
1. Crear estructura de carpetas React organizada
2. Implementar todos los componentes visuales basados en `/screens`
3. Crear datos mock en archivos JSON o constantes JavaScript:
   - Lista de distribuidores simulados
   - Datos de ventas trimestrales y anuales
   - Usuarios de prueba (admin y distribuidores)
4. Implementar sistema de rutas con React Router:
   - `/login` - Página de inicio de sesión
   - `/dashboard` - Dashboard del distribuidor
   - `/admin` - Consola administrativa
   - Rutas protegidas simuladas con verificación de rol mock
5. Simular autenticación:
   - Login funcional con validación local
   - Almacenamiento temporal de sesión (localStorage)
   - Redirección según rol simulado
6. Dashboard completamente funcional:
   - Cálculos de porcentajes
   - Mensajes dinámicos
   - Visualización de trimestres
7. Consola admin completamente funcional:
   - Formularios para crear/editar distribuidores
   - Formularios para cargar ventas
   - Tablas de gestión de usuarios
   - Operaciones CRUD en memoria (sin persistencia real)

**Entregable Fase 1**: Aplicación 100% funcional visualmente con navegación completa y datos simulados.

---

### **FASE 2 – Integración con Supabase**

**Objetivo**: Reemplazar datos mock por Supabase real con autenticación y persistencia.

**Tareas**:

1. **Configuración de Supabase**:
   - Crear proyecto en Supabase
   - Configurar autenticación por email/contraseña
   - Instalar cliente de Supabase en React

2. **Estructura de Base de Datos**:
   
   Crear tablas:
   
   **`users`**
   - `id` (uuid, PK)
   - `email` (text)
   - `role` (text: 'admin' | 'distribuidor')
   - `nombre` (text)
   - `activo` (boolean)
   - `created_at` (timestamp)

   **`distribuidores`**
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → users)
   - `nombre` (text)
   - `region` (text)
   - `objetivo_anual` (numeric)
   - `created_at` (timestamp)

   **`ventas`**
   - `id` (uuid, PK)
   - `distribuidor_id` (uuid, FK → distribuidores)
   - `trimestre` (text: 'Q1' | 'Q2' | 'Q3' | 'Q4')
   - `semana` (integer, nullable)
   - `monto` (numeric)
   - `fecha` (date)
   - `created_at` (timestamp)

   **`objetivos`**
   - `id` (uuid, PK)
   - `distribuidor_id` (uuid, FK → distribuidores)
   - `trimestre` (text)
   - `meta` (numeric)
   - `año` (integer)

3. **Row Level Security (RLS)**:
   - Los distribuidores solo pueden ver sus propios datos
   - Los admins pueden ver y modificar todos los datos
   - Implementar políticas de seguridad en todas las tablas

4. **Migración de Lógica**:
   - Reemplazar autenticación mock por Supabase Auth
   - Reemplazar operaciones CRUD mock por queries reales
   - Implementar consultas optimizadas para dashboard
   - Agregar manejo de estados de carga y error

5. **Protección de Rutas**:
   - Validación real de sesión con Supabase
   - Redirección basada en rol desde la base de datos
   - Manejo de sesión persistente

**Entregable Fase 2**: Sistema completamente funcional con persistencia real y autenticación segura.

---

### **FASE 3 – Refinamiento y Optimización**

**Objetivo**: Pulir la experiencia de usuario y código.

**Tareas**:
1. **Validaciones**:
   - Validación de formularios en cliente
   - Validación de datos antes de enviar a Supabase
   - Mensajes de error claros y específicos

2. **UX**:
   - Indicadores de carga (spinners, skeletons)
   - Mensajes de confirmación para acciones destructivas
   - Toast notifications para operaciones exitosas/fallidas
   - Manejo de estados vacíos (empty states)

3. **Optimización**:
   - Refactorizar componentes repetitivos
   - Optimizar queries a Supabase
   - Implementar lazy loading si es necesario
   - Code splitting de rutas

4. **Organización de Código**:
   - Separación clara de componentes, hooks, utils
   - Documentación de funciones complejas
   - Nombres descriptivos y consistentes
   - Eliminación de código muerto

5. **Seguridad**:
   - Verificar políticas RLS
   - Sanitización de inputs
   - Manejo seguro de tokens

**Entregable Fase 3**: Aplicación producción-ready con código limpio y mantenible.

---

## Lineamientos Técnicos Obligatorios

### Arquitectura
```
/src
  /components      # Componentes reutilizables
  /pages          # Páginas principales (Login, Dashboard, Admin)
  /hooks          # Custom hooks
  /services       # Lógica de Supabase
  /utils          # Funciones auxiliares
  /constants      # Datos mock (Fase 1), constantes
  /styles         # Estilos globales
```

### Buenas Prácticas
- Componentes funcionales con hooks
- Nombres descriptivos y en español
- Separación de lógica de negocio y presentación
- Manejo de errores consistente
- Comentarios solo donde sea necesario
- Código DRY (Don't Repeat Yourself)

### Consideraciones de Seguridad
- Nunca exponer credenciales en el código
- Variables de entorno para configuración de Supabase
- Validación en cliente y servidor
- RLS correctamente configurado

---

## Criterios de Éxito

- [ ] Diseño fiel a `/screens`
- [ ] Autenticación funcional con roles
- [ ] Dashboard de distribuidor 100% informativo (sin edición)
- [ ] Consola admin con todas las operaciones CRUD
- [ ] Fase 1 funcional con mocks
- [ ] Fase 2 integrada con Supabase
- [ ] Fase 3 refinada y optimizada
- [ ] Código limpio y mantenible
- [ ] Sin errores en consola
- [ ] Responsive design

---

## Instrucciones de Ejecución

1. Comienza con **FASE 1** completa antes de avanzar
2. Solicita revisión y aprobación antes de pasar a FASE 2
3. Respeta estrictamente los diseños en `/screens`
4. Pregunta ante cualquier ambigüedad antes de implementar
5. Documenta decisiones técnicas importantes

---

**Desarrolla este proyecto siguiendo estrictamente las fases descritas. Comienza con la FASE 1.**