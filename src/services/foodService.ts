import { CustomError } from '../utils/customError';

interface FoodSearchResult {
  id: number;
  title: string;
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
  image: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

class FoodService {
  private static readonly BASE_URL = 'https://api.spoonacular.com';
  private static readonly API_KEY = process.env.SPOONACULAR_API_KEY;

  /**
   * Search for foods by query string
   */
  static async searchFood(query: string, number: number = 10): Promise<FoodSearchResult[]> {
    try {
      if (!this.API_KEY) {
        throw new CustomError('Spoonacular API key not configured', 500);
      }

      const params = new URLSearchParams({
        apiKey: this.API_KEY,
        query: query.trim(),
        number: Math.min(number, 5).toString(),
        addRecipeInformation: 'true',
        fillIngredients: 'false'
      });

      // Use the recipes/complexSearch endpoint which searches by name and includes nutrition
      const response = await fetch(`${this.BASE_URL}/recipes/complexSearch?${params}`);
      
      if (!response.ok) {
        if (response.status === 402) {
          throw new CustomError('API quota exceeded', 429);
        }
        if (response.status === 401) {
          throw new CustomError('Invalid API key', 401);
        }
        if (response.status === 429) {
          throw new CustomError('Rate limit exceeded', 429);
        }
        throw new CustomError(`API request failed: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // Return recipe results with basic nutrition info
      return (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        calories: item.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
        protein: item.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
        fat: item.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
        carbs: item.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
        image: item.image || ''
      }));
    } catch (error: any) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to search food', 500);
    }
  }

  /**
   * Get detailed nutrition information for a specific food
   */
  static async getFoodNutrition(foodId: number): Promise<NutritionInfo> {
    try {
      if (!this.API_KEY) {
        throw new CustomError('Spoonacular API key not configured', 500);
      }

      const params = new URLSearchParams({
        apiKey: this.API_KEY
      });

      // Use the food information endpoint which includes nutrition data
      const response = await fetch(`${this.BASE_URL}/food/${foodId}/information?${params}`);
      
      if (!response.ok) {
        throw new CustomError(`API request failed: ${response.status}`, response.status);
      }

      const data = await response.json();
      
      // Extract nutrition data from the response
      const nutrients = data.nutrition?.nutrients || [];
      
      const calories = nutrients.find((n: any) => n.name === 'Calories')?.amount || 0;
      const protein = nutrients.find((n: any) => n.name === 'Protein')?.amount || 0;
      const fat = nutrients.find((n: any) => n.name === 'Fat')?.amount || 0;
      const carbs = nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;

      return {
        calories: calories,
        protein: protein,
        fat: fat,
        carbs: carbs
      };
    } catch (error: any) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get nutrition info', 500);
    }
  }

  /**
   * Get nutrition information for a food by name
   */
  static async getNutritionByName(foodName: string): Promise<NutritionInfo> {
    try {
      const searchResults = await this.searchFood(foodName, 1);
      if (searchResults.length === 0) {
        throw new CustomError('Food not found', 404);
      }

      const food = searchResults[0];
      return {
        calories: food.calories,
        protein: parseFloat(food.protein.toString()),
        fat: parseFloat(food.fat.toString()),
        carbs: parseFloat(food.carbs.toString())
      };
    } catch (error: any) {
      throw new CustomError('Failed to get nutrition info', 500);
    }
  }
}

export default FoodService;
