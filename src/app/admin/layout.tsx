import type { Metadata } from "next";
import { AdminChrome } from "./AdminChrome";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Floral Doctor" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
