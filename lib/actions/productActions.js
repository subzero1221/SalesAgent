import { supabaseAdmin } from "../supabaseAdmin";


export async function searchInventory(searchTerm) {
  if (!searchTerm || typeof searchTerm !== "string") return [];

  try {
    const { data, error } = await supabaseAdmin.rpc("search_products_fuzzy", {
      search_text: searchTerm,
    });

    if (error || !data) return [];

    // ვიყენებთ optional chaining-ს ?. ყველგან
    return data.filter((item) => {
      const name = (item?.name || "").toString().toLowerCase();
      const term = searchTerm.toLowerCase();
      // ვამოწმებთ შეიცავს თუ არა სახელი საძიებო სიტყვას
      return name.includes(term) || term.includes(name);
    });
  } catch (err) {
    return [];
  }
}
