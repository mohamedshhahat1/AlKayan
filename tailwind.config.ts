import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * The intentionally dark bands.
         *
         * These are fixed charcoals rather than tokens, which is deliberate:
         * under the light/dark section rhythm the footer and the CTA band stay
         * dark in both themes. Wiring them to --surface would make them flip to
         * warm beige in light mode and destroy the rhythm.
         *
         * The `navy` key name is historical and kept so the section layer does
         * not need a markup rewrite in the same commit as a palette change.
         */
        navy: {
          DEFAULT: "#111111",
          light: "#202020",
          lighter: "#242424",
          deep: "#111111",
          deepest: "#171717",
        },

        /**
         * Gold, resolved through tokens.
         *
         * This is what keeps the palette accessible across themes: text-gold is
         * #C9A15A on charcoal, and the same class resolves to #A77A32 in light
         * mode, because #C9A15A on #F3F0E8 sits near 2.6:1 and fails.
         */
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-hover))",
          dark: "hsl(var(--gold-active))",
          border: "hsl(var(--border-gold))",
          ink: "hsl(var(--on-gold))",
        },
        "on-gold": "hsl(var(--on-gold))",

        /* Charcoal / warm-beige surface hierarchy. */
        surface: "hsl(var(--surface))",
        elevated: "hsl(var(--elevated))",

        /* Four text weights: primary, secondary, muted, disabled. */
        ink: {
          DEFAULT: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          disabled: "hsl(var(--text-disabled))",
        },

        /* Three border weights. Hairlines do the structural work here. */
        line: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
          gold: "hsl(var(--border-gold))",
        },

        stone: "hsl(var(--stone))",

        /* Status only. Deliberately desaturated so they never read as brand. */
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",

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
          hover: "hsl(var(--card-hover))",
        },
      },

      fontFamily: {
        /* Body: Tajawal, kept for reading. */
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        /* Display: Cairo, for headings only. Falls back to the body face so a
           font failure degrades instead of dropping to a system serif. */
        display: ["var(--font-cairo)", "var(--font-tajawal)", "sans-serif"],
      },

      /* Fluid display steps. Arabic needs a looser line-height than Latin at
         these sizes; descenders and marks collide below ~1.15. */
      fontSize: {
        "display-xl": ["clamp(2.75rem, 7vw, 5.5rem)", { lineHeight: "1.12", fontWeight: "800" }],
        "display-lg": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.18", fontWeight: "700" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.5rem)", { lineHeight: "1.25", fontWeight: "700" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.22em", fontWeight: "600" }],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* Restrained elevation. Depth comes from surface steps, not shadow. */
      boxShadow: {
        card: "0 1px 2px hsl(0 0% 0% / 0.28)",
        elevated: "0 18px 40px -22px hsl(0 0% 0% / 0.55)",
      },

      /* Named curves so motion stays one language across the site. */
      transitionTimingFunction: {
        arch: "cubic-bezier(0.22, 1, 0.36, 1)",
        calm: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      /*
       * A real duration scale. duration-[250ms] as an arbitrary value collides
       * with the animation-duration utility that tailwindcss-animate registers,
       * so Tailwind reports it ambiguous and emits nothing — the class silently
       * did nothing. duration-250 is unambiguous.
       */
      transitionDuration: {
        250: "250ms",
        400: "400ms",
        600: "600ms",
        900: "900ms",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
        /* Gold rule drawing itself in, from the leading edge. RTL-aware via
           transform-origin set on the element. */
        "line-expand": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "line-expand": "line-expand 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
