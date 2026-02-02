import type { Metadata } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";
import Providers from "./Providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
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
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html lang="en">
        <body
          className={`${cormorant.variable} ${karla.variable} font-sans antialiased bg-[#FDFCFB] text-stone-900 selection:bg-emerald-100`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
