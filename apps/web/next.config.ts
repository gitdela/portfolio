import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @portfolio/sanity is a just-in-time package that ships TypeScript source, so Next has
  // to compile it rather than treat it as pre-built.
  transpilePackages: ["@portfolio/sanity"],

  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" }],
  },

  typedRoutes: true,

  // Next 16 dropped `next lint` and the `eslint` config key; linting is its own
  // Turborepo task and no longer runs as part of the build.

  // Not `async`: there is nothing to await, and Next only needs a promise back.
  headers: () =>
    Promise.resolve([
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ]),
};

export default nextConfig;
