import type { NextConfig } from "next";

import { publicAliases } from "./src/modules/foundation/routing/public-aliases";

const nextConfig: NextConfig = {
  async redirects() {
    return publicAliases.map((alias) => ({
      source: alias.source,
      destination: alias.destination,
      permanent: false,
    }));
  },
  async headers() {
    const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "";
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
    ];
    if (origin.startsWith("https://")) {
      headers.push({ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
