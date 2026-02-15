"use client";

import { useState } from "react";

interface WalletAvatarProps {
  walletId: string;
  walletName: string;
  /** CSS pixel size (default 32). Actual image is 2x for retina. */
  size?: number;
  className?: string;
  /** Tailwind classes for the letter-avatar fallback (e.g. "bg-blue-500/20 text-blue-400") */
  fallbackColorClass?: string;
}

export function WalletAvatar({
  walletId,
  walletName,
  size = 32,
  className = "",
  fallbackColorClass = "bg-bitcoin/15 text-bitcoin",
}: WalletAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`rounded-full ${fallbackColorClass} text-sm font-bold flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        {walletName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`/wallets/${walletId}.webp`}
      alt={`${walletName} icon`}
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
