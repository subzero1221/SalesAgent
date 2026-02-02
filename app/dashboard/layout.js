
import AccessDenied from "../components/AccessDenied";
import { createClient } from "@/lib/supabaseServer";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
