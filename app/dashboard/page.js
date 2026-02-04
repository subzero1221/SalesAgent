import { redirect } from "next/navigation";
import FacebookConnectPage from "../components/FacebookConnectPage";
import { getMyShops } from "@/lib/actions/shopActions";
import { createClient } from "@/lib/supabaseServer";


export default async function DashboardPage() {

   const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
 

  const [shops] = await Promise.all([
     getMyShops(),
   ]);

  if (shops && shops.length > 0) {
   
    
    redirect(`/dashboard/user/${user.id}`);
  }

  return <FacebookConnectPage />;
}