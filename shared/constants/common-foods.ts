/**
 * 常見台灣食物資料庫
 * 熱量與營養素為每份（一般食用份量）的估計值
 */

export interface CommonFood {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: string;
  category: "staple" | "breakfast" | "snack" | "drink" | "soup" | "side" | "fruit" | "dessert";
}

export const COMMON_FOODS: CommonFood[] = [
  // === 主食 ===
  { name: "滷肉飯", calories: 500, protein_g: 18, carbs_g: 65, fat_g: 18, serving_size: "一碗", category: "staple" },
  { name: "雞腿便當", calories: 750, protein_g: 35, carbs_g: 80, fat_g: 28, serving_size: "一個", category: "staple" },
  { name: "排骨便當", calories: 780, protein_g: 30, carbs_g: 82, fat_g: 30, serving_size: "一個", category: "staple" },
  { name: "牛肉麵", calories: 550, protein_g: 28, carbs_g: 60, fat_g: 20, serving_size: "一碗", category: "staple" },
  { name: "乾麵", calories: 380, protein_g: 12, carbs_g: 55, fat_g: 12, serving_size: "一碗", category: "staple" },
  { name: "陽春麵", calories: 350, protein_g: 10, carbs_g: 55, fat_g: 8, serving_size: "一碗", category: "staple" },
  { name: "炒飯", calories: 550, protein_g: 15, carbs_g: 70, fat_g: 22, serving_size: "一盤", category: "staple" },
  { name: "炒麵", calories: 500, protein_g: 14, carbs_g: 62, fat_g: 20, serving_size: "一盤", category: "staple" },
  { name: "水餃", calories: 400, protein_g: 18, carbs_g: 45, fat_g: 15, serving_size: "10 顆", category: "staple" },
  { name: "鍋貼", calories: 450, protein_g: 16, carbs_g: 42, fat_g: 22, serving_size: "10 顆", category: "staple" },
  { name: "肉粽", calories: 480, protein_g: 15, carbs_g: 55, fat_g: 20, serving_size: "一顆", category: "staple" },
  { name: "咖哩飯", calories: 600, protein_g: 20, carbs_g: 75, fat_g: 22, serving_size: "一盤", category: "staple" },
  { name: "燒臘飯", calories: 700, protein_g: 30, carbs_g: 78, fat_g: 28, serving_size: "一盤", category: "staple" },
  { name: "控肉飯", calories: 550, protein_g: 20, carbs_g: 65, fat_g: 22, serving_size: "一碗", category: "staple" },
  { name: "雞肉飯", calories: 400, protein_g: 22, carbs_g: 58, fat_g: 10, serving_size: "一碗", category: "staple" },

  // === 早餐 ===
  { name: "蛋餅", calories: 280, protein_g: 10, carbs_g: 30, fat_g: 13, serving_size: "一份", category: "breakfast" },
  { name: "飯糰", calories: 350, protein_g: 10, carbs_g: 55, fat_g: 10, serving_size: "一個", category: "breakfast" },
  { name: "燒餅油條", calories: 420, protein_g: 10, carbs_g: 48, fat_g: 22, serving_size: "一份", category: "breakfast" },
  { name: "蘿蔔糕", calories: 200, protein_g: 4, carbs_g: 30, fat_g: 8, serving_size: "兩片", category: "breakfast" },
  { name: "豆漿（無糖）", calories: 70, protein_g: 6, carbs_g: 4, fat_g: 3.5, serving_size: "300ml", category: "breakfast" },
  { name: "豆漿（甜）", calories: 120, protein_g: 6, carbs_g: 15, fat_g: 3.5, serving_size: "300ml", category: "breakfast" },
  { name: "三明治", calories: 300, protein_g: 12, carbs_g: 32, fat_g: 14, serving_size: "一個", category: "breakfast" },
  { name: "漢堡", calories: 350, protein_g: 15, carbs_g: 35, fat_g: 16, serving_size: "一個", category: "breakfast" },
  { name: "吐司夾蛋", calories: 250, protein_g: 11, carbs_g: 28, fat_g: 10, serving_size: "一份", category: "breakfast" },

  // === 小吃 / 點心 ===
  { name: "臭豆腐", calories: 350, protein_g: 14, carbs_g: 20, fat_g: 24, serving_size: "一份", category: "snack" },
  { name: "鹹酥雞", calories: 500, protein_g: 25, carbs_g: 30, fat_g: 30, serving_size: "一份", category: "snack" },
  { name: "雞排", calories: 550, protein_g: 30, carbs_g: 25, fat_g: 35, serving_size: "一片", category: "snack" },
  { name: "蔥油餅", calories: 300, protein_g: 6, carbs_g: 38, fat_g: 14, serving_size: "一份", category: "snack" },
  { name: "肉圓", calories: 280, protein_g: 10, carbs_g: 35, fat_g: 12, serving_size: "一顆", category: "snack" },
  { name: "小籠包", calories: 350, protein_g: 16, carbs_g: 35, fat_g: 15, serving_size: "8 顆", category: "snack" },
  { name: "潤餅", calories: 300, protein_g: 10, carbs_g: 40, fat_g: 12, serving_size: "一捲", category: "snack" },
  { name: "蚵仔煎", calories: 350, protein_g: 12, carbs_g: 35, fat_g: 18, serving_size: "一份", category: "snack" },
  { name: "地瓜球", calories: 250, protein_g: 2, carbs_g: 40, fat_g: 10, serving_size: "一份", category: "snack" },

  // === 飲料 ===
  { name: "珍珠奶茶", calories: 450, protein_g: 3, carbs_g: 75, fat_g: 15, serving_size: "700ml", category: "drink" },
  { name: "綠茶（無糖）", calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, serving_size: "500ml", category: "drink" },
  { name: "紅茶拿鐵", calories: 200, protein_g: 5, carbs_g: 30, fat_g: 7, serving_size: "500ml", category: "drink" },
  { name: "多多綠", calories: 280, protein_g: 2, carbs_g: 60, fat_g: 2, serving_size: "700ml", category: "drink" },
  { name: "冬瓜茶", calories: 180, protein_g: 0, carbs_g: 45, fat_g: 0, serving_size: "500ml", category: "drink" },
  { name: "黑咖啡", calories: 5, protein_g: 0.3, carbs_g: 0, fat_g: 0, serving_size: "240ml", category: "drink" },
  { name: "拿鐵咖啡", calories: 150, protein_g: 7, carbs_g: 12, fat_g: 8, serving_size: "350ml", category: "drink" },
  { name: "美式咖啡", calories: 10, protein_g: 0.5, carbs_g: 1, fat_g: 0, serving_size: "350ml", category: "drink" },

  // === 湯品 ===
  { name: "貢丸湯", calories: 120, protein_g: 8, carbs_g: 8, fat_g: 6, serving_size: "一碗", category: "soup" },
  { name: "酸辣湯", calories: 100, protein_g: 5, carbs_g: 10, fat_g: 4, serving_size: "一碗", category: "soup" },
  { name: "味噌湯", calories: 50, protein_g: 3, carbs_g: 5, fat_g: 2, serving_size: "一碗", category: "soup" },
  { name: "玉米濃湯", calories: 150, protein_g: 4, carbs_g: 22, fat_g: 6, serving_size: "一碗", category: "soup" },

  // === 配菜 / 簡單食物 ===
  { name: "滷蛋", calories: 80, protein_g: 7, carbs_g: 1, fat_g: 5, serving_size: "一顆", category: "side" },
  { name: "茶葉蛋", calories: 75, protein_g: 7, carbs_g: 1, fat_g: 5, serving_size: "一顆", category: "side" },
  { name: "燙青菜", calories: 50, protein_g: 2, carbs_g: 5, fat_g: 3, serving_size: "一份", category: "side" },
  { name: "白飯", calories: 280, protein_g: 5, carbs_g: 62, fat_g: 0.5, serving_size: "一碗", category: "side" },
  { name: "地瓜", calories: 120, protein_g: 1.5, carbs_g: 28, fat_g: 0.2, serving_size: "一條(中)", category: "side" },
  { name: "玉米", calories: 100, protein_g: 3, carbs_g: 22, fat_g: 1, serving_size: "一根", category: "side" },
  { name: "雞胸肉", calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, serving_size: "100g", category: "side" },

  // === 水果 ===
  { name: "香蕉", calories: 90, protein_g: 1, carbs_g: 23, fat_g: 0.3, serving_size: "一根", category: "fruit" },
  { name: "蘋果", calories: 80, protein_g: 0.4, carbs_g: 21, fat_g: 0.2, serving_size: "一顆(中)", category: "fruit" },
  { name: "芭樂", calories: 60, protein_g: 2, carbs_g: 14, fat_g: 0.5, serving_size: "一顆(中)", category: "fruit" },
  { name: "芒果", calories: 100, protein_g: 1, carbs_g: 25, fat_g: 0.5, serving_size: "一顆(中)", category: "fruit" },
  { name: "鳳梨", calories: 75, protein_g: 0.8, carbs_g: 20, fat_g: 0.2, serving_size: "一碗(切塊)", category: "fruit" },

  // === 甜點 ===
  { name: "豆花", calories: 180, protein_g: 6, carbs_g: 30, fat_g: 4, serving_size: "一碗", category: "dessert" },
  { name: "仙草凍", calories: 100, protein_g: 0.5, carbs_g: 25, fat_g: 0, serving_size: "一碗", category: "dessert" },
  { name: "鳳梨酥", calories: 180, protein_g: 2, carbs_g: 28, fat_g: 7, serving_size: "一顆", category: "dessert" },
  { name: "蛋塔", calories: 220, protein_g: 4, carbs_g: 25, fat_g: 12, serving_size: "一顆", category: "dessert" },
];

/**
 * 搜尋本地食物庫（模糊比對）
 */
export function searchCommonFoods(query: string): CommonFood[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return COMMON_FOODS.filter((food) => food.name.toLowerCase().includes(q));
}
