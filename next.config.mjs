/** @type {import('next').NextConfig} */
const nextConfig = {};
if (process.env.MAHAM_DOCKER === '1') nextConfig.output = 'standalone';
export default nextConfig;
