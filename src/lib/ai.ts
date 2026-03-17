import { GoogleGenAI } from "@google/genai";
import { AnalysisResultSchema, RecipeSchema } from "./schemas";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function analyzeIngredients(imageBuffer: string, mimeType: string) {
  const prompt = `Проанализируй это изображение и перечисли все продукты питания, которые ты видишь. 
  Верни результат в формате JSON со списком ингредиентов (название и примерное количество) и списком из 3-5 названий блюд, которые можно из них приготовить.
  Отвечай строго на русском языке.`;

  const response = await ai.models.generateContent({
    model: process.env.AI_MODEL || "gemini-2.5-flash",
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            data: imageBuffer.split(",")[1],
            mimeType,
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                amount: { type: "string" }
              },
              required: ["name"]
            }
          },
          suggestedRecipes: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["ingredients", "suggestedRecipes"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateRecipe(ingredients: string[], preferences: any) {
  const prompt = `Создай подробный рецепт блюда, используя следующие ингредиенты: ${ingredients.join(", ")}.
  Учитывай предпочтения пользователя: Диета - ${preferences.diet}, Аллергии - ${preferences.allergies.join(", ")}, Другое - ${preferences.customPreferences.join(", ")}.
  Верни результат в формате JSON.
  Отвечай строго на русском языке.`;

  const response = await ai.models.generateContent({
    model: process.env.AI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item: { type: "string" },
                amount: { type: "string" }
              }
            }
          },
          instructions: {
            type: "array",
            items: { type: "string" }
          },
          cookingTime: { type: "string" },
          difficulty: { type: "string", enum: ["Легко", "Средне", "Сложно"] },
          calories: { type: "number" }
        },
        required: ["title", "description", "ingredients", "instructions", "cookingTime", "difficulty"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
