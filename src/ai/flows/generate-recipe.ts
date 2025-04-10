'use server';
/**
 * @fileOverview Generates recipe suggestions based on a list of ingredients.
 *
 * - generateRecipe - A function that generates recipe suggestions.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      instructions: z.string().describe('The instructions for the recipe.'),
      requiredIngredients: z
        .array(z.string())
        .describe('The list of ingredients required for the recipe.'),
    })
  ),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {
    schema: z.object({
      ingredients: z
        .string()
        .describe('A comma-separated list of ingredients available.'),
    }),
  },
  output: {
    schema: z.object({
      recipes: z.array(
        z.object({
          name: z.string().describe('The name of the recipe.'),
          instructions: z.string().describe('The instructions for the recipe.'),
          requiredIngredients: z
            .array(z.string())
            .describe('The list of ingredients required for the recipe.'),
        })
      ),
    }),
  },
  prompt: `You are a world-class chef. Given the following ingredients, suggest a few recipes.

Ingredients: {{{ingredients}}}

Return a JSON array of recipes. Each recipe should have a name, instructions, and a list of requiredIngredients.
`,
});

const generateRecipeFlow = ai.defineFlow<
  typeof GenerateRecipeInputSchema,
  typeof GenerateRecipeOutputSchema
>({
  name: 'generateRecipeFlow',
  inputSchema: GenerateRecipeInputSchema,
  outputSchema: GenerateRecipeOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
