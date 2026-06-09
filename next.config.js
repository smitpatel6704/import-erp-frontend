const rawBackendUrl = process.env.BACKEND_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '');
const isPrivateHostname = (hostname) => hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
const backendUrl = (() => {
    if (!rawBackendUrl)
        return '';
    try {
        const url = new URL(rawBackendUrl);
        if (process.env.NODE_ENV === 'production' && isPrivateHostname(url.hostname)) {
            console.warn(`Skipping API rewrite because ${url.hostname} is not reachable from Vercel production.`);
            return '';
        }
        return url.origin;
    }
    catch (_a) {
        console.warn(`Skipping API rewrite because "${rawBackendUrl}" is not a valid URL.`);
        return '';
    }
})();
const nextConfig = {
    output: "standalone",
    turbopack: {
        root: __dirname,
    },
    reactStrictMode: false,
    allowedDevOrigins: ['172.20.10.3', 'localhost'],
    async rewrites() {
        if (!backendUrl)
            return [];
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
};
module.exports = nextConfig;
