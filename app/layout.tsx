import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DataProvider } from "@/contexts/data-context"
import { PageTransitionProvider, PageTransitionLoader } from "@/contexts/page-transition-context"
import { ToastProvider, ToastContainer } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Cuatro Granos",
  description: "Sistema de gestión de cereales"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ToastProvider>
          <PageTransitionProvider>
            <DataProvider>
              {children}
              <PageTransitionLoader />
              <ToastContainer />
            </DataProvider>
          </PageTransitionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}