"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SHOP_ITEMS, getShopItem } from "@/lib/shop-items";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * 購買商品
 */
export async function purchaseItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "請先登入" };

  const item = getShopItem(itemId);
  if (!item) return { error: "商品不存在" };

  // Check coins
  const { data: profile } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single();

  if (!profile || profile.coins < item.price) {
    return { error: `金幣不足（需要 ${item.price}，目前 ${profile?.coins ?? 0}）` };
  }

  // Check monthly limit
  if (item.monthlyLimit !== null) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .gte("purchased_at", startOfMonth);

    if ((count ?? 0) >= item.monthlyLimit) {
      return { error: `此商品本月已達購買上限（${item.monthlyLimit} 次）` };
    }
  }

  // Deduct coins (atomic)
  const admin = getSupabaseAdmin();
  const { data: updated } = await admin
    .from("profiles")
    .update({ coins: profile.coins - item.price })
    .eq("id", user.id)
    .gte("coins", item.price) // Optimistic lock
    .select("coins")
    .single();

  if (!updated) {
    return { error: "購買失敗，請重試" };
  }

  // Record purchase
  await admin.from("purchases").insert({
    user_id: user.id,
    item_id: itemId,
    coins_spent: item.price,
  });

  return {
    success: true,
    remainingCoins: updated.coins,
    item: { id: item.id, name: item.name, emoji: item.emoji },
  };
}

/**
 * 取得用戶的購買記錄
 */
export async function getPurchaseHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("purchases")
    .select("id, item_id, coins_spent, purchased_at")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

/**
 * 檢查用戶是否可以購買指定商品（用於 UI 顯示）
 */
export async function canPurchase(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { canBuy: false, reason: "未登入" };

  const item = getShopItem(itemId);
  if (!item) return { canBuy: false, reason: "商品不存在" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("coins")
    .eq("id", user.id)
    .single();

  if (!profile || profile.coins < item.price) {
    return { canBuy: false, reason: "金幣不足" };
  }

  if (item.monthlyLimit !== null) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .gte("purchased_at", startOfMonth);

    if ((count ?? 0) >= item.monthlyLimit) {
      return { canBuy: false, reason: "本月已達上限" };
    }
  }

  return { canBuy: true };
}
