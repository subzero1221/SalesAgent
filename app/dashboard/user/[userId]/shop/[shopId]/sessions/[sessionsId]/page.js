import SingleSessionPage from "@/app/components/SingleSessionPage";

export const metadata = {
  title: "Sales Agent / session details",
  description: "My Sales Bot - AI Sales Assistant for E-commerce Businesses",
};

export default async function Page({ params }) {
  const { sessionId } = await params;

  return (
    <div className="w-full">
      {" "}
      <SingleSessionPage sessionId={sessionId} />
    </div>
  );
}
