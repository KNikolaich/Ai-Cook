"use client";

import { useTheme } from "next-themes";
import { Palette } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useEffect, useState } from "react";

const themes = [
  { id: "light", label: "Светлая", color: "bg-white" },
  { id: "dark", label: "Темная", color: "bg-slate-900" },
  { id: "warm", label: "Теплая", color: "bg-amber-100" },
  { id: "cool", label: "Холодная", color: "bg-sky-100" },
  { id: "vanilla", label: "Ваниль", color: "bg-[#fdfcf0]" },
  { id: "chocolate", label: "Шоколад", color: "bg-[#2c1810]" },
  { id: "desert", label: "Пустыня", color: "bg-[#fefae0]" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <div className="relative group">
      <button className="p-2 rounded-full hover:bg-secondary transition-colors">
        <Palette className="w-5 h-5" />
      </button>
      
      <div className="absolute right-0 top-full mt-2 p-2 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all grid grid-cols-1 gap-1 min-w-[140px]">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors w-full text-left",
              theme === t.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            )}
          >
            <div className={cn("w-3 h-3 rounded-full border", t.color)} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
