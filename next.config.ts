import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  // Routes rendered at request time (the filterable /episodes page, the
  // subscribe API, on-demand OG images) read /content and the OG fonts from
  // disk. Make sure those files ship inside the serverless functions on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./assets/fonts/*.ttf"],
  },
};

export default nextConfig;
