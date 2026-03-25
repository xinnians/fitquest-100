"use client";

import { useState } from "react";
import { purchaseItem } from "@/lib/shop-actions";
import type { ShopItem } from "@/lib/shop-items";

const CATEGORY_LABELS: Record<string, string> = {
  utility: "實用道具",
  cosmetic: "裝飾道具",
};

export function ShopClient({ items, initialCoins }: { items: ShopItem[]; initialCoins: number }) {
  const [coins, setCoins] = useState(initialCoins);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const categories = [...new Set(items.map((i) => i.category))];

  async function handlePurchase(itemId: string) {
    setPurchasing(itemId);
    setMessage(null);

    const result = await purchaseItem(itemId);
    if (result && "error" in result) {
      setMessage({ type: "error", text: result.error ?? "購買失敗" });
    } else if (result && "success" in result) {
      setCoins(result.remainingCoins ?? coins);
      setMessage({
        type: "success",
        text: `成功購買 ${result.item?.emoji} ${result.item?.name}！`,
      });
    }

    setPurchasing(null);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <>
      {message && (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-center text-sm animate-fade-in-up ${
            message.type === "success"
              ? "bg-accent/10 text-accent"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 space-y-6">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 font-heading text-lg font-bold">{CATEGORY_LABELS[cat] ?? cat}</h2>
            <div className="space-y-3">
              {items
                .filter((item) => item.category === cat)
                .map((item) => {
                  const canAfford = coins >= item.price;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted">{item.description}</p>
                        {item.monthlyLimit && (
                          <p className="text-[10px] text-muted/70">每月限 {item.monthlyLimit} 次</p>
                        )}
                      </div>
                      <button
                        onClick={() => handlePurchase(item.id)}
                        disabled={!canAfford || purchasing === item.id}
                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition-all ${
                          canAfford
                            ? "bg-primary text-white hover:bg-primary-hover"
                            : "bg-muted/20 text-muted cursor-not-allowed"
                        }`}
                      >
                        {purchasing === item.id ? "..." : `${item.price} 🪙`}
                      </button>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
