"use server";

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
