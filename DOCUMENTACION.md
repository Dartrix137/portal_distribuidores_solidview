# Portal de Distribuidores SolidView — Documentación

## Descripción General

El **Portal de Distribuidores SolidView** es una aplicación web diseñada para gestionar y monitorear el rendimiento de ventas de los distribuidores de SolidView. Cuenta con dos perfiles principales:

- **Administrador**: Gestiona distribuidores, registra ventas, define objetivos y administra los usuarios del sistema.
- **Distribuidor**: Visualiza su rendimiento de ventas contra los objetivos definidos por el administrador.

---

## Accesos

### Dokploy (Gestor de aplicaciones del VPS)

- **URL**: [http://195.35.32.214:3000/](http://195.35.32.214:3000/)
- **Usuario**: `mercadeo@videonet.com.co`
- **Contraseña**: `Mercadeo.2025`

### Portal de Distribuidores (Aplicación)

- **URL**: [https://portaldistribuidores.solidview.com.co/](https://portaldistribuidores.solidview.com.co/)
- **Usuario admin**: `mercadeo@videonet.com.co`
- **Contraseña**: `Mercadeo.2025`

---

## Stack Tecnológico

| Capa        | Tecnología                 |
|-------------|----------------------------|
| Frontend    | React.js + Vite            |
| Estilos     | Tailwind CSS               |
| Backend     | Supabase (Auth + Database) |
| Servidor    | Nginx (contenedor Docker)  |
| Deploy      | Dokploy en VPS             |

---

## Módulos del Panel de Administración

### 1. Clientes (Distribuidores)

Permite gestionar el directorio de distribuidores de SolidView.

**Funcionalidades:**
- Listar todos los distribuidores registrados.
- Crear un nuevo distribuidor seleccionando su sector industrial.
- Editar un distribuidor existente para configurar:
  - **Objetivo anual** de ventas.
  - **Objetivos trimestrales** (Q1, Q2, Q3, Q4).

> **Nota importante:** Los objetivos de un distribuidor solo se pueden configurar *después* de haberse creado. Es necesario ir al directorio de clientes, buscar el distribuidor y editarlo para asignar las metas.

### 2. Ventas

Permite registrar y auditar las ventas realizadas por cada distribuidor.

**Funcionalidades:**
- Seleccionar el distribuidor al que se le registrará la venta.
- Elegir el **trimestre** y la **semana** correspondiente.
- Ingresar el **valor** de la venta.
- **Editar** el registro de ventas existentes desde el historial.
- **Eliminar** ventas del historial.

### 3. Usuarios

Permite administrar las cuentas de acceso al portal.

**Funcionalidades:**
- **Crear** nuevos usuarios.
- **Editar** usuarios existentes.
- **Actualizar contraseña** de un usuario.
- **Desautorizar** el acceso de un usuario (sin eliminarlo).
- **Eliminar** un usuario del sistema.

**Tipos de usuario:**

| Tipo           | Descripción                                                                                                  |
|----------------|--------------------------------------------------------------------------------------------------------------|
| Administrador  | Acceso completo al panel de administración (clientes, ventas, usuarios).                                     |
| Distribuidor   | Acceso únicamente al dashboard de rendimiento. Debe estar vinculado a un distribuidor del módulo de clientes. |

> **Nota:** Al crear un usuario tipo *Distribuidor*, es obligatorio asignarlo a un distribuidor previamente creado en el módulo de Clientes. Sin esta asociación, el usuario no podrá ver ningún dato en su dashboard.

---

## Módulo del Distribuidor (Dashboard)

Cuando un usuario tipo *Distribuidor* inicia sesión, accede a un dashboard donde puede consultar:

- **Objetivo anual** y porcentaje de avance.
- **Objetivos trimestrales** (Q1–Q4) con su respectivo progreso.
- **Rendimiento general** del año actual basado en las ventas registradas por el administrador.
- **Reglas de comisión** según el porcentaje de cumplimiento:
  - 80% – 89%: comisión del 1% sobre la facturación.
  - 90% – 109%: comisión del 2% sobre la facturación.
  - Más del 110%: comisión del 3% sobre la facturación.

---

## Despliegue (Dokploy)

La aplicación se despliega como un contenedor Docker a través de **Dokploy**.

**Flujo de despliegue:**
1. El código se sube al repositorio en GitHub.
2. Dokploy detecta los cambios y ejecuta el build usando el `Dockerfile` del proyecto.
3. El `Dockerfile` realiza un build multi-stage:
   - **Stage 1**: Instala dependencias y genera el build de producción con Vite.
   - **Stage 2**: Sirve los archivos estáticos con Nginx.
4. La aplicación queda disponible en `https://portaldistribuidores.solidview.com.co/`.

**Variables de entorno requeridas** (se configuran en Dokploy → Environment):
- `VITE_SUPABASE_URL` — URL de la instancia de Supabase.
- `VITE_SUPABASE_ANON_KEY` — Clave anónima (pública) de Supabase.

---

## Flujo de Uso Típico

1. El administrador **crea los distribuidores** en el módulo de Clientes.
2. **Edita cada distribuidor** para asignar su objetivo anual y objetivos trimestrales.
3. **Crea usuarios** tipo Distribuidor vinculados a cada distribuidor.
4. Semanalmente, el administrador **registra las ventas** en el módulo de Ventas.
5. Los distribuidores **inician sesión** y visualizan su rendimiento en el dashboard.
