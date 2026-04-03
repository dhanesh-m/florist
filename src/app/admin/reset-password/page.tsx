import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-beige-600">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
