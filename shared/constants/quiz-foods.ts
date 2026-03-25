/**
 * 猜猜熱量遊戲用食物資料
 */

export interface QuizFood {
  name: string;
  emoji: string;
  calories: number;
  serving: string;
}

export const QUIZ_FOODS: QuizFood[] = [
  { name: "珍珠奶茶", emoji: "🧋", calories: 450, serving: "700ml" },
  { name: "雞排", emoji: "🍗", calories: 550, serving: "一片" },
  { name: "滷肉飯", emoji: "🍚", calories: 500, serving: "一碗" },
  { name: "蛋餅", emoji: "🥞", calories: 280, serving: "一份" },
  { name: "臭豆腐", emoji: "🫕", calories: 350, serving: "一份" },
  { name: "香蕉", emoji: "🍌", calories: 90, serving: "一根" },
  { name: "鹹酥雞", emoji: "🍿", calories: 500, serving: "一份" },
  { name: "牛肉麵", emoji: "🍜", calories: 550, serving: "一碗" },
  { name: "蘋果", emoji: "🍎", calories: 80, serving: "一顆" },
  { name: "飯糰", emoji: "🍙", calories: 350, serving: "一個" },
  { name: "小籠包", emoji: "🥟", calories: 350, serving: "8 顆" },
  { name: "拿鐵咖啡", emoji: "☕", calories: 150, serving: "350ml" },
  { name: "白飯", emoji: "🍚", calories: 280, serving: "一碗" },
  { name: "水餃", emoji: "🥟", calories: 400, serving: "10 顆" },
  { name: "蚵仔煎", emoji: "🥘", calories: 350, serving: "一份" },
  { name: "豆花", emoji: "🍮", calories: 180, serving: "一碗" },
  { name: "雞胸肉", emoji: "🥩", calories: 165, serving: "100g" },
  { name: "冬瓜茶", emoji: "🥤", calories: 180, serving: "500ml" },
  { name: "芭樂", emoji: "🍐", calories: 60, serving: "一顆" },
  { name: "鳳梨酥", emoji: "🍰", calories: 180, serving: "一顆" },
  { name: "蔥油餅", emoji: "🫓", calories: 300, serving: "一份" },
  { name: "肉圓", emoji: "🟤", calories: 280, serving: "一顆" },
  { name: "炒飯", emoji: "🍳", calories: 550, serving: "一盤" },
  { name: "黑咖啡", emoji: "☕", calories: 5, serving: "240ml" },
  { name: "地瓜", emoji: "🍠", calories: 120, serving: "一條" },
];
