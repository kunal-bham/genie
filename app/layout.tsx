import type { Metadata } from "next";
import { Anek_Devanagari } from "next/font/google";
import "./globals.css";

const anekDevanagari = Anek_Devanagari({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Genie | Screenshot to Google Calendar",
  description: "Add events to your Google Calendar from a screenshot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧞‍♂️</text></svg>"
        />
      </head>
      <body className={anekDevanagari.className}>
        <div />
        {children}
      </body>
    </html>
  );
}
