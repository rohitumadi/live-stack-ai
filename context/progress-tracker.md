# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Implementation

## Current Goal

- Implement Clerk Authentication (spec: `03-auth.md`)

## Completed

- Initialized shadcn UI and added core components (button, tabs, input, textarea, select, badge, card, alert, tooltip, popover, dropdown‑menu, dialog, drawer, progress, skeleton, avatar, scroll‑area)
- Created `lib/utils.ts` with `cn` helper for Tailwind class merging
- Added `tailwind.config.ts` with dark‑mode support and custom color mappings to UI‑context variables
- Updated `app/globals.css` with CSS custom properties for the dark theme and set the `dark` class as default
- Design system and UI primitives complete
- Built editor chrome: top navbar and left project sidebar shell (`components/editor/editor-navbar.tsx`, `components/editor/project-sidebar.tsx`)
- Configured dialog pattern for future use
- Implemented Authentication with Clerk: wrap root layout with ClerkProvider, installed custom styled sign-in and sign-up pages using `@efferd/auth-5` using CSS variables
- Added root `proxy.ts` (`clerkMiddleware`, Next.js 16 proxy convention) to protect routes by default; sign-in, sign-up, and `/sso-callback` are public so OAuth can complete before `auth.protect()` runs
- Placed Clerk `UserButton` within the editor navbar.
- Root page `/` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`.

## Next Up

- Build the actual editor canvas area (subsequent spec chapter)
- Wire the New Project button to open a New Project dialog

## Open Questions

- Toast component is deprecated; consider using an alternative such as `sonner` for notifications

## Architecture Decisions

- Adopted shadcn UI as the component library per project guidelines; all components live under `components/ui/`
- Chose CSS custom properties for theming to align with the UI‑context specification
- Editor-specific components live under `components/editor/` separated from generic UI primitives
- Sidebar floats above canvas (overlay pattern) so it never shifts page layout

## Session Notes

- Updated `components/auth-page.tsx` for `@clerk/nextjs` v7: email OTP uses `SignInFuture` / `SignUpFuture` (`emailCode`, `verifications`, `finalize`); OAuth uses `clerk.client.signIn.authenticateWithRedirect` with callback `/sso-callback` and post-login `/editor`; readiness uses `fetchStatus === 'idle'` plus `clerk.loaded`.
- Added required dependencies (`shadcn`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`)
- Ensured the build passes with the new Tailwind configuration
- Created `components/editor/` directory with `editor-navbar.tsx` and `project-sidebar.tsx`
- Switched primary font to Roboto Slab and updated `context/ui-context.md` and `globals.css` accordingly
- Cleaned up unused Geist font references
