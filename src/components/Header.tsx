"use client";

import Link from "next/link";
import { NetworkSelector } from "./NetworkSelector";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-card-border">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-xl font-bold tracking-tight text-foreground">
          tx<span className="text-bitcoin">fix</span>
        </span>
      </Link>
      <NetworkSelector />
    </header>
  );
}
