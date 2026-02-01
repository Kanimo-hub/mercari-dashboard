export interface Product {
  item_id: string;
  current_status: string;
  source: string;
  platform: string;
  purchase_date: string | null;
  title: string;
  color: string;
  category: string;
  gender: string;
  brand: string;
  size: string;
  selling_platform: string;
  condition: string;
  listed_at: string | null;
  list_price: number | null;
  sold_at: string | null;
  sold_price: number | null;
  mercari_fee: number | null;
  mercari_shipping_cost: number | null;
  net_amount: number | null;
  price: number | null;
  consumption_tax: number | null;
  photo_folder_url: string;
  created_at: string | null;
  note: string;
}

export interface MonthlyData {
  month: string;
  sales: number;
  profit: number;
  profitRate: number;
  achievementRate: number;
}
