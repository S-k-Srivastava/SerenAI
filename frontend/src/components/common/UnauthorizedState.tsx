import React from "react"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface UnauthorizedStateProps {
    permission?: string;
    resource?: string;
    message?: string;
    backUrl?: string;
    backLabel?: string;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
    permission,
    resource,
    message = "You do not have permission to access this page.",
    backUrl = "/dashboard",
    backLabel = "Return to Dashboard"
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 shadow-lg shadow-destructive/5">
                <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
            <p className="text-muted-foreground max-w-[500px] mb-8 text-lg">
                {message}
                {permission && resource && (
                    <span className="block mt-2 text-xs font-mono bg-muted py-1 px-2 rounded border border-border/50 text-foreground/70">
                        Missing permission: {permission}:{resource}
                    </span>
                )}
            </p>
            <div className="flex gap-4">
                <Link href={backUrl}>
                    <Button variant="default" className="gap-2 pl-3">
                        <ArrowLeft className="w-4 h-4" />
                        {backLabel}
                    </Button>
                </Link>
            </div>
        </div>
    )
}
