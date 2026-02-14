"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WALLETS } from "@/lib/wallets/data";
import type { WalletInfo, Platform } from "@/lib/wallets/types";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface WalletSelectorProps {
  onSelect: (walletId: string) => void;
  onCancel: () => void;
}

const platformLabels: Record<Platform, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  web: "Web",
  hardware: "Hardware",
};

export function WalletSelector({ onSelect, onCancel }: WalletSelectorProps) {
  const [query, setQuery] = useState("");

  const { mainWallets, otherWallet } = useMemo(() => {
    const other = WALLETS.find((w) => w.id === "other");
    const main = WALLETS.filter((w) => w.id !== "other");
    return { mainWallets: main, otherWallet: other };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return mainWallets;
    const q = query.toLowerCase();
    return mainWallets.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.keywords.some((k) => k.includes(q)),
    );
  }, [query, mainWallets]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card accent="bitcoin" className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Which wallet do you use?</h3>
          <p className="text-muted text-sm mt-1">
            We&apos;ll show you step-by-step instructions for your specific
            wallet.
          </p>
        </div>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search wallets..."
          autoComplete="off"
          className="w-full bg-surface-inset border border-card-border rounded-lg px-3 py-2
            text-sm text-foreground placeholder:text-muted/50
            focus:outline-none focus:border-bitcoin transition-colors"
        />

        {/* Wallet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onSelect={onSelect}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-2">
            No wallets match your search.
          </p>
        )}

        {/* Other / Not Listed -always visible */}
        {otherWallet && (
          <button
            onClick={() => onSelect(otherWallet.id)}
            className="w-full text-left bg-surface-inset border border-card-border rounded-lg p-3
              hover:border-muted transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium text-muted">
              {otherWallet.name}
            </span>
            <span className="text-xs text-muted/60 block mt-0.5">
              {otherWallet.description}
            </span>
          </button>
        )}

        <button
          onClick={onCancel}
          className="text-muted text-sm hover:text-foreground transition-colors cursor-pointer"
        >
          &larr; Back to diagnosis
        </button>
      </Card>
    </motion.div>
  );
}

function WalletCard({
  wallet,
  onSelect,
}: {
  wallet: WalletInfo;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(wallet.id)}
      className="text-left bg-surface-inset border border-card-border rounded-lg p-3
        hover:border-bitcoin transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-sm font-semibold block">{wallet.name}</span>
          <span className="text-xs text-muted block mt-0.5 truncate">
            {wallet.description}
          </span>
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        {wallet.platforms.map((p) => (
          <Badge key={p} variant="muted" className="text-[10px] px-1.5 py-0">
            {platformLabels[p]}
          </Badge>
        ))}
        {wallet.openSource && (
          <Badge
            variant="success"
            className="text-[10px] px-1.5 py-0"
          >
            FOSS
          </Badge>
        )}
      </div>
    </motion.button>
  );
}
