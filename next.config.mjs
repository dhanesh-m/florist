/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["firebase"],
  },
  /** Apex → www (both can be added in Firebase Hosting; keeps one canonical host). */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "floraldoctor.ca" }],
        destination: "https://www.floraldoctor.ca/:path*",
        permanent: true,
      },
      {
        source: "/admin/forgot-password",
        destination: "/admin/login",
        permanent: true,
      },
      {
        source: "/admin/reset-password",
        destination: "/admin/login",
        permanent: true,
      },
      {
        source: "/admin/create-password",
        destination: "/admin/login",
        permanent: true,
      },
    ];
  },
  /** Browsers request `/favicon.ico` by default; map to the generated PNG at `/icon`. */
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
