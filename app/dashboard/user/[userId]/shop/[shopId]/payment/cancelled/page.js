import CancelledPage from "@/app/components/PaymentCancelled";

export default async function Cancelled({ params }) {
     const {userId} =  await params; 
   const {shopId} = await params;

  return <CancelledPage userId={userId} shopId={shopId} />
    }    