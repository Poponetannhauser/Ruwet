# PLAN — Audit Fix
> Dibuat: 2026-08-13  
> Berdasarkan: Audit profesional post Milestone C  
> Scope: Semua temuan dari audit — Critical, High, Medium  
> Aturan commit tetap ikut rules.md (Conventional Commits, build harus hijau tiap commit)

---

## Konteks

Audit menemukan beberapa gap infrastruktur & kualitas kode yang tidak terdeteksi selama pengerjaan milestone fitur. Dokumen ini memecah setiap temuan menjadi task atomik yang bisa langsung dikerjakan, diurutkan dari dampak terbesar ke terkecil.

---

## Wave 1 — Quick Wins (< 1 jam total)

Task-task ini tidak ada dependensi satu sama lain. Bisa dikerjakan dalam satu sesi.

### W1-1 · Rename `package.json` name

**Masalah:** `name: "temp_app"` — placeholder belum diubah sejak scaffolding.  
**Fix:**
```json
{
  "name": "ruwet"
}
```
**Commit:** `chore: rename package name from temp_app to ruwet`

---

### W1-2 · Tambah `typecheck` script

**Masalah:** `rules.md` mensyaratkan `bun run typecheck` sebelum commit, tapi script tidak ada di `package.json`.  
**Fix:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit"
}
```
**Lalu jalankan:** `bun run typecheck` — fix semua type error yang muncul.  
**Commit:** `chore: add typecheck script to package.json`

---

### W1-3 · Security headers di `next.config.ts`

**Masalah:** `next.config.ts` kosong total. Tidak ada security headers sama sekali.  
**Fix:**
```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```
**Commit:** `chore: add security headers to next.config.ts`

---

### W1-4 · Klarifikasi `schema.sql` root

**Masalah:** `schema.sql` di root (12KB) dan `supabase/migrations/` keduanya ada — dua "sumber kebenaran" yang ambigu.  
**Fix:** Tambahkan komentar di baris pertama `schema.sql`:
```sql
-- REFERENCE ONLY — bukan yang diapply ke database.
-- Source of truth ada di supabase/migrations/ (timestamp-versioned).
-- File ini adalah snapshot awal dari skema, dipertahankan untuk referensi cepat.
-- Update jika ada migrasi besar, tapi apply SELALU lewat supabase/migrations/.
```
**Commit:** `docs(schema): clarify schema.sql is reference-only, migrations are source of truth`

---

## Wave 2 — CI/CD & Tooling (1–2 jam)

### W2-1 · GitHub Actions CI Pipeline

**Masalah:** Tidak ada `.github/workflows/`. Build broken bisa masuk ke `main`.  
**Buat file:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  check:
    name: Lint · Typecheck · Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Lint
        run: bun run lint

      - name: Typecheck
        run: bun run typecheck

      - name: Build
        run: bun run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

> [!IMPORTANT]
> Tambahkan secrets `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di GitHub repo Settings → Secrets and variables → Actions. Tanpa ini, `bun run build` akan gagal di CI karena env vars tidak tersedia.

**Commit:** `chore(ci): add GitHub Actions CI pipeline with lint, typecheck, and build`

---

### W2-2 · Tambah npm utility scripts

**Masalah:** Hanya ada `deploy-telegram-webhook.sh`. Tidak ada script standar untuk operasi DB lokal.  
**Fix** (tambah ke `package.json`):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "db:start": "supabase start",
  "db:stop": "supabase stop",
  "db:reset": "supabase db reset",
  "db:migrate": "supabase db push",
  "db:types": "supabase gen types typescript --local > src/lib/supabase/types.gen.ts",
  "functions:serve": "supabase functions serve",
  "functions:deploy": "supabase functions deploy"
}
```
**Commit:** `chore: add db and functions utility scripts to package.json`

---

### W2-3 · Tingkatkan ESLint config

**Masalah:** `eslint.config.mjs` hanya pakai `eslint-config-next` default. Tidak ada guard untuk `console.log`, `any`, dll.  
**Tambah rules ke `eslint.config.mjs`:**
```js
// Di dalam rules object, tambahkan:
"no-console": ["warn", { allow: ["warn", "error"] }],
"@typescript-eslint/no-explicit-any": "warn",
"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
```
**Lalu jalankan:** `bun run lint` — fix semua warning yang muncul.  
**Commit:** `chore(lint): add no-console, no-explicit-any, no-unused-vars rules`

---

## Wave 3 — Environment Validation (1 jam)

### W3-1 · Env validation dengan `@t3-oss/env-nextjs`

**Masalah:** App silently fail jika env var kritikal tidak ada. Tidak ada validation saat startup.

**Install:**
```bash
bun add @t3-oss/env-nextjs zod
```

**Buat file `src/lib/env.ts`:**
```ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
    TELEGRAM_SECRET_TOKEN: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_SECRET_TOKEN: process.env.TELEGRAM_SECRET_TOKEN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
