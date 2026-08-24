import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LynDesk — Link Your Next Desk",
  description: "Link Your Next Desk — Pinned Events, Team Collaboration, University Portals, and Academic Study Desk.",
  keywords: ["LynDesk", "Event Tracker", "Student Collaboration", "Study Desk", "Hackathons", "University Portal"],
  authors: [{ name: "LynDesk Engineering" }],
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lyndesk.tech"),
  openGraph: {
    title: "LynDesk — Link Your Next Desk",
    description: "Pinned Events, Team Collaboration, University Portals, and Academic Study Desk.",
    url: "https://lyndesk.tech",
    siteName: "LynDesk",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "LynDesk — Link Your Next Desk",
    description: "Pinned Events, Team Collaboration, University Portals, and Academic Study Desk."
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    title: "LynDesk",
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
