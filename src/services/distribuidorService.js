import { supabase } from './supabase'

export const distribuidorService = {
    // Obtener todos los distribuidores (admin) con datos del usuario
    async getAll() {
        const { data, error } = await supabase
            .from('distribuidores')
            .select(
                `
                *,
                users (id, email, nombre, activo, role)
            `
            )
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Obtener distribuidor por user_id (para distribuidores autenticados)
    async getByUserId(userId) {
        const { data, error } = await supabase
            .from('distribuidores')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) throw error
        return data
    },

    // Obtener distribuidor por ID
    async getById(id) {
        const { data, error } = await supabase
            .from('distribuidores')
            .select(
                `
                *,
                users (id, email, nombre, activo, role)
            `
            )
            .eq('id', id)
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
    },
}
