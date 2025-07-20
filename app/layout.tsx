import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/contexts/data-context"

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
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}