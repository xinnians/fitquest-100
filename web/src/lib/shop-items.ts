/**
 * 靜態商品目錄
 */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  price: number;
  category: "utility" | "cosmetic";
  /** 每月最多購買次數（null = 無限） */
  monthlyLimit: number | null;
}

export const SHOP_ITEMS: ShopItem[] = [
  // === 實用道具 ===
  {
    id: "streak_revival",
    name: "連續打卡復活",
    description: "恢復中斷的連續打卡天數（每月限 2 次）",
    emoji: "💖",
    price: 50,
    category: "utility",
    monthlyLimit: 2,
  },
  {
    id: "wheel_extra",
    name: "轉盤額外一轉",
    description: "今天再多轉一次運動轉盤",
    emoji: "🎰",
    price: 10,
    category: "utility",
    monthlyLimit: null,
  },

  // === 裝飾道具（預留） ===
  {
    id: "title_ironman",
    name: "稱號：鐵人",
    description: "在個人頁面顯示「鐵人」稱號",
    emoji: "🏅",
    price: 100,
    category: "cosmetic",
    monthlyLimit: null,
  },
  {
    id: "title_legend",
    name: "稱號：傳說",
    description: "在個人頁面顯示「傳說」稱號",
    emoji: "👑",
    price: 500,
    category: "cosmetic",
    monthlyLimit: null,
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}
