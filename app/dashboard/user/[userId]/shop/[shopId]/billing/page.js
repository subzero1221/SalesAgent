import BillingPageRenderer from "@/app/components/BillingPageRenderer";
import {getShopById, getShopWithActiveSubscription } from "@/lib/actions/shopActions";

export async function generateMetadata({ params }) {
  const { shopId } = await params;
  const shop = await getShopById(shopId);
  return {
    title: `მაღაზია ${shop.name} / ფასები`,
    description: `Shop billing details for shop with ID ${shopId}`,
  };
}


export default async function BillingPages({ params }) {
  const resolvedParams = await params;
  const shopId = resolvedParams.shopId;

  const shop = await getShopWithActiveSubscription(shopId);

  // თუ მაღაზია ვერ მოიძებნა, რენდერერამდე ნუ მიუშვებ
  if (!shop) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        მაღაზია ვერ მოიძებნა (ID: {shopId}) ❌
      </div>
    );
  }

  return <BillingPageRenderer shop={shop} />;
}
