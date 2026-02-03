import Dashboard from "@/app/components/Dashboard";
import { getMyShops } from "@/lib/actions/shopActions";

export default async function UserPage({ params }) {
     const { userId } = await params;

    const shops = await getMyShops()
     
    return <Dashboard shops={shops} userId={userId}/>;
}