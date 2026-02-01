import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import LogoutButton from "./LogoutButton";
import UserNav from "./UserNav"; // ამას ქვემოთ მოგცემ
import { getMyShops } from "@/lib/actions/shopActions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let shops = await getMyShops();

 

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            SalesAgent
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            ფასები
          </Link>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              {/* Dynamic Dropdown for Shops and Links */}
              <UserNav user={user} shops={shops} />

              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="group relative">
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-tr from-gray-900 to-gray-600 p-0.5 shadow-md transition-transform hover:scale-105">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-gray-900 text-sm font-bold">
                      {user.email[0].toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                </Link>
                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                შესვლა
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800 hover:shadow-none active:scale-95"
              >
                გაიარე რეგისტრაცია
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
