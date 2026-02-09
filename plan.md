# TxFix V1 — Full Implementation Plan

## Context

TxFix is the first diagnostic-first rescue tool for stuck Bitcoin transactions. Every existing tool (accelerators, wallet bump buttons) skips diagnosis and jumps to the most expensive fix. TxFix tells you what's actually wrong for free, then walks you to the cheapest fix in 3 clicks.

**V1 ships completely free** — no payment gating. Payments (phoenixd Lightning) will be added in V1.1 once there's traction. The app is a **static site** deployed to **GitHub Pages** — no backend, no database, pure frontend + public Bitcoin APIs.

### Why GitHub Pages Works

The entire app is client-side JavaScript. There are zero server dependencies:
- **Data**: fetched at runtime from public mempool.space + Esplora REST APIs (CORS-enabled)
- **Bitcoin logic**: bitcoinjs-lib runs 100% in the browser (pure JS, no native modules)
- **Build output**: `next build` with `output: 'export'` produces a plain `out/` folder of HTML/JS/CSS
- **No API routes, no SSR, no middleware** — just static files served by GitHub Pages

The only technical consideration is **browser polyfills for bitcoinjs-lib** (it uses Node.js `Buffer`). TxFix handles this with explicit imports (`import { Buffer } from 'buffer'`) rather than webpack global polyfills, ensuring compatibility with both Turbopack (dev) and webpack (build).

---

## Architecture

Single-page app. One route (`/`), URL query params drive state (`?tx=TXID&network=mainnet`). All data fetched client-side from public APIs.

```
User pastes TXID → Client fetches from mempool.space + Esplora APIs
  → Diagnostic engine runs checks (RBF, CPFP, fees, position, wait)
  → Animated step-by-step reveal → Verdict card (STUCK/SLOW/FINE)
  → "Fix it" → PSBT constructed client-side (bitcoinjs-lib)
  → Delivered as BBQr QR / .psbt file / raw hex
  → User signs in own wallet → Broadcast → Live tracker → Rescue receipt
```

