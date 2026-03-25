import { getPlayerStats } from "@/lib/reward-actions";
import { SHOP_ITEMS } from "@/lib/shop-items";
import { ShopClient } from "./shop-client";

export default async function ShopPage() {
  const stats = await getPlayerStats();

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">獎勵商店</h1>
          <p className="mt-1 text-sm text-muted">使用金幣兌換道具</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1.5">
          <span className="text-sm">🪙</span>
          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
            {stats?.coins ?? 0}
          </span>
        </div>
      </div>

      <ShopClient items={SHOP_ITEMS} initialCoins={stats?.coins ?? 0} />
    </main>
  );
}
