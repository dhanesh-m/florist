import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-beige-600">Loading…</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