**No keys ever touch TxFix.** PSBTs are unsigned templates the user signs in their own wallet.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (static export, App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS 4 (dark-only, CSS variables) |
| Animation | Motion (React 19 compatible successor to Framer Motion) |
| Bitcoin | bitcoinjs-lib v7 + @bitcoinerlab/secp256k1 + buffer polyfill |
| QR Codes | BBQr (animated QR for PSBTs) + qrcode.react (simple QR) |
| APIs | mempool.space REST + Blockstream Esplora (public, no auth) |
| Deploy | GitHub Pages via GitHub Actions |

**Networks supported:** mainnet, testnet4, signet (all mempool.space-supported Bitcoin networks)

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout, fonts, metadata, NetworkProvider
│   ├── page.tsx                   # Single page: view state machine
│   ├── globals.css                # Dark theme design system
│   └── favicon.ico
│
├── components/
│   ├── ui/                        # Reusable atoms
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── CopyButton.tsx
│   │   └── MonoText.tsx           # Monospace wrapper for TXIDs, fees
│   │
│   ├── Header.tsx                 # Logo + network selector
│   ├── Footer.tsx                 # Minimal: GitHub link, version
│   ├── NetworkSelector.tsx        # mainnet / testnet4 / signet dropdown
│   ├── TxInput.tsx                # Hero TXID input (paste-and-go)
│   ├── DiagnosticSequence.tsx     # Animated terminal-style step list
│   ├── DiagnosticStep.tsx         # Single check line (icon + label + detail)
│   ├── VerdictCard.tsx            # STUCK/SLOW/FINE + recommendations
│   ├── CostComparison.tsx         # RBF vs CPFP vs accelerator costs
│   ├── FixFlow.tsx                # Orchestrates PSBT build + delivery
│   ├── CpfpAddressInput.tsx       # Destination address input for CPFP
│   ├── PsbtDelivery.tsx           # Tabbed: QR / Download / Hex
│   ├── BbqrAnimatedQr.tsx         # BBQr animated QR renderer
│   ├── PsbtFileDownload.tsx       # .psbt file download button
│   ├── PsbtHexDisplay.tsx         # Raw hex + copy
│   ├── BroadcastInput.tsx         # Paste signed tx hex → broadcast
│   ├── LiveTracker.tsx            # Real-time confirmation monitor
│   ├── RescueReceipt.tsx          # Shareable rescue summary card
│   └── AcceleratorFallback.tsx    # Links when RBF/CPFP impossible
│
├── lib/
│   ├── api/
│   │   ├── mempool.ts             # mempool.space client (factory with baseUrl)
│   │   ├── esplora.ts             # Blockstream Esplora client
│   │   └── types.ts               # API response types (MempoolTransaction, etc.)
│   │
│   ├── diagnosis/
│   │   ├── engine.ts              # AsyncGenerator pipeline (yields CheckResults)
│   │   ├── types.ts               # DiagnosisState, Verdict, CheckResult, etc.
│   │   └── checks/
│   │       ├── confirmationStatus.ts
│   │       ├── rbf.ts             # Sequence number analysis
│   │       ├── cpfp.ts            # Unspent output detection
│   │       ├── feeAnalysis.ts     # Fee rate vs mempool target
│   │       ├── mempoolPosition.ts # Position in mempool queue
│   │       └── waitEstimate.ts    # Projected confirmation time
│   │
│   ├── psbt/
│   │   ├── rbfBuilder.ts          # RBF replacement PSBT construction
│   │   ├── cpfpBuilder.ts         # CPFP child PSBT construction
│   │   └── helpers.ts             # Change detection, dust limits, script utils
│   │
│   ├── bitcoin/
│   │   ├── networks.ts            # Network configs (URLs, bitcoinjs networks)
│   │   ├── constants.ts           # DUST_LIMIT, MAX_SEQUENCE, etc.
│   │   ├── fees.ts                # Fee calculation helpers (RBF cost, CPFP cost)
│   │   └── format.ts              # Sats formatting, truncate TXID, etc.
│   │
│   └── errors.ts                  # TxFixError class + ErrorCode enum
│
├── hooks/
│   ├── useDiagnosis.ts            # Main hook: fetch → diagnose → result
│   ├── useUrlState.ts             # Reads/writes ?tx= and ?network= URL params
│   ├── usePsbtBuilder.ts          # On-demand PSBT construction (dynamic import)
│   ├── useLiveTracker.ts          # Polls tx status for confirmation
│   └── useBroadcast.ts            # POST signed tx to mempool.space
│
├── context/
│   └── NetworkContext.tsx          # React context for network selection
│
public/
├── .nojekyll                      # Required for GitHub Pages
├── CNAME                          # txfix.it (when domain is ready)
└── (favicons, OG image)

.github/
└── workflows/
    └── deploy.yml                 # Build + deploy to GitHub Pages
```

---

## Implementation Phases

### Phase 1: Foundation & Design System
> Config, theme, layout, network infrastructure

**Modify:**
- `next.config.ts` — Add `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }`. **No webpack polyfills needed** — TxFix uses explicit `buffer` imports instead of global polyfills, which works with both Turbopack (dev) and webpack (build).
- `src/app/globals.css` — Dark-only theme with CSS custom properties: `--background: #0a0a0a`, `--card-bg: #18181b`, `--card-border: #27272a`, `--bitcoin: #F7931A`, `--success: #22c55e`, `--warning: #eab308`, `--danger: #ef4444`, `--muted: #71717a`
- `src/app/layout.tsx` — Update metadata (title: "TxFix — Fix Stuck Bitcoin Transactions"), wrap children in `<Suspense>` + `<NetworkProvider>`, keep Geist + Geist Mono fonts
- `package.json` — Add all dependencies up-front

**Create:**
- `src/lib/bitcoin/polyfills.ts` — Single file that sets up `globalThis.Buffer` from the `buffer` package. Imported once at the top of any entry point that uses bitcoinjs-lib (lazy-loaded with dynamic import, so it only runs when needed).
- `src/context/NetworkContext.tsx` — Stores network selection, provides API base URLs
- `src/hooks/useUrlState.ts` — Reads/writes `?tx=` and `?network=` params (must be inside `<Suspense>`)
- `src/lib/bitcoin/networks.ts` — Config map: `{ mainnet: { mempoolBaseUrl, esploraBaseUrl, bitcoinjsNetwork, explorerUrl }, testnet4: {...}, signet: {...} }`
- `src/lib/bitcoin/constants.ts` — `MAX_SEQUENCE = 0xFFFFFFFF`, `RBF_MAX_SEQUENCE = 0xFFFFFFFD`, dust limits by script type
- `src/lib/bitcoin/format.ts` — `formatSats()`, `truncateTxid()`, `feeRateDisplay()`
- `src/lib/errors.ts` — `TxFixError` class with error codes and user-friendly messages
- `src/components/ui/*` — Button, Card, Badge, Spinner, CopyButton, MonoText
- `src/components/Header.tsx` — Logo text ("txfix") + NetworkSelector
- `src/components/Footer.tsx` — Minimal footer
- `src/components/NetworkSelector.tsx` — Dropdown with colored dot indicators
- `public/.nojekyll` — Empty file

