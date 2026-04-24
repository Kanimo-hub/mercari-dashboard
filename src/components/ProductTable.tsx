"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/types";
import { CONFIG } from "@/lib/config";

interface Props {
  products: Product[];
}

type SortKey = "item_id" | "listed_at" | "sold_at" | "title" | "brand" | "list_price" | "sold_price" | "profit";
type SortDir = "asc" | "desc";

function getProfit(p: Product): number | null {
  if (p.net_amount == null || p.price == null) return null;
  return p.net_amount - p.price - (p.consumption_tax ?? 0);
}

function getListedDate(p: Product): string | null {
  return p.listed_at || null;
}

function getSoldDate(p: Product): string | null {
  return p.sold_at || null;
}

function formatCurrency(v: number | null): string {
  if (v == null) return "-";
  return `¥${v.toLocaleString()}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const PAGE_SIZE = 20;

export default function ProductTable({ products }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("listed_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  // ステータスに基づいてデフォルトソートキーを設定
  const defaultSortKey = useMemo(() => {
    const hasListing = products.some(p => p.current_status === "出品中");
    const hasSold = products.some(p => p.current_status === "取引完了");
    if (hasListing && !hasSold) return "listed_at";
    if (hasSold && !hasListing) return "sold_at";
    return "item_id";
  }, [products]);

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
    } else if (sortKey === "listed_at") {
      av = getListedDate(a);
      bv = getListedDate(b);
    } else if (sortKey === "sold_at") {
      av = getSoldDate(a);
      bv = getSoldDate(b);
    } else {
      av = a[sortKey as keyof Product] as string | number | null;
      bv = b[sortKey as keyof Product] as string | number | null;
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

  // ソート選択肢
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "listed_at", label: "出品日" },
    { key: "sold_at", label: "売却日" },
    { key: "title", label: "商品名" },
    { key: "brand", label: "ブランド" },
    { key: "list_price", label: "出品価格" },
    { key: "sold_price", label: "売却価格" },
    { key: "profit", label: "利益" },
    { key: "item_id", label: "商品ID" },
  ];

  return (
    <div className="rounded-lg bg-card shadow-sm">
      {/* ソート選択 */}
      <div className="flex items-center gap-2 border-b px-4 py-3 overflow-x-auto">
        <span className="text-sm text-subtext whitespace-nowrap">並び替え:</span>
        <select
          value={sortKey}
          onChange={(e) => handleSort(e.target.value as SortKey)}
          className="rounded-lg border border-gray-200 bg-card px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          {sortDir === "asc" ? "↑ 昇順" : "↓ 降順"}
        </button>
      </div>

      {/* カードリスト */}
      <div className="divide-y">
        {pageProducts.map((p) => {
          const profit = getProfit(p);
          const listedDate = getListedDate(p);
          const soldDate = getSoldDate(p);
          
          return (
            <div key={p.item_id} className="flex gap-3 p-4 hover:bg-gray-50 transition-colors">
              {/* 画像 */}
              <div className="shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                {p.photo_folder_url ? (
                  <img 
                    src={p.photo_folder_url} 
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    画像なし
                  </div>
                )}
              </div>

              {/* 商品情報 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text truncate">{p.title}</h3>
                
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-text">
                    {p.current_status === "取引完了" ? formatCurrency(p.sold_price) : formatCurrency(p.list_price)}
                  </span>
                  {p.current_status === "出品中" && p.list_price && (
                    <span className="text-xs text-subtext">({formatCurrency(p.list_price)})</span>
                  )}
                </div>

                <div className="mt-1 text-sm text-subtext">
                  {p.brand} · {p.size}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(p.current_status)}`}>
                    {p.current_status}
                  </span>
                  <span className="text-xs text-subtext">
                    {p.current_status === "出品中" && listedDate ? `出品: ${formatDate(listedDate)}` : ""}
                    {p.current_status === "取引完了" && soldDate ? `売却: ${formatDate(soldDate)}` : ""}
                  </span>
                </div>

                {/* 仕入れ情報（出品中の場合） */}
                {p.current_status === "出品中" && p.price && (
                  <div className="mt-2 text-xs text-subtext">
                    仕入: {formatCurrency(p.price)}
                    {profit !== null && (
                      <span className={`ml-2 ${profit >= 0 ? "text-success" : "text-red-500"}`}>
                        予定利益: {formatCurrency(profit)}
                      </span>
                    )}
                  </div>
                )}

                {/* 利益（取引完了の場合） */}
                {p.current_status === "取引完了" && profit !== null && (
                  <div className="mt-2 text-sm font-medium">
                    利益: <span className={profit >= 0 ? "text-success" : "text-red-500"}>{formatCurrency(profit)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-subtext">
            {sorted.length}件中 {page * PAGE_SIZE + 1}〜{Math.min((page + 1) * PAGE_SIZE, sorted.length)}件
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              前へ
            </button>
            <span className="px-3 py-1 text-sm text-subtext">
              {page + 1} / {totalPages}
            </span>
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
