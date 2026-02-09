/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary': '#E98D04',
                'background-light': '#f6f7f8',
                'background-dark': '#101922',
                'text-primary': '#111418',
                'text-secondary': '#617589',
            },
            fontFamily: {
                'display': ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'DEFAULT': '0.25rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                'full': '9999px',
            },
        },
    },
    plugins: [],
}