**Install:**
```bash
pnpm add motion bitcoinjs-lib ecpair @bitcoinerlab/secp256k1 buffer bbqr qrcode.react
```
Note: No `crypto-browserify` or `stream-browserify` needed — bitcoinjs-lib v7 with `@bitcoinerlab/secp256k1` handles crypto internally, and TxFix uses explicit `Buffer` imports instead of webpack shims.

**Verify:** `pnpm build` produces `out/` directory successfully. Dev server shows dark themed page with header + network selector.

---

### Phase 2: API Layer
> Type-safe clients for mempool.space and Esplora

**Create:**
- `src/lib/api/types.ts` — Types matching actual API responses:
  - `MempoolTransaction` (txid, version, locktime, size, weight, fee, vin[], vout[], status)
  - `MempoolVin` (txid, vout, prevout: {scriptpubkey, scriptpubkey_type, scriptpubkey_address, value}, sequence, witness, scriptsig)
  - `MempoolVout` (scriptpubkey, scriptpubkey_type, scriptpubkey_address, value)
  - `TxStatus` (confirmed, block_height, block_hash, block_time)
  - `RecommendedFees` (fastestFee, halfHourFee, hourFee, economyFee, minimumFee)
  - `MempoolBlock` (blockVSize, nTx, feeRange[])
  - `MempoolInfo` (count, vsize, total_fee, fee_histogram)
  - `OutspendStatus` (spent, txid, vin, status)
  - `Utxo` (txid, vout, value, status)

- `src/lib/api/mempool.ts` — Factory function `createMempoolClient(baseUrl)` returning:
  - `getTransaction(txid)` — GET `/tx/{txid}`
  - `getTxStatus(txid)` — GET `/tx/{txid}/status`
  - `getTxHex(txid)` — GET `/tx/{txid}/hex`
  - `getTxOutspends(txid)` — GET `/tx/{txid}/outspends`
  - `getRecommendedFees()` — GET `/v1/fees/recommended`
  - `getMempoolBlocks()` — GET `/v1/fees/mempool-blocks`
  - `getMempoolInfo()` — GET `/mempool`
  - `broadcastTx(hex)` — POST `/tx`
  - `getPrice()` — GET `/v1/prices` (for USD estimates)
  - Error handling: 404→TX_NOT_FOUND, 429→RATE_LIMITED, 5xx→API_UNAVAILABLE, network→NETWORK_ERROR
  - Retry: 3 attempts with exponential backoff (1s, 2s, 4s) for 5xx/network errors only

- `src/lib/api/esplora.ts` — Factory function `createEsploraClient(baseUrl)` returning:
  - `getAddressUtxos(address)` — GET `/address/{address}/utxo`
  - (Other endpoints overlap with mempool.space, use mempool as primary)

**Verify:** Create a temp test in page.tsx that fetches a known mainnet TXID and logs the parsed response.

---

### Phase 3: Diagnostic Engine
> The intellectual core — analyzes transactions and produces verdicts

**Create:**
- `src/lib/diagnosis/types.ts`:
  - `CheckStatus`: `'running' | 'pass' | 'warn' | 'fail' | 'info'`
  - `CheckResult`: `{ id, label, detail, status, icon: '✓'|'⚠'|'✗'|'○'|'⟳' }`
  - `VerdictSeverity`: `'STUCK' | 'SLOW' | 'FINE' | 'CONFIRMED'`
  - `Verdict`: `{ severity, headline, explanation, recommendations[], canRbf, canCpfp, showAcceleratorFallback }`
  - `Recommendation`: `{ method: 'RBF'|'CPFP'|'WAIT'|'ACCELERATOR', label, isPrimary, costSats, costUsd, estimatedTime, targetFeeRate }`
  - `CpfpCandidate`: `{ outputIndex, address, value, scriptPubKey, scriptType }`

