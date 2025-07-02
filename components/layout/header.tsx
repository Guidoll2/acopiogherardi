"use client"

import { useEffect, useState } from "react"
import { AuthService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SettingsDialog } from "@/components/settings/settings-dialog"
import { ProfileDialog } from "@/components/profile/profile-dialog"
import { Bell, Settings } from "lucide-react"

function getInitials(name: string | undefined): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }, [])

  return (
    <>
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-600">Gestión de acopio de cereales</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-0" onClick={() => setProfileOpen(true)}>
              <Avatar>
                <AvatarFallback className="bg-green-600 text-white">
                  {getInitials(user?.full_name || user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Profile Dialog */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
