import { getRequests } from "@/lib/actions/requestActions";
import RequestsRenderer from "@/app/components/RequestsRenderer";

export default async function RequestsPage({ params, searchParams}) {
 const resolvedParams = await params;
 const resolvedSearchParams = await searchParams;

 const shopId = resolvedParams.shopId;
 const page = parseInt(resolvedSearchParams.page) || 1;
 const pageSize = 10;

 
 const { data: requests, count } = await getRequests(shopId, page, pageSize);
 const totalPages = Math.ceil(count / pageSize);

    return <RequestsRenderer requests={requests} count={count} totalPages={totalPages} currentPage={page} shopId={shopId} />;
}