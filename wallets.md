# TxFix Wallet-Guided Fix Flow

## Overview

After diagnosing a stuck Bitcoin transaction, TxFix guides users through fixing it in their specific wallet. Instead of jumping straight to PSBT generation, TxFix asks which wallet the user has and provides tailored step-by-step instructions.

**Three guide modes:**
- **Native** — The wallet has built-in fee bumping. TxFix shows numbered steps to use it.
- **PSBT Import** — The wallet can import unsigned transactions. TxFix generates a free PSBT.
- **Unsupported** — The wallet can't perform this method. TxFix offers alternatives.

## Wallet Capability Matrix

| Wallet | RBF | CPFP | PSBT Import | Platform | FOSS |
|--------|-----|------|-------------|----------|------|
| **Sparrow Wallet** | native | native | file, qr, clipboard | Desktop | Yes |
| **Electrum** | native | native | file, qr, clipboard | Desktop, Android | Yes |
| **Bitkit** | native | none | — | Mobile | Yes |
| **Ashigaru** | native | native | — | Android | Yes |
| **BlueWallet** | native | none | file, qr | Mobile | Yes |
| **Bitcoin Core** | native | native (manual) | — | Desktop | Yes |
| **Wasabi Wallet** | native | native (auto) | — | Desktop | Yes |
| **Ledger Live** | native | none | — | Desktop, Mobile, HW | No |
| **Trezor Suite** | native | native (manual) | — | Desktop, HW | Yes |
| **Exodus** | native | native (auto) | — | Desktop, Mobile | No |
| **Muun** | none | none | — | Mobile | Yes |
| **Blockstream Green** | native | none | — | Desktop, Mobile | Yes |
| **Other / Not Listed** | psbt-import | psbt-import | file, qr, clipboard | All | — |

## Per-Wallet Details

### Sparrow Wallet (sparrowwallet.com)
The gold standard for Bitcoin power users. Full native support for both RBF and CPFP via right-click context menus. Complete PSBT support via File > Open Transaction (file, UR QR codes, base64/hex clipboard). Signals RBF by default. Supports BBQr/UR fountain QR codes for hardware wallet round-trips.

- **RBF**: Right-click tx > "Increase Fee (RBF)" > adjust fee slider > Create > Sign > Broadcast
- **CPFP**: UTXOs tab > right-click unconfirmed UTXO > "Send Selected" > set high fee > Send
- **PSBT**: File > Open Transaction > choose import method

### Electrum (electrum.org)
Lightweight desktop wallet since 2011. RBF always on since v4.4 (toggle removed). Both RBF and CPFP available via right-click context menus. Full PSBT support via Tools > Load transaction.

- **RBF**: History tab > right-click > "Increase Fee" > adjust or enter manual sat/vB > Sign > Broadcast
- **CPFP**: History tab > right-click > "Child pays for parent" > set fee > Sign > Broadcast
- **PSBT**: Tools > Load transaction > From file / From text / From QR code

### Bitkit (bitkit.to)
Mobile-only (iOS + Android) Bitcoin + Lightning wallet by Synonym. "Boost" button for RBF on sent transactions. No CPFP or PSBT support exposed to users.

- **RBF**: Tap pending tx > "Boost" button > choose fee level > confirm
- **CPFP**: Not supported
- **Caveat**: Only works for outgoing transactions sent from Bitkit

### Ashigaru (ashigaru.rs)
Privacy-focused Android wallet, fork of Samourai Wallet. Uses unified "Boost Transaction Fee" button for both RBF (sent) and CPFP (received). RBF must be pre-enabled in Settings > Transactions > "Spend using RBF". Auto-calculates fees.

- **RBF**: Tap pending tx > "Boost Transaction Fee" > confirm (auto-calculated fee)
- **CPFP**: Same UI — wallet auto-selects CPFP for incoming transactions
- **Caveat**: Requires v1.1.0+ for CPFP bug fix. Android-only, requires own Dojo node.

### BlueWallet (bluewallet.io)
Mobile Bitcoin + Lightning wallet (iOS, Android, macOS). "Bump Fee" button for RBF on bech32 wallets. CPFP not fully implemented for end users.