- `src/lib/diagnosis/engine.ts` — **AsyncGenerator** pipeline that yields `CheckResult` one at a time (this drives the animated UI):
  1. Fetch all data in parallel: tx, txHex, fees, mempoolBlocks, outspends
  2. `yield` confirmation status check (already confirmed? → CONFIRMED verdict, done)
  3. `yield` RBF signaling check (sequence < 0xFFFFFFFE? + note full-RBF era since Core 28)
  4. `yield` CPFP feasibility (unspent outputs above dust limit?)
  5. `yield` fee adequacy (current rate vs next-block minimum)
  6. `yield` mempool position (how many vbytes ahead at higher fees)
  7. `yield` wait estimate (projected blocks to confirmation)
  8. `return` final `Verdict` with recommendations

- `src/lib/diagnosis/checks/confirmationStatus.ts` — Check `tx.status.confirmed`
- `src/lib/diagnosis/checks/rbf.ts` — Check all `vin[].sequence` values. RBF signaled if any < 0xFFFFFFFE. Note: full-RBF relay is default since Bitcoin Core 28+, so replacement may work even without signal.
- `src/lib/diagnosis/checks/cpfp.ts` — Cross-reference `outspends[]` to find unspent outputs with `scriptpubkey_address` above dust limit. These are CPFP candidates.
- `src/lib/diagnosis/checks/feeAnalysis.ts` — Calculate `tx.fee / (tx.weight / 4)` = effective fee rate in sat/vB. Compare against `recommendedFees.fastestFee` and `mempoolBlocks[0].feeRange[0]`.
- `src/lib/diagnosis/checks/mempoolPosition.ts` — Walk `mempoolInfo.fee_histogram` (descending by fee rate), sum vsizes of entries with higher fee rate to estimate queue position.
- `src/lib/diagnosis/checks/waitEstimate.ts` — Walk `mempoolBlocks[]` to find which projected block this tx would land in. Each block ≈ 10 minutes.

- `src/lib/bitcoin/fees.ts`:
  - `calculateRbfCost(tx, targetFeeRate)` → `{ additionalFeeSats, newTotalFee }` (new fee = ceil(vsize × targetRate), delta = new - old)
  - `calculateCpfpCost(parentTx, candidate, targetFeeRate)` → `{ childFeeSats, effectiveChildFeeRate }` (child must pay enough to bring parent+child package to target rate)

- `src/hooks/useDiagnosis.ts` — Consumes the async generator, updating React state as each step yields:
  - State: `{ phase: 'idle'|'fetching'|'diagnosing'|'complete'|'error', steps: CheckResult[], verdict: Verdict|null, txData, rawTxHex, error }`
  - On new txid: reset state, create API clients from NetworkContext, run `engine.ts` generator
  - Each yielded `CheckResult` appends to `steps[]` (triggers re-render → animation)
  - Generator return value becomes `verdict`

**Verify:** Paste known stuck/confirmed/slow TXIDs on testnet4, inspect diagnosis results in console.

---

### Phase 4: Diagnostic UI & Verdict Card
> The user-facing diagnosis experience

**Create:**
- `src/components/TxInput.tsx` — `'use client'`
  - Full-viewport centered when no TXID (hero layout)
  - Large monospace input, placeholder: "Paste a transaction ID..."
  - Validates 64-char hex on submit/paste
  - Auto-detects paste events → immediate submit ("paste and go")
  - Bitcoin orange glow on focus
  - Inline error for invalid TXIDs

- `src/components/DiagnosticStep.tsx` — Single line: `[icon] [label] — [detail]`
  - Icon color: green (pass), yellow (warn), red (fail), gray (info), spinning (running)
  - Motion: `initial={{ opacity: 0, x: -10 }}` → `animate={{ opacity: 1, x: 0 }}`

- `src/components/DiagnosticSequence.tsx` — `'use client'`
  - Dark terminal-style container with monospace font
  - Maps `steps[]` to `<DiagnosticStep>` components
  - Each step animates in as it's added (staggered by the generator timing)
  - Spinner at bottom while diagnosis is running

- `src/components/VerdictCard.tsx` — `'use client'`
  - Colored top border: red=STUCK, yellow=SLOW, green=FINE, blue=CONFIRMED
  - Large severity badge
  - Headline in large text (e.g., "~14 hours at current fee rate")
  - Explanation in muted text
  - Recommendation rows: method badge, cost in sats (~$USD), estimated time, "Fix it" button
  - Primary recommendation visually emphasized (Bitcoin orange button)
  - Motion: card slides up with fade

