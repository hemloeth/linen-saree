"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
    name: string
    email: string
    phone: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isHydrated: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface StoredUser {
    name: string
    email: string
    phone: string
    password: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user")
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser)
                setUser({ name: parsed.name, email: parsed.email, phone: parsed.phone })
            } catch {
                setUser(null)
            }
        }
        setIsHydrated(true)
    }, [])

    const signup = async (name: string, email: string, phone: string, password: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, password }),
            })

            const data = await res.json().catch(() => ({ message: "Invalid server response" }))

            if (!res.ok) {
                return { success: false, error: data.message || "Registration failed" }
            }

            const userData = { name: data.name, email: data.email, phone: data.phone }
            setUser(userData)
            localStorage.setItem("auth_user", JSON.stringify(userData))
            localStorage.setItem("auth_token", data.token)

            return { success: true }
        } catch (error) {
            return { success: false, error: "Something went wrong. Please try again." }
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json().catch(() => ({ message: "Invalid server response" }))

            if (!res.ok) {
                return { success: false, error: data.message || "Invalid email or password" }
            }

            const userData = { name: data.user.name, email: data.user.email, phone: data.user.phone }
            setUser(userData)
            localStorage.setItem("auth_user", JSON.stringify(userData))
            localStorage.setItem("auth_token", data.token)

            return { success: true }
        } catch (error) {
            return { success: false, error: "Something went wrong. Please try again." }
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

        // Also update in registered users list
        const existingUsers: StoredUser[] = JSON.parse(localStorage.getItem("registered_users") || "[]")
        const idx = existingUsers.findIndex(u => u.email === user.email)
        if (idx !== -1) {
            existingUsers[idx] = { ...existingUsers[idx], ...data }
            // If email changed, update the key
            if (data.email) {
                existingUsers[idx].email = data.email
            }
            localStorage.setItem("registered_users", JSON.stringify(existingUsers))
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isHydrated,
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
