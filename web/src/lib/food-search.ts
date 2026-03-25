"use server";

import { searchCommonFoods } from "shared/constants/common-foods";

export interface FoodSearchResult {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: string;
  source: "local" | "api";
}

export async function searchFood(query: string): Promise<FoodSearchResult[]> {
  if (!query || query.length < 1) return [];

  // 1. 先搜本地台灣食物庫
  const localResults: FoodSearchResult[] = searchCommonFoods(query).map((f) => ({
    name: f.name,
    calories: f.calories,
    protein_g: f.protein_g,
    carbs_g: f.carbs_g,
    fat_g: f.fat_g,
    serving_size: f.serving_size,
    source: "local" as const,
  }));

  // 本地結果足夠多就直接回傳
  if (localResults.length >= 5) return localResults.slice(0, 8);

  // 2. 不足則 fallback Open Food Facts API
  if (query.length < 2) return localResults;

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments,serving_size`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return localResults;

    const data = await res.json();
    const products = data.products ?? [];

    const apiResults: FoodSearchResult[] = products
      .filter((p: Record<string, unknown>) => p.product_name && p.nutriments)
      .map((p: Record<string, Record<string, number> & { serving_size?: string }>) => ({
        name: p.product_name as unknown as string,
        calories: Math.round(p.nutriments?.["energy-kcal_100g"] ?? 0),
        protein_g: Math.round((p.nutriments?.proteins_100g ?? 0) * 10) / 10,
        carbs_g: Math.round((p.nutriments?.carbohydrates_100g ?? 0) * 10) / 10,
        fat_g: Math.round((p.nutriments?.fat_100g ?? 0) * 10) / 10,
        serving_size: (p.serving_size as unknown as string) ?? "100g",
        source: "api" as const,
      }))
      .slice(0, 8 - localResults.length);

    return [...localResults, ...apiResults];
  } catch {
    return localResults;
  }
}
