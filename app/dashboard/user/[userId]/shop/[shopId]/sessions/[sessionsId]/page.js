import SingleSessionPage from "@/app/components/SingleSessionPage";

export async function generateMetadata({ params }) {
  const { sessionId } = await params;
  return {
    title: `Session ${sessionId} / Details`,
    description: `Details for session with ID ${sessionId}`,
  };
}

export default async function Page({ params }) {
  const { sessionId } = await params;

  return (
    <div className="w-full">
      {" "}
      <SingleSessionPage sessionId={sessionId} />
    </div>
  );
}
