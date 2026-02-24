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

    // Crear nuevo distribuidor
    async create(distribuidorData) {
        const { data, error } = await supabase
            .from('distribuidores')
            .insert([distribuidorData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Obtener distribuidor por user_id (para distribuidores autenticados)
    async getByUserId(userId) {
        // Primero obtenemos el distribuidor_id del usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('distribuidor_id')
            .eq('id', userId)
            .single()

        if (userError) throw userError
        if (!userData || !userData.distribuidor_id) return null

        // Ahora buscamos el distribuidor con ese ID
        const { data, error } = await supabase
            .from('distribuidores')
            .select('*')
            .eq('id', userData.distribuidor_id)
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
