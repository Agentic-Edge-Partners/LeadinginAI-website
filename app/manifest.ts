import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  const site = getSite();
  return {
    name: site.shortName,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
