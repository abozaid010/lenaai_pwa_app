'use client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function UnitPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = params.unit as string

  useEffect(() => {
    // Store unitId in localStorage
    localStorage.setItem('unitId', unitId)
    // Redirect to main page
    router.push('/')
  }, [unitId, router])

  return null // No need to render anything as we're redirecting
}
