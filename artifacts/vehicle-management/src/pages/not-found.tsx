import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 glass-panel border-t-4 border-t-primary">
        <CardContent className="pt-10 pb-10 flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-6 text-primary">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">404</h1>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-primary/25 h-11 px-8">
            Return to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
