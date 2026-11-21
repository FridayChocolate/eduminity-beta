import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <Header />
      <div className="flex w-full min-w-0">
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 min-w-0 w-full p-3 md:p-6 overflow-x-hidden">
          <Breadcrumbs />
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
};