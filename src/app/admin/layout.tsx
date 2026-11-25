import type { Metadata } from "next";
export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel" }, robots: { index: false, follow: false } };
export default function AdminRoot({ children }: { children: React.ReactNode }) { return <div className="grow">{children}</div>; }
