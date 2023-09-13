export interface Recipe {
  id?: string;
  slug: string;
  title: string;
  categories: string[];
  cuisine: string;
  prepTime: number;
  cookTime: number;
  recipeUrl: string;
  created: string;
}