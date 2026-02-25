import { supabase } from './supabase'

export const userService = {
    // Crear usuario (llama a Edge Function)
    async createUser(userData) {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) throw new Error('No hay sesión activa')

        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(userData),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Error creando usuario')
        }

        return data
    },

    // Actualizar contraseña (llama a Edge Function)
    async updatePassword(userId, newPassword) {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) throw new Error('No hay sesión activa')

        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ userId, newPassword }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Error actualizando contraseña')
        }

        return data
    },

    // Obtener usuario por ID
    async getUserById(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*, distribuidores (*)')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    },

    // Listar usuarios (admin)
    async getUsers() {
        const { data, error } = await supabase
            .from('users')
            .select(
                `
                *,
                distribuidores (*)
            `
            )
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

    // Toggle activo/inactivo
    async toggleActive(userId, currentlyActive) {
        const { data, error } = await supabase
            .from('users')
            .update({ activo: !currentlyActive })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Eliminar usuario (solo tabla public.users, requiere RLS o service role)
    async deleteUser(userId) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId)

        if (error) throw error
        return true
    },
}
