import SessionsPage from "@/app/components/SessionsPage";
import { getShopById } from "@/lib/actions/shopActions";

export async function generateMetadata({ params }) {
  const { shopId } = await params;
  const shop = await getShopById(shopId);
  return {
    title: `მაღაზია ${shop.name} / სესიები`,
    description: `Shop sessions for shop with ID ${shopId}`,
  };
}

export default async function Page({ params }) {
  const { userId, shopId } = await params;

  return <SessionsPage shopId={shopId} userId={userId} />;
}
