"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SearchProvider } from "@/lib/search";
import { useCredora } from "@/lib/store";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, session } = useCredora();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !session) {
      router.replace("/login");
    }
  }, [ready, session, router]);

  if (!ready) return <FullscreenLoader />;
  if (!session) return <FullscreenLoader />;

  return (
    <SearchProvider>
      <div className="app-shell-bg min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] lg:block">
          <Sidebar />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative h-full w-[280px] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg border border-line bg-near-black/60 text-muted"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-h-screen flex-col lg:pl-[252px]">
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1240px]">{children}</div>
          </main>
          <footer className="border-t border-line/60 px-4 py-4 text-[10.5px] text-muted/60 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1240px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span>Credora · Credit Intelligence Platform</span>
              <span>Predictions are decision support, not automated credit decisions.</span>
            </div>
          </footer>
        </div>
      </div>
    </SearchProvider>
  );
}
