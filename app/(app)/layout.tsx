import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#0A0412" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[240px] min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
