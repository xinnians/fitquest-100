"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { MEAL_TYPES } from "shared/constants/nutrients";
import { createMeal, deleteMeal } from "@/lib/meal-actions";
import { searchFood, type FoodSearchResult } from "@/lib/food-search";
import { NutrientChart } from "@/components/features/nutrient-chart";
import { useRouter } from "next/navigation";

interface Meal {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  eaten_at: string;
}

export function DietClient({ initialMeals }: { initialMeals: Meal[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Manual input state
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [error, setError] = useState("");

  // Totals
  const totalCalories = initialMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = initialMeals.reduce((sum, m) => sum + (m.protein_g ?? 0), 0);
  const totalCarbs = initialMeals.reduce((sum, m) => sum + (m.carbs_g ?? 0), 0);
  const totalFat = initialMeals.reduce((sum, m) => sum + (m.fat_g ?? 0), 0);

  // Debounced autocomplete
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const results = await searchFood(query);
    setSearchResults(results);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, doSearch]);

  function selectFood(food: FoodSearchResult) {
    setFoodName(food.name);
    setCalories(String(food.calories));
    setProteinG(String(food.protein_g));
    setCarbsG(String(food.carbs_g));
    setFatG(String(food.fat_g));
    setSearchResults([]);
    setSearchQuery("");
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = await createMeal(formData);
    if (result && "error" in result) {
      setError(result.error ?? "發生錯誤");
      return;
    }
    // Reset form
    setFoodName("");
    setCalories("");
    setProteinG("");
    setCarbsG("");
    setFatG("");
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(mealId: string) {
    startTransition(async () => {
      await deleteMeal(mealId);
      router.refresh();
    });
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">飲食記錄</h1>
          <p className="mt-1 text-sm text-muted">今日攝取 {totalCalories} kcal</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
        >
          {showForm ? "取消" : "+ 記錄"}
        </button>
      </div>

      {/* Nutrient Summary */}
      {initialMeals.length > 0 && (
        <section className="mt-4 rounded-xl border border-border bg-card p-4 shadow-card">
          <h3 className="mb-2 font-heading text-base font-bold">營養素分佈</h3>
          <NutrientChart protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
        </section>
      )}

      {/* Add Meal Form */}
      {showForm && (
        <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
          {/* Meal Type */}
          <div className="mb-4 flex gap-2">
            {MEAL_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedMealType(type.id)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                  selectedMealType === type.id
                    ? "bg-primary text-white"
                    : "border border-border text-muted hover:text-foreground"
                }`}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>

          {/* Food Search — debounced autocomplete */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="搜尋食物名稱..."
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                  搜尋中...
                </span>
              )}
            </div>

            {searchQuery.length > 0 && !isSearching && searchResults.length === 0 && (
              <p className="mt-2 text-center text-xs text-muted">找不到結果，請手動輸入</p>
            )}

            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border">
                {searchResults.map((food, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectFood(food)}
                    className="w-full border-b border-border px-3 py-2 text-left text-sm last:border-0 hover:bg-background"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{food.name}</p>
                      {food.source === "local" && (
                        <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                          台灣
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {food.calories} kcal · P{food.protein_g}g · C{food.carbs_g}g · F{food.fat_g}g
                      <span className="ml-1 text-muted/70">({food.serving_size})</span>
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manual Input */}
          <form action={handleSubmit} className="space-y-3">
            <input type="hidden" name="meal_type" value={selectedMealType} />
            <div>
              <input
                name="food_name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="食物名稱"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted">卡路里 (kcal)</label>
                <input
                  name="calories"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">蛋白質 (g)</label>
                <input
                  name="protein_g"
                  type="number"
                  step="0.1"
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">碳水 (g)</label>
                <input
                  name="carbs_g"
                  type="number"
                  step="0.1"
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">脂肪 (g)</label>
                <input
                  name="fat_g"
                  type="number"
                  step="0.1"
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-3 font-bold text-white transition-colors hover:bg-accent-hover"
            >
              記錄飲食
            </button>
          </form>
        </section>
      )}

      {/* Today's Meals List */}
      <section className="mt-6 space-y-3">
        <h3 className="font-heading text-lg font-bold">今日記錄</h3>
        {initialMeals.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-3xl">🍽️</p>
            <p className="mt-2 text-sm text-muted">還沒有記錄，點擊上方「+ 記錄」開始</p>
          </div>
        ) : (
          <>
            {MEAL_TYPES.map((type) => {
              const meals = initialMeals.filter((m) => m.meal_type === type.id);
              if (meals.length === 0) return null;
              return (
                <div key={type.id}>
                  <p className="mb-1 text-xs font-medium text-muted">
                    {type.emoji} {type.label}
                  </p>
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="mb-2 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{meal.food_name}</p>
                        <p className="text-xs text-muted">
                          {meal.calories} kcal
                          {meal.protein_g != null && ` · P${meal.protein_g}g`}
                          {meal.carbs_g != null && ` · C${meal.carbs_g}g`}
                          {meal.fat_g != null && ` · F${meal.fat_g}g`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        disabled={isPending}
                        className="text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </section>
    </main>
  );
}
