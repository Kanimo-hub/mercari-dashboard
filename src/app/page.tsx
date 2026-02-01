"use client";

import { useEffect, useState, useMemo } from "react";
import { Product } from "@/lib/types";
import SummaryCards from "@/components/SummaryCards";
import MonthlySalesChart from "@/components/MonthlySalesChart";
import Filters from "@/components/Filters";
import ProductTable from "@/components/ProductTable";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("/api/sheets")
      .then((res) => {
        if (!res.ok) throw new Error("データの取得に失敗しました");
        return res.json();
      })
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(() => [...new Set(products.map((p) => p.current_status).filter(Boolean))], [products]);
  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(), [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedStatus && p.current_status !== selectedStatus) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (keyword && !p.title.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [products, selectedStatus, selectedCategory, selectedBrand, keyword]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="mt-4 text-subtext">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
          <p className="font-semibold">エラーが発生しました</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-primary">KANIMO 販売管理ダッシュボード</h1>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <SummaryCards products={products} />
        <MonthlySalesChart products={products} />

        <div className="rounded-lg bg-card p-4 shadow-sm">
          <Filters
            statuses={statuses}
            categories={categories}
            brands={brands}
            selectedStatus={selectedStatus}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            keyword={keyword}
            onStatusChange={setSelectedStatus}
            onCategoryChange={setSelectedCategory}
            onBrandChange={setSelectedBrand}
            onKeywordChange={setKeyword}
          />
        </div>

        <ProductTable products={filtered} />
      </main>
    </div>
  );
}
