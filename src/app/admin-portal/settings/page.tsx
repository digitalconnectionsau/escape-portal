// SettingsPage.tsx
'use client'

const superAdmins = [
  { id: 1, name: 'Craig Parker', email: 'craig@admin.com' },
  { id: 2, name: 'Jess Taylor', email: 'jess@admin.com' }
]

const companyAdmins = [
  { id: 1, name: 'Mark White', email: 'mark@company.com' },
  { id: 2, name: 'Lisa Green', email: 'lisa@company.com' }
]

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Super Admins</h2>
          <button className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded">
            ➕ Add Super Admin
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {superAdmins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Company Admins</h2>
          <button className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded">
            ➕ Add Company Admin
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {companyAdmins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
