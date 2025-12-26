/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {}, // autoprefixer is optional with v4 but keeping it doesn't hurt usually, strictly v4 includes it. But let's keep it simple. Actually v4 handles prefixes.
    },
};

export default config;
