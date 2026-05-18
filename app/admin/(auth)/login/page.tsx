"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { apiPost } from "@/lib/api"

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        
        try {
            const data = await apiPost('/api/user/login', { email, password })
            if (data.token) {
                localStorage.setItem("auth_token", data.token)
                if (data.user) {
                    localStorage.setItem("auth_user", JSON.stringify(data.user))
                }
                router.push("/admin")
            } else {
                setError("Authentication failed: No token received from server.")
            }
        } catch (err: any) {
            setError(err.message || "Invalid email or password.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-serif text-primary">Admin Access</CardTitle>
                    <CardDescription>
                        Enter your email and password to login
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-xs font-semibold p-3 rounded-lg border border-destructive/20 animate-in fade-in duration-300">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="admin@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            <Link href="/" className="hover:underline">Back to Store</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
