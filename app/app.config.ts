export default defineAppConfig({
    // https://ui.nuxt.com/getting-started/theme#design-system
    ui: {
        colors: {
            primary: 'emerald',
            neutral: 'slate',
        },
        button: {
            defaultVariants: {
                // Set default button color to neutral
                // color: 'neutral'
            }
        },
        main: {
            base: 'min-h-[calc(100vh-calc(var(--ui-header-height)+var(--ui-footer-height)))]' // Adjust main height to account for header and footer
        }
    }
})
