/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f1e8",
        ink: "#14231d",
        brand: {
          50: "#eef8f1",
          100: "#d4ecd8",
          200: "#acd8b3",
          300: "#7fc089",
          400: "#58a964",
          500: "#3f8d4b",
          600: "#2f703a",
          700: "#275932",
          800: "#21482b",
          900: "#1b3a23"
        },
        accent: {
          50: "#fff7eb",
          100: "#fce7c6",
          200: "#f7ce8e",
          300: "#f1b554",
          400: "#eb9c28",
          500: "#cf7a11",
          600: "#a85e0d",
          700: "#80460f",
          800: "#673813",
          900: "#562f13"
        },
        berry: {
          50: "#fff1f2",
          100: "#ffe2e6",
          200: "#ffc9d1",
          300: "#ff9ead",
          400: "#ff6d85",
          500: "#fb3a63",
          600: "#e51d53",
          700: "#c11345",
          800: "#a01441",
          900: "#88153e"
        }
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 50px -24px rgba(20, 35, 29, 0.35)"
      }
    }
  },
  plugins: []
};
