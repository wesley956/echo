# Task 7-a — Profile + Goals + Emergency

## Files Created
- `/home/z/my-project/src/components/echo/screens/profile-screen.tsx`
- `/home/z/my-project/src/components/echo/screens/goals-screen.tsx`
- `/home/z/my-project/src/components/echo/screens/emergency-screen.tsx`

## API Contract
- All 3 screens: `'use client'`, named + default export, NO props (read from `useEcho` store).
- EmergencyScreen is a full-screen overlay (`fixed inset-0 z-50 echo-ink-bg`) controlled by `overlay === 'emergency'` in store. ProfileScreen/GoalsScreen render inside the SPA tab container.

## State Reads
- ProfileScreen: profile, strengths, challenges, conversations, diary, setOverlay
- GoalsScreen: profile, goals, patterns, challenges, strengths, addGoal, updateGoal, deleteGoal
- EmergencyScreen: profile, setProfile, setOverlay

## External Calls
- GoalsScreen → POST `/api/echo/goals-suggest` with `{userName, patterns, challenges, strengths}` → `{goals:[{title,description,targetDate}]}`

## Design Decisions
- Radar values: Saúde/Autoestima from real diary (avg sleep+energy *10, avg mood *20); other dims from stable per-name hash.
- Strength values: 60–95% via hash of name.
- Challenge frequency: hash-derived label (frequente/às vezes/raro).
- tel: links via `window.location.href` (EchoButton has no asChild).
- Lint: clean.

## Next Agent Notes
- page.tsx should: render ProfileScreen when `tab === 'profile'`; render EmergencyScreen when `overlay === 'emergency'`; add a way to open GoalsScreen (probably as overlay `goals` or a tab) — the GoalsScreen is ready to be embedded either way (it has its own scroll container with pb-28).
