import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import BottomNav from "@/components/layout/BottomNav";
import ThemeProvider from "@/components/layout/ThemeProvider";
import Toaster from "@/components/ui/Toaster";
import SearchOverlay from "@/components/ui/SearchOverlay";
import Chatbot from "@/components/ui/Chatbot";
import FlashBanner from "@/components/ui/FlashBanner";
import FirstVisitPopup from "@/components/ui/FirstVisitPopup";

// Manrope: fuente de marca conAI (ver BRAND.md §3).
// Cargada via next/font/google: Next la sirve self-hosted, optimizada y sin flash.
// La asignamos a la CSS variable --font-manrope para usarla en globals.css y
// como font-sans por defecto.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "conAI — Tecnología con Inteligencia Artificial",
  description:
    "Los mejores productos con IA: salud, belleza, hogar, wearables, mascotas, gadgets, audio, oficina, juguetes, deportes, electrónica y teléfonos. Envío a todo Chile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`h-full antialiased ${manrope.variable}`}>
      <body
        className="min-h-full flex flex-col pb-16 md:pb-0"
        style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <FlashBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
          <BottomNav />
          <Toaster />
          <SearchOverlay />
          <Chatbot />
          <FirstVisitPopup />
        </ThemeProvider>
      </body>
    </html>
  );
}