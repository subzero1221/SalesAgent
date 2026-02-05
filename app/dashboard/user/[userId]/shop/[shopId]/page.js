import SingleShop from "@/app/components/SingleShop";
import { getShopProductCount } from "@/lib/actions/productActions";
import { getRequestCount } from "@/lib/actions/requestActions";
import { getSessionsCount } from "@/lib/actions/sessionActions";
import { getShopById } from "@/lib/actions/shopActions";

export async function generateMetadata({ params }) {
  const { shopId } = await params;
  const shop = await getShopById(shopId);
  return {
    title: `მაღაზია ${shop.name} / სესიები`,
    description: `Shop details for shop with ID ${shopId}`,
  };
}

export default async function ShopPage({ params }) {
   const { userId, shopId } = await params;
   const shop = await getShopById(shopId);
   const productCount = await getShopProductCount(shopId);
   const sessionCount = await getSessionsCount(shopId);
   const requestCount = await getRequestCount(shopId);


  return <SingleShop shop={shop} userId={userId} productCount={productCount} sessionCount={sessionCount} requestCount={requestCount} />;
}