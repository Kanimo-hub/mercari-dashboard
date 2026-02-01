"use client";

import { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

function formatCurrency(value: number): string {
  return `¥${value.toLocaleString()}`;
}

export default function SummaryCards({ products }: Props) {
  const completed = products.filter((p) => p.current_status === "取引完了");
  const listing = products.filter((p) => p.current_status === "出品中");

  const totalSales = completed.reduce((sum, p) => sum + (p.sold_price ?? 0), 0);
  const totalProfit = completed.reduce(
    (sum, p) => sum + ((p.net_amount ?? 0) - (p.price ?? 0) - (p.consumption_tax ?? 0)),
    0
  );

  const cards = [
    { label: "総売上", value: formatCurrency(totalSales), color: "text-accent" },
    { label: "総利益", value: formatCurrency(totalProfit), color: totalProfit >= 0 ? "text-success" : "text-red-500" },
    { label: "出品中", value: `${listing.length}件`, color: "text-warning" },
    { label: "取引完了", value: `${completed.length}件`, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-sm font-medium text-subtext">{card.label}</p>
          <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
