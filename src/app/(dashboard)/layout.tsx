import { Sidebar } from "@/components/layout/Sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get('hemat_session')?.value;
  
  let activeUser = "Gania K.";
  let activeRole = "owner";
  if (sessionValue && sessionValue.startsWith('{')) {
    try {
      const parsed = JSON.parse(sessionValue);
      if (parsed.name) activeUser = parsed.name;
      if (parsed.role) activeRole = parsed.role;
    } catch { console.error("Error parsing session"); }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-soft-gray">
      <Sidebar activeUser={activeUser} activeRole={activeRole} />
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
