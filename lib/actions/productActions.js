import { supabaseAdmin } from "../supabaseAdmin";

// lib/actions/inventory.js ან მსგავს ფაილში
export async function searchInventory(searchTerm) {
    console.log("Searching inventory for term:", searchTerm);
  const { data, error } = await supabaseAdmin.rpc("search_products_fuzzy", {
    search_text: searchTerm,
  });

  if (error) {
    console.error("Fuzzy search error:", error);
    return [];
  }
  return data;
}
