import type { Metadata } from "next";
// import Head from 'next/head';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FakeStore - Your One-Stop Shop",
  description: "Discover amazing products at great prices",
  other: {
    "algolia-site-verification": "052C10CF851BC251",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <Head>
        <meta name="algolia-site-verification" content="052C10CF851BC251" />
        <title>Algolia Verification</title>
      </Head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
