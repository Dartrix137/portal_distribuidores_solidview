// Currency formatting
export const formatCurrency = (amount, options = {}) => {
    const {
        locale = 'en-US',
        currency = 'USD',
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        compact = false
    } = options

    if (compact && amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(2)}M`
    }

    if (compact && amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount)
}

// Date formatting
export const formatDate = (dateString, options = {}) => {
    const { locale = 'es-ES', format = 'short' } = options
    const date = new Date(dateString)

    if (format === 'short') {
        return date.toLocaleDateString(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    if (format === 'long') {
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    return date.toLocaleDateString(locale)
}

// Percentage formatting
export const formatPercentage = (value, decimals = 0) => {
    return `${value.toFixed(decimals)}%`
}

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '??'
    const words = name.trim().split(' ')
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase()
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// Period label
export const getPeriodLabel = (anio, semana) => {
    return `${anio} W${semana}`
}

// Quarter label
export const getQuarterLabel = (quarter) => {
    const labels = {
        Q1: 'Q1 (Ene - Mar)',
        Q2: 'Q2 (Abr - Jun)',
        Q3: 'Q3 (Jul - Sep)',
        Q4: 'Q4 (Oct - Dic)',
    }
    return labels[quarter] || quarter
}
