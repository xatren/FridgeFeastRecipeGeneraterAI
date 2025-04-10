'use server';
/**
 * @fileOverview Ranks recipes based on relevance and completeness of ingredients.
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
});
export type RankRecipesInput = z.infer<typeof RankRecipesInputSchema>;

const RankRecipesOutputSchema = z.array(
  z.object({
    recipe: z.string().describe('The recipe.'),
    rank: z.number().describe('The rank of the recipe based on relevance and completeness of ingredients. Higher is better.'),
    reason: z.string().describe('The reason for the ranking.'),
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
    }),
  },
  output: {
    schema: z.array(
      z.object({
        recipe: z.string().describe('The recipe.'),
        rank: z.number().describe('The rank of the recipe based on relevance and completeness of ingredients. Higher is better.'),
        reason: z.string().describe('The reason for the ranking.'),
      })
    ),
  },
  prompt: `You are a recipe ranking expert. Given the following ingredients and recipes, rank the recipes based on how well they match the ingredients.

Ingredients:
{{#each ingredients}}{{{this}}}\n{{/each}}

Recipes:
{{#each recipes}}{{{this}}}\n{{/each}}

Rank each recipe based on relevance and completeness of ingredients. The rank should be a number between 0 and 10, where 10 is the best match.
Also provide a reason for the ranking.

Return a JSON array of objects with the following format:
[{
  "recipe": "recipe name",
  "rank": rank,
  "reason": "reason for ranking"
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
    return output!;
  }
);
