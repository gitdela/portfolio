import { nextConfig } from "@portfolio/eslint-config/next";

export default [
  ...nextConfig({
    tsconfigRootDir: import.meta.dirname,
    additionalIgnores: [".next/**", "next-env.d.ts"],
  }),
  {
    // Development-only scripts run in a terminal, so progress output is the point.
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];
