# TxFix

**Transaction stuck? Fix it.** &rarr; [txfix.click](https://txfix.click)

3 clicks to unstick. Free diagnosis. No keys required.

---

TxFix is the first diagnostic-first rescue tool for stuck Bitcoin transactions. Every other tool - accelerators, rebroadcasters, wallet bump buttons - assumes you already know what's wrong and jumps straight to the most expensive fix. TxFix tells you what's actually happening, for free, then walks you to the cheapest resolution in 3 clicks.

## The Problem

When a Bitcoin transaction gets stuck, the user experience is broken:

1. User sends Bitcoin. Transaction doesn't confirm. Panic sets in.
2. They google "stuck bitcoin transaction" and get 15 articles with conflicting advice.
3. "Use RBF!" - their wallet doesn't support it. "Try CPFP!" - they don't know what a change output is.
4. They find an accelerator. Pay $40 in out-of-band mining fees for a $15 transaction.
5. Transaction confirms. They overpaid massively. They swear at Bitcoin.

The entire existing toolkit - mempool.space Accelerator, ViaBTC, BitAccelerate, wallet-integrated bump buttons - skips the most important step: **diagnosis**. Nobody checks whether a simple $0.50 RBF bump would work before charging $40 for an out-of-band miner bribe.

The diagnostic layer doesn't exist. Until now.

## 3 Clicks to Unstick

### Click 1: Paste your TXID

One input field. Center screen. Nothing else. No signup, no wallet connect, no noise.

An animated diagnostic sequence fires in real-time:

```
ok  Transaction found in mempool
ok  RBF signaled (sequence: 0xfffffffd)
!!  Fee rate: 4 sat/vB - below next-block minimum
--  Mempool position: 23,471 of 84,209
--  Change output detected - CPFP possible
--  Estimated wait at current rate: ~14 hours
--  Next-block target: 18 sat/vB
```

### Click 2: Read the verdict, hit Fix

A clear recommendation card tells you exactly what's happening and what to do:

```
STUCK - ~14 hours at current fee rate

Your tx pays 4 sat/vB but the mempool needs
18 sat/vB for next-block confirmation.

BEST: RBF Bump - 2,847 sats (~$2.70, ~10 min)
ALT:  CPFP     - 4,120 sats (~$3.91, ~10 min)

                [ Fix it ]
```

Sometimes the verdict is: **"Relax. Your tx will confirm in ~45 minutes. Do nothing."** TxFix is honest, not an upsell.

### Click 3: Choose your wallet, follow the guide

Pick your wallet from 12 supported wallets. TxFix resolves the best approach for your wallet + method + diagnosis:

- **Native** - Your wallet has a built-in bump button. TxFix gives you step-by-step instructions tailored to your wallet's UI.
- **PSBT** - Your wallet supports PSBT import. TxFix auto-generates the replacement transaction for free - download the file, scan the QR, or copy the hex.
- **Unsupported** - Your wallet can't do this method. TxFix suggests switching methods, changing wallets, or using an accelerator.

After the fix, a live tracker monitors confirmation in real-time. You get a rescue receipt showing what was done and how much it cost.

> *"Rescued by TxFix - transaction confirmed."*

## Supported Wallets

TxFix provides wallet-specific step-by-step guides for 12 wallets, with a generic PSBT fallback for any wallet not listed.

| Wallet | Platforms | RBF | CPFP | PSBT Import |
|---|---|---|---|---|
| **Sparrow Wallet** | Desktop | Native | Native | File, QR, Clipboard |
| **Electrum** | Desktop, Android | Native | Native | File, QR, Clipboard |
| **Bitkit** | Mobile | Native | - | - |
| **Ashigaru** | Mobile | Native | Native | - |
| **BlueWallet** | Mobile | Native | - | - |
| **Bitcoin Core** | Desktop | Native | Native | - |
| **Wasabi Wallet** | Desktop | Native | Native | - |
| **Ledger Live** | Desktop, Mobile | Native | - | - |
| **Trezor Suite** | Desktop | Native | Native | - |
| **Exodus** | Desktop, Mobile | Native | Native | - |
| **Muun** | Mobile | - | - | - |
| **Blockstream Green** | Desktop, Mobile | Native | - | - |
| **Other / Not Listed** | Any | PSBT | PSBT | File, QR, Clipboard |

Each guide adapts to the diagnosis verdict. If a wallet auto-calculates fees (Bitkit, Ashigaru, Wasabi, Exodus), TxFix tells the user so they don't look for a manual fee slider that doesn't exist.

## What Makes TxFix Different

| | TxFix | mempool.space Accelerator | ViaBTC | BitAccelerate | Wallet RBF |
|---|---|---|---|---|---|
| **Diagnoses the problem** | Free, always | No | No | No | No |
| **Checks RBF/CPFP options** | Automatic | No | No | No | Partial |
| **Recommends cheapest fix** | With exact cost | No | No | No | No |
| **Wallet-specific guides** | 12 wallets | No | No | No | Own wallet only |
| **Generates free PSBT** | Sign in your wallet | No | No | No | Own txs only |
| **Works with any wallet** | Wallet-agnostic | Yes | Yes | Yes | Own wallet only |
| **Touches your keys** | Never | No | No | No | Yes |

**The core insight:** Existing tools charge $40 without telling you a $0.50 RBF bump would work. TxFix tells you for free.

## Features

**V1 - The Unstuck Machine**

- Instant diagnosis - RBF signaling, CPFP feasibility, fee analysis, mempool position, estimated wait time
- Verdict card - Plain-English explanation with clear recommendation and exact cost comparison
- Wallet-guided fix flow - Step-by-step instructions for 12 wallets (Sparrow, Electrum, Bitkit, Ashigaru, BlueWallet, Bitcoin Core, Wasabi, Ledger Live, Trezor Suite, Exodus, Muun, Blockstream Green)
- Smart guide resolution - Automatically picks native, PSBT, or unsupported path per wallet + method + verdict
- Free PSBT generation - Auto-constructed RBF bump or CPFP child transaction for wallets that support import
- Three PSBT delivery methods - BBQr animated QR, .psbt file download, raw hex copy
- Live tracker - Watch your replacement tx propagate and confirm
- Rescue receipt - Shareable summary card with method, fee, and transaction links
- Accelerator fallback - Links to mempool.space and ViaBTC when RBF/CPFP aren't possible
- Network support - Mainnet, testnet4, signet

**V2 - The Copilot** (planned)

- Watchlist - Monitor multiple pending transactions with push alerts
- Send Time Advisor - "Fees will likely drop 40% in ~3 hours"
- Pre-Flight Check - Paste a raw tx before broadcasting to get a risk score
- Fee Alerts - "Notify me when next-block fee drops below 10 sat/vB"

## Tech Stack

```
Frontend        Next.js 16 + TypeScript + Tailwind CSS 4 + Motion
Bitcoin data    mempool.space REST API (fees, mempool, tx status)
Tx building     bitcoinjs-lib v7 (RBF/CPFP construction + PSBT)
QR codes        BBQr (animated PSBT QR) + qrcode.react
Analytics       Cloudflare Web Analytics (privacy-first, no cookies)
Deploy          GitHub Pages (static export) + custom domain
```

No backend servers. No databases. No custody. Pure client-side code + public APIs.

## Architecture

```
User pastes TXID
       |
       v
+---------------------+
|  Diagnostic Engine   |
|                      |
|  mempool.space API   |-->  fee estimates, mempool stats, tx status
|                      |
|  Checks:             |
|  - RBF signaling     |    (sequence number < 0xfffffffe)
|  - CPFP feasibility  |    (change output + spendable UTXO)
|  - Fee adequacy      |    (current rate vs next-block target)
|  - Mempool position  |    (how many txs ahead at higher fees)
|  - Wait estimate     |    (projected confirmation time)
+---------+-----------+
          |
          v
+---------------------+
|    Verdict Card      |-->  STUCK / SLOW / FINE + recommendation
+---------+-----------+
          |
          v
+---------------------+
|   Wallet Selection   |-->  12 wallets with search + filtering
+---------+-----------+
          |
          v
+---------------------+
|  resolveGuide()      |-->  wallet + method + verdict = ResolvedGuide
|                      |
|  Native: follow UI   |-->  wallet-specific step-by-step instructions
|  PSBT: auto-generate |-->  BBQr QR + .psbt file + raw hex
|  Unsupported: fallback|-->  switch method, change wallet, accelerator
+---------+-----------+
          |
          v
+---------------------+
|  Broadcast + Track   |-->  live confirmation monitoring
+---------+-----------+
          |
          v
+---------------------+
|   Rescue Receipt     |-->  shareable summary + copy to clipboard
+---------------------+
```

## Getting Started

### Prerequisites

- Node.js 22+ (run `nvm use`)
- pnpm

### Development

```bash
git clone https://github.com/copexit/txfix.git
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

### Test

```bash
pnpm test
```

## Why Open Source

Bitcoin is a trust-minimized system. A transaction rescue tool should be too.

- **Verify the code** - You can read exactly what TxFix does with your TXID. No hidden tracking, no data harvesting, no wallet fingerprinting.
- **Self-host** - Run it on your own infrastructure, connect to your own mempool.space instance, keep everything private.
- **Contribute** - Found an edge case? Better fee estimation logic? Submit a PR.
- **Fork it** - Build something better.

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
- [x] Wallet-guided fix flow (12 wallets with step-by-step instructions)
- [x] Smart guide resolution (native / PSBT / unsupported per wallet)
- [x] GitHub Pages deployment (static export) + custom domain
- [x] Cloudflare Web Analytics
- [ ] Transaction watchlist with push notifications
- [ ] Send time advisor (predictive fee forecasting)
- [ ] Pre-flight check (paste raw tx, get risk score)
- [ ] Fee alerts (Telegram, Nostr DM)
- [ ] Umbrel / Start9 app for self-hosted deployment

## License

AGPL

## Acknowledgments

Built on the shoulders of:

- [mempool.space](https://mempool.space) - The best Bitcoin explorer and the API that makes TxFix possible
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) - Rock-solid Bitcoin transaction library
- [BBQr](https://github.com/nicklockwood/bbqr) - Animated QR encoding for large payloads

---

<p align="center">
  <strong>txfix.click</strong> - 3 clicks to unstick.
</p>
