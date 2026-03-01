import type { Metadata } from "next";
import "./globals.css";

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
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
