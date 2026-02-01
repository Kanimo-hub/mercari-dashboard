"use client";

import { Product, MonthlyData } from "@/lib/types";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { CONFIG } from "@/lib/config";

interface Props {
  products: Product[];
}

function computeMonthlyData(products: Product[]): MonthlyData[] {
  const map = new Map<string, { sales: number; profit: number; purchase: number }>();

  // Sales & profit by sold_at
  for (const p of products.filter((p) => p.current_status === "取引完了" && p.sold_at)) {
    const key = p.sold_at!.slice(0, 7);
    const entry = map.get(key) ?? { sales: 0, profit: 0, purchase: 0 };
    entry.sales += p.sold_price ?? 0;
    entry.profit += (p.net_amount ?? 0) - (p.price ?? 0) - (p.consumption_tax ?? 0);
    map.set(key, entry);
  }

  // Purchase by purchase_date
  for (const p of products.filter((p) => p.purchase_date)) {
    const key = p.purchase_date!.slice(0, 7);
    const entry = map.get(key) ?? { sales: 0, profit: 0, purchase: 0 };
    entry.purchase += (p.price ?? 0) + (p.consumption_tax ?? 0);
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [y, m] = key.split("-");
      return {
        month: `${y}年${Number(m)}月`,
        sales: v.sales,
        purchase: v.purchase,
        profit: v.profit,
        profitRate: v.sales > 0 ? Math.round((v.profit / v.sales) * 100) : 0,
        achievementRate: v.sales > 0 ? Math.round((v.sales / CONFIG.monthlyGoal) * 100) : 0,
      };
    });
}

function formatYen(v: number) {
  return `¥${v.toLocaleString()}`;
}

export default function MonthlySalesChart({ products }: Props) {
  const data = computeMonthlyData(products);

  if (data.length === 0) {
    return (
      <div className="rounded-lg bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">月別売上グラフ</h2>
        <p className="mt-4 text-subtext">取引完了データがありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">月別売上グラフ</h2>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => [
              formatYen(value as number),
              name === "sales" ? "売上" : name === "purchase" ? "仕入" : "利益",
            ]}
          />
          <Legend formatter={(v) => (v === "sales" ? "売上" : v === "purchase" ? "仕入" : "利益")} />
          <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} name="sales" />
          <Bar dataKey="purchase" fill="#f59e0b" radius={[4, 4, 0, 0]} name="purchase" />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="profit"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 月別サマリーテーブル */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-subtext">
              <th className="pb-2 font-medium">月</th>
              <th className="pb-2 font-medium text-right">売上</th>
              <th className="pb-2 font-medium text-right">仕入</th>
              <th className="pb-2 font-medium text-right">利益</th>
              <th className="pb-2 font-medium text-right">利益率</th>
              <th className="pb-2 font-medium text-right">目標達成率</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className="border-b last:border-0">
                <td className="py-2">{d.month}</td>
                <td className="py-2 text-right">{formatYen(d.sales)}</td>
                <td className="py-2 text-right text-warning">{formatYen(d.purchase)}</td>
                <td className={`py-2 text-right ${d.profit >= 0 ? "text-success" : "text-red-500"}`}>
                  {formatYen(d.profit)}
                </td>
                <td className="py-2 text-right">{d.profitRate}%</td>
                <td className="py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={d.achievementRate >= 100 ? "text-success font-semibold" : ""}>
                      {d.achievementRate}%
                    </span>
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${
                          d.achievementRate >= 100 ? "bg-[#10b981]" :
                          d.achievementRate >= 71 ? "bg-[#3b82f6]" :
                          d.achievementRate >= 31 ? "bg-[#f59e0b]" : "bg-[#ef4444]"
                        }`}
                        style={{ width: `${Math.min(d.achievementRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
