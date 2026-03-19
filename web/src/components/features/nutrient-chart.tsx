"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface NutrientChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const COLORS = [
  "var(--color-protein)",
  "var(--color-carbs)",
  "var(--color-fat)",
];

export function NutrientChart({ protein, carbs, fat }: NutrientChartProps) {
  const total = protein + carbs + fat;
  const data = [
    { name: "蛋白質", value: protein, color: COLORS[0] },
    { name: "碳水", value: carbs, color: COLORS[1] },
    { name: "脂肪", value: fat, color: COLORS[2] },
  ];

  if (total === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted">
        尚無營養素數據
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-32 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 text-sm">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted">{item.name}</span>
            <span className="ml-auto font-bold">{item.value.toFixed(1)}g</span>
            <span className="text-xs text-muted">
              ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
