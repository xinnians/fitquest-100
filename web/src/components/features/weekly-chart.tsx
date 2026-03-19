"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyChartProps {
  data: { date: string; label: string; burned: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div>
      <h3 className="mb-3 font-heading text-lg font-bold">本週消耗</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [`${value} kcal`, "消耗"]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
                fontSize: "14px",
              }}
            />
            <Bar
              dataKey="burned"
              fill="var(--color-accent)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
