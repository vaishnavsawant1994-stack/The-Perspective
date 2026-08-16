import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { HomepageRedesignHeader } from "@/components/home/homepage-redesign-header";
import { GlobalMembershipNewsletter, GlobalPerspectiveFooter } from "@/components/layout/perspective-global-shell";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a className="sr-only z-50 bg-foreground px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4" href="#main-content">Skip to content</a>
        <HomepageRedesignHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <div className="home-wrap home-global-newsletter-wrap">
          <GlobalMembershipNewsletter />
        </div>
        <GlobalPerspectiveFooter />
      </body>
    </html>
  );
}
