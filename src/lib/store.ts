import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserPreferences, Recipe } from "./schemas";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "analysis" | "recipe";
  data?: any;
  image?: string;
}

interface AppState {
  preferences: UserPreferences;
  favorites: Recipe[];
  messages: Message[];
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  toggleFavorite: (recipe: Recipe) => void;
  isFavorite: (title: string) => boolean;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  addMessage: (msg: Omit<Message, "id">) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: {
        diet: "Без ограничений",
        allergies: [],
        customPreferences: [],
        autoRead: true,
      },
      favorites: [],
      messages: [
        { 
          id: "welcome",
          role: "assistant", 
          content: "Привет! Я твой персональный Шеф-повар. Сфотографируй продукты в холодильнике или просто напиши, что хочешь приготовить!",
          type: "text"
        }
      ],
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      toggleFavorite: (recipe) =>
        set((state) => {
          const exists = state.favorites.find((f) => f.title === recipe.title);
          if (exists) {
            return {
              favorites: state.favorites.filter((f) => f.title !== recipe.title),
            };
          }
          return { favorites: [...state.favorites, recipe] };
        }),
      isFavorite: (title) => {
        return !!get().favorites.find((f) => f.title === title);
      },
      setMessages: (messages) => 
        set((state) => ({ 
          messages: typeof messages === 'function' ? messages(state.messages) : messages 
        })),
      addMessage: (msg) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          messages: [...state.messages, { ...msg, id }]
        }));
      }
    }),
    {
      name: "ai-culinary-storage",
    }
  )
);
