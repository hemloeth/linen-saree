import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ProductLoading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size="lg" className="text-primary w-10 h-10" />
            <p className="text-sm font-sans tracking-widest uppercase text-muted-foreground animate-pulse">
                Loading Details...
            </p>
        </div>
    )
}
