/** @type {import('next').NextConfig} */
const bunnyCdnHost = process.env.NEXT_PUBLIC_BUNNY_CDN_HOST || "";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/uploads/**",
      },
      ...(bunnyCdnHost
        ? [
            {
              protocol: "https",
              hostname: bunnyCdnHost,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE || `${apiUrl}/api/v1`;
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
      {
        source: "/facebook-feed.xml",
        destination: `${apiBase}/feeds/facebook-feed.xml`,
      },
      {
        source: "/google-merchant.xml",
        destination: `${apiBase}/feeds/google-merchant.xml`,
      },
    ];
  },
};

module.exports = nextConfig;
