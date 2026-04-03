import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { COOKIE_NAME, isAdminCookie } from "@/lib/admin-session";
import { isAdminLoginReady } from "@/lib/admin-auth-config";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (isAdminCookie(token)) {
    redirect("/admin");
  }

  const misconfigured = !(await isAdminLoginReady());

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-beige-600">Loading…</p>}>
        <LoginForm misconfigured={misconfigured} />
      </Suspense>
    </div>
  );
}
