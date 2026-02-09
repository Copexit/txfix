"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface BbqrAnimatedQrProps {
  psbtBase64: string;
}

export function BbqrAnimatedQr({ psbtBase64 }: BbqrAnimatedQrProps) {
  const [parts, setParts] = useState<string[] | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Split PSBT into BBQr frames
  useEffect(() => {
    async function split() {
      try {
        const bbqr = await import("bbqr");
        const data = Uint8Array.from(atob(psbtBase64), (c) => c.charCodeAt(0));
        const result = bbqr.splitQRs(data, "P", {
          encoding: "Z",
          minVersion: 5,
          maxVersion: 20,
        });
        setParts(result.parts);
      } catch {
        setError("Failed to generate QR code");
      }
    }
    split();
  }, [psbtBase64]);

  // Animate through frames
  useEffect(() => {
    if (!parts || parts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % parts.length);
    }, 250);
    return () => clearInterval(interval);
  }, [parts]);

  if (error) {
    return <p className="text-danger text-sm">{error}</p>;
  }

  if (!parts) {
    return (
      <div className="w-[280px] h-[280px] bg-card-bg rounded-xl animate-pulse" />
    );
  }

  // Small enough for single static QR
  if (parts.length === 1) {
    return (
      <div className="inline-block p-4 bg-white rounded-xl" aria-label="PSBT QR code">
        <QRCodeSVG
          value={parts[0]}
          size={248}
          level="L"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="inline-block p-4 bg-white rounded-xl" aria-label="PSBT QR code">
        <QRCodeSVG
          value={parts[currentFrame]}
          size={248}
          level="L"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      <p className="text-muted text-xs text-center">
        Frame {currentFrame + 1} of {parts.length}
      </p>
    </div>
  );
}
