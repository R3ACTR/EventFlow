/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", "sans-serif"],
                mono: ["'Roboto Mono'", "monospace"],
                serif: ["'Instrument Serif'", "serif"], // Hero heading font
            },
            colors: {
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                },
                neon: {
                    cyan: "#00ff87",
                    violet: "#60a5fa",
                    blue: "#3b82f6",
                    pink: "#ec4899",
                },
                space: {
                    900: "#050510",
                    800: "#0a0a20",
                    700: "#0f0f30",
                    600: "#141440",
                },
            },
        },
    },
    plugins: [],
};
