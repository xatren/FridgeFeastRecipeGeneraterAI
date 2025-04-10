'use client';

import {generateRecipe} from '@/ai/flows/generate-recipe';
import {rankRecipes} from '@/ai/flows/rank-recipes';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useEffect, useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

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
      nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
      };
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];
  const cuisineOptions = ['Italian', 'Mexican', 'Indian', 'Chinese', 'American'];

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

        const ranked = await rankRecipes({
          ingredients: ingredientList,
          recipes: recipeStrings,
          dietaryRestrictions: dietaryRestrictions,
          cuisinePreferences: cuisinePreferences,
        });
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
    <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-background rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Fridge Feast</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md md:max-w-3xl px-4">
        {/* Ingredients Input */}
        <Card className="w-full">
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

        {/* Preferences Input */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Set your dietary restrictions and cuisine preferences.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label htmlFor="dietary-restrictions">Dietary Restrictions</Label>
              <Select
                multiple
                id="dietary-restrictions"
                onValueChange={(values: string[]) => setDietaryRestrictions(values)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select restrictions" />
                </SelectTrigger>
                <SelectContent>
                  {dietaryOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cuisine-preferences">Cuisine Preferences</Label>
              <Select
                multiple
                id="cuisine-preferences"
                onValueChange={(values: string[]) => setCuisinePreferences(values)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select cuisines" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Generated Recipes */}
        {recipes.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Generated Recipes</CardTitle>
              <CardDescription>
                Here are some recipes based on your ingredients and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recipes.map((recipe, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{recipe.name}</h3>
                  {rankedRecipes.length > 0 && rankedRecipes[index] && (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        Rank: {rankedRecipes[index].rank} - {rankedRecipes[index].reason}
                      </p>
                      {rankedRecipes[index].nutrition && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Calories: {rankedRecipes[index].nutrition?.calories}, Protein: {rankedRecipes[index].nutrition?.protein}g, Carbs: {rankedRecipes[index].nutrition?.carbs}g, Fat: {rankedRecipes[index].nutrition?.fat}g
                        </p>
                      )}
                    </>
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
