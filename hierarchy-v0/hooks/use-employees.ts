"use client"

import { useState, useEffect } from "react"
import type { Employee } from "@/types/employee"

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/employees")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const refetch = async () => {
    await fetchEmployees()
  }

  return { employees, loading, error, refetch }
}
