import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