```

**Import di `next.config.ts`:**
```ts
import "./src/lib/env"; // validate on startup
```

**Update `.env.example`** untuk pastikan semua variable terdokumentasi.

**Commit:** `feat: add env validation with @t3-oss/env-nextjs and zod`

---

## Wave 4 — Rate Limiting (2–4 jam) 🔒

### W4-1 · Migrate rate limiting ke Upstash Redis

**Masalah:** [`src/lib/rateLimit.ts`](file:///home/paundraexe/Project/Ruwet/src/lib/rateLimit.ts) pakai in-memory store. Di Vercel serverless, setiap cold start reset state — rate limit tidak efektif sama sekali.

**Pilihan solusi (pilih salah satu):**

**Opsi A — Upstash Redis (recommended untuk Vercel):**
```bash
bun add @upstash/ratelimit @upstash/redis
```
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});
```
Tambah `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` ke `.env.example` dan env validation.

**Opsi B — Supabase table-based rate limiting (zero infrastructure tambahan):**
Buat tabel `rate_limits` di Supabase, query per request. Lebih lambat tapi tidak butuh service baru.

> [!CAUTION]
> Task ini menyentuh security-critical path. Wajib manual review checklist (rules.md §0.2 🔒) sebelum merge:
> - [ ] Cold start tidak bisa bypass limit
> - [ ] Limit state persist antar invocation
> - [ ] Error dari Redis/DB tidak crash app (fallback graceful)
> - [ ] Limit key menggunakan user_id atau IP, bukan session yang bisa di-spoof

**Commit:** `feat: migrate rate limiting from in-memory to persistent store`

---

## Wave 5 — Testing Foundation (3–5 jam)

### W5-1 · Setup test runner

**Install:**
```bash
bun add -d vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Buat `vitest.config.ts`:**
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
```

**Tambah ke `package.json`:**
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Commit:** `chore(test): setup vitest with jsdom and testing-library`

---

### W5-2 · Unit test untuk fungsi kritikal

**Prioritas test berdasarkan risk:**

1. **`checkRateLimit()`** — logic paling kritikal, seluruh flow task protection bergantung padanya
2. **`handleTaskCommand()`** — Telegram command parsing, banyak edge case
3. **`escapeHtml()`** — security function (XSS prevention), 8 edges
4. **`sendTelegramMessage()`** — perlu mock Telegram API
5. **Auth actions** (`login`, `signup`) — perlu mock Supabase client

**Struktur test:**
```
src/
  test/
    setup.ts
    lib/
      rateLimit.test.ts
    supabase/
      functions/
        telegram-webhook.test.ts
```

**Commit per test file:** `test(<scope>): add unit tests for <function>`

---

## Wave 6 — Docker & Reproducible Environment (2–3 jam)

### W6-1 · Dockerfile untuk production

**Tambah `output: 'standalone'` ke `next.config.ts` dulu** (wajib untuk Docker image yang efisien).

**Buat `Dockerfile`:**
```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

**Commit:** `chore: add Dockerfile with multi-stage build using Bun`

---

### W6-2 · `docker-compose.yml` untuk local dev

```yaml
version: "3.9"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - supabase

  # Untuk development, gunakan Supabase CLI local
  # Jalankan: bun run db:start terlebih dahulu
```

> [!NOTE]
> Supabase local emulator dijalankan via `supabase start` (Supabase CLI), bukan Docker Compose langsung, karena Supabase CLI sudah handle orchestrasi internal-nya. `docker-compose.yml` di sini scope-nya hanya untuk Next.js app.

**Tambah `.dockerignore`:**
```
node_modules
.next
.git
.env*
!.env.example
```

**Commit:** `chore: add docker-compose.yml and .dockerignore`

---

## Checklist Status

| Wave | Task | Status |
|------|------|--------|
| W1 | Rename `package.json` name | ☐ |
| W1 | Tambah `typecheck` script | ☐ |
| W1 | Security headers `next.config.ts` | ☐ |
| W1 | Klarifikasi `schema.sql` | ☐ |
| W2 | GitHub Actions CI | ☐ |
| W2 | Utility scripts (`db:*`, `functions:*`) | ☐ |
| W2 | ESLint rules tambahan | ☐ |
| W3 | Env validation `@t3-oss/env-nextjs` | ☐ |
| W4 | Rate limiting persistent (Upstash/Supabase) 🔒 | ☐ |
| W5 | Setup vitest | ☐ |
| W5 | Unit tests kritikal | ☐ |
| W6 | Dockerfile | ☐ |
| W6 | docker-compose + .dockerignore | ☐ |

---

## Urutan Pengerjaan yang Disarankan

```
Wave 1 (quick wins, satu sesi)
  ↓
Wave 2 (CI/CD — paling value karena protect semua perubahan berikutnya)
  ↓
Wave 3 (env validation — blocker untuk Wave 4)
  ↓
Wave 4 (rate limit fix — security, kerjakan saat ada waktu fokus)
  ↓
Wave 5 (testing — foundational, kerjakan iteratif)
  ↓
Wave 6 (Docker — nice to have, kerjakan terakhir)
```

> [!TIP]
> Wave 1 + Wave 2 saja sudah menutup semua temuan Critical dan High. Wave 3–6 adalah Medium/polish yang meningkatkan production-readiness secara signifikan.
