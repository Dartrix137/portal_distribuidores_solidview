import { supabase } from './supabase'

export const authService = {
    // Login de usuarios
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error

        // Obtener información adicional del usuario desde la tabla users
        // Se ejecuta una vez que signInWithPassword liberó el lock
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()

        if (userError) throw userError

        if (!userData.activo) {
            await supabase.auth.signOut()
            throw new Error('Usuario desactivado. Contacte al administrador.')
        }

        return { user: data.user, userData }
    },

    // Obtener sesión actual
    async getSession() {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession()

        if (error) throw error
        if (!session) return null

        // Obtener datos del usuario desde tabla users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

        if (userError) return null

        return {
            user: session.user,
            userData,
            role: userData.role,
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
    },
}
