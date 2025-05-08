import './globals.css'

export const metadata = {
  title: 'Escape Portal',
  description: 'Cyber escape game admin portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}
