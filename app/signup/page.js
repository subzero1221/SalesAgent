import SignUpForm from "../components/SignUpForm";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "რეგისტრაცია / გაყიდვების აგენტი",
  description: "Login to SalesAgent - AI Sales Assistant",
};

export default async function SignUp() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect(`/dashboard/user/${user.id}`);
  }

  return <SignUpForm />;
}
