import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app lives in a monorepo subdirectory (jastip-frontend) alongside
  // jastip-backend and jastip-mobile, each with their own package-lock.json.
  // Next.js 16 workspace-root inference gets confused by the sibling
  // lockfiles and may pick the wrong root, producing an empty build.
  // Pin the app root explicitly so the Vercel build outputs real routes.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
