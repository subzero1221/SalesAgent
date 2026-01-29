import { supabaseAdmin } from "../supabaseAdmin";


export async function searchInventory(searchTerm) {
  if (!searchTerm || searchTerm === "none") return [];

  try {
    const { data, error } = await supabaseAdmin
      .rpc("search_products_fuzzy", { search_text: searchTerm })
      .order("created_at", { ascending: false })
      .limit(3);

    if (error || !data) return [];

    // ❌ ამოვიღოთ მკაცრი .filter()
    // RPC უკვე აკეთებს თავის საქმეს.
    // თუ მაინც გინდა გაფილტვრა, გამოიყენე უფრო "ლაითი" ლოგიკა.

    return data; // დააბრუნე ის, რაც ბაზამ იპოვა
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}
