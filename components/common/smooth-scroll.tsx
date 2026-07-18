'use client'

import { useEffect, useRef, createContext, useContext } from 'react'
import Lenis from '@studio-freight/lenis'

interface LenisContextType {
    stop: () => void
    start: () => void
}

const LenisContext = createContext<LenisContextType>({
    stop: () => { },
    start: () => { },
})

export const useLenis = () => useContext(LenisContext)

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        lenisRef.current = new Lenis({
            lerp: 0.07,
            syncTouch: false,
            touchMultiplier: 1.5,
            orientation: 'vertical',
        })

        function raf(time: number) {
            lenisRef.current?.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenisRef.current?.destroy()
            lenisRef.current = null
        }
    }, [])

    return (
        <LenisContext.Provider value={{
            stop: () => lenisRef.current?.stop(),
            start: () => lenisRef.current?.start(),
        }}>
            {children}
        </LenisContext.Provider>
    )
}