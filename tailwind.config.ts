import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // UI Context custom colors
        "bg-base": "var(--bg-base)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-subtle": "var(--bg-subtle)",
        "border-default": "var(--border-default)",
        "border-subtle": "var(--border-subtle)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        "accent-primary": "var(--accent-primary)",
        "accent-primary-dim": "var(--accent-primary-dim)",
        "accent-ai": "var(--accent-ai)",
        "accent-ai-text": "var(--accent-ai-text)",
        "state-error": "var(--state-error)",
        "state-success": "var(--state-success)",
        "state-warning": "var(--state-warning)",
      },
    },
  },

} satisfies Config;
