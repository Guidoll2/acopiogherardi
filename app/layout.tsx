import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/contexts/data-context"
import { PageTransitionProvider, PageTransitionLoader } from "@/contexts/page-transition-context"
import { ToastProvider, ToastContainer } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Cuatro Granos",
  description: "Sistema de gestión de cereales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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