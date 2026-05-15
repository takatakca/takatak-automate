import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/auth-store";

/** Client-side gate. Redirects to /login if no auth token in sessionStorage. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      setAllowed(true);
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }
  return <>{children}</>;
}