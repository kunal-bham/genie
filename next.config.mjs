/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    // Exclude GenieMobile and extension directories
    config.watchOptions = {
      ignored: ['**/GenieMobile/**', '**/extension/**']
    };
    return config;
  }
};

export default nextConfig;
