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
    <div className="flex flex-wrap items-center gap-3">
      <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
        <option value="">すべてのステータス</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)} className={selectClass}>
        <option value="">すべてのカテゴリ</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={selectedBrand} onChange={(e) => onBrandChange(e.target.value)} className={selectClass}>
        <option value="">すべてのブランド</option>
        {brands.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="商品名で検索..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        className={`${selectClass} min-w-[200px] flex-1`}
      />
    </div>
  );
}
