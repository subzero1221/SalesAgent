"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        // ეს ეუბნება Supabase-ს სად დააბრუნოს იუზერი იმეილის დადასტურების შემდეგ
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert("შეცდომა რეგისტრაციისას: " + error.message);
    } else {
      alert("რეგისტრაცია წარმატებულია! შეამოწმეთ იმეილი.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-gray-100"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-black">
          რეგისტრაცია
        </h1>

        <input
          type="email"
          placeholder="თქვენი იმეილი"
          required
          className="border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="პაროლი"
          required
          className="border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? "მიმდინარეობს..." : "ანგარიშის შექმნა"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-2">
          უკვე გაქვთ ანგარიში?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            შესვლა
          </Link>
        </p>
      </form>
    </div>
  );
}
