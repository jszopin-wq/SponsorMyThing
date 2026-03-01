import type { Metadata } from "next";
import { Source_Sans_3, Bitter } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-source-sans",
});

const bitter = Bitter({
 subsets: ["latin"],
 display: "swap",
 variable: "--font-bitter",
});

export const metadata: Metadata = {
 title: "SponsorMyThing — Find Local Business Sponsors for Your Cause",
 description:
 "Help your non-profit, PTA, or youth sports league find and contact local businesses for sponsorships and donations. AI-powered outreach made easy.",
 keywords: ["sponsorship", "non-profit", "fundraising", "local business", "outreach", "PTA", "youth sports"],
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en">
 <body className={`${sourceSans.variable} ${bitter.variable} font-sans antialiased text-gray-900 bg-white`}>
 {children}
 </body>
 </html>
 );
}
