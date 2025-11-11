import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Savanna Tale",
  description: "Animated tale of a curious monkey and a fierce lion"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
