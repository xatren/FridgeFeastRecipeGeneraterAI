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
    <div className="flex flex-col items-center justify-start min-h-screen py-4 bg-background">
      <h1 className="text-2xl font-bold mb-4">Fridge Feast</h1>

      <div className="mb-4 w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>Enter ingredients separated by commas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., chicken, rice, broccoli"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleGenerateRecipes} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/80">
        {loading ? 'Generating...' : 'Generate Recipes'}
      </Button>

      {recipes.length > 0 && (
        <div className="mt-8 w-full max-w-lg">
          <h2 className="text-xl font-semibold mb-2">Generated Recipes</h2>
          {recipes.map((recipe, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
                {rankedRecipes.length > 0 && rankedRecipes[index] && (
                  <CardDescription>
                    Rank: {rankedRecipes[index].rank} - {rankedRecipes[index].reason}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="mb-2">{recipe.instructions}</p>
                <p className="font-semibold">Required Ingredients:</p>
                <ul>
                  {recipe.requiredIngredients.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
