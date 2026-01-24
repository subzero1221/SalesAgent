import SingleSessionPage from "@/app/components/SingleSessionPage";

export default async function Page({ params }) {
  const { sessionId } = await params;

  return <SingleSessionPage sessionId={sessionId} />;
}
