import { ReactNode } from "react";
import { Navbar, MobileNavbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-8 md:pl-64">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <MobileNavbar />
    </div>
  );
}