- **RBF**: Tap pending tx > "Bump Fee" > choose fee > "Create"
- **CPFP**: Not available
- **Caveat**: Only works with native SegWit (bech32) wallets

### Bitcoin Core (bitcoin.org)
The reference Bitcoin full node + wallet. RBF via right-click "Increase transaction fee". CPFP requires manual coin control.

- **RBF**: Transactions tab > right-click > "Increase transaction fee" > confirm
- **CPFP**: Enable coin control in Settings > select unconfirmed UTXO > send to self with high fee
- **Caveat**: CPFP requires technical knowledge of coin control

### Wasabi Wallet (wasabiwallet.io)
Privacy-focused desktop wallet with CoinJoin. "Speed Up Transaction" handles both RBF and CPFP automatically with intelligent fallback.

- **RBF/CPFP**: Right-click tx > "Speed Up Transaction" > confirm > enter passphrase
- **Caveat**: Not available for CoinJoin transactions or hardware wallet-connected wallets

### Ledger Live (ledger.com)
Hardware wallet companion app. "Boost" button for RBF on sent transactions. No built-in CPFP.

- **RBF**: Click pending tx > "Boost" > choose fee > confirm on Ledger device
- **CPFP**: Not supported (pair with Electrum/Sparrow for CPFP)
- **Caveat**: Requires Ledger device connected and Bitcoin app open

### Trezor Suite (trezor.io)
Hardware wallet companion app. "Bump fee" button for RBF. CPFP via manual coin control.

- **RBF**: Click pending tx > "Bump fee" > choose fee or use Advanced tab > confirm on Trezor
- **CPFP**: Send tab > Coin control > select unconfirmed UTXO > send to self with high fee
- **Caveat**: Requires Trezor device connected

### Exodus (exodus.com)
Multi-asset desktop + mobile wallet. "Accelerate" button auto-selects between RBF and CPFP.

- **RBF/CPFP**: Click pending tx > "Accelerate" > confirm
- **Caveat**: Requires additional BTC in wallet. Exodus picks the method automatically.

### Muun (muun.com)
Simple mobile Bitcoin + Lightning wallet. Does NOT support RBF or CPFP.

- **RBF**: Not supported
- **CPFP**: Not supported
- **Fallback**: Wait for confirmation, use accelerator, or export funds via Muun recovery tool

### Blockstream Green (blockstream.com/green)
Mobile + desktop wallet by Blockstream. "Increase Fee" for RBF. No built-in CPFP button.

- **RBF**: Tap pending tx > "Increase Fee" > set fee > confirm
- **CPFP**: Not supported (pair Jade with Sparrow for CPFP)

## Guide Resolution Logic

```
resolveGuide(wallet, method, verdict) → ResolvedGuide

1. If verdict says method unavailable (e.g., canCpfp=false) OR wallet.support="none"
   → approach: "unsupported"

2. If wallet.support="native"
   → approach: "native", steps = nativeSteps
   → Flag PSBT as alternative if wallet also has psbtImportMethods

3. If wallet.support="psbt-import"
   → approach: "psbt", steps = psbtSteps
```

## Adding a New Wallet

1. Add entry to `src/lib/wallets/data.ts` following the `WalletInfo` interface
2. Include `nativeSteps` for each supported method (RBF/CPFP)
3. Include `psbtSteps` and `psbtImportMethods` if PSBT import is supported
4. Set `autoFee: true` if the wallet auto-calculates boost fees (user can't set exact sat/vB)
5. Add relevant `keywords` for search filtering
6. Run `pnpm build` and `pnpm test` to verify
7. Test the guide flow in the browser

## Architecture

```
src/lib/wallets/
├── types.ts          # WalletInfo, WalletMethodGuide, ResolvedGuide, etc.
├── data.ts           # Static WALLETS array + getWalletById()
└── resolveGuide.ts   # Pure function: wallet + method + verdict → guide

src/components/
├── WalletSelector.tsx  # Grid picker with search, platform badges, FOSS badges
└── WalletGuide.tsx     # Three modes: native steps, PSBT flow, unsupported fallback
```
