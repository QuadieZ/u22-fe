// next.config.js
module.exports = {
    async rewrites() {
        return [
            {
                source: '/*',
                destination: 'https://manga-senseii.onrender.com/:path*',
            },
        ]
    },
};