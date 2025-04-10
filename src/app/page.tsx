'use client';

import {generateRecipe} from '@/ai/flows/generate-recipe';
import {rankRecipes} from '@/ai/flows/rank-recipes';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useEffect, useState} from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<
    {
      name: string;
      instructions: string;
      requiredIngredients: string[];
    }[]
  >([]);
  const [rankedRecipes, setRankedRecipes] = useState<
    {
      recipe: string;
      rank: number;
      reason: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateRecipes = async () => {
    setLoading(true);
    try {
      const recipeData = await generateRecipe({ingredients});
      if (recipeData?.recipes) {
        setRecipes(recipeData.recipes);
        // Rank recipes immediately after generating
        const recipeStrings = recipeData.recipes.map(
          recipe => `${recipe.name}: ${recipe.instructions}`
        );
        const ingredientList = ingredients.split(',').map(item => item.trim());

        const ranked = await rankRecipes({ingredients: ingredientList, recipes: recipeStrings});
        setRankedRecipes(ranked);
      }
    } catch (error) {
      console.error('Error generating recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, [rankedRecipes]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-10 bg-background rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Fridge Feast</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
        {/* Ingredients Input */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>Enter ingredients, separated by commas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., chicken, rice, broccoli"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Generated Recipes */}
        {recipes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Recipes</CardTitle>
              <CardDescription>
                Here are some recipes based on your ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recipes.map((recipe, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>
                  {rankedRecipes.length > 0 && rankedRecipes[index] && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Rank: {rankedRecipes[index].rank} - {rankedRecipes[index].reason}
                    </p>
                  )}
                  <p className="mb-2">{recipe.instructions}</p>
                  <p className="font-semibold">Required Ingredients:</p>
                  <ul>
                    {recipe.requiredIngredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Button
        onClick={handleGenerateRecipes}
        disabled={loading}
        className="mt-6 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-8 py-3 font-semibold"
      >
        {loading ? 'Generating...' : 'Generate Recipes'}
      </Button>
    </div>
  );
}
