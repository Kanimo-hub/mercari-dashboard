import { fetchSheetData } from "@/lib/fetchSheetData";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const products = await fetchSheetData();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch sheet data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
