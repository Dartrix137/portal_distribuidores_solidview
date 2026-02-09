import { createContext, useState, useContext, useEffect } from 'react'
import { mockUsers } from '../constants/mockUsers'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('solidview_user')
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch {
                localStorage.removeItem('solidview_user')
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const foundUser = mockUsers.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )

        if (!foundUser) {
            throw new Error('Credenciales inválidas')
        }

        if (!foundUser.activo) {
            throw new Error('Usuario desactivado. Contacte al administrador.')
        }

        // Remove password from stored user
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        localStorage.setItem('solidview_user', JSON.stringify(userWithoutPassword))

        return userWithoutPassword
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('solidview_user')
    }

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDistribuidor: user?.role === 'distribuidor',
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
