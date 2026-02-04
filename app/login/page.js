import LoginForm from "@/app/components/LoginForm";
import { getMyShops } from "@/lib/actions/shopActions";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export const metadata = {
  title: "შესვლა / გაყიდვების აგენტი",
  description: "Login to SalesAgent - AI Sales Assistant",
};

export default async function Login() {
  const supabase = await createClient();

 
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const {shops} = await getMyShops(); 

  if (user && shops && shops.length > 0) {
    return redirect(`/dashboard/user/${user.id}`);
  }else if (user) {
    return redirect(`/dashboard`);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}
