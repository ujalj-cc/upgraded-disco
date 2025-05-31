import { Navbar } from "@/app/component/NavBar"
import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
        <h1 className="text-4xl font-bold mb-4">Welcome to My OrgApp</h1>
        <p className="text-lg mb-8 max-w-xl text-center">
          Visualize and manage your organization's hierarchy easily and efficiently.
        </p>
        <Link href="/hierarchymap" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          View Hierarchy Map
        </Link>

          {/* <Link href="/hierarchymapv2" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          View Hierarchy Map V2
        </Link> */}

        
      </main>
    </>
  )
}
