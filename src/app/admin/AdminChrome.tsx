"use client";

import { Toaster } from "sonner";
import "sonner/dist/styles.css";

export function AdminChrome({ children }: { children: React.ReactNode }) {
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
      {children}
    </div>
  );
}
