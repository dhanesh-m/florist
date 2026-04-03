import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, isAdminCookie } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!isAdminCookie(token)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
