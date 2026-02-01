"use client";

import { Product } from "@/lib/types";
import { CONFIG } from "@/lib/config";

interface Props {
  products: Product[];
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString()}`;
}

function getDaysOnMarket(listedAt: string | null): number | null {
  if (!listedAt) return null;
  const listed = new Date(listedAt);
  const today = new Date();
  return Math.floor((today.getTime() - listed.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SummaryCards({ products }: Props) {
  const completed = products.filter((p) => p.current_status === "取引完了");
  const listing = products.filter((p) => p.current_status === "出品中");
  const inventory = products.filter(
    (p) => p.current_status === "出品中" || p.current_status === "データ・カード作成"
  );

  const totalSales = completed.reduce((sum, p) => sum + (p.sold_price ?? 0), 0);
  const totalProfit = completed.reduce(
    (sum, p) => sum + ((p.net_amount ?? 0) - (p.price ?? 0) - (p.consumption_tax ?? 0)),
    0
  );

  const inventoryAmount = inventory.reduce(
    (sum, p) => sum + (p.price ?? 0) + (p.consumption_tax ?? 0),
    0
  );

  const daysOnMarket = listing
    .map((p) => getDaysOnMarket(p.listed_at))
    .filter((d): d is number => d !== null);
  const avgDays = daysOnMarket.length > 0
    ? Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length)
    : 0;
  const over30 = daysOnMarket.filter((d) => d >= CONFIG.warningDays).length;

  const row1 = [
    { label: "総売上", value: formatCurrency(totalSales), color: "text-accent" },
    { label: "総利益", value: formatCurrency(totalProfit), color: totalProfit >= 0 ? "text-success" : "text-red-500" },
    { label: "出品中", value: `${listing.length}件`, color: "text-warning" },
    { label: "取引完了", value: `${completed.length}件`, color: "text-accent" },
  ];

  const row2 = [
    { label: "在庫金額", value: formatCurrency(inventoryAmount), color: "text-warning" },
    { label: "平均滞留日数", value: `${avgDays}日`, color: avgDays >= CONFIG.warningDays ? "text-red-500" : "text-accent" },
    {
      label: `${CONFIG.warningDays}日超え`,
      value: over30 > 0 ? `${over30}件` : "0件",
      color: over30 > 0 ? "text-warning" : "text-success",
      suffix: over30 > 0 ? " \u26A0\uFE0F" : " \u2713",
    },
  ];

  const renderCard = (card: { label: string; value: string; color: string; suffix?: string }) => (
    <div
      key={card.label}
      className="rounded-lg bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-subtext">{card.label}</p>
      <p className={`mt-2 text-2xl font-bold ${card.color}`}>
        {card.value}
        {card.suffix && <span className="ml-1 text-lg">{card.suffix}</span>}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {row1.map(renderCard)}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {row2.map(renderCard)}
      </div>
    </div>
  );
}
