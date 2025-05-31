"use client"

import Link from "next/link"

export function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">My OrgApp</div>
      <div className="space-x-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/hierarchymap" className="hover:underline">
          Hierarchy Map
        </Link>
      </div>
    </nav>
  )
}
