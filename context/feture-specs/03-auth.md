Clerk is already installed and connected. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Use Clerk’s `dark` theme from `@clerk/ui/themes` as the base.

Override Clerk appearance variables using the app’s existing CSS variables. Do not hardcode colors.

### Sign-in and sign-up pages:

Install the @efferd/auth-5 block into this project.

Steps:

1. Install the shadcn skill if missing: npx skills add shadcn/ui
2. Ensure this is a shadcn project (has components.json). If not, run: npx shadcn@latest init
3. Add the @efferd registry to components.json (if missing):
   {
   "registries": {
   "@efferd": "https://efferd.com/r/{style}/{name}.json"
   }
   }
4. Run: npx shadcn@latest add @efferd/auth-5

## Implementation

Wrap the root layout with `ClerkProvider` using Clerk’s `dark` theme.

Create sign-in and sign-up pages using Clerk components.

Use `proxy.ts` at the project root, not `middleware.ts`.

Define public routes using the existing sign-in and sign-up env vars. Protect everything else by default.

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `/sign-in`

Add Clerk’s built-in `UserButton` to the editor navbar right section for profile settings and logout.

Keep Clerk’s default user menu and profile flows intact. Do not rebuild or heavily customize Clerk internals.

Use existing Clerk env vars. Do not rename or invent new ones.

## Dependencies

install: @clerk/ui.

## Check When Done

- `proxy.ts` exists at the root
- all routes are protected except public auth paths
- auth pages use CSS variables with no hardcoded colors
- `ClerkProvider` wraps the root layout
- `npm run build` passes
