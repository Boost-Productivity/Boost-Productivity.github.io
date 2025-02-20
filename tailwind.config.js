module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./index.html",
    ],
    theme: {
        extend: {
            colors: {
                // Main brand color and its variations (xyflow uses blue accents)
                primary: {
                    DEFAULT: '#4C9AFF',
                    light: '#6FB1FF',
                    dark: '#2684FF',
                },
                // Surface colors (dark mode panels and cards)
                surface: {
                    DEFAULT: '#1E1F25',
                    secondary: '#232429',
                    tertiary: '#2A2B32',
                },
                // Background colors (dark mode)
                background: {
                    DEFAULT: '#17181C',
                    alt: '#1E1F25',
                },
                // Text colors
                text: {
                    primary: '#F8F9FA',
                    secondary: '#A9B0BC',
                    tertiary: '#666B74',
                },
                // Border colors
                border: {
                    DEFAULT: '#2A2B32',
                    focus: '#4C9AFF',
                },
                // Status colors (keeping these similar but adjusted for dark theme)
                error: {
                    DEFAULT: '#FF4D4D',
                    light: '#4C2626',
                },
                success: {
                    DEFAULT: '#36B37E',
                    light: '#1F3326',
                },
                warning: {
                    DEFAULT: '#FFAB00',
                    light: '#4C3A00',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },
        },
    },
    plugins: [],
}