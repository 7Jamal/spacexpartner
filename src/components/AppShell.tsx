import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/BrandMark";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";


export function AppShell({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  const { user, isAdmin, signOut } = useAuth();
  const { theme } = useTheme();
  const { pathname } = useLocation();
  const logoTone = theme === "dark" ? "onDark" : "default";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass-bar glass-refract glass-sheen border-b">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="shrink-0">
            <BrandMark size="sm" layout="inline" tone={logoTone} textClassName="hidden sm:flex" />
          </Link>


          {isAdmin ? (
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              <NavLink to="/admin" active={pathname.startsWith("/admin")}>
                <ShieldCheck className="size-4" />
                Admin
              </NavLink>
              <NavLink to="/dashboard" active={pathname.startsWith("/dashboard")}>
                <LayoutDashboard className="size-4" />
                My dashboard
              </NavLink>
            </nav>
          ) : null}

          <div className="ml-auto flex items-center gap-1">
            <div className="mr-2 hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-xs font-semibold">{user?.email}</p>
              <p className="text-[11px] text-muted-foreground">
                {isAdmin ? "Super Administrator" : "Partner"}
              </p>
            </div>
            <NotificationCenter userId={user?.id} />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
        {isAdmin ? (
          <nav className="flex items-center gap-1 border-t border-[color:var(--glass-border)] px-4 py-2 md:hidden">
            <NavLink to="/admin" active={pathname.startsWith("/admin")}>
              <ShieldCheck className="size-4" />
              Admin
            </NavLink>
            <NavLink to="/dashboard" active={pathname.startsWith("/dashboard")}>
              <LayoutDashboard className="size-4" />
              My dashboard
            </NavLink>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {subtitle ? <p className="sr-only">{subtitle}</p> : null}
        {children}
      </main>

      <footer className="glass-bar glass-refract mt-8 border-t py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <BrandMark size="sm" layout="inline" tone={logoTone} textClassName="hidden sm:flex" />
          <p className="text-xs text-muted-foreground">Secure partner payment management</p>

        </div>
      </footer>
    </div>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "liquid-press inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
        active ? "glass-field border text-foreground" : "text-muted-foreground hover:glass-field hover:border",
      )}
    >
      {children}
    </Link>
  );
}