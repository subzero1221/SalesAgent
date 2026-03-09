import SuccessPage from "@/app/components/PaymentSuccess";

export default async function Success({ params }) {
   const {userId} =  await params; 
   const {shopId} = await params;

  return <SuccessPage userId={userId} shopId={shopId} />
    } 