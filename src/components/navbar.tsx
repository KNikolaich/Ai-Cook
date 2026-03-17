"use client";

import Link from "next/link";
import { ChefHat, Heart, MessageSquare, Settings, Home } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/favorites", icon: Heart, label: "Избранное" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ChefHat className="w-8 h-8" />
          <span className="hidden sm:inline">AI-Кулинар</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
          <div className="ml-2 border-l pl-2">
            <ThemeSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
