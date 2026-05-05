import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-xl font-medium text-foreground">
            Access denied
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            This project does not exist, or you do not have access to open it.
          </p>
        </div>
        <Link
          href="/editor"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to editor
        </Link>
      </div>
    </main>
  );
}
