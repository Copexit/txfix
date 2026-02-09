# TxFix

**Transaction Stuck? Fix it.** &rarr; [txfix.it](https://txfix.it)

Free Bitcoin transaction diagnosis. 30-second rescue. No keys required.

---

TxFix is the first diagnostic-first rescue tool for stuck Bitcoin transactions. Every other tool — accelerators, rebroadcasters, wallet bump buttons — assumes you already know what's wrong and jumps straight to the most expensive fix. TxFix tells you what's actually happening, for free, then walks you to the cheapest resolution in 3 clicks.

Paste a TXID. Get a diagnosis in 3 seconds. Fix it in 30.

## The Problem

When a Bitcoin transaction gets stuck, the user experience is broken:

1. User sends Bitcoin. Transaction doesn't confirm. Panic sets in.
2. They google "stuck bitcoin transaction" and get 15 articles with conflicting advice.
3. "Use RBF!" — their wallet doesn't support it. "Try CPFP!" — they don't know what a change output is.
4. They find an accelerator. Pay $40 in out-of-band mining fees for a $15 transaction.
5. Transaction confirms. They overpaid massively. They swear at Bitcoin.

The entire existing toolkit — mempool.space Accelerator, ViaBTC, BitAccelerate, wallet-integrated bump buttons — skips the most important step: **diagnosis**. Nobody checks whether a simple $0.50 RBF bump would work before charging $40 for an out-of-band miner bribe.

The diagnostic layer doesn't exist. Until now.

## How It Works

### 1. Paste your TXID

One input field. Center screen. Nothing else. No signup, no wallet connect, no noise.

### 2. Watch the diagnosis (2-3 seconds)

An animated diagnostic sequence fires in real-time:

```
✓ Transaction found in mempool
✓ RBF signaled (sequence: 0xfffffffd)
⚠ Fee rate: 4 sat/vB — below next-block minimum
○ Mempool position: 23,471 of 84,209
○ Change output detected → CPFP possible
○ Estimated wait at current rate: ~14 hours
○ Next-block target: 18 sat/vB
```

### 3. Get the verdict

A clear recommendation card tells you exactly what's happening and what to do:

```
┌─────────────────────────────────────────────────┐
│  STUCK — ~14 hours at current fee rate          │
│                                                  │
│  Your tx pays 4 sat/vB but the mempool needs    │
│  18 sat/vB for next-block confirmation.          │
│                                                  │
│  BEST: RBF Bump → 2,847 sats (~$2.70, ~10 min) │
│  ALT:  CPFP     → 4,120 sats (~$3.91, ~10 min) │
│                                                  │
│  [ Fix it ]                                      │
└─────────────────────────────────────────────────┘
```

Sometimes the verdict is: **"Relax. Your tx will confirm in ~45 minutes. Do nothing."** I built this tool to be honest, not to upsell.

### 4. Fix it

Click "Fix it" &rarr; TxFix constructs the exact replacement transaction &rarr; presents it as a PSBT (QR code for hardware wallets, .psbt file for Sparrow/Electrum, raw hex for everything else). You sign in your own wallet. **TxFix never touches your keys.** After broadcast, a live tracker shows confirmation in real-time.

### 5. Share

After confirmation, you get a shareable rescue receipt: what went wrong, what was done, how much it cost vs. how much an accelerator would have charged.

> *"Rescued by TxFix — saved $37.30 vs. mempool.space Accelerator."*

## What Makes TxFix Different

| | TxFix | mempool.space Accelerator | ViaBTC | BitAccelerate | Wallet RBF |
|---|---|---|---|---|---|
| **Diagnoses the problem** | Free, always | No | No | No | No |
| **Checks RBF/CPFP options** | Automatic | No | No | No | Partial |
| **Recommends cheapest fix** | With exact cost | No | No | No | No |
| **Generates PSBT** | Sign in your wallet | No | No | No | Own txs only |
| **Works with any wallet** | Wallet-agnostic | Yes | Yes | Yes | Own wallet only |
| **Typical cost** | 500-5,000 sats | $30-50+ | Free (limited) | Free (placebo) | Varies |
| **Touches your keys** | Never | No | No | No | Yes |

**The core insight:** Existing tools charge $40 without telling you a $0.50 RBF bump would work. TxFix tells you for free.

## Features

**V1 — The Unstuck Machine**

- Instant diagnosis — RBF signaling, CPFP feasibility, fee analysis, mempool position, estimated wait time
- Verdict card — Plain-English explanation with clear recommendation
- PSBT generation — Auto-constructed RBF bump or CPFP child transaction
- Three delivery methods — BBQr animated QR, .psbt file download, raw hex copy
- Live tracker — Watch your replacement tx propagate and confirm
- Rescue receipt — Shareable card showing what you saved vs. alternatives
- Accelerator fallback — Links to mempool.space and ViaBTC when RBF/CPFP aren't possible
- Network support — Mainnet, testnet4, signet

**V2 — The Copilot** (planned)

- Watchlist — Monitor multiple pending transactions with push alerts
- Send Time Advisor — "Fees will likely drop 40% in ~3 hours"
- Pre-Flight Check — Paste a raw tx before broadcasting to get a risk score
- Fee Alerts — "Notify me when next-block fee drops below 10 sat/vB"

## Tech Stack

```
Frontend        Next.js 16 + TypeScript + Tailwind CSS 4 + Motion
Bitcoin data    mempool.space REST API (fees, mempool, tx status)
Tx building     bitcoinjs-lib v7 (RBF/CPFP construction + PSBT)
QR codes        BBQr (animated PSBT QR) + qrcode.react
Deploy          GitHub Pages via GitHub Actions (static export)
```

No backend servers. No databases. No custody. Pure client-side code + public APIs.

## Architecture

```
User pastes TXID
       │
       ▼
┌─────────────────────┐
│  Diagnostic Engine   │
│                      │
│  mempool.space API   │──→ fee estimates, mempool stats, tx status
│                      │
│  Checks:             │
│  • RBF signaling     │    (sequence number < 0xfffffffe)
│  • CPFP feasibility  │    (change output + spendable UTXO)
│  • Fee adequacy      │    (current rate vs next-block target)
│  • Mempool position  │    (how many txs ahead at higher fees)
│  • Wait estimate     │    (projected confirmation time)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Verdict Card      │──→ STUCK / SLOW / FINE + recommendation
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Transaction Builder │
│                      │
│  bitcoinjs-lib       │──→ RBF replacement or CPFP child tx
│  PSBT output         │──→ QR code + .psbt file + raw hex
│                      │
│  User signs in       │
│  their own wallet    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Broadcast + Track   │──→ live confirmation monitoring
└─────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 24 (run `nvm use`)
- pnpm

### Development

```bash
git clone https://github.com/shacollision/txfix.git
cd txfix
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
```

Static output goes to `out/`. Serve it with any static file server.

## Pricing

I intend to keep the diagnosis permanently free. V1 is completely free — no payment gating at all. Future versions may charge a small Lightning fee for PSBT generation to sustain the service, but if you run TxFix locally, everything is free forever. It's FOSS.

| Tier | What you get | Cost |
|------|-------------|------|
| **Run it yourself** | Everything, forever | $0 |
| **Free tier** | Full diagnosis + recommendation | $0 |
| **Rescue** *(future)* | Auto-generated PSBT for RBF or CPFP | Small Lightning fee |

## Why Open Source

Bitcoin is a trust-minimized system. A transaction rescue tool should be too.

- **Verify the code** — You can read exactly what TxFix does with your TXID. No hidden tracking, no data harvesting, no wallet fingerprinting.
- **Self-host** — Run it on your own infrastructure, connect to your own mempool.space instance, keep everything private.
- **Contribute** — Found an edge case? Better fee estimation logic? Submit a PR.
- **Fork it** — Build something better. I'd love that.

PSBT generation is fully client-side. Your keys never leave your device. There is nothing to trust.

## Roadmap

- [x] Diagnostic engine (RBF detection, CPFP feasibility, fee analysis)
- [x] Animated diagnostic sequence UI
- [x] Verdict card with recommendation logic
- [x] RBF replacement transaction construction
- [x] CPFP child transaction construction
- [x] PSBT generation + BBQr animated QR + file download + hex copy
- [x] Broadcast + live confirmation tracker
- [x] Rescue receipt / share card
- [x] GitHub Pages deployment (static export)
- [ ] Lightning payment via phoenixd
- [ ] Transaction watchlist with push notifications
- [ ] Send time advisor (predictive fee forecasting)
- [ ] Pre-flight check (paste raw tx, get risk score)
- [ ] Fee alerts (Telegram, Nostr DM)
- [ ] Umbrel / Start9 app for self-hosted deployment

## License

AGPL

## Acknowledgments

Built on the shoulders of:

- [mempool.space](https://mempool.space) — The best Bitcoin explorer and the API that makes TxFix possible
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) — Rock-solid Bitcoin transaction library
- [BBQr](https://github.com/nicklockwood/bbqr) — Animated QR encoding for large payloads

---

<p align="center">
  <strong>txfix.it</strong> — because your sats have places to be.
</p>
