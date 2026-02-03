import SingleShop from "@/app/components/SingleShop";
import { getShopProductCount } from "@/lib/actions/productActions";
import { getShopById } from "@/lib/actions/shopActions";

export default async function ShopPage({ params }) {
   const { userId, shopId } = await params;
   const shop = await getShopById(shopId);
   const productCount = await getShopProductCount(shopId);


  return <SingleShop shop={shop} userId={userId} productCount={productCount} />;
}