/** @type {import('next').NextConfig} */
function cleanEnv(value, fallback = "") {
  const cleaned = String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim();
  return cleaned || fallback;
}

const bunnyCdnHost = cleanEnv(process.env.NEXT_PUBLIC_BUNNY_CDN_HOST);
const apiUrl = cleanEnv(
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:8000",
).replace(/\/$/, "");
const apiBase = cleanEnv(
  process.env.NEXT_PUBLIC_API_BASE,
  `${apiUrl}/api/v1`,
).replace(/\/$/, "");

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
      {
        protocol: "https",
        hostname: "api.chakladekho.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.chakladekho.in",
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
