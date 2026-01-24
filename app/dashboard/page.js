import { getMyShops } from "@/lib/actions/shopActions";
import Dashboard from "../components/Dashboard";
import { getRecentRequests } from "@/lib/actions/requestActions";

export default async function DashboradPage() {
  const shops = await getMyShops();
  const requests = await getRecentRequests();

  return <Dashboard shops={shops} requests={requests} />;
}
