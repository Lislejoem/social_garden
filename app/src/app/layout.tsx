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

// Check if Clerk is configured (for CI builds without secrets)
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${karla.variable} font-sans antialiased bg-surface-offWhite text-ink-rich selection:bg-grove-lightGreen/30`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  // Skip ClerkProvider during builds without the key (e.g., CI)
  if (!clerkPubKey) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
