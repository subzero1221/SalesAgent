"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
      router.refresh(); // აუცილებელია, რომ სერვერმა დაინახოს ახალი სესია
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto p-10">
      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded text-black"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded text-black"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSignIn}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        შესვლა
      </button>
    </div>
  );
}
