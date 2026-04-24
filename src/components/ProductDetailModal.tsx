"use client";

import { useEffect } from "react";
import { Product } from "@/lib/types";

interface Props {
  product: Product | null;
  onClose: () => void;
}

function formatCurrency(v: number | null): string {
  if (v == null) return "-";
  return `¥${v.toLocaleString()}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function getProfit(p: Product): number | null {
  if (p.net_amount == null || p.price == null) return null;
  return p.net_amount - p.price;
}

export default function ProductDetailModal({ product, onClose }: Props) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const profit = getProfit(product);
  const statusColor =
    product.current_status === "取引完了"
      ? "bg-green-100 text-green-700"
      : product.current_status === "出品中"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
          {product.current_status}
        </span>
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="rounded-full p-2 text-subtext hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="aspect-square w-full bg-gray-100">
          {product.photo_folder_url ? (
            <img
              src={product.photo_folder_url}
              alt={product.title}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">画像なし</div>
          )}
        </div>

        <div className="space-y-4 p-4">
          <h2 className="text-lg font-bold text-text">{product.title}</h2>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text">
              {product.current_status === "取引完了"
                ? formatCurrency(product.sold_price)
                : formatCurrency(product.list_price)}
            </span>
            {product.current_status === "取引完了" && product.list_price && (
              <span className="text-sm text-subtext">
                (出品: {formatCurrency(product.list_price)})
              </span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-y-3 border-t pt-4 text-sm">
            <dt className="text-subtext">ブランド</dt>
            <dd className="text-text">{product.brand || "-"}</dd>
            <dt className="text-subtext">カテゴリ</dt>
            <dd className="text-text">{product.category || "-"}</dd>
            <dt className="text-subtext">サイズ</dt>
            <dd className="text-text">{product.size || "-"}</dd>
            <dt className="text-subtext">状態</dt>
            <dd className="text-text">{product.condition || "-"}</dd>
            <dt className="text-subtext">色</dt>
            <dd className="text-text">{product.color || "-"}</dd>
            <dt className="text-subtext">出品日</dt>
            <dd className="text-text">{formatDate(product.listed_at)}</dd>
            {product.current_status === "取引完了" && (
              <>
                <dt className="text-subtext">売却日</dt>
                <dd className="text-text">{formatDate(product.sold_at)}</dd>
              </>
            )}
          </dl>

          <dl className="grid grid-cols-2 gap-y-3 border-t pt-4 text-sm">
            <dt className="text-subtext">仕入価格</dt>
            <dd className="text-text">{formatCurrency(product.price)}</dd>
            {product.current_status === "取引完了" && (
              <>
                <dt className="text-subtext">販売手数料</dt>
                <dd className="text-text">{formatCurrency(product.mercari_fee)}</dd>
                <dt className="text-subtext">送料</dt>
                <dd className="text-text">{formatCurrency(product.mercari_shipping_cost)}</dd>
                <dt className="text-subtext">手取り</dt>
                <dd className="text-text">{formatCurrency(product.net_amount)}</dd>
              </>
            )}
            <dt className="text-subtext">
              {product.current_status === "取引完了" ? "利益" : "予定利益"}
            </dt>
            <dd className={profit != null && profit >= 0 ? "text-success font-medium" : "text-red-500 font-medium"}>
              {formatCurrency(profit)}
            </dd>
          </dl>

          {product.note && (
            <div className="border-t pt-4 text-sm">
              <p className="text-subtext mb-1">メモ</p>
              <p className="text-text whitespace-pre-wrap">{product.note}</p>
            </div>
          )}

          <div className="border-t pt-4 text-xs text-subtext">
            商品ID: {product.item_id}
          </div>
        </div>
      </div>
    </div>
  );
}
