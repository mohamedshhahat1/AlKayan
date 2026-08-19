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
         * Brand palette. These used to live only in :root as CSS variables,
         * which meant Tailwind could not generate variants or opacity
         * modifiers for them and components resorted to inline hex values.
         *
         * The dark scale is neutral black — no hue at all. The steps are
         * spaced the way the old navy scale was, so every surface keeps the
         * same relative depth and every text/background pair keeps the same
         * contrast ratio; only the blue is gone.
         *
         * `deepest` is DARKER than the base here, because on this branch it is
         * the footer and the hero's bottom band — the deepest surfaces on the
         * page. (main pairs those keys the other way round to suit its
         * alternating light/dark section rhythm.)
         *
         * The `navy` key name is historical and kept deliberately: the section
         * layer is full of bg-navy-deepest and text-navy-deep, and renaming it
         * is a mechanical sweep that does not belong in the same commit as a
         * palette change.
         */
        navy: {
          DEFAULT: "#111111",
          light: "#202020",
          lighter: "#242424",
          deep: "#111111",
          deepest: "#0A0A0A",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E4C558",
          dark: "#B8962E",
        },

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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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

        /**
         * Seamless marquee, for a track that renders its content exactly twice.
         *
         * -50% is what makes the loop invisible: at the end of the cycle the
         * second copy sits precisely where the first one started, so the final
         * frame is identical to the first and there is no jump to see. Stated
         * as a percentage of the track's own width, it stays correct at every
         * viewport size and font size with nothing measured in JavaScript.
         *
         * translate3d rather than translateX to put the track on its own
         * compositor layer, so the browser is not re-rasterising a row of text
         * nodes on every frame — the usual source of marquee stutter.
         */
        "client-marquee": {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // linear and infinite, and deliberately without any easing: constant
        // speed is the effect, and easing would slow the strip right at the
        // loop point, advertising the seam the duplication exists to hide.
        "client-marquee": "client-marquee 46s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
