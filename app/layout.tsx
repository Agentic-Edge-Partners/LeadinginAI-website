import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { absoluteUrl, getSite } from "@/lib/content";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SubscribeProvider } from "@/components/forms/SubscribeProvider";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: { default: `${site.shortName} — ${site.tagline}`, template: `%s — ${site.name}` },
    description: site.description,
    applicationName: site.shortName,
    openGraph: { type: "website", siteName: site.shortName, locale: "en_GB" },
    twitter: { card: "summary_large_image" },
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": [{ url: "/rss.xml", title: `${site.shortName} — site feed` }],
      },
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  return (
    <html lang={site.language} className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <MotionProvider>
          <SubscribeProvider
            headline={site.newsletter.headline}
            subheadline={site.newsletter.subheadline}
            copy={site.newsletter}
          >
            <SkipLink />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer site={site} />
          </SubscribeProvider>
        </MotionProvider>
        <SmoothScroll />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
