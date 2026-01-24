"use client";

import { logOut } from "@/lib/actions/authActions";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logOut()}
      className="text-xs font-medium cursor-pointer text-red-500 hover:text-red-600 transition-colors pt-1 border-t border-gray-100 w-full text-right"
    >
      Log out
    </button>
  );
}
