"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiPost } from "@/lib/api"

interface User {
    _id?: string
    name: string
    email: string
    phone: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isHydrated: boolean
    loginEvent: number  // Increments on each login — cart/wishlist watch this
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)
    const [loginEvent, setLoginEvent] = useState(0)

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user")
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser)
                setUser({ _id: parsed._id, name: parsed.name, email: parsed.email, phone: parsed.phone })
            } catch {
                setUser(null)
            }
        }
        setIsHydrated(true)
    }, [])

    const signup = async (name: string, email: string, phone: string, password: string) => {
        try {
            const data = await apiPost('/api/user/register', { name, email, phone, password })

            const userData = { _id: data._id, name: data.name, email: data.email, phone: data.phone }
            setUser(userData)
            localStorage.setItem("auth_user", JSON.stringify(userData))
            localStorage.setItem("auth_token", data.token)

            // Signal cart/wishlist to sync
            setLoginEvent(prev => prev + 1)

            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message || "Something went wrong. Please try again." }
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const data = await apiPost('/api/user/login', { email, password })

            const userData = { _id: data.user._id, name: data.user.name, email: data.user.email, phone: data.user.phone }
            setUser(userData)
            localStorage.setItem("auth_user", JSON.stringify(userData))
            localStorage.setItem("auth_token", data.token)

            // Signal cart/wishlist to sync
            setLoginEvent(prev => prev + 1)

            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message || "Invalid email or password" }
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_token")
    }

    const updateProfile = (data: Partial<User>) => {
        if (!user) return

        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem("auth_user", JSON.stringify(updatedUser))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isHydrated,
                loginEvent,
                login,
                signup,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
