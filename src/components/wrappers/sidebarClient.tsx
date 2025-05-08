'use client'
import dynamic from 'next/dynamic'

const Sidebar = dynamic(() => import('@/components/common/Sidebar'), { ssr: false })
export default Sidebar
