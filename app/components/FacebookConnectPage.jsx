"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import FacebookLoginPage from "./FacebookLoginPage";

export default function FacebookConnectPage() {
  const [userId, setUserId] = useState(null); // ვქმნით State-ს ID-სთვის

  useEffect(() => {
    async function getUserData() {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser();

      if (user) {
        setUserId(user.id); // ვინახავთ ID-ს State-ში
      } else {
        console.log("მომხმარებელი არ არის დალოგინებული");
      }
    }
    getUserData();
  }, []); // ცარიელი მასივი ნიშნავს, რომ მხოლოდ ერთხელ გაეშვება ჩატვირთვისას

  // სანამ ID იტვირთება, შეგვიძლია ვაჩვენოთ Loading
  if (!userId) return <p>იტვირთება...</p>;

  return <FacebookLoginPage userId={userId} />;
}
