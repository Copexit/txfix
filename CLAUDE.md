# CLAUDE.md - Project Instructions for AI Assistants

## Build & Test

- **Package manager:** pnpm (do not use npm or yarn)
- **Dev server:** `pnpm dev`
- **Build (static export):** `pnpm build`
- **Run all tests:** `pnpm test`
- **Run single test file:** `pnpm vitest run src/path/to/file.test.ts`

## Code Style Rules

### No em dashes

Never use em dashes in any form:
- No literal `—` (U+2014) characters
- No `\u2014` unicode escapes
- No `&mdash;` HTML entities

Use a regular hyphen with spaces instead: ` - `

This applies to all strings, comments, UI text, metadata, test descriptions, and documentation within `src/`.

### General

- TypeScript strict mode, no `any` types
- Tailwind CSS 4 for styling (use semantic tokens like `bg-surface-inset` over hardcoded hex values)
- Use `motion/react` (not `framer-motion`) for animations
- Next.js 16 with static export (`output: "export"`)
- All Bitcoin amounts in satoshis (never BTC floats in logic)
