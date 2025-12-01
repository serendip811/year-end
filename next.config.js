const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    scope: '/',
    buildExcludes: [/middleware-manifest\.json$/],
    // Firebase messaging service worker와 충돌하지 않도록 별도 처리
    publicExcludes: ['!firebase-messaging-sw.js'],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
