import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useNavigate, useRouteError } from "react-router-dom"

interface RouterError {
    statusText?: string
    message?: string
    status?: number
}

export default function ErrorPage() {
    const error = useRouteError() as RouterError
    const navigate = useNavigate()
    console.error(error)

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardContent className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">Oops!</h1>
                    <p className="text-sm text-muted-foreground">
                        Sorry, an unexpected error has occurred.
                    </p>
                    <div className="rounded-md bg-muted p-4">
                        <p className="text-sm font-medium text-destructive">
                            {error.statusText || error.message}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
