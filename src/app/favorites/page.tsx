"use client";
 
import { useState } from "react";

import { useAppStore } from "@/src/lib/store";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Trash2, Clock, Flame, ChefHat, Utensils } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useAppStore();
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Моё избранное</h1>
        <p className="text-muted-foreground">{favorites.length} рецептов сохранено</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl space-y-4">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
          <h2 className="text-xl font-medium">У вас пока нет избранных рецептов</h2>
          <p className="text-muted-foreground">Добавляйте понравившиеся рецепты, нажимая на ❤️</p>
          <Link href="/" className="inline-block bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity">
            Найти рецепты
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {favorites.map((recipe) => {
              const isExpanded = expandedRecipe === recipe.title;
              
              return (
                <motion.div
                  key={recipe.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "glass rounded-3xl overflow-hidden flex flex-col group transition-all duration-300",
                    isExpanded ? "md:col-span-2 lg:col-span-3" : ""
                  )}
                >
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-bold">{recipe.title}</h3>
                      <button
                        onClick={() => toggleFavorite(recipe)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    
                    <p className={cn("text-sm text-muted-foreground", !isExpanded && "line-clamp-3")}>
                      {recipe.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-medium">
                      <div className="flex items-center gap-1.5 p-2 bg-secondary rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {recipe.cookingTime}
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-secondary rounded-lg">
                        <Flame className="w-3.5 h-3.5 text-primary" />
                        {recipe.calories} ккал
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-secondary rounded-lg">
                        <ChefHat className="w-3.5 h-3.5 text-primary" />
                        {recipe.difficulty}
                      </div>
                      <div className="flex items-center gap-1.5 p-2 bg-secondary rounded-lg">
                        <Utensils className="w-3.5 h-3.5 text-primary" />
                        {recipe.ingredients.length} ингред.
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t"
                      >
                        <div className="space-y-4">
                          <h4 className="font-bold flex items-center gap-2 text-primary">
                            <Utensils className="w-4 h-4" /> Ингредиенты
                          </h4>
                          <ul className="space-y-2">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i} className="text-sm flex justify-between p-2 bg-primary/5 rounded-xl">
                                <span>{ing.item}</span>
                                <span className="font-medium">{ing.amount}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-bold flex items-center gap-2 text-primary">
                            <Utensils className="w-4 h-4" /> Инструкция
                          </h4>
                          <ol className="space-y-4">
                            {recipe.instructions.map((step, i) => (
                              <li key={i} className="text-sm flex gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                                  {i + 1}
                                </span>
                                <p className="pt-0.5">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-primary/5 border-t flex justify-end items-center">
                    <button 
                      onClick={() => setExpandedRecipe(isExpanded ? null : recipe.title)}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      {isExpanded ? "Свернуть" : "Посмотреть полностью"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
