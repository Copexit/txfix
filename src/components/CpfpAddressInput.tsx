"use client";

import { useState } from "react";

interface CpfpAddressInputProps {
  defaultAddress: string;
  onConfirm: (address: string) => void;
  onCancel: () => void;
}

export function CpfpAddressInput({
  defaultAddress,
  onConfirm,
  onCancel,
}: CpfpAddressInputProps) {
  const [address, setAddress] = useState(defaultAddress);

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-sm">CPFP Destination Address</h3>
      <p className="text-muted text-xs leading-relaxed">
        The child transaction will send funds to this address. By default, it
        sends back to the same address (self-spend). You can change it if
        needed.
      </p>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        className="w-full bg-[#111113] border border-card-border rounded-lg px-3 py-2
          font-mono text-sm text-foreground placeholder:text-muted/50
          focus:outline-none focus:border-bitcoin transition-colors"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(address)}
          disabled={!address.trim()}
          className="px-4 py-2 bg-bitcoin text-black font-semibold text-sm rounded-lg
            hover:bg-bitcoin-hover transition-colors disabled:opacity-50 cursor-pointer"
        >
          Build PSBT
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-muted text-sm hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
