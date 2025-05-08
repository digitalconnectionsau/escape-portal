// app/admin-portal/layout.tsx
import Sidebar from '@/components/common/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 bg-white text-black p-8">
        {children}
      </main>
    </div>
  )
}
