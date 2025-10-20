"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect /login to landing page and scroll to login section
    // We include the hash so the landing's login section is shown
    router.replace('/#login-section')
  }, [router])

  return null
}
