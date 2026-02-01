"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { Mail, Lock, Loader2, UserPlus, CheckCircle2 } from "lucide-react";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert("შეცდომა: " + error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-[400px] mx-auto p-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-50 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-950 mb-2">
          შეამოწმე ფოსტა!
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          რეგისტრაციის დასასრულებლად დააჭირე დასტურის ლინკს, რომელიც
          გამოგიგზავნეთ: <br />
          <span className="font-bold text-black">{email}</span>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full py-3.5 bg-gray-950 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all"
        >
          ავტორიზაციაზე დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto p-6">
      <div className="flex flex-col gap-2 mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-gray-950">
          შემოუერთდი SalesAgent-ს
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          შექმენი ანგარიში და დაიწყე გაყიდვების ავტომატიზაცია
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
            ელ-ფოსტა
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              required
              type="email"
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-black outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
            პაროლი
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              required
              type="password"
              placeholder="მინიმუმ 6 სიმბოლო"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-black outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full  bg-gray-950 cursor-pointer text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              ანგარიშის შექმნა
              <UserPlus className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-500">
        უკვე გაქვს ანგარიში?{" "}
        <Link href="/login" className="font-bold text-black hover:underline">
          შედი აქედან
        </Link>
      </p>
    </div>
  );
}
