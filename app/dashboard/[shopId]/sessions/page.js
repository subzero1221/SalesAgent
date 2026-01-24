
import SessionsPage from "@/app/components/SessionsPage";

export default async function Page({ params }) {
  const { shopId } = await params;

  return <SessionsPage shopId={shopId} />;
}