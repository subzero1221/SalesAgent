import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// lib/supabase.js
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // სერვერულ კომპონენტებში (გვერდებზე) ქუქიების დასეტვა აკრძალულია.
          // ამიტომ აქ ვამატებთ try-catch-ს ან უბრალოდ ვტოვებთ ცარიელს, 
          // თუ ეს მხოლოდ გვერდის წაკითხვისთვისაა.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // აქ შეცდომას "ვყლაპავთ", რადგან გვერდზე ქუქის ვერ შევცვლით
          }
        },
      },
    }
  );
}
