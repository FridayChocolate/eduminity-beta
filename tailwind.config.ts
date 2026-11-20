import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neon: {
          teal: "hsl(var(--neon-teal))",
          violet: "hsl(var(--neon-violet))",
          blue: "hsl(var(--neon-blue))",
          magenta: "hsl(var(--neon-magenta))",
        },
        student: {
          primary: "hsl(var(--student-primary))",
          secondary: "hsl(var(--student-secondary))",
          accent: "hsl(var(--student-accent))",
          bg: "hsl(var(--student-bg))",
          card: "hsl(var(--student-card))",
          border: "hsl(var(--student-border))",
          hover: "hsl(var(--student-hover))",
          sidebar: "hsl(var(--student-sidebar))",
          muted: "hsl(var(--student-muted))",
          glow: "hsl(var(--student-glow))",
        },
        creator: {
          primary: "hsl(var(--creator-primary))",
          secondary: "hsl(var(--creator-secondary))",
          tertiary: "hsl(var(--creator-tertiary))",
          cyan: "hsl(var(--creator-cyan))",
          magenta: "hsl(var(--creator-magenta))",
          violet: "hsl(var(--creator-violet))",
          green: "hsl(var(--creator-green))",
          bg: "hsl(var(--creator-bg))",
          border: "hsl(var(--creator-border))",
          sidebar: "hsl(var(--creator-sidebar))",
          hover: "hsl(var(--creator-hover))",
          card: "hsl(var(--creator-card))",
          glow: "hsl(var(--creator-glow))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-student': 'var(--gradient-student)',
        'gradient-creator': 'var(--gradient-creator)',
      },
      boxShadow: {
        'glow-teal': '0 0 20px hsl(var(--neon-teal) / 0.5)',
        'glow-violet': '0 0 20px hsl(var(--neon-violet) / 0.5)',
        'glow-blue': '0 0 20px hsl(var(--neon-blue) / 0.5)',
        'glow-magenta': '0 0 20px hsl(var(--neon-magenta) / 0.5)',
        'glow-student': '0 0 25px hsl(var(--student-glow) / 0.4)',
        'glow-creator': '0 0 30px hsl(var(--creator-glow) / 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--neon-teal) / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--neon-teal) / 0.6)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "shooting-star": {
          "0%": { transform: "translateX(-100%) translateY(0) rotate(-45deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateX(200%) translateY(100%) rotate(-45deg)", opacity: "0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "card-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" },
        },
        "mode-transition": {
          "0%": { opacity: "0", transform: "scale(1.1)" },
          "50%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "press": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "check-mark": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "50%": { transform: "scale(1)", opacity: "0.4" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "page-enter": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "page-exit": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "shooting-star": "shooting-star 3s ease-in-out infinite",
        "spin-slow": "spin-slow 10s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "mode-transition": "mode-transition 0.8s ease-in-out forwards",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "press": "press 0.15s ease-out",
        "shake": "shake 0.4s ease-in-out",
        "check-mark": "check-mark 0.3s ease-out forwards",
        "count-up": "count-up 0.4s ease-out forwards",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        "float": "float 3s ease-in-out infinite",
        "page-enter": "page-enter 0.3s ease-out forwards",
        "page-exit": "page-exit 0.2s ease-in forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
