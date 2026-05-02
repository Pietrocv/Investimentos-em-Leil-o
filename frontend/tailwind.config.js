export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#111214",
          green: "#D3AA53",
          gold: "#B7873A",
          bg: "#111214",
          text: "#ECECEC"
        }
      },
      boxShadow: {
        gold: "0 18px 50px rgba(211, 170, 83, 0.16)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 520ms ease-out both",
        shimmer: "shimmer 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
