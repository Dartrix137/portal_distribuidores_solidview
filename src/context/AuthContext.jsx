import { createContext, useState, useContext, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Usar refs para acceder al estado actual dentro del effect sin triggearlo
    const authUserRef = useRef(authUser)
    const userDataRef = useRef(userData)

    useEffect(() => {
        authUserRef.current = authUser
        userDataRef.current = userData
    }, [authUser, userData])

    useEffect(() => {
        let isCancelled = false

        // Escuchar cambios de auth
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Auth event:', _event)

            if (_event === 'SIGNED_OUT' || !session) {
                if (!isCancelled) {
                    setAuthUser(null)
                    setUserData(null)
                    setLoading(false)
                }
                return
            }

            // IGNORAR SIGNED_IN: La función login() se encarga de cargar los datos del usuario
            // secuencialmente DESPUÉS de que signInWithPassword libera el lock. Esto evita el
            // deadlock "Navigator LockManager lock timed out waiting 10000ms".
            if (_event === 'SIGNED_IN') {
                return
            }

            // Para INITIAL_SESSION o TOKEN_REFRESHED, cargamos los datos normalmente
            const user = session.user
            if (!isCancelled) {
                setAuthUser(user)
            }

            // Si ya tenemos los datos cargados para este usuario, no consultar DB de nuevo
            if (userDataRef.current?.id === user.id) {
                if (!isCancelled) setLoading(false)
                return
            }

            // Consultar datos adicionales
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (!isCancelled) {
                    if (error) {
                        console.error('Error obteniendo datos:', error)
                        setUserData(null)
                    } else {
                        if (!data.activo) {
                            await authService.logout()
                            setAuthUser(null)
                            setUserData(null)
                        } else {
                            setUserData(data)
                        }
                    }
                }
            } catch (err) {
                console.error('Error inesperado:', err)
                if (!isCancelled) setUserData(null)
            } finally {
                if (!isCancelled) setLoading(false)
            }
        })

        return () => {
            isCancelled = true
            subscription.unsubscribe()
        }
    }, [])

    const login = async (email, password) => {
        // Llama al authService.login, el cual ejecuta signInWithPassword
        // de forma aislada, y LUEGO consulta la tabla users.
        const result = await authService.login(email, password)

        // Actualizamos estado manualmente
        setAuthUser(result.user)
        setUserData(result.userData)

        return result.userData
    }

    const logout = async () => {
        await authService.logout()
        setAuthUser(null)
        setUserData(null)
    }

    const value = {
        user: userData,
        authUser,
        loading,
        login,
        logout,
        isAuthenticated: !!authUser && !!userData,
        isAdmin: userData?.role === 'admin',
        isDistribuidor: userData?.role === 'distribuidor',
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
