"use client";

import { useAppStore } from "@/src/lib/store";
import { motion } from "motion/react";
import { Settings, Bell, Shield, User, Plus, X, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

const DIETS = ["Без ограничений", "Вегетарианец", "Веган"];
const COMMON_ALLERGIES = ["Лактоза", "Глютен", "Орехи", "Яйца", "Рыба", "Морепродукты", "Соя", "Арахис"];

export default function SettingsPage() {
  const { preferences, setPreferences } = useAppStore();
  const [newPreference, setNewPreference] = useState("");

  const toggleAllergy = (allergy: string) => {
    const current = preferences.allergies;
    if (current.includes(allergy)) {
      setPreferences({ allergies: current.filter(a => a !== allergy) });
    } else {
      setPreferences({ allergies: [...current, allergy] });
    }
  };

  const addCustomPreference = () => {
    if (newPreference && !preferences.customPreferences.includes(newPreference)) {
      setPreferences({ customPreferences: [...preferences.customPreferences, newPreference] });
      setNewPreference("");
    }
  };

  const removeCustomPreference = (pref: string) => {
    setPreferences({ customPreferences: preferences.customPreferences.filter(p => p !== pref) });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Настройки профиля</h1>
      </div>

      <div className="grid gap-6">
        {/* Diet Section */}
        <section className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Тип питания
          </h2>
          <div className="flex flex-wrap gap-2">
            {DIETS.map((diet) => (
              <button
                key={diet}
                onClick={() => setPreferences({ diet: diet as any })}
                className={cn(
                  "px-6 py-2 rounded-full border transition-all",
                  preferences.diet === diet 
                    ? "bg-primary text-white border-primary" 
                    : "hover:bg-secondary border-transparent"
                )}
              >
                {diet}
              </button>
            ))}
          </div>
        </section>

        {/* Allergies Section */}
        <section className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Аллергии
          </h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((allergy) => (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={cn(
                  "px-4 py-2 rounded-xl border transition-all text-sm",
                  preferences.allergies.includes(allergy)
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-secondary text-muted-foreground hover:bg-red-100 border-transparent"
                )}
              >
                {allergy}
              </button>
            ))}
          </div>
        </section>

        {/* Custom Preferences */}
        <section className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Особые пожелания
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Например: Не люблю кинзу"
              className="flex-1 bg-secondary rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomPreference()}
            />
            <button
              onClick={addCustomPreference}
              className="bg-primary text-white px-4 py-2 rounded-xl hover:opacity-90"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.customPreferences.map((pref) => (
              <div key={pref} className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                <span className="text-sm">{pref}</span>
                <button onClick={() => removeCustomPreference(pref)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* App Settings */}
        <section className="glass p-6 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Настройки приложения
          </h2>
          <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
            <div className="flex items-center gap-3">
              {preferences.autoRead ? <Volume2 className="text-primary" /> : <VolumeX className="text-muted-foreground" />}
              <div>
                <p className="font-medium">Автопрочтение ответов</p>
                <p className="text-xs text-muted-foreground">Озвучивать ответы шеф-повара в чате</p>
              </div>
            </div>
            <button
              onClick={() => setPreferences({ autoRead: !preferences.autoRead })}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                preferences.autoRead ? "bg-primary" : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                preferences.autoRead ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
