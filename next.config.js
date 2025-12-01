const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    // Firebase messaging service worker를 제외
    swSrc: false, // 커스텀 SW 사용하지 않음
    scope: '/',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
