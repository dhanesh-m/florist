"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error("Can't update password", { description: msg });
      return;
    }
    if (password.length < 8) {
      const msg = "Use at least 8 characters.";
      setError(msg);
      toast.error("Can't update password", { description: msg });
      return;
    }
    if (!token) {
      const msg = "Missing reset link. Request a new one from forgot password.";
      setError(msg);
      toast.error("Invalid link", { description: msg });
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        if (data.error === "invalid_or_expired_token") {
          const msg = "This link is invalid or expired. Request a new reset email.";
          setError(msg);
          toast.error("Can't update password", { description: msg });
          return;
        }
        const msg = "Could not update password. Try again.";
        setError(msg);
        toast.error("Save failed", { description: msg });
        return;
      }
      toast.success("Password updated", { description: "Sign in with your new password." });
      router.replace("/admin/login?reset=ok");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-beige-200/70 bg-white/90 shadow-soft p-8">
        <h1 className="font-display text-2xl text-[#2a2521]">Invalid link</h1>
        <p className="text-sm text-beige-600 mt-2 mb-6">Open the reset link from your email, or request a new one.</p>
        <Link
          href="/admin/forgot-password"
          className="inline-block text-sm font-medium text-[#b89164] hover:text-[#9f774d]"
        >
          Forgot password
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-beige-200/70 bg-white/90 shadow-soft p-8">
      <h1 className="font-display text-2xl text-[#2a2521]">Floral Doctor</h1>
      <p className="text-sm text-beige-600 mt-1 mb-6">Set a new password</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm text-beige-600 mb-1">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            minLength={8}
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm text-beige-600 mb-1">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={pending}
            minLength={8}
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] disabled:opacity-50 text-white font-medium transition-colors"
        >
          {pending ? "Saving…" : "Update password"}
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
