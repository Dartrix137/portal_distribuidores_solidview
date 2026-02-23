import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env')
}

// Prevenir múltiples instancias en desarrollo (Vite HMR)
const globalSupabase = globalThis.__supabaseClient || null

export const supabase = globalSupabase || createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        detectSessionInUrl: true,
        persistSession: true,
        // Override navigator.locks con un dummy lock para evitar el deadlock (timeout 10000ms)
        lock: async (name, p2, p3) => {
            const fn = typeof p2 === 'function' ? p2 : p3
            return await fn()
        }
    },
})

if (import.meta.env.DEV) {
    globalThis.__supabaseClient = supabase
}
