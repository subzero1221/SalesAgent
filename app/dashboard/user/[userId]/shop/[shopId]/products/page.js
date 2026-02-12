import ProductsPage from "@/app/components/ProductsPage";
import { getShopById } from "@/lib/actions/shopActions";

export async function generateMetadata({ params }) {
  const { shopId } = await params;
  const shop = await getShopById(shopId);
  return {
    title: `მაღაზია ${shop.name} / პროდუქტები`,
    description: `Shop products for shop with ID ${shopId}`,
  };
}


export default async function Page({ params }) {
  // ველოდებით params-ს (Next.js 15-ის მოთხოვნაა)
  const { userId, shopId } = await params;

  return <ProductsPage shopId={shopId} userId={userId} />;
}