"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, addWeightRecord } from "@/lib/profile-actions";
import { signOut } from "@/lib/auth-actions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Profile {
  nickname: string;
  email: string | null;
  gender: string | null;
  weight_kg: number | null;
  daily_calorie_goal: number;
  created_at: string;
}

interface WeightRecord {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  recorded_at: string;
}

export function ProfileClient({
  profile,
  weightHistory,
}: {
  profile: Profile;
  weightHistory: WeightRecord[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdateProfile(formData: FormData) {
    const result = await updateProfile(formData);
    if (result && "success" in result) {
      setMessage("已更新");
      setIsEditing(false);
      router.refresh();
    } else {
      setMessage(result?.error ?? "更新失敗");
    }
  }

  async function handleAddWeight(formData: FormData) {
    const result = await addWeightRecord(formData);
    if (result && "success" in result) {
      setShowWeightForm(false);
      router.refresh();
    }
  }

  const chartData = weightHistory.map((r) => ({
    date: r.recorded_at,
    weight: r.weight_kg,
  }));

  return (
    <main className="mx-auto max-w-md px-4 pb-8 pt-8">
      <h1 className="font-heading text-3xl font-extrabold">我的</h1>

      {/* Profile Card */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        {isEditing ? (
          <form action={handleUpdateProfile} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted">暱稱</label>
              <input
                name="nickname"
                defaultValue={profile.nickname}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">性別</label>
              <select
                name="gender"
                defaultValue={profile.gender ?? ""}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">不透露</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">體重 (kg)</label>
              <input
                name="weight_kg"
                type="number"
                step="0.1"
                defaultValue={profile.weight_kg ?? ""}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">每日目標 (kcal)</label>
              <input
                name="daily_calorie_goal"
                type="number"
                defaultValue={profile.daily_calorie_goal}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium"
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold">
                  {profile.nickname}
                </h2>
                <p className="text-sm text-muted">{profile.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-primary hover:underline"
              >
                編輯
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-heading text-lg font-bold">
                  {profile.weight_kg ?? "-"}
                </p>
                <p className="text-xs text-muted">體重 kg</p>
              </div>
              <div>
                <p className="font-heading text-lg font-bold">
                  {profile.daily_calorie_goal}
                </p>
                <p className="text-xs text-muted">目標 kcal</p>
              </div>
              <div>
                <p className="font-heading text-lg font-bold">
                  {profile.gender === "male" ? "男" : profile.gender === "female" ? "女" : "-"}
                </p>
                <p className="text-xs text-muted">性別</p>
              </div>
            </div>
            {message && (
              <p className="mt-2 text-center text-sm text-accent">{message}</p>
            )}
          </div>
        )}
      </section>

      {/* Weight Tracking */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold">體重趨勢</h3>
          <button
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="text-sm text-primary hover:underline"
          >
            {showWeightForm ? "取消" : "+ 記錄"}
          </button>
        </div>

        {showWeightForm && (
          <form action={handleAddWeight} className="mt-3 flex gap-2">
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              placeholder="體重 kg"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              required
            />
            <input
              name="body_fat_pct"
              type="number"
              step="0.1"
              placeholder="體脂 %"
              className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white"
            >
              記錄
            </button>
          </form>
        )}

        {chartData.length > 1 ? (
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, "體重"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "14px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-muted">
            {chartData.length === 0
              ? "尚無體重記錄"
              : "記錄更多數據以顯示趨勢圖"}
          </p>
        )}
      </section>

      {/* Sign Out */}
      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-xl border border-destructive px-4 py-3 font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          登出
        </button>
      </form>
    </main>
  );
}
