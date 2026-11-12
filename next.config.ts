import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Autori e newsletter non hanno (ancora) un backend: niente pagine rotte.
    return [
      { source: "/author", destination: "/chi-siamo", permanent: false },
      { source: "/author/:slug", destination: "/chi-siamo", permanent: false },
      { source: "/newsletter", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
