"use client";

export function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
      className="text-sm text-beige-700 hover:text-blush-700 underline underline-offset-2"
    >
      Sign out
    </button>
  );
}
