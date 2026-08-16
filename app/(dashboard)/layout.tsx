import { Sidebar } from "@/components/shared/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background dark:bg-slate-950 transition-colors duration-200">
      <Sidebar className="hidden md:flex shrink-0" />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full overflow-x-hidden">
        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
