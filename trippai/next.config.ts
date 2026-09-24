import type { NextConfig } from "next"

// NEXT_PUBLIC_DEMO_MODE=true produces a fully static export in `out/` that reads
// pre-computed forecasts from public/demo/ instead of calling the API.
const isStatic = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const nextConfig: NextConfig = {
  eslint: {
    // Allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  ...(isStatic
    ? { output: "export" as const, images: { unoptimized: true } }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
                { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
              ],
            },
          ]
        },
      }),
}

export default nextConfig
