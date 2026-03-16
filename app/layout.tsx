import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import Navbar from "@/components/Navbar";
import MeshBackground from "@/components/MeshBackground";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalExceptionHandler from "@/components/GlobalExceptionHandler";

const ibmPlexSerif = IBM_Plex_Serif({
    variable: "--font-ibm-plex-serif",
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap'
});

const monaSans = Mona_Sans({
    variable: '--font-mona-sans',
    subsets: ['latin'],
    display: 'swap'
})

export const metadata: Metadata = {
  title: "Knowl - Neural Knowledge Synthesis",
  description: "Synthesize your research into interactive knowledge nodes. Engage with AI resonance and a community of deep thinkers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased`}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <MeshBackground />
              <GlobalExceptionHandler />
              {children}
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
    </ClerkProvider>
  );
}