- `src/components/CostComparison.tsx` — Simple visual: "RBF: ~$2.70 vs Accelerator: ~$40 — save $37.30"

- `src/components/AcceleratorFallback.tsx` — Shown when no RBF/CPFP possible. Links to mempool.space/tx/{txid} and ViaBTC. Explains why.

**Modify:**
- `src/app/page.tsx` — Wire up the view state machine:
  - No txid → `<TxInput>` hero
  - Diagnosing → `<DiagnosticSequence>` (with `<TxInput>` collapsed at top)
  - Complete → `<DiagnosticSequence>` + `<VerdictCard>`
  - Error → Error display with retry

**Verify:** Full flow: paste TXID → animated diagnosis → verdict card. Test with mainnet, testnet4, signet.

---

### Phase 5: PSBT Construction
> Client-side transaction building with bitcoinjs-lib

**Create:**
- `src/lib/psbt/helpers.ts`:
  - `isSegWitInput(vin)` — checks scriptpubkey_type ∈ {v0_p2wpkh, v0_p2wsh, v1_p2tr}
  - `getDustLimit(scriptType)` — 294 for witness types, 546 for legacy
  - `identifyChangeOutput(tx)` — heuristic: match input address type, prefer non-round amounts, fallback to last matching output. **If ambiguous, return all candidates and let UI ask user.**
  - `extractRedeemScript(scriptsig)` — for P2SH-wrapped SegWit inputs

- `src/lib/psbt/rbfBuilder.ts` — `buildRbfPsbt({ originalTx, originalTxHex, targetFeeRate, network })`:
  1. Calculate new fee: `ceil(vsize × targetFeeRate)`
  2. Identify change output (reduce its value by fee delta)
  3. Verify change output stays above dust after reduction
  4. Add all original inputs with `sequence ≤ 0xFFFFFFFD` (ensure RBF signal)
  5. For SegWit inputs: set `witnessUtxo = { script, value }` from prevout
  6. For legacy inputs: set `nonWitnessUtxo` (raw prev tx hex — may need extra API call)
  7. For P2SH-wrapped SegWit: add `redeemScript`
  8. Add all original outputs with adjusted change value
  9. Return `{ psbt, psbtBase64, psbtHex, newFee }`

- `src/lib/psbt/cpfpBuilder.ts` — `buildCpfpPsbt({ parentTx, candidate, targetFeeRate, destinationAddress, network })`:
  1. Calculate required child fee (package fee rate math: parentVsize + childVsize × target - parentFee)
  2. Create 1-input-1-output tx: spend candidate UTXO → destinationAddress
  3. Verify output value (candidate.value - childFee) > dust limit
  4. Set `witnessUtxo` from candidate's scriptPubKey and value
  5. Return `{ psbt, psbtBase64, psbtHex, childFee }`
  6. Default destinationAddress = same as candidate address (self-spend, simplest UX)

