import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "conAI — Tecnología con Inteligencia Artificial",
  description:
    "Los mejores productos con IA: salud, belleza, hogar, wearables, mascotas y gadgets. Envío a todo Chile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col pb-16 md:pb-0" suppressHydrationWarning>
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
