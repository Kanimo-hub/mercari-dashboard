"use client";

import { Product } from "@/lib/types";
import { CONFIG } from "@/lib/config";

interface Props {
  products: Product[];
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString()}`;
}

function getProgressColor(rate: number): string {
  if (rate >= 100) return "bg-[#10b981]";
  if (rate >= 71) return "bg-[#3b82f6]";
  if (rate >= 31) return "bg-[#f59e0b]";
  return "bg-[#ef4444]";
}

export default function MonthlyGoal({ products }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentMonthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const completed = products.filter(
    (p) => p.current_status === "取引完了" && p.sold_at?.startsWith(currentMonthKey)
  );

  const currentSales = completed.reduce((sum, p) => sum + (p.sold_price ?? 0), 0);
  const rate = Math.round((currentSales / CONFIG.monthlyGoal) * 100);

  const lastDay = new Date(year, month + 1, 0).getDate();
  const remainingDays = Math.max(0, lastDay - now.getDate());
  const remaining = CONFIG.monthlyGoal - currentSales;
  const dailyRequired = remainingDays > 0 ? Math.ceil(remaining / remainingDays) : 0;

  const displayMonth = `${year}年${month + 1}月`;

  return (
    <div className="rounded-lg bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{displayMonth}の目標達成状況</h2>

      <div className="mt-4 flex items-baseline justify-between text-sm">
        <span className="text-subtext">目標: {formatCurrency(CONFIG.monthlyGoal)}</span>
        <span className="font-semibold">現在: {formatCurrency(currentSales)}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${getProgressColor(rate)}`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className={`font-bold ${getProgressColor(rate).replace("bg-", "text-")}`}>
          {rate}%
        </span>
        {remaining > 0 && remainingDays > 0 ? (
          <span className="text-subtext">
            残り{remainingDays}日 → 1日あたり {formatCurrency(dailyRequired)} 必要
          </span>
        ) : remaining <= 0 ? (
          <span className="font-semibold text-success">目標達成!</span>
        ) : (
          <span className="text-subtext">月末です</span>
        )}
      </div>
    </div>
  );
}
