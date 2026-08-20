import { nextConfig } from "@portfolio/eslint-config/next";

export default nextConfig({
  tsconfigRootDir: import.meta.dirname,
  additionalIgnores: [".next/**", "next-env.d.ts"],
});
