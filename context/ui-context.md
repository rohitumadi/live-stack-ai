# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role                 | CSS Variable         | OKLCH Value                  |
| -------------------- | -------------------- | ---------------------------- |
| Page background      | `--background`       | `oklch(0.145 0 0)`           |
| Foreground text      | `--foreground`       | `oklch(0.985 0 0)`           |
| Card background      | `--card`             | `oklch(0.205 0 0)`           |
| Card text            | `--card-foreground`  | `oklch(0.985 0 0)`           |
| Primary accent       | `--primary`          | `oklch(0.47 0.157 37.304)`   |
| Secondary background | `--secondary`        | `oklch(0.274 0.006 286.033)` |
| Muted background     | `--muted`            | `oklch(0.269 0 0)`           |
| Border               | `--border`           | `oklch(1 0 0 / 10%)`         |
| Muted text           | `--muted-foreground` | `oklch(0.708 0 0)`           |
| Accent background    | `--accent`           | `oklch(0.269 0 0)`           |
| Destructive          | `--destructive`      | `oklch(0.704 0.191 22.216)`  |

Tailwind utility names map to these variables. Use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-accent`, etc.

## Typography

| Role      | Font        | CSS Variable         |
| --------- | ----------- | -------------------- |
| UI text   | Roboto Slab | `--font-roboto-slab` |
| Code/mono | System Mono | `ui-monospace`       |

The primary font is loaded via `next/font/google` and applied as a CSS variable on the `<html>` element. Both `--font-sans` and `--font-heading` are mapped to Roboto Slab in `globals.css`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Canvas

### Node Color Palette

8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Smooth-step path with an arrow marker. Default edge color: `#f8fafc`. Stroke width is thin — edges are visually secondary to nodes.

### Node Shapes

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage
- `hexagon` — external system / boundary

### Connection Handles

Small white circular handles, hidden by default, revealed on node hover. Appear at all four sides of a node.

### Canvas Background

React Flow `<Background>` component. Canvas sits on the base background color.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor workspace: full-viewport layout — floating sidebar overlay on the left, center canvas, slide-over AI sidebar on the right.
- Sidebars: floating overlay with dark semi-transparent background and subtle border.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.
- Navbar: top bar with dark background and bottom border.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.
