import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#171717", // Soft black (zinc-900)
                "background-light": "#fdfdfd", // Soft white
                "surface-light": "#f4f4f5", // Zinc 100
                "border-light": "#e5e7eb",
                "text-primary": "#111418",
                "text-secondary": "#617589",
                "mid-gray": "#f7f7f7",
                "light-gray": "#9a9a9a",
                "active-highlight": "#171717", // Soft black
                "habits-bg-light": "#f6f7f8",
                "black-primary": "#171717", // Soft black
                "white-primary": "#fdfdfd", // Soft white
                "grey-text": "#637c88",
                "grey-border-light": "#e5e7eb",
                "grey-bg-light": "#f0f3f4",
                "grey-hover-light": "#f9fafb",
                "grey-icon-light": "#9ca3af",
                "grey-tag-light": "#f0f3f4",
                "success-bg-light": "#e0f2f1",
                "success-text-light": "#28a745",
                "danger-icon": "#dc3545",
                // Semantic soft colors
                "soft-black": "#171717",
                "soft-white": "#fdfdfd",
            },
            fontFamily: {
                sans: ["Geist Sans", "sans-serif"],
                mono: ["Geist Mono", "monospace"],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
                xl: "0.75rem",
            },
            animation: {
                blob: "blob 7s infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
            },
        },
    },
    plugins: [typography],
}
