"use client";

import { useState } from "react";
import { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

type SortKey = "item_id" | "title" | "brand" | "category" | "size" | "current_status" | "list_price" | "sold_price" | "profit";
type SortDir = "asc" | "desc";

function getProfit(p: Product): number | null {
  if (p.net_amount == null || p.price == null) return null;
  return p.net_amount - p.price - (p.consumption_tax ?? 0);
}

function formatCurrency(v: number | null): string {
  if (v == null) return "-";
  return `¥${v.toLocaleString()}`;
}

const PAGE_SIZE = 20;

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "item_id", label: "商品ID" },
  { key: "title", label: "商品名" },
  { key: "brand", label: "ブランド" },
  { key: "category", label: "カテゴリ" },
  { key: "size", label: "サイズ" },
  { key: "current_status", label: "ステータス" },
  { key: "list_price", label: "出品価格", align: "right" },
  { key: "sold_price", label: "売却価格", align: "right" },
  { key: "profit", label: "利益", align: "right" },
];

export default function ProductTable({ products }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("item_id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const sorted = [...products].sort((a, b) => {
    let av: string | number | null;
    let bv: string | number | null;

    if (sortKey === "profit") {
      av = getProfit(a);
      bv = getProfit(b);
    } else {
      av = a[sortKey];
      bv = b[sortKey];
    }

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ja");
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageProducts = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusColor = (s: string) => {
    if (s === "取引完了") return "bg-green-100 text-green-700";
    if (s === "出品中") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="rounded-lg bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer whitespace-nowrap px-4 py-3 font-medium text-subtext hover:text-text ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageProducts.map((p) => {
              const profit = getProfit(p);
              return (
                <tr key={p.item_id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{p.item_id}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{p.title}</td>
                  <td className="whitespace-nowrap px-4 py-3">{p.brand}</td>
                  <td className="whitespace-nowrap px-4 py-3">{p.category}</td>
                  <td className="whitespace-nowrap px-4 py-3">{p.size}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(p.current_status)}`}>
                      {p.current_status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{formatCurrency(p.list_price)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{formatCurrency(p.sold_price)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                    profit != null && profit >= 0 ? "text-success" : profit != null ? "text-red-500" : ""
                  }`}>
                    {formatCurrency(profit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-subtext">
            {sorted.length}件中 {page * PAGE_SIZE + 1}〜{Math.min((page + 1) * PAGE_SIZE, sorted.length)}件を表示
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              前へ
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
