import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// New fonts for design testing
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

export const metadata: Metadata = {
  title: "Grove",
  description: "Cultivate your meaningful connections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${karla.variable} font-sans antialiased bg-[#FDFCFB] text-stone-900 selection:bg-emerald-100`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
