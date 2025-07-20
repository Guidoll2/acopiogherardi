import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/contexts/data-context"
import { PageTransitionProvider } from "@/contexts/page-transition-context"

export const metadata: Metadata = {
  title: "Acopio Gherardi",
  description: "Tu app cerealera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PageTransitionProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}