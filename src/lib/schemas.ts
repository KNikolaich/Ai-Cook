import { z } from "zod";

export const IngredientSchema = z.object({
  name: z.string().describe("Название ингредиента"),
  amount: z.string().optional().describe("Количество (например, 2 шт, 500г)"),
});

export const RecipeSchema = z.object({
  title: z.string().describe("Название блюда"),
  description: z.string().describe("Краткое описание"),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string()
  })).describe("Список ингредиентов для рецепта"),
  instructions: z.array(z.string()).describe("Пошаговая инструкция приготовления"),
  cookingTime: z.string().describe("Время приготовления"),
  difficulty: z.enum(["Легко", "Средне", "Сложно"]).describe("Сложность"),
  calories: z.number().optional().describe("Калорийность"),
});

export const AnalysisResultSchema = z.object({
  ingredients: z.array(IngredientSchema),
  suggestedRecipes: z.array(z.string()).describe("Названия 3-5 блюд, которые можно приготовить"),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const UserPreferencesSchema = z.object({
  diet: z.enum(["Без ограничений", "Вегетарианец", "Веган"]),
  allergies: z.array(z.string()),
  customPreferences: z.array(z.string()),
  autoRead: z.boolean().default(true),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
