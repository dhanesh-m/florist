"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const r = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (r.status === 503) {
        if (data.error === "email_not_configured") {
          const msg =
            "Password reset email is not configured. Add RESEND_API_KEY (and RESEND_FROM if needed) to your environment.";
          setError(msg);
          toast.error("Can't send reset email", { description: msg });
          return;
        }
        const msg =
          "Password reset is unavailable. Set FIREBASE_SERVICE_ACCOUNT_JSON so the server can store reset tokens.";
        setError(msg);
        toast.error("Can't send reset email", { description: msg });
        return;
      }
      if (!r.ok) {
        const msg = "Something went wrong. Try again later.";
        setError(msg);
        toast.error("Request failed", { description: msg });
        return;
      }
      setDone(true);
      toast.success("Check your email", {
        description: "If that address is on file, we sent a reset link (expires in one hour).",
      });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-beige-200/70 bg-white/90 shadow-soft p-8">
        <h1 className="font-display text-2xl text-[#2a2521]">Check your email</h1>
        <p className="text-sm text-beige-600 mt-2 mb-6">
          If an account exists for that address, we sent a reset link. It expires in one hour.
        </p>
        <Link
          href="/admin/login"
          className="inline-block text-sm font-medium text-[#b89164] hover:text-[#9f774d]"
        >
          Back to sign-in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-beige-200/70 bg-white/90 shadow-soft p-8">
      <h1 className="font-display text-2xl text-[#2a2521]">Floral Doctor</h1>
      <p className="text-sm text-beige-600 mt-1 mb-6">Forgot password</p>
      <p className="text-sm text-beige-600 mb-4">
        Enter the admin email on file. You will receive a link to set a new password.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm text-beige-600 mb-1">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] disabled:opacity-50 text-white font-medium transition-colors"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-beige-600">
        <Link href="/admin/login" className="text-[#b89164] hover:text-[#9f774d] font-medium">
          Back to sign-in
        </Link>
      </p>
    </div>
  );
}
