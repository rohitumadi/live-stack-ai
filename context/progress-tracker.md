# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Implementation

## Current Goal

- Prepare the next focused canvas feature unit

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
- Editor `/editor` home screen: heading, description, and **New Project** with Plus icon (minimal layout, no cards).
- Project dialogs (mock-only): Create (name + live slug preview), Rename (prefilled name, current name in description, autofocus, Enter submits), Delete (destructive confirm, no input).
- `useProjectDialogs` hook (`hooks/use-project-dialogs.ts`): dialog state, form fields, and loading simulation; wired from editor home and sidebar (New Project, rename, delete).
- Sidebar: rename/delete actions only on owned projects; hidden on shared/collaborator rows; backdrop closes sidebar on outside tap with stronger scrim and backdrop blur on narrow viewports (`components/editor/project-sidebar.tsx`).
- Prisma: added `Project` + `ProjectCollaborator` models (`prisma/models/project.prisma`) with status enum, relations, unique constraint, and indexes; added cached Prisma singleton (`lib/prisma.ts`) with `prisma+postgres://` Accelerate branching vs direct `@prisma/adapter-pg`; created and applied initial migration and generated Prisma client.
- Project APIs (backend-only): added authenticated REST routes for projects — `GET /api/projects` (list owner projects), `POST /api/projects` (create w/ default `Untitled Project`), `PATCH /api/projects/[projectId]` (owner-only rename), `DELETE /api/projects/[projectId]` (owner-only delete) with correct `401`/`403` responses; `npm run build` passes.
- **Wired editor home to real project API**:
  - Created `lib/project-data.ts` helper to fetch owned/shared projects server-side
  - Created `types/project.ts` with `Project` and `ProjectWithRole` types
  - Converted `app/editor/page.tsx` to server component that fetches real data and passes to `EditorHome`
  - Created `components/editor/editor-home.tsx` client component that manages sidebar and dialog state
  - Updated `useProjectDialogs` hook to accept initial projects and call real API endpoints (`POST`, `PATCH`, `DELETE`)
  - Hook implements: create dialog → POST /api/projects → navigate to workspace; rename dialog → PATCH /api/projects/[id] → refresh; delete dialog → DELETE /api/projects/[id] → refresh/redirect
  - Updated `components/editor/project-sidebar.tsx` to use real `ProjectWithRole` data; projects are now links to `/editor/[projectId]`
  - Updated `components/editor/project-dialogs.tsx` to display error messages and use real project types
  - Created `app/editor/[projectId]/page.tsx` workspace page (placeholder for editor canvas)
  - Sidebar uses real project data, create navigates to workspace, rename/delete update correctly via API
  - Build passes with no errors
- **Built `/editor/[roomId]` workspace shell**:
  - Added `lib/project-access.ts` for Clerk identity lookup and owner/collaborator project access checks
  - Added `components/editor/access-denied.tsx` for missing or unauthorized projects
  - Replaced the placeholder workspace with a server-rendered access gate and client workspace shell
  - Workspace navbar shows the current project name with share and AI sidebar controls
  - Sidebar highlights the current room and the central canvas/right AI sidebar render placeholders only
  - `npm run build` passes
- **Implemented share dialog and collaborator management**:
  - Added `components/editor/share-dialog.tsx` and wired desktop/mobile Share buttons in the workspace shell
  - Owners can invite collaborators by email, view enriched collaborators, remove collaborators, and copy the project link with `Copied!` feedback
  - Collaborators can open the dialog and view the collaborator list without invite/remove controls
  - Added collaborator API routes: `GET`/`POST /api/projects/[projectId]/collaborators` and `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]`
  - Invite/remove actions enforce owner-only access server-side; list access is allowed for owners and project collaborators
  - Added Clerk Backend API enrichment for collaborator display names and avatar images with email-only fallback
  - Shared-project lookups normalize Clerk primary emails to match email-based collaborator records
  - `npm run build` passes
