// Edge Function: create-user
// Despliega esta función en tu panel de Supabase > Edge Functions
// O usando: supabase functions deploy create-user

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Verificar autorización
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Crear cliente Supabase con service_role
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Verificar que el usuario que llama es admin
        const token = authHeader.replace('Bearer ', '')
        const {
            data: { user },
            error: authError,
        } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'No autorizado' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const { data: callerData } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (callerData?.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Solo los administradores pueden crear usuarios' }),
                {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Obtener datos del body
        const { email, password, nombre, role, region, objetivo_anual } = await req.json()

        // Validar campos requeridos
        if (!email || !password || !nombre || !role) {
            return new Response(
                JSON.stringify({ error: 'Faltan campos requeridos: email, password, nombre, role' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Crear usuario en Supabase Auth
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nombre, role },
        })

        if (createError) {
            return new Response(JSON.stringify({ error: createError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
                activo: true,
            })
            .select()
            .single()

        if (userError) {
            // Rollback: eliminar usuario de auth
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            return new Response(JSON.stringify({ error: userError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Si es distribuidor, crear registro en tabla distribuidores
        if (role === 'distribuidor') {
            const { error: distError } = await supabaseAdmin.from('distribuidores').insert({
                user_id: newUser.user.id,
                nombre,
                region: region || null,
                objetivo_anual: objetivo_anual || 0,
            })

            if (distError) {
                // Rollback completo
                await supabaseAdmin.from('users').delete().eq('id', newUser.user.id)
                await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
                return new Response(JSON.stringify({ error: distError.message }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        return new Response(JSON.stringify({ success: true, user: userRecord }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
