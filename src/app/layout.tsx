import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Ruwet — Kanban & Team Accountability",
  description: "Manage tasks, track stale items, and collaborate with team accountability.",
  icons: {
    icon: "/ruwet-logo.png",
    shortcut: "/ruwet-logo.png",
    apple: "/ruwet-logo.png",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#1A1A1E] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}

