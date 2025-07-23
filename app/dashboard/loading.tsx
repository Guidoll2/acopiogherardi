import { ConditionalLoadingSpinner } from "@/components/ui/conditional-loading-spinner"

export default function DashboardLoading() {
  return <ConditionalLoadingSpinner text="Cargando dashboard..." />
}
