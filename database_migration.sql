-- ==========================================
-- SCRIPT DE MIGRACIÓN
-- Ejecuta esto en el SQL Editor de Supabase
-- ==========================================

-- 0. Primero, debemos eliminar las políticas que dependen de la columna que vamos a borrar
DROP POLICY IF EXISTS "Distribuidores pueden ver su propio registro" ON distribuidores;
DROP POLICY IF EXISTS "Distribuidores solo pueden ver sus ventas" ON ventas;
DROP POLICY IF EXISTS "Distribuidores pueden ver sus ventas" ON ventas;
DROP POLICY IF EXISTS "Distribuidores solo pueden ver sus objetivos" ON objetivos;
DROP POLICY IF EXISTS "Distribuidores pueden ver sus objetivos" ON objetivos;

-- 1. Eliminar la dependencia antigua de distribuidores hacia users
ALTER TABLE distribuidores DROP CONSTRAINT IF EXISTS distribuidores_user_id_fkey;
ALTER TABLE distribuidores DROP COLUMN IF EXISTS user_id;

-- 2. Añadir nueva columna a users apuntando a distribuidores
ALTER TABLE users ADD COLUMN IF NOT EXISTS distribuidor_id UUID REFERENCES distribuidores(id) ON DELETE SET NULL;

-- 3. Recrear política de seguridad para distribuidores
CREATE POLICY "Distribuidores pueden ver su propio registro" 
ON distribuidores FOR SELECT 
USING (
    id IN (SELECT distribuidor_id FROM users WHERE id = auth.uid())
);

-- 4. Recrear política de seguridad para ventas
CREATE POLICY "Distribuidores pueden ver sus ventas" 
ON ventas FOR SELECT 
USING (
    distribuidor_id IN (SELECT distribuidor_id FROM users WHERE id = auth.uid())
);

-- 5. Recrear política de seguridad para objetivos
CREATE POLICY "Distribuidores pueden ver sus objetivos" 
ON objetivos FOR SELECT 
USING (
    distribuidor_id IN (SELECT distribuidor_id FROM users WHERE id = auth.uid())
);
