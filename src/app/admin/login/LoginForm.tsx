"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  misconfigured: boolean;
};

export function LoginForm({ misconfigured }: Props) {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (misconfigured) return;
    if (!password.trim()) {
      const msg = "Enter your password.";
      setError(msg);
      toast.error("Sign-in failed", { description: msg });
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const msg =
          r.status === 503 ? "Server is not configured for admin login." : "Wrong password.";
        setError(msg);
        toast.error("Sign-in failed", { description: msg });
        return;
      }
      const from = searchParams.get("from");
      const target = from && from.startsWith("/admin") && from !== "/admin/login" ? from : "/admin";
      window.location.href = target;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-3xl border border-beige-200/70 bg-white/90 shadow-soft p-8">
      <h1 className="font-display text-2xl text-[#2a2521]">Floral Doctor</h1>
      <p className="text-sm text-beige-600 mt-1 mb-6">Admin sign-in</p>

      {misconfigured && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Configure admin access</p>
          <p className="mt-2">
            Set <code className="font-mono text-xs">ADMIN_SESSION_SECRET</code> (16+ random characters) and{" "}
            <code className="font-mono text-xs">FIREBASE_SERVICE_ACCOUNT_JSON</code> in your environment. Add a{" "}
            <code className="font-mono text-xs">password</code> field on the Firestore document{" "}
            <code className="font-mono text-xs">adminContent/main</code> (same document as site content), then restart
            or redeploy.
          </p>
        </div>
      )}

      {searchParams.get("error") === "config" && !misconfigured && (
        <p className="mb-4 text-sm text-amber-800">Session secret was missing; try again after configuring env.</p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-password" className="block text-sm text-beige-600 mb-1">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-beige-200/70 px-4 py-2 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={misconfigured || pending}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={misconfigured || pending}
          className="w-full px-6 py-3 rounded-2xl bg-[#b89164] hover:bg-[#9f774d] disabled:opacity-50 text-white font-medium transition-colors"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
