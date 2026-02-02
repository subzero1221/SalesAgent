import { getMyShops } from "@/lib/actions/shopActions";
import Dashboard from "../components/Dashboard";
import { getRecentRequests } from "@/lib/actions/requestActions";

export const metadata = {
  title: "Sales Agent / dashboard",
  description: "My Sales Bot - AI Sales Assistant for E-commerce Businesses",
};

export default async function DashboradPage() {


  const [shops, requests] = await Promise.all([
    getMyShops(),
    getRecentRequests(),
  ]);

  return <Dashboard shops={shops} requests={requests} />;
}
