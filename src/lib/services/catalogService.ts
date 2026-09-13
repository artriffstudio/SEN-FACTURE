import { supabase } from "@/lib/supabase";
import { CatalogItem } from "@/lib/types";

export async function getCatalogItems(): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("active", true)
    .order("code", { ascending: true });

  if (error || !data) {
    console.error("Erreur récupération catalogue:", error?.message);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    description: item.description || "",
    category: item.category as any,
    unitPrice: Number(item.unit_price),
    unit: item.unit,
    taxRate: Number(item.tax_rate),
    active: item.active,
  }));
}

export async function createCatalogItem(
  item: Omit<CatalogItem, "id">
): Promise<CatalogItem> {
  const { data, error } = await supabase
    .from("catalog_items")
    .insert([
      {
        code: item.code,
        name: item.name,
        description: item.description,
        category: item.category,
        unit_price: item.unitPrice,
        unit: item.unit,
        tax_rate: item.taxRate || 18.0,
        active: item.active ?? true,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Échec ajout article catalogue: ${error?.message}`);
  }

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    description: data.description || "",
    category: data.category as any,
    unitPrice: Number(data.unit_price),
    unit: data.unit,
    taxRate: Number(data.tax_rate),
    active: data.active,
  };
}
