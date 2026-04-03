"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import { AdminSignOut } from "@/components/admin/AdminSignOut";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans border-beige-200/80",
            title: "text-[#2a2521]",
            description: "text-beige-700",
          },
        }}
      />
      {!isLogin && (
        <div className="border-b border-beige-200/70 bg-white/90 px-4 py-2 flex justify-end">
          <AdminSignOut />
        </div>
      )}
      {children}
    </div>
  );
}
