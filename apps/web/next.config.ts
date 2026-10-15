import "./src/load-env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg uses native Node modules; keep it out of the bundler.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
