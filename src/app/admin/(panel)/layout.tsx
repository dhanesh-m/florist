import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifySession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    redirect("/admin/login?error=config");
  }

  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token || !verifySession(token, secret)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
