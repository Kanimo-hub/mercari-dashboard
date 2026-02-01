import { Product } from "./types";

const SHEET_ID = "15GP8xi34mMw7J-1A9PjzJjwnR_222LiC-yxD5PU9jWc";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function parseGvizDate(cell: { v: string } | null): string | null {
  if (!cell?.v) return null;
  const match = cell.v.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${String(Number(month) + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
}

function parseNumber(cell: { v: number | string } | null): number | null {
  if (!cell || cell.v === null || cell.v === undefined || cell.v === "") return null;
  const num = typeof cell.v === "string" ? Number(cell.v.replace(/,/g, "")) : cell.v;
  return isNaN(num) ? null : num;
}

function parseString(cell: { v: string } | null): string {
  return cell?.v?.toString() ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRow(cols: any[]): Product {
  return {
    item_id: parseString(cols[0]),
    current_status: parseString(cols[1]),
    source: parseString(cols[2]),
    platform: parseString(cols[3]),
    purchase_date: parseGvizDate(cols[4]),
    title: parseString(cols[5]),
    color: parseString(cols[6]),
    category: parseString(cols[7]),
    gender: parseString(cols[8]),
    brand: parseString(cols[9]),
    size: parseString(cols[10]),
    selling_platform: parseString(cols[11]),
    condition: parseString(cols[12]),
    listed_at: parseGvizDate(cols[13]),
    list_price: parseNumber(cols[14]),
    sold_at: parseGvizDate(cols[15]),
    sold_price: parseNumber(cols[16]),
    mercari_fee: parseNumber(cols[17]),
    mercari_shipping_cost: parseNumber(cols[18]),
    net_amount: parseNumber(cols[19]),
    price: parseNumber(cols[20]),
    consumption_tax: parseNumber(cols[21]),
    photo_folder_url: parseString(cols[22]),
    created_at: parseGvizDate(cols[23]),
    note: parseString(cols[24]),
  };
}

export async function fetchSheetData(): Promise<Product[]> {
  const res = await fetch(SHEET_URL, { next: { revalidate: 300 } });
  const text = await res.text();

  // Remove wrapper: google.visualization.Query.setResponse({...})
  const jsonStr = text.replace(/^[^(]*\(/, "").replace(/\);?\s*$/, "");
  const data = JSON.parse(jsonStr);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: Product[] = data.table.rows.map((row: { c: any[] }) => parseRow(row.c));

  return rows.filter((r) => r.item_id);
}
