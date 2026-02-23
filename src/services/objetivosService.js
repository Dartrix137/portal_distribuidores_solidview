import { supabase } from './supabase'

export const objetivosService = {
    // Obtener objetivos de un distribuidor para un año
    async getByDistribuidor(distribuidorId, año) {
        const { data, error } = await supabase
            .from('objetivos')
            .select('*')
            .eq('distribuidor_id', distribuidorId)
            .eq('año', año)

        if (error) throw error
        return data
    },

    // Crear o actualizar objetivo individual
    async upsert(objetivoData) {
        const { data, error } = await supabase
            .from('objetivos')
            .upsert(objetivoData, {
                onConflict: 'distribuidor_id,trimestre,año',
            })
            .select()

        if (error) throw error
        return data
    },

    // Crear objetivos para los 4 trimestres de un año
    async createYearObjectives(distribuidorId, año, objetivos) {
        const records = [
            { distribuidor_id: distribuidorId, trimestre: 'Q1', año, meta: objetivos.Q1 || 0 },
            { distribuidor_id: distribuidorId, trimestre: 'Q2', año, meta: objetivos.Q2 || 0 },
            { distribuidor_id: distribuidorId, trimestre: 'Q3', año, meta: objetivos.Q3 || 0 },
            { distribuidor_id: distribuidorId, trimestre: 'Q4', año, meta: objetivos.Q4 || 0 },
        ]

        const { data, error } = await supabase.from('objetivos').upsert(records).select()

        if (error) throw error
        return data
    },
}
