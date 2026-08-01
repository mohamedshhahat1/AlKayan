import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "الكيان | شركة مقاولات وتشطيبات داخلية فاخرة",
  description:
    "الكيان - شركة رائدة في مجال المقاولات والتشطيبات الداخلية والتصميم الداخلي والخارجي. من الفكرة إلى تسليم المفتاح بأعلى معايير الجودة والاحترافية.",
  keywords: [
    "تشطيبات",
    "مقاولات",
    "تصميم داخلي",
    "تصميم خارجي",
    "الكيان",
    "تشطيب شقق",
    "تشطيب فلل",
    "تشطيب مكاتب",
    "ديكور",
    "مقاولات عامة",
  ],
  openGraph: {
    title: "الكيان | شركة مقاولات وتشطيبات داخلية فاخرة",
    description:
      "نصمم، ننفذ، ونشرف على جميع أعمال التشطيبات والمقاولات بأعلى معايير الجودة والاحترافية.",
    type: "website",
    locale: "ar_SA",
    siteName: "الكيان",
  },
  twitter: {
    card: "summary_large_image",
    title: "الكيان | شركة مقاولات وتشطيبات داخلية فاخرة",
    description:
      "نصمم، ننفذ، ونشرف على جميع أعمال التشطيبات والمقاولات بأعلى معايير الجودة والاحترافية.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className={tajawal.className} style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
        <SmoothScroll>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <ChatWidget />
        </SmoothScroll>
      </body>
    </html>
  );
}
