@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — start the Expo dev server (Metro). Use `npm run android` / `npm run ios` / `npm run web` to launch on a specific target.
- `npm run lint` — run `expo lint` (ESLint flat config, `eslint-config-expo`). `dist/*` is ignored.
- `npm run reset-project` — moves the current `app/` into `app-example/` and creates a blank `app/`. Destructive; only run when the user explicitly asks.
- No test runner is configured.

Requires a native dev client build (this project uses `expo-dev-client` and `newArchEnabled`); Expo Go will not load it.

## Required environment variables

Read from `process.env` at module load (throws/crashes if missing):

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk auth (`app/_layout.tsx`).
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` — Supabase client (`lib/supabase.ts`).

## Architecture

Real-estate app ("Kribb") built on Expo Router (file-based routing) with **Clerk for auth** and **Supabase for data**. The two are bridged so RLS policies can read the Clerk user.

**Auth + data bridge (`lib/supabase.ts` + `hooks/useSupabase.ts`).** There are two Supabase clients:
- `supabase` — anon client, used before sign-in.
- `createClearkSupabaseClient(getToken)` — client whose `accessToken()` returns the Clerk JWT, so Supabase RLS policies can identify the user via `auth.jwt()`.

Components must call `useSupabase()` (not import `supabase` directly) to get the correct client based on auth state. The hook memoizes and swaps clients when `isSignedIn` flips.

**Routing (`app/`).** Uses Expo Router with `typedRoutes` and `reactCompiler` experiments enabled.
- `app/_layout.tsx` wraps everything in `ClerkProvider` + an `AuthGate` that redirects unsigned users to `/sign-in` and signed-in users off auth screens. When signed in, `AuthenticatedApp` runs `useUserSync()` once.
- `app/(auth)/` — sign-in / sign-up screens.
- `app/(root)/(tabs)/` — main tab screens. The `create` tab is admin-only (see below).
- `app/(root)/property/[id].tsx` and `property/map.tsx` — property detail + map view.

**Platform-split tabs (`app/(root)/(tabs)/_layout.tsx`).** iOS uses `NativeTabs` (SF Symbols, native tab bar); Android uses classic `Tabs` with Ionicons. Both read `useUserStore().isAdmin` to conditionally show the `create` tab — keep the two branches in sync when adding/removing tabs.

**User sync (`hooks/useUserSync.ts`).** On sign-in, upserts the Clerk user into Supabase `users` table (`clerk_id`, `email`, `first_name`, `last_name`, `avatar_url`) and hydrates `useUserStore.isAdmin` from the `is_admin` column. `PGRST116` (no rows) is treated as "not found, create". This drives admin-gated UI everywhere.

**State (Zustand, `store/`).**
- `userStore` — global `isAdmin` flag, set by `useUserSync`.
- `filtrerStore` — search/filter state (type, bedrooms, price range) shared between the search screen and `FilterModal`. Note the file/exported name is `filtrer` (typo, but consistent — don't rename without updating imports).

**Supabase tables in use.** `users` (clerk_id, is_admin, profile fields), `saved_properties` (user_clerk_id + property_id, toggled via `hooks/useSavedProperty.ts`), and a properties table matching `types/index.ts:Property`.

## Styling

NativeWind v4 + Tailwind. `global.css` is imported once in `app/_layout.tsx`. Tailwind scans `./app` and `./components` only — new top-level dirs with JSX need to be added to `tailwind.config.js` `content`. Custom theme: `primary` `#0E4D92`, `accent` `#F59E0B`, `card` `#1A1A2E`; font families `sans`/`medium`/`bold` map to Rubik weights.

## Path aliases

`@/*` → repo root (see `tsconfig.json`). Prefer `@/hooks/...`, `@/store/...`, `@/lib/...`, `@/components/...` over relative paths.
