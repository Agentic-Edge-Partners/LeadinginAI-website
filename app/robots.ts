import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const origin = absoluteUrl("/").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