- **Set up Liveblocks collaboration infrastructure**:
  - Updated `liveblocks.config.ts` with typed presence (`cursor`, `isThinking`) and user metadata (`name`, `displayName`, optional avatar URLs, `color`, `cursorColor`)
  - Added cached Liveblocks Node client and deterministic cursor color helper in `lib/liveblocks.ts`
  - Added `POST /api/liveblocks-auth` to require Clerk auth, parse the requested project room, verify project access, ensure the Liveblocks room exists, and issue a room-scoped session token
  - Added the missing `@liveblocks/node` dependency required by the Liveblocks server SDK
  - `npm run build` passes
- **Replaced the workspace canvas placeholder with the base collaborative canvas**:
  - Kept `app/editor/[roomId]/page.tsx` server-rendered and mounted a focused client canvas inside the existing workspace shell
  - Added `components/editor/base-canvas.tsx` with `LiveblocksProvider`, `RoomProvider`, `ClientSideSuspense`, initial presence, and a connection error fallback
  - Wired `@liveblocks/react-flow` `useLiveblocksFlow` to React Flow with suspense, empty initial nodes/edges, synced change handlers, loose connections, `fitView`, `MiniMap`, cursors, and dot-pattern background
  - Added shared canvas contracts in `types/canvas.ts` for node data (`label`, `color`, `shape`) plus `canvasNode` and `canvasEdge` types
  - Imported React Flow and Liveblocks canvas styles through `app/globals.css`
  - `npm run build` passes
- **Added the bottom shape panel for canvas node creation**:
  - Added shared drag payload and node size types in `types/canvas.ts`
  - Added a bottom-center floating shape toolbar with draggable Lucide icon buttons for rectangle, diamond, circle, pill, cylinder, and hexagon
  - Added shape drag payloads with default sizes and drop handling that converts screen coordinates to React Flow canvas coordinates
  - Created new collaborative `canvasNode` nodes through Liveblocks-backed React Flow node changes using empty labels, the default node color, dragged shape data, and IDs built from shape, timestamp, and counter
  - Added a basic custom canvas node renderer that displays every shape as a bordered rectangle with centered label text
  - `npm run build` passes
- **Added resizing and inline label editing to canvas nodes**:
  - Added minimum size constants (`MIN_NODE_SIZE`) to prevent nodes from being resized below 60×40 px
  - Enhanced `CanvasNodeRenderer` with `useState` for edit mode and label tracking
  - Selected nodes use React Flow `NodeResizer` controls so corner and edge resizing updates dimensions and top/left position correctly
  - Double-click on any node's label area to enter inline edit mode
  - Textarea appears over the label with placeholder text when empty, updates label as users type
  - Label editing closes on blur or `Escape` key; `Ctrl+Enter` also commits changes
  - Stopped pointer events on textarea to prevent canvas drag/pan during text editing
  - Label edits now update only `node.data.label` through React Flow so nodes keep their existing position and size after editing
  - All node updates (label, dimensions, and resize position adjustments) sync through collaborative canvas state
  - `npm run build` passes
- **Fixed current canvas editing issues**:
  - Replaced the earlier label save path that rewrote whole nodes with incomplete position/dimension data
  - Removed the custom resize listener implementation in favor of React Flow's production resize controls
  - `npm run build` passes

## Next Up

- Add the next canvas feature unit from the subsequent spec chapter

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
- **Wired editor home to real project API**: refactored mock data to real server-side data fetching, created `lib/project-data.ts` helper, updated hook to make real API calls (POST/PATCH/DELETE), created workspace page `/editor/[projectId]`, updated sidebar to use real projects with links to workspace, dialogs now show errors from API
- Built `/editor/[roomId]` as a guarded server component with workspace chrome only; no canvas, Liveblocks, AI chat, or sharing behavior added.
- Built the share dialog feature from `context/feture-specs/09-share-dialog.md`; collaborator membership remains email-based in Prisma and Clerk is used only for profile enrichment.
- Built the Liveblocks setup feature from `context/feture-specs/10-liveblocks-setup.md`; the auth endpoint uses project IDs as room IDs and grants access-token permissions only after Clerk plus project membership checks.
- Built the base canvas feature from `context/feture-specs/11-base-canvas.md`; first build attempt was blocked by sandboxed Google font fetching, then `npm run build` passed with network access.
- Built the shape panel feature from `context/feture-specs/12-shape-panel.md`; first build attempt was blocked by sandboxed Google font fetching, then `npm run build` passed with network access.
