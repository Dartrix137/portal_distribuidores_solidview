import { supabase } from './supabase'

export const ventasService = {
    // Obtener ventas de un distribuidor
    async getByDistribuidor(distribuidorId) {
        const { data, error } = await supabase
            .from('ventas')
            .select('*')
            .eq('distribuidor_id', distribuidorId)
            .order('fecha', { ascending: false })

        if (error) throw error
        return data
    },

    // Obtener todas las ventas (admin) con info del distribuidor
    async getAll() {
        const { data, error } = await supabase
            .from('ventas')
            .select(
                `
                *,
                distribuidores (id, nombre)
            `
            )
            .order('fecha', { ascending: false })

        if (error) throw error
        return data
    },

    // Crear venta
    async create(ventaData) {
        const { data, error } = await supabase
            .from('ventas')
            .insert(ventaData)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Actualizar venta
    async update(id, updates) {
        const { data, error } = await supabase
            .from('ventas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Eliminar venta
    async delete(id) {
        const { error } = await supabase.from('ventas').delete().eq('id', id)

        if (error) throw error
    },

    // Obtener resumen por trimestre para un distribuidor y año
    async getResumenTrimestral(distribuidorId, año) {
        const { data, error } = await supabase
            .from('ventas')
            .select('trimestre, monto')
            .eq('distribuidor_id', distribuidorId)
            .gte('fecha', `${año}-01-01`)
            .lte('fecha', `${año}-12-31`)

        if (error) throw error

        // Agrupar por trimestre
        const resumen = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }

        data.forEach((venta) => {
            resumen[venta.trimestre] += parseFloat(venta.monto)
        })

        return resumen
    },
}
