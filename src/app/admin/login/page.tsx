import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { COOKIE_NAME, verifySession } from "@/lib/admin-session";
import { isAdminLoginReady } from "@/lib/admin-auth-config";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token && secret && secret.length >= 16 && verifySession(token, secret)) {
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
