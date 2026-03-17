"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChefHat, Clock, Flame, Utensils, Heart, Loader2, Wand2, 
  Send, Bot, User as UserIcon, Camera, Upload, Image as ImageIcon,
  X, Sparkles, Mic, Eraser
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/src/lib/utils";
import { useAppStore } from "@/src/lib/store";
import { analyzeIngredients, generateRecipe } from "@/src/lib/ai";
import { AnalysisResult, Recipe } from "@/src/lib/schemas";
import { VoiceButton, useSpeech } from "@/src/components/voice-button";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "analysis" | "recipe";
  data?: any;
  image?: string;
}

export default function HomePage() {
  const { 
    preferences, 
    toggleFavorite, 
    isFavorite, 
    setPreferences,
    messages,
    addMessage,
    clearMessages
  } = useAppStore();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { speak } = useSpeech();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    addMessage({ role: "user", content: messageText, type: "text" });
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });
      
      // Prepare history with context from analysis and recipes
      const history = messages
        .slice(-10) // Keep last 10 messages for context
        .filter(m => m.id !== "welcome")
        .map(m => {
          let content = m.content;
          if (m.type === "analysis" && m.data) {
            const ingredients = m.data.ingredients.map((i: any) => `${i.name} (${i.amount || ""})`).join(", ");
            content = `Я проанализировал фото и нашел: ${ingredients}. Предложенные блюда: ${m.data.suggestedRecipes.join(", ")}`;
          } else if (m.type === "recipe" && m.data) {
            content = `Я составил рецепт: ${m.data.title}. Описание: ${m.data.description}`;
          }
          
          return {
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: content }],
          };
        });

      const chat = ai.chats.create({
        model: process.env.AI_MODEL || "gemini-2.5-flash",
        config: {
          systemInstruction: `Ты — экспертный Шеф-повар. Отвечай на русском языке. 
          Помогай пользователю с рецептами, техниками приготовления и советами по продуктам.
          Учитывай предпочтения: Диета - ${preferences.diet}, Аллергии - ${preferences.allergies.join(", ")}, Другое - ${preferences.customPreferences.join(", ")}.
          Если пользователь загружал фото продуктов ранее, используй эту информацию для советов.`,
        },
        history: history,
      });

      const response = await chat.sendMessage({ message: messageText });
      const responseText = response.text || "Извини, я не смог сгенерировать ответ.";
      
      addMessage({ role: "assistant", content: responseText, type: "text" });
      // speak(responseText); // Removed automatic speech
    } catch (error) {
      console.error("Chat Error:", error);
      addMessage({ role: "assistant", content: "Произошла ошибка при общении с ИИ. Попробуй еще раз.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const previewUrl = URL.createObjectURL(file);
    addMessage({ role: "user", content: "Загружено фото продуктов", type: "text", image: previewUrl });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const analysis = await analyzeIngredients(base64, file.type);
        
        addMessage({ 
          role: "assistant", 
          content: "Я проанализировал фото! Вот что я нашел:", 
          type: "analysis",
          data: analysis
        });
        setUploadingImage(false);
      };
    } catch (error) {
      console.error("Analysis Error:", error);
      addMessage({ role: "assistant", content: "Не удалось проанализировать фото. Попробуй другое.", type: "text" });
      setUploadingImage(false);
    }
  };

  const handleGenerateRecipe = async (recipeName: string, ingredients: string[]) => {
    setIsLoading(true);
    const prompt = `Распиши полностью рецепт: ${recipeName}`;
    addMessage({ role: "user", content: prompt, type: "text" });

    try {
      // Pass full context to recipe generation if needed, 
      // but generateRecipe is a specialized tool for structured output.
      // We combine the ingredients from analysis with the specific recipe name.
      const recipe = await generateRecipe([recipeName, ...ingredients], preferences);
      addMessage({ 
        role: "assistant", 
        content: `Вот подробный рецепт для "${recipe.title}":`, 
        type: "recipe",
        data: recipe
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#fbbf24", "#f59e0b"]
      });
    } catch (error) {
      console.error("Recipe Error:", error);
      addMessage({ role: "assistant", content: "Не удалось создать рецепт. Попробуй изменить список продуктов.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col glass md:rounded-3xl overflow-hidden shadow-2xl md:border border-white/20">
      {/* Ratatouille Easter Egg - Only on Desktop */}
      <div className="hidden md:block absolute -top-16 -right-12 w-32 h-32 z-0 pointer-events-none">
        <img 
          src="https://static.wikia.nocookie.net/pixar/images/d/d2/Remy_ratatouille.png" 
          alt="Remy" 
          className="w-full h-full object-contain transform -rotate-12 opacity-90"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-primary/5 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Шеф-повар AI</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-muted-foreground">На кухне и готов помочь</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            clearMessages();
          }}
          className="p-2.5 rounded-xl bg-secondary/50 hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-600 group shadow-sm"
          title="Очистить чат"
        >
          <Eraser className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-gradient-to-b from-transparent to-primary/5">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-md",
                m.role === "user" ? "bg-secondary" : "bg-primary text-white"
              )}>
                {m.role === "user" ? <UserIcon className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>

              <div className={cn(
                "flex flex-col gap-2 max-w-[90%] md:max-w-[75%]",
                m.role === "user" ? "items-end" : "items-start"
              )}>
                {m.image && (
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-primary/20 mb-2">
                    <img src={m.image} alt="Uploaded" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                  m.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "glass rounded-tl-none border border-white/10"
                )}>
                  {m.type === "text" && (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                      {m.content}
                    </ReactMarkdown>
                  )}

                  {m.type === "analysis" && m.data && (
                    <div className="space-y-4">
                      <p className="font-medium text-primary">{m.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {(m.data as AnalysisResult).ingredients.map((ing, i) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                            {ing.name} {ing.amount && <span className="opacity-60">({ing.amount})</span>}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Что приготовим?</p>
                        <div className="grid grid-cols-1 gap-2">
                          {(m.data as AnalysisResult).suggestedRecipes.map((name, i) => (
                            <button
                              key={i}
                              onClick={() => handleGenerateRecipe(name, (m.data as AnalysisResult).ingredients.map(ing => ing.name))}
                              className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary hover:text-white transition-all group border border-primary/10"
                            >
                              <span className="font-medium">{name}</span>
                              <Wand2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {m.type === "recipe" && m.data && (
                    <div className="space-y-6 w-full min-w-[280px] md:min-w-[400px]">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-primary">{(m.data as Recipe).title}</h3>
                          <p className="text-xs text-muted-foreground italic">{(m.data as Recipe).description}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(m.data as Recipe)}
                          className={cn(
                            "p-2 rounded-full transition-all border shrink-0",
                            isFavorite((m.data as Recipe).title) 
                              ? "bg-red-500 text-white border-red-500" 
                              : "bg-secondary text-muted-foreground hover:text-red-500 border-transparent"
                          )}
                        >
                          <Heart className={cn("w-5 h-5", isFavorite((m.data as Recipe).title) && "fill-current")} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg text-xs">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{(m.data as Recipe).cookingTime}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg text-xs">
                          <Flame className="w-4 h-4 text-primary" />
                          <span>{(m.data as Recipe).calories} ккал</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold border-b pb-1 flex items-center gap-2">
                          <Utensils className="w-4 h-4" /> Ингредиенты
                        </h4>
                        <ul className="grid grid-cols-1 gap-1">
                          {(m.data as Recipe).ingredients.map((ing, i) => (
                            <li key={i} className="text-xs flex justify-between p-1.5 hover:bg-primary/5 rounded-md">
                              <span className="font-medium">{ing.item}</span>
                              <span className="text-muted-foreground">{ing.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold border-b pb-1 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Инструкция
                        </h4>
                        <ol className="space-y-3">
                          {(m.data as Recipe).instructions.map((step, i) => (
                            <li key={i} className="text-xs flex gap-3">
                              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
                                {i + 1}
                              </span>
                              <p className="pt-1 leading-relaxed">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(isLoading || uploadingImage) && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 items-start"
          >
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-6 h-6" />
            </div>
            <div className="glass p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium animate-pulse">
                {uploadingImage ? "Изучаю продукты..." : "Шеф-повар думает..."}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t bg-secondary/20 backdrop-blur-xl relative z-10">
        <div className="flex gap-2 items-center max-w-4xl mx-auto">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm shrink-0"
            title="Сделать фото"
          >
            <Camera className="w-6 h-6" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleImageUpload}
            />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm shrink-0"
            title="Загрузить файл"
          >
            <Upload className="w-6 h-6" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </button>

          <div className="flex-1 relative group">
            <textarea
              rows={1}
              placeholder="Спроси рецепт или загрузи фото..."
              className="w-full bg-background/80 border-2 border-primary/10 rounded-3xl px-6 py-4 pr-24 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none max-h-32 scrollbar-hide"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <VoiceButton 
                onTranscript={(text) => handleSend(text)} 
                isListening={isListening} 
                setIsListening={setIsListening} 
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
