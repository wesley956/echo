import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const maShan = Ma_Shan_Zheng({
  variable: "--font-ma-shan",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ECHO — Inteligência Emocional | Cultivo do Coração",
  description:
    "ECHO é o seu eco interior. Um assistente de inteligência emocional que te ouve quando você não consegue ouvir a si mesmo. Cultive o coração como um guerreiro cultiva o espírito.",
  keywords: [
    "ECHO", "inteligência emocional", "saúde mental", "diário emocional",
    "apoio emocional", "autoconhecimento", "CVV 188", "wuxia",
  ],
  authors: [{ name: "ECHO" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ECHO",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className={`${dmSans.variable} ${cormorant.variable} ${maShan.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
