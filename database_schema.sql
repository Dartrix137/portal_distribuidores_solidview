-- Habilitar extensión pgcrypto para generar UUIDs gen_random_uuid() en caso de ser necesario
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. TABLA: distribuidores
-- ==========================================
CREATE TABLE distribuidores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    region TEXT,
    objetivo_anual NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. TABLA: users
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'distribuidor')),
    distribuidor_id UUID REFERENCES distribuidores(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. TABLA: ventas
-- ==========================================
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribuidor_id UUID NOT NULL REFERENCES distribuidores(id) ON DELETE CASCADE,
    trimestre TEXT NOT NULL CHECK (trimestre IN ('Q1', 'Q2', 'Q3', 'Q4')),
    semana INTEGER,
    monto NUMERIC(15, 2) NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. TABLA: objetivos
-- ==========================================
CREATE TABLE objetivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distribuidor_id UUID NOT NULL REFERENCES distribuidores(id) ON DELETE CASCADE,
    trimestre TEXT NOT NULL CHECK (trimestre IN ('Q1', 'Q2', 'Q3', 'Q4')),
    meta NUMERIC(15, 2) NOT NULL,
    año INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- SEGURIDAD: Row Level Security (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribuidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Políticas para 'users'
-- ------------------------------------------
-- 1. Admins pueden ver y modificar todo
CREATE POLICY "Admins pueden gestionar usuarios" 
ON users FOR ALL 
USING (
    EXISTS (SELECT 1 FROM users AS admin_user WHERE admin_user.id = auth.uid() AND admin_user.role = 'admin')
);

-- 2. Distribuidores pueden ver solo su propio usuario
CREATE POLICY "Distribuidores pueden ver su usuario" 
ON users FOR SELECT 
USING (id = auth.uid());

-- ------------------------------------------
-- Políticas para 'distribuidores'
-- ------------------------------------------
-- 1. Admins pueden ver y modificar todo
CREATE POLICY "Admins pueden gestionar distribuidores" 
ON distribuidores FOR ALL 
USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 2. Distribuidores solo pueden ver su distribuidor
CREATE POLICY "Distribuidores pueden ver su propio registro" 
ON distribuidores FOR SELECT 
USING (
    id IN (SELECT distribuidor_id FROM users WHERE id = auth.uid())
);

-- ------------------------------------------
-- Políticas para 'ventas'
-- ------------------------------------------
-- 1. Admins pueden ver y modificar todas las ventas
CREATE POLICY "Admins pueden gestionar ventas" 
ON ventas FOR ALL 
USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 2. Distribuidores solo pueden ver sus ventas
CREATE POLICY "Distribuidores pueden ver sus ventas" 
ON ventas FOR SELECT 
USING (
    distribuidor_id IN (SELECT distribuidor_id FROM users WHERE id = auth.uid())
);

-- ------------------------------------------
-- Políticas para 'objetivos'
-- ------------------------------------------
-- 1. Admins pueden ver y modificar todos los objetivos
CREATE POLICY "Admins pueden gestionar objetivos" 
ON objetivos FOR ALL 
USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 2. Distribuidores solo pueden ver sus objetivos
CREATE POLICY "Distribuidores pueden ver sus objetivos" 
ON objetivos FOR SELECT 
USING (
    distribuidor_id IN (SELECT distribuidor_id FROM users WHERE id = auth.uid())
);
