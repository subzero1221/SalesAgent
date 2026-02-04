import Dashboard from "@/app/components/Dashboard";
import { getMyShops } from "@/lib/actions/shopActions";
import { createClient } from "@/lib/supabaseServer";

export async function generateMetadata({ params }) {
  const { userId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  return {
    title: `მომხმარებელი ${user.email.split('@')[0]} / მაღაზიები`,
    description: `Dashboard for user with ID ${userId}`,
  };
}

export default async function UserPage({ params }) {
     const { userId } = await params;

    const shops = await getMyShops()
     
    return <Dashboard shops={shops} userId={userId}/>;
}