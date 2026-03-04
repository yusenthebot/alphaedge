# Design — Cycle 1 [20:30:14]

## Task 1: Signal strength animated pixel progress bars
File: `src/frontend/src/app/dashboard/page.tsx`
Change: In `SignalCard` (~line 250), replace the `<StrengthRing>` Recharts radial chart with `<SignalStrengthBar value={s.signal_strength} signal={s.signal} />` (already exported from `PixelProgress.tsx`). Add `animate` prop to `SignalStrengthBar` for a filled-block pulse. Remove the `StrengthRing` component (lines 116-141) and the `recharts` RadialBarChart import it uses.
Why: The radial chart breaks the pixel aesthetic — segmented block bars are on-brand and lighter weight.

## Task 2: Keyboard shortcuts overlay (? key)
File: `src/frontend/src/components/KeyboardShortcuts.tsx` (new) + wire in `src/frontend/src/app/dashboard/page.tsx`
Change: Create a `<KeyboardShortcuts />` modal (pixel-bordered overlay, `bg-[var(--pixel-surface)]`, `border-2 border-[var(--pixel-border)]`) listing Cmd+K → Search, ? → Help, F → Filter, S → Sort. Toggle via `useEffect` keydown listener for `?`. In `dashboard/page.tsx`, add `<KeyboardShortcuts />` and a `[?]` hint badge in the header.
Why: Power users have no discoverability for existing shortcuts like Cmd+K; a CRT-styled overlay fixes that.