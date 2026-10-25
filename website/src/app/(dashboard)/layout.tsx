import { Header } from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </main>
    </div>
  );
}