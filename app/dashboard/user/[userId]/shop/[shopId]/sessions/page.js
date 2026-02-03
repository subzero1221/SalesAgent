import SessionsPage from "@/app/components/SessionsPage";
export const metadata = {
  title: "Sales Agent / sessions",
  description: "My Sales Bot - AI Sales Assistant for E-commerce Businesses",
};

export default async function Page({ params }) {
  const { userId, shopId } = await params;

  return <SessionsPage shopId={shopId} />;
}