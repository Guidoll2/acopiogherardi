import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineDataProvider } from "@/contexts/offline-data-context"
import { PageTransitionProvider, PageTransitionLoader } from "@/contexts/page-transition-context"
import { ToastProvider, ToastContainer } from "@/components/ui/toast"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { ServiceWorkerUpdater } from "@/hooks/use-service-worker"
import { SyncManagerProvider } from "@/components/providers/sync-manager-provider"

export const metadata: Metadata = {
  title: "Cuatro Granos",
  description: "Sistema de gestión de cereales",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuatro Granos"
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cuatro Granos" />
        <meta name="application-name" content="Cuatro Granos" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <PageTransitionProvider>
            <OfflineDataProvider>
              <SyncManagerProvider>
                <OfflineIndicator showDetails={true} />
                {children}
                <PageTransitionLoader />
                <ToastContainer />
                <ServiceWorkerUpdater />
              </SyncManagerProvider>
            </OfflineDataProvider>
          </PageTransitionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}