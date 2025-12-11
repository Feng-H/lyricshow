/** @type {import('next').NextConfig} */
const nextConfig = {
  // Comment out output export for development with API routes
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Exclude pinyin from client build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };

      // Ignore pinyin module on client side
      config.externals = {
        ...config.externals,
        'pinyin': 'pinyin'
      };
    }
    return config;
  },
}

module.exports = nextConfig