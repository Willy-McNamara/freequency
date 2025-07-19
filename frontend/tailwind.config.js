/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "slate-100": "var(--slate-100)",
        "slate-50": "var(--slate-50)",
        "slate-700": "var(--slate-700)",
        "slate-900": "var(--slate-900)",
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
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      // Spacing Design System
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        navbar: "4rem", // Height of the top bar (increased)
      },
      // Standardized Content Widths
      maxWidth: {
        "content-sm": "var(--max-width-sm)",
        "content-md": "var(--max-width-md)",
        "content-lg": "var(--max-width-lg)",
        "content-xl": "var(--max-width-xl)",
      },
      // Standardized Heights
      minHeight: {
        "screen-75": "var(--min-height-sm)",
        "screen-50": "var(--min-height-md)",
      },
      // Responsive Breakpoint Strategy
      screens: {
        // xs: Small phones (iPhone SE, etc.)
        xs: "375px",
        // sm: Phones (default Tailwind)
        sm: "640px",
        // md: Tablets
        md: "768px",
        // lg: Small laptops/desktops
        lg: "1024px",
        // xl: Large desktops
        xl: "1280px",
        // 2xl: Very large screens
        "2xl": "1536px",
      },
      // Standardized Grid Patterns
      gridTemplateColumns: {
        "auto-fit-sm": "repeat(auto-fit, minmax(280px, 1fr))",
        "auto-fit-md": "repeat(auto-fit, minmax(320px, 1fr))",
        "auto-fit-lg": "repeat(auto-fit, minmax(400px, 1fr))",
        "auto-fill-sm": "repeat(auto-fill, minmax(280px, 1fr))",
        "auto-fill-md": "repeat(auto-fill, minmax(320px, 1fr))",
        "auto-fill-lg": "repeat(auto-fill, minmax(400px, 1fr))",
      },
      fontFamily: {
        body: "var(--body-font-family)",
        "body-medium": "var(--body-medium-font-family)",
        "h-2": "var(--h-2-font-family)",
        small: "var(--small-font-family)",
        "table-item": "var(--table-item-font-family)",
        sans: ["Inter, sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ["class"],
};
