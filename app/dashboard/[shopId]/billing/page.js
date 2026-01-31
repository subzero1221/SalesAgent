import BillingPageRenderer from "@/app/components/BillingPageRenderer";
import { getShopById } from "@/lib/actions/shopActions";

export default async function BillingPages({ params }) {
  const resolvedParams = await params;
  const shopId = resolvedParams.shopId;

  const shop = await getShopById(shopId);

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
