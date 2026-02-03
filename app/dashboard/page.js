import { redirect } from "next/navigation";
import FacebookConnectPage from "../components/FacebookConnectPage";
import { getMyShops } from "@/lib/actions/shopActions";
import { getRecentRequests } from "@/lib/actions/requestActions";
import { createClient } from "@/lib/supabaseServer";


export default async function DashboardPage() {

   const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
 

  const [shops, requests] = await Promise.all([
     getMyShops(),
     getRecentRequests(),
   ]);

  if (shops && shops.length > 0) {
    // თუ აქვს მაღაზიები, გადამისამართე პირველ მაღაზიაზე სესიების გვერდზე
    const firstShopId = shops[0].id;
    redirect(`/dashboard/user/${user.id}`);
  }

  // თუ არ აქვს, აჩვენე მაღაზიის შექმნის გვერდი
  return <FacebookConnectPage />;
}