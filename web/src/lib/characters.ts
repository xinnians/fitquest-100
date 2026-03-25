export interface Character {
  id: string;
  name: string;
  emoji: string;
  sport: string;
  color: string;
  imagePath: string;
  description: string;
}

export const CHARACTERS: Character[] = [
  {
    id: "flamey",
    name: "Flamey",
    emoji: "\u{1F525}",
    sport: "綜合健身",
    color: "#FEF3C7",
    imagePath: "/characters/flamey.png",
    description: "熱情如火的健身小夥伴，每天都充滿能量！",
  },
  {
    id: "bubbles",
    name: "Bubbles",
    emoji: "\u{1F4A7}",
    sport: "游泳",
    color: "#DBEAFE",
    imagePath: "/characters/bubbles.png",
    description: "水中的小精靈，游泳就是他的超能力。",
  },
  {
    id: "twinkle",
    name: "Twinkle",
    emoji: "✨",
    sport: "瑞士球",
    color: "#F3E8FF",
    imagePath: "/characters/twinkle.png",
    description: "閃閃發光的星星小彬伴，帶你提升全身協調力。",
  },
  {
    id: "mochi",
    name: "Mochi",
    emoji: "\u{1F361}",
    sport: "瑜伽",
    color: "#FCE7F3",
    imagePath: "/characters/mochi.png",
    description: "軟綿綿的麻糣小彬伴，最愛柔軟伸展。",
  },
  {
    id: "bolt",
    name: "Bolt",
    emoji: "⚡",
    sport: "短跑",
    color: "#FEF9C3",
    imagePath: "/characters/bolt.png",
    description: "電光般的速度，沒人跟得上他！",
  },
  {
    id: "rocky",
    name: "Rocky",
    emoji: "\u{1FAA8}",
    sport: "重訓",
    color: "#E2E8F0",
    imagePath: "/characters/rocky.png",
    description: "堅如磐石的力量型夥伴，擉鐵就是他的日常。",
  },
  {
    id: "wheely",
    name: "Wheely",
    emoji: "\u{1F6B4}",
    sport: "单車",
    color: "#ECFCCB",
    imagePath: "/characters/wheely.png",
    description: "風馳電掣的單車小將，愛在路上奔馳。",
  },
  {
    id: "bouncy",
    name: "Bouncy",
    emoji: "\u{1F3C0}",
    sport: "籃球",
    color: "#FED7AA",
    imagePath: "/characters/bouncy.png",
    description: "彈跳力滿點的籃球小將！",
  },
  {
    id: "punchy",
    name: "Punchy",
    emoji: "\u{1F94A}",
    sport: "拳擊",
    color: "#FECACA",
    imagePath: "/characters/punchy.png",
    description: "出拳如風，打拳就是最好的紓壓方式！",
  },
  {
    id: "cliffy",
    name: "Cliffy",
    emoji: "\u{1F9D7}",
    sport: "攀岩",
    color: "#D9F99D",
    imagePath: "/characters/cliffy.png",
    description: "勇敢向上的攀岩小達人，沒有他爭不上的峰。",
  },
  {
    id: "surfy",
    name: "Surfy",
    emoji: "\u{1F3C4}",
    sport: "衝浪",
    color: "#BAE6FD",
    imagePath: "/characters/surfy.png",
    description: "乘風破浪的衝浪小將，海洋就是他的遊樂場。",
  },
  {
    id: "smash",
    name: "Smash",
    emoji: "\u{1F3F8}",
    sport: "羽球",
    color: "#C7D2FE",
    imagePath: "/characters/smash.png",
    description: "殺球王者，在球場上所向無敵！",
  },
  {
    id: "frosty",
    name: "Frosty",
    emoji: "❄️",
    sport: "滑冰",
    color: "#E0F2FE",
    imagePath: "/characters/frosty.png",
    description: "冰上的優雅舞者，滑冰就像飛一樣。",
  },
  {
    id: "arrow",
    name: "Arrow",
    emoji: "\u{1F3AF}",
    sport: "射箭",
    color: "#FEF3C7",
    imagePath: "/characters/arrow.png",
    description: "百發百中的神射手，專注力滿分。",
  },
  {
    id: "flippy",
    name: "Flippy",
    emoji: "\u{1F938}",
    sport: "體操",
    color: "#FBCFE8",
    imagePath: "/characters/flippy.png",
    description: "翻轉跳躍的體操小將，柔軟度無人能比！",
  },
  {
    id: "zen",
    name: "Zen",
    emoji: "\u{1F9D8}",
    sport: "冥想",
    color: "#D5F5F6",
    imagePath: "/characters/zen.png",
    description: "内心平静的冥想大師，帶你找到內心的平衡。",
  },
  {
    id: "ace",
    name: "Ace",
    emoji: "\u{1F3BE}",
    sport: "網球",
    color: "#BBF7D0",
    imagePath: "/characters/ace.png",
    description: "球場上的王牌選手，發球必得分！",
  },
  {
    id: "trekky",
    name: "Trekky",
    emoji: "\u{1F97E}",
    sport: "健行",
    color: "#FDE68A",
    imagePath: "/characters/trekky.png",
    description: "熱愛探索的健行者，每步都是新的發現。",
  },
  {
    id: "stretchy",
    name: "Stretchy",
    emoji: "\u{1F9B8}",
    sport: "拉筋",
    color: "#E9D5FF",
    imagePath: "/characters/stretchy.png",
    description: "身體柔軟如橡皮，拉筋就是他的日常。",
  },
  {
    id: "skippy",
    name: "Skippy",
    emoji: "\u{1F3C3}",
    sport: "跳繩",
    color: "#FEF08A",
    imagePath: "/characters/skippy.png",
    description: "跳躍的小精靈，跳繩就是他的快樂源泉！",
  },
];

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function getCharacterOrDefault(id: string | undefined): Character {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
