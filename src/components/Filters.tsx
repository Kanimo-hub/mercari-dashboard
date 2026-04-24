"use client";

interface Props {
  statuses: string[];
  categories: string[];
  brands: string[];
  selectedStatus: string;
  selectedCategory: string;
  selectedBrand: string;
  keyword: string;
  onStatusChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onKeywordChange: (v: string) => void;
}

export default function Filters({
  statuses,
  categories,
  brands,
  selectedStatus,
  selectedCategory,
  selectedBrand,
  keyword,
  onStatusChange,
  onCategoryChange,
  onBrandChange,
  onKeywordChange,
}: Props) {
  const selectClass =
    "rounded-lg border border-gray-200 bg-card px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} className={`${selectClass} w-full sm:w-auto min-w-[140px]`}>
        <option value="">ステータス</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className={`${selectClass} w-full sm:w-auto min-w-[140px]`}>
        <option value="">カテゴリ</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={selectedBrand} onChange={(e) => onBrandChange(e.target.value)} className={`${selectClass} w-full sm:w-auto min-w-[140px]`}>
        <option value="">ブランド</option>
        {brands.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="検索..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        className={`${selectClass} w-full sm:flex-1 sm:min-w-[200px]`}
      />
    </div>
  );
}
