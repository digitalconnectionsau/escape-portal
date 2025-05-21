// DashboardPage.TSX
// src/componets/pages/DashboardPage.tsx

'use client'

export default function DashboardPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="space-x-2">
          <button className="bg-orange-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded transition">
            New Organisation
          </button>
          <button className="bg-orange-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded transition">
            New Session
          </button>
        </div>
      </div>
      <p className="text-gray-700">Welcome to your admin dashboard. Use the menu to get started.</p>
    </>
  )
}
