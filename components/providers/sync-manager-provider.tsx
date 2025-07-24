"use client"

import { useSyncManager } from '@/hooks/use-sync-manager'

export function SyncManagerProvider({ children }: { children: React.ReactNode }) {
  // Initialize sync management
  useSyncManager()
  
  return <>{children}</>
}
