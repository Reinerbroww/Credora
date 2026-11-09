"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MenuIcon, SearchIcon } from "@/components/icons";
import { NotificationsMenu } from "@/components/notifications";
import { Avatar } from "@/components/ui";
import { getPageMeta } from "@/lib/nav";
import { useSearch } from "@/lib/search";
import { useCredora } from "@/lib/store";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useCredora();
  const { query, setQuery } = useSearch();
  const [draft, setDraft] = useState(query);
  const meta = getPageMeta(pathname);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setQuery(draft.trim());
    router.push("/applications");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-near-black/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0">
          <p className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-muted/70 sm:block">
            {meta.section}
          </p>
          <p className="truncate text-[13.5px] font-semibold text-white">
            {meta.title}
          </p>
        </div>

        <div className="flex-1" />

        <form
          onSubmit={handleSubmit}
          className="relative hidden w-[260px] md:block lg:w-[330px]"
          role="search"
        >
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search applications..."
            className="field h-9 py-0 pl-9 pr-3 text-[12.5px]"
            aria-label="Search applications"
          />
        </form>

        <span className="hidden items-center gap-1.5 rounded-full border border-sage/15 bg-sage/[0.06] px-2.5 py-1 text-[10px] font-medium text-sage xl:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          Demo data
        </span>

        <NotificationsMenu />

        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg border border-line bg-white/[0.02] py-1 pl-1 pr-2.5 transition-colors hover:border-sage/25 hover:bg-white/[0.04]"
        >
          <Avatar name={session?.full_name ?? "Credora User"} className="h-7 w-7 text-[10px]" />
          <span className="hidden leading-tight sm:block">
            <span className="block max-w-[120px] truncate text-[11.5px] font-medium text-white">
              {session?.full_name ?? "Credora User"}
            </span>
            <span className="block text-[10px] text-muted">
              {session?.role ?? "Risk Analyst"}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
