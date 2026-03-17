import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Navbar } from "@/src/components/navbar";
import { Background } from "@/src/components/background";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "AI-Кулинар | Твой умный шеф-повар",
  description: "Анализируй продукты по фото и получай идеальные рецепты",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          storageKey="culinary-theme"
        >
          <Background />
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
