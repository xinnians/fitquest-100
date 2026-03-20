"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeeklyChartProps {
  data: { date: string; label: string; burned: number }[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <div>
      <h3 className="mb-3 font-heading text-lg font-bold">本週消耗</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB923C" stopOpacity={1} />
                <stop offset="100%" stopColor="#FB923C" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" stopOpacity={1} />
                <stop offset="100%" stopColor="#4ADE80" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => [`${value} kcal`, "消耗"]}
              contentStyle={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontSize: "14px",
                color: "#F1F5F9",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
              }}
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
            />
            <Bar dataKey="burned" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={entry.date === todayStr ? "url(#barGradientToday)" : "url(#barGradient)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
