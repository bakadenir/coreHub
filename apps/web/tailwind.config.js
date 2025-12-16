/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#18181b", // Zinc 900
                "background-light": "#ffffff",
                "surface-light": "#f4f4f5", // Zinc 100
                "border-light": "#e5e7eb",
                "text-primary": "#111418",
                "text-secondary": "#617589",
                "mid-gray": "#f7f7f7",
                "light-gray": "#9a9a9a",
                "active-highlight": "#0a0a0a",
                "habits-bg-light": "#f6f7f8",
                "black-primary": "#111518",
                "white-primary": "#ffffff",
                "grey-text": "#637c88",
                "grey-border-light": "#e5e7eb",
                "grey-bg-light": "#f0f3f4",
                "grey-hover-light": "#f9fafb",
                "grey-icon-light": "#9ca3af",
                "grey-tag-light": "#f0f3f4",
                "success-bg-light": "#e0f2f1",
                "success-text-light": "#28a745",
                "danger-icon": "#dc3545",
            },
            fontFamily: {
                sans: ["Geist Sans", "sans-serif"],
                mono: ["Geist Mono", "monospace"],
                "serif-body": ["Playfair Display", "serif"],
                "display": ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                xl: "0.75rem",
            },
        },
    },
    plugins: [],
}
