import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
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
            <body className={`${inter.className} antialiased`}>
                {children}
            </body>
        </html>
    );
}
