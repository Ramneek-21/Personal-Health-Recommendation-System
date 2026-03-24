/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5efe4",
        ink: "#11213a",
        pine: "#1e6b58",
        ember: "#e27d47",
        sky: "#5f8ebf",
        paper: "#fff9f0",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(17, 33, 58, 0.08)",
      },
      fontFamily: {
        display: ["Space Grotesk", "Avenir Next", "sans-serif"],
        body: ["DM Sans", "Segoe UI", "sans-serif"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(226, 125, 71, 0.28), transparent 35%), radial-gradient(circle at 80% 20%, rgba(95, 142, 191, 0.22), transparent 28%)",
      },
    },
  },
  plugins: [],
};

