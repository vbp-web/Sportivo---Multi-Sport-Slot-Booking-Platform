import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Sportivo - Book Sports Slots Instantly",
  description: "India's fastest growing sports booking platform. Find venues, book slots, and play your favorite sports instantly. Cricket, Football, Badminton, Tennis & more.",
  keywords: ["sports booking", "venue booking", "cricket", "football", "badminton", "tennis", "sports slots"],
  authors: [{ name: "Sportivo" }],
  openGraph: {
    title: "Sportivo - Book Sports Slots Instantly",
    description: "Find and book sports venues in your city. Play cricket, football, badminton, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
