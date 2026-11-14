import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // l'esportazione PDF legge le immagini del testo dallo stesso dominio, passando dall'ottimizzatore di Next
  // (le immagini stanno su S3 e senza CORS sporcherebbero il canvas)
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'fridaymedia.s3.eu-west-par.io.cloud.ovh.net' }],
  },
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
