import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    allowedDevOrigins: (process.env.CORS_DOMAIN as string).split('|'),
};

export default nextConfig;
