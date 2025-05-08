'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const linkClass = (href: string, exact: boolean = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href)
    return isActive
      ? 'block py-2 px-4 rounded bg-orange-500 text-black font-bold'
      : 'block py-2 px-4 rounded hover:bg-orange-400 hover:text-black text-white transition'
  }

  return (
    <aside className="w-64 bg-black p-6 min-h-screen flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="mb-8 self-center text-center">
          <Image
            src="/EPHv1.png"
            alt="Escape Portal Logo"
            width={160}
            height={60}
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
        <Link href="/admin-portal" className={linkClass('/admin-portal', true)}>
            Dashboard
          </Link>
          <Link href="/admin-portal/organisations" className={linkClass('/admin-portal/organisations')}>
            Organisations
          </Link>
          <Link href="/admin-portal/rounds" className={linkClass('/admin-portal/rounds')}>
            Rounds
          </Link>
          <Link href="/admin-portal/sessions" className={linkClass('/admin-portal/sessions')}>
            Sessions
          </Link>
          <Link href="/admin-portal/games" className={linkClass('/admin-portal/games')}>
            Games
          </Link>
          <Link href="/admin-portal/quizzes" className={linkClass('/admin-portal/quizzes')}>
            Quizzes
          </Link>
          <Link href="/admin-portal/phishing" className={linkClass('/admin-portal/phishing')}>
            Phishing
          </Link>
          <Link href="/admin-portal/settings" className={linkClass('/admin-portal/settings')}>
            Settings
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded transition"
      >
        Logout
      </button>
    </aside>
  )
}
