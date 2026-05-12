import { WifiOff } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        <WifiOff className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">You are offline</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        It looks like you've lost your internet connection. Don't worry, your work is saved locally and will sync once you're back online.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
