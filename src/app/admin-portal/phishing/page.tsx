// PhishingPage.tsx
'use client'

const phishingTests = [
  { id: 1, name: 'Employee Campaign A', date: '2024-06-01', status: 'Sent' },
  { id: 2, name: 'Internal Test', date: '2024-06-10', status: 'Draft' },
  { id: 3, name: 'Customer Awareness', date: '2024-07-01', status: 'Scheduled' }
]

export default function PhishingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Phishing</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Date</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {phishingTests.map(test => (
            <tr key={test.id}>
              <td>{test.name}</td>
              <td>{test.date}</td>
              <td>{test.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
