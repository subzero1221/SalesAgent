import ProductsPage from "@/app/components/ProductsPage";

export default async function Page({ params }) {
  // ველოდებით params-ს (Next.js 15-ის მოთხოვნაა)
  const { shopId } = await params;

  return <ProductsPage shopId={shopId} />;
}