- `src/hooks/usePsbtBuilder.ts` — **Dynamic imports** bitcoinjs-lib + builders (they're large, only load when user clicks "Fix it"):
  ```ts
  const build = async (method, params) => {
    const mod = await import(method === 'RBF' ? '@/lib/psbt/rbfBuilder' : '@/lib/psbt/cpfpBuilder');
    return mod.build(params);
  };
  ```

**Verify:** Build PSBT for a testnet4 transaction, import the .psbt file into Sparrow Wallet, verify it parses correctly with correct inputs/outputs/fee.

---

### Phase 6: PSBT Delivery UI
> QR codes, file download, hex display

**Create:**
- `src/components/BbqrAnimatedQr.tsx` — `'use client'`
  - Uses `bbqr.splitQRs(data, 'P', { encoding: 'Z' })` to split PSBT into frames
  - Cycles through frames at 4 FPS using `setInterval`
  - If PSBT fits in single QR (< ~2953 bytes), show static QR via `qrcode.react` instead
  - Dark QR (white on #18181b background)
  - Frame counter: "3 / 12"

- `src/components/PsbtFileDownload.tsx` — Button that creates Blob from base64 PSBT, triggers download as `txfix-rescue-{timestamp}.psbt`

- `src/components/PsbtHexDisplay.tsx` — Scrollable monospace container with full hex + CopyButton

- `src/components/PsbtDelivery.tsx` — `'use client'`
  - Three tabs: "Scan QR" / "Download File" / "Copy Hex"
  - Instructions per tab:
    - QR: "Scan with your hardware wallet or Sparrow Wallet"
    - File: "Import this .psbt file into Sparrow, Electrum, or any PSBT-compatible wallet"
    - Hex: "Paste this hex into your wallet's PSBT import"
  - Shows fee summary: "New fee: X sats (Y sat/vB) — Additional cost: Z sats"

- `src/components/CpfpAddressInput.tsx` — For CPFP: input for destination address, pre-filled with the candidate output address (self-spend default), with option to change

- `src/components/FixFlow.tsx` — Orchestrates: choose method → (CPFP? get address) → build PSBT → show delivery

**Verify:** Generate all three delivery formats, import each into Sparrow on testnet4.

---

### Phase 7: Broadcast & Live Tracker
> Sign → Broadcast → Watch confirmation

**Create:**
- `src/components/BroadcastInput.tsx` — `'use client'`
  - Text area: "Paste your signed transaction hex here"
  - "Broadcast" button → calls mempool.space `POST /tx`
  - Shows success (new TXID) or error (rejection reason from node)
  - Alternative: "Already broadcast? Paste the replacement TXID" input

- `src/hooks/useBroadcast.ts` — Calls `mempoolClient.broadcastTx(hex)`, returns txid or error

- `src/hooks/useLiveTracker.ts` — Polls `getTxStatus(txid)` every 10s:
  - States: `pending → mempool → confirmed`
  - Stops polling on confirmation
  - Returns `{ status, blockHeight, confirmations }`

- `src/components/LiveTracker.tsx` — `'use client'`
  - Progress steps: "Broadcasting..." → "In mempool" → "Confirmed"
  - Shows link to mempool.space explorer for the tx
  - Animated state transitions (Motion)
  - Subtle celebration on confirmation (green checkmark animation)

**Verify:** Broadcast a signed testnet4 transaction, watch it confirm in the tracker.

---

### Phase 8: Rescue Receipt
> Shareable proof of rescue

**Create:**
- `src/components/RescueReceipt.tsx` — `'use client'`
  - Dark card with Bitcoin orange accent
  - Shows: original TXID (truncated), method used (RBF/CPFP), fee paid, savings vs accelerator
  - Headline: "Rescued by TxFix — saved $X.XX vs. accelerator"
  - "Copy Summary" button (copies formatted text to clipboard)
  - Screenshot-friendly layout (fixed dimensions, high contrast)
  - Link back to txfix.it

**Verify:** Complete full flow end-to-end on testnet4: paste TXID → diagnosis → fix → broadcast → confirm → receipt.

---

### Phase 9: Polish & Deploy
> Error handling, mobile, accessibility, deployment

**Tasks:**
1. **Error handling audit** — Every API call has user-friendly error messages, retry buttons
2. **Mobile responsiveness** — Test all views at 375px width. TxInput, VerdictCard, PsbtDelivery must be fully usable on mobile
3. **Loading states** — Skeleton/shimmer where appropriate, spinners for async ops
4. **Accessibility** — Keyboard navigation, focus management between views, aria-labels on icons, screen reader text for status icons
5. **SEO/Meta** — OG image, description, favicon (Bitcoin-themed). `robots.txt`, `sitemap.xml` in `/public/`
6. **Performance** — Dynamic import bitcoinjs-lib + bbqr (only loaded on "Fix it" click). Lazy-load heavy components.
7. **GitHub Actions deploy** — `.github/workflows/deploy.yml`: checkout → pnpm install → pnpm build → upload `out/` → deploy pages
8. **Static export validation** — `pnpm build && npx serve out` locally, test all flows

**Modify:**
- `next.config.ts` — Conditional `basePath`/`assetPrefix` for GitHub Pages subdomain vs custom domain. Note: `next.config.ts` stays simple (no webpack overrides needed thanks to explicit polyfill imports).
- `public/CNAME` — Add when custom domain (txfix.it) is configured

---

## Key Technical Details

### State Machine (page.tsx)

```
idle → (paste TXID) → diagnosing → complete → (click Fix) → building →
  psbt-ready → (user signs + broadcasts) → tracking → confirmed → receipt
```

Views: `input | diagnosis | verdict | fix | tracker | receipt`

Driven by `useDiagnosis` phase + local UI state. `useUrlState` syncs TXID and network with URL for shareability.

**Critical:** `useSearchParams()` requires `<Suspense>` boundary in static export, or build fails.

### RBF Logic

- BIP125 rules: replacement must pay strictly higher absolute fee + sufficient fee rate
- TxFix keeps same inputs, same outputs, only reduces change output value
- Change output identification: heuristic (match input address type → non-round amount → last output)
- If change too small after fee increase → error, suggest CPFP instead
- Full-RBF era (Bitcoin Core 28+): replacement works even without explicit RBF signal in most cases

### CPFP Logic

- Spend an unspent output from the stuck tx with a high-fee child
- Child fee must bring package (parent + child) to target fee rate
- Formula: `childFee = ceil((parentVsize + childVsize) × targetRate) - parentFee`
- Default: self-spend (send back to same address), user can change destination
- 1-input-1-output child tx, estimated vsizes by script type (110 for P2WPKH, 111 for P2TR)

### Browser Polyfill Strategy (No Webpack Hacks)

bitcoinjs-lib needs Node.js `Buffer` in the browser. Instead of fragile webpack `resolve.fallback` polyfills (which break with Turbopack in dev), TxFix uses **explicit imports**:

```ts
// src/lib/bitcoin/polyfills.ts — imported once before any bitcoinjs-lib usage
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
```

This file is dynamically imported alongside bitcoinjs-lib (only when user clicks "Fix it"), keeping the initial bundle clean. Uses `@bitcoinerlab/secp256k1` (pure JS) instead of native/WASM secp256k1. No `crypto-browserify` or `stream-browserify` needed — bitcoinjs-lib v7 handles crypto internally.

### Network Config

```ts
const NETWORKS = {
  mainnet: { mempool: 'https://mempool.space/api', esplora: 'https://blockstream.info/api', explorer: 'https://mempool.space' },
  testnet4: { mempool: 'https://mempool.space/testnet4/api', esplora: 'https://mempool.space/testnet4/api', explorer: 'https://mempool.space/testnet4' },
  signet:   { mempool: 'https://mempool.space/signet/api', esplora: 'https://mempool.space/signet/api', explorer: 'https://mempool.space/signet' },
}
```

### Design System (Dark Only)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0a0a` | Page background |
| `--card-bg` | `#18181b` | Cards, panels |
| `--card-border` | `#27272a` | Borders, dividers |
| `--foreground` | `#ededed` | Primary text |
| `--muted` | `#71717a` | Secondary text |
| `--bitcoin` | `#F7931A` | Accent, CTAs, brand |
| `--success` | `#22c55e` | Confirmed, pass |
| `--warning` | `#eab308` | Slow, caution |
| `--danger` | `#ef4444` | Stuck, error |

Fonts: Geist Sans (UI text) + Geist Mono (TXIDs, fees, hex, code).

---

## Verification Plan

After each phase, verify with these tests:

1. **Phase 1:** `pnpm build` succeeds with static export. Dark theme renders. Network selector works.
2. **Phase 2:** Fetch a known TXID from each network, log parsed response, verify types match.
3. **Phase 3:** Diagnose known stuck/slow/fine/confirmed TXIDs, verify CheckResults and Verdict accuracy.
4. **Phase 4:** Full visual flow: paste → animated steps → verdict card. Test all 4 verdict types. Mobile check.
5. **Phase 5:** Generate PSBT for testnet4 tx, import into Sparrow, verify structure is valid.
6. **Phase 6:** All 3 delivery methods work: QR scans, file imports, hex pastes correctly.
7. **Phase 7:** Broadcast signed testnet4 tx, tracker shows confirmation.
8. **Phase 8:** Receipt displays correct data, copy function works.
9. **Phase 9:** `pnpm build && npx serve out` — full end-to-end flow works from static build. Deploy to GitHub Pages succeeds.

---

## Dependencies Between Phases

```
Phase 1 (Foundation) ──→ Phase 2 (API) ──→ Phase 3 (Engine) ──→ Phase 4 (UI)
                                                                      │
Phase 1 ──→ Phase 5 (PSBT) ──→ Phase 6 (Delivery) ──→ Phase 7 (Broadcast) ──→ Phase 8 (Receipt)
                                                                                       │
                                                                                 Phase 9 (Polish)
```

Phase 5 (PSBT) can start in parallel with Phase 4 (UI) since it only depends on Phase 2 (API types) and Phase 1 (polyfills).
