"use server";

export interface FoodSearchResult {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: string;
}

export async function searchFood(query: string): Promise<FoodSearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments,serving_size`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const products = data.products ?? [];

    return products
      .filter((p: Record<string, unknown>) => p.product_name && p.nutriments)
      .map((p: Record<string, Record<string, number> & { serving_size?: string }>) => ({
        name: p.product_name as unknown as string,
        calories: Math.round(p.nutriments?.["energy-kcal_100g"] ?? 0),
        protein_g: Math.round((p.nutriments?.proteins_100g ?? 0) * 10) / 10,
        carbs_g: Math.round((p.nutriments?.carbohydrates_100g ?? 0) * 10) / 10,
        fat_g: Math.round((p.nutriments?.fat_100g ?? 0) * 10) / 10,
        serving_size: (p.serving_size as unknown as string) ?? "100g",
      }))
      .slice(0, 8);
  } catch {
    return [];
  }
}
