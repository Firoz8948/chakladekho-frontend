import "@/styles/globals.css";

import { Cormorant_Garamond, Manrope } from "next/font/google";

import AppToaster from "@/components/AppToaster/AppToaster";
import JsonLd from "@/components/JsonLd/JsonLd";
import MetaPixel from "@/components/MetaPixel/MetaPixel";
import FloatingCartBar from "@/components/FloatingCartBar/FloatingCartBar";
import SiteChrome from "@/components/SiteChrome/SiteChrome";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ASSETS, BRAND } from "@/utils/constants";
import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  socialImages,
  websiteJsonLd,
} from "@/utils/seo";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${BRAND.tagline}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "chakla",
    "tawa",
    "belan",
    "rolling pin",
    "serving spoon",
    "spatula",
    "mortar and pestle",
    "ChaklaDekho",
    "kitchen essentials India",
    "buy chakla online",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${BRAND.tagline}`,
    description: DEFAULT_DESCRIPTION,
    images: socialImages(OG_IMAGE),
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${BRAND.tagline}`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
  },
  icons: {
    icon: [{ url: ASSETS.icon, type: "image/svg+xml" }],
    shortcut: ASSETS.icon,
    apple: ASSETS.icon,
  },
  category: "shopping",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_BUNNY_CDN_HOST ? (
          <>
            <link
              rel="preconnect"
              href={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOST}`}
              crossOrigin="anonymous"
            />
            <link
              rel="dns-prefetch"
              href={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOST}`}
            />
          </>
        ) : null}
        {process.env.NEXT_PUBLIC_API_URL ? (
          <>
            <link
              rel="preconnect"
              href={process.env.NEXT_PUBLIC_API_URL}
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
          </>
        ) : null}
      </head>
      <body>
        <MetaPixel />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <AuthProvider>
          <CartProvider>
            <AppToaster />
            <SiteChrome>{children}</SiteChrome>
            <FloatingCartBar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
