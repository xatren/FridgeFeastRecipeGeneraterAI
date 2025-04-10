'use server';
/**
 * @fileOverview Ranks recipes based on relevance, completeness of ingredients, and dietary restrictions.
 *
 * - rankRecipes - A function that ranks recipes based on relevance and completeness of ingredients.
 * - RankRecipesInput - The input type for the rankRecipes function.
 * - RankRecipesOutput - The return type for the rankRecipes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RankRecipesInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients available in the fridge.'),
  recipes: z.array(z.string()).describe('A list of recipe suggestions.'),
  dietaryRestrictions: z.array(z.string()).optional().describe('A list of dietary restrictions (e.g., vegetarian, vegan, gluten-free).'),
  cuisinePreferences: z.array(z.string()).optional().describe('A list of preferred cuisine types (e.g., Italian, Mexican, Indian).'),
});
export type RankRecipesInput = z.infer<typeof RankRecipesInputSchema>;

const RankRecipesOutputSchema = z.array(
  z.object({
    recipe: z.string().describe('The recipe.'),
    rank: z.number().describe('The rank of the recipe based on relevance and completeness of ingredients, and dietary restrictions. Higher is better.'),
    reason: z.string().describe('The reason for the ranking.'),
    nutrition: z.object({
      calories: z.number().optional().describe('The number of calories in the recipe.'),
      protein: z.number().optional().describe('The amount of protein in the recipe (in grams).'),
      carbs: z.number().optional().describe('The amount of carbohydrates in the recipe (in grams).'),
      fat: z.number().optional().describe('The amount of fat in the recipe (in grams).'),
    }).optional().describe('Nutritional information for the recipe.'),
  })
);
export type RankRecipesOutput = z.infer<typeof RankRecipesOutputSchema>;

export async function rankRecipes(input: RankRecipesInput): Promise<RankRecipesOutput> {
  return rankRecipesFlow(input);
}

const rankRecipesPrompt = ai.definePrompt({
  name: 'rankRecipesPrompt',
  input: {
    schema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients available in the fridge.'),
      recipes: z.array(z.string()).describe('A list of recipe suggestions.'),
      dietaryRestrictions: z.array(z.string()).optional().describe('A list of dietary restrictions (e.g., vegetarian, vegan, gluten-free).'),
      cuisinePreferences: z.array(z.string()).optional().describe('A list of preferred cuisine types (e.g., Italian, Mexican, Indian).'),
    }),
  },
  output: {
    schema: z.array(
      z.object({
        recipe: z.string().describe('The recipe.'),
        rank: z.number().describe('The rank of the recipe based on relevance and completeness of ingredients, and dietary restrictions. Higher is better.'),
        reason: z.string().describe('The reason for the ranking.'),
        nutrition: z.object({
          calories: z.number().optional().describe('The number of calories in the recipe.'),
          protein: z.number().optional().describe('The amount of protein in the recipe (in grams).'),
          carbs: z.number().optional().describe('The amount of carbohydrates in the recipe (in grams).'),
          fat: z.number().optional().describe('The amount of fat in the recipe (in grams).'),
        }).optional().describe('Nutritional information for the recipe.'),
      })
    ),
  },
  prompt: `You are a recipe ranking expert. Given the following ingredients and recipes, rank the recipes based on how well they match the ingredients, dietary restrictions, and cuisine preferences.

Ingredients:
{{#each ingredients}}{{{this}}}\n{{/each}}

Recipes:
{{#each recipes}}{{{this}}}\n{{/each}}

{{#if dietaryRestrictions}}
Dietary Restrictions:
{{#each dietaryRestrictions}}{{{this}}}\n{{/each}}
{{/if}}

{{#if cuisinePreferences}}
Cuisine Preferences:
{{#each cuisinePreferences}}{{{this}}}\n{{/each}}
{{/if}}

Rank each recipe based on relevance and completeness of ingredients. The rank should be a number between 0 and 10, where 10 is the best match.
Also consider dietary restrictions and cuisine preferences when ranking.  If a recipe does not meet the dietary restrictions, it should be ranked lower.  If a recipe matches the cuisine preferences, it should be ranked higher.
Also provide a reason for the ranking.

Return a JSON array of objects with the following format:
[{
  "recipe": "recipe name",
  "rank": rank,
  "reason": "reason for ranking",
  "nutrition": {
    "calories": calories,
    "protein": protein,
    "carbs": carbs,
    "fat": fat
  }
}]`,
});

const rankRecipesFlow = ai.defineFlow<typeof RankRecipesInputSchema, typeof RankRecipesOutputSchema>(
  {
    name: 'rankRecipesFlow',
    inputSchema: RankRecipesInputSchema,
    outputSchema: RankRecipesOutputSchema,
  },
  async input => {
    const {output} = await rankRecipesPrompt(input);

    // Simulate fetching nutritional information from an API
    const recipesWithNutrition = output!.map(recipe => {
      // In a real application, you would call a nutrition API here
      // and populate the nutrition field with the results.
      return {
        ...recipe,
        nutrition: {
          calories: Math.floor(Math.random() * 500 + 200), // Random calories between 200 and 700
          protein: Math.floor(Math.random() * 30 + 10),    // Random protein between 10 and 40g
          carbs: Math.floor(Math.random() * 50 + 20),      // Random carbs between 20 and 70g
          fat: Math.floor(Math.random() * 20 + 5),        // Random fat between 5 and 25g
        },
      };
    });

    return recipesWithNutrition;
  }
);
