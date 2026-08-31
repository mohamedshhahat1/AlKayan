import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    /*
     * lib/ too, and it is not optional.
     *
     * Tailwind generates a utility only if it finds the literal class string in
     * a scanned file. `headerOffsetClass` in lib/navigation.ts is the string
     * "pt-[55px] sm:pt-[60px] lg:pt-[64px]" and lib/ was not on this list, so
     * those three utilities were never emitted: every route that used it —
     * /about, /services, /projects, /contact and every project page — resolved
     * to padding-top 0 and started underneath the fixed header.
     *
     * It went unnoticed because most of those pages open with a section whose
     * own py-14/py-20 happens to clear a 64px header. The pages that do not,
     * did not.
     *
     * Any file that composes class names belongs here, not just components.
     */
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Brand palette. These used to live only in :root as CSS variables,
         * which meant Tailwind could not generate variants or opacity
         * modifiers for them and components resorted to inline hex values.
         *
         * The dark scale is pure neutral black — no hue at all.
         *
         * DEFAULT, deep and deepest are all true #000: they are the page shell
         * (body, footer, the hero's bottom band) and the ink on gold buttons,
         * and all of those were asked for as pure black. light and lighter keep
         * a little lift because they are raised surfaces, not the shell — the
         * hero's fallback gradient needs two steps above black to read as a
         * gradient at all rather than a flat void.
         *
         * The `navy` key name is historical and kept deliberately: the section
         * layer is full of bg-navy-deepest and text-navy-deep, and renaming it
         * is a mechanical sweep that does not belong in the same commit as a
         * palette change.
         */
        navy: {
          DEFAULT: "#000000",
          light: "#202020",
          lighter: "#242424",
          deep: "#000000",
          deepest: "#000000",
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
