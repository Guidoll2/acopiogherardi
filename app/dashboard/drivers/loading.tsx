import { ConditionalLoadingSpinner } from "@/components/ui/conditional-loading-spinner"

export default function Loading() {
  return <ConditionalLoadingSpinner text="Cargando conductores..." />
}
// Este componente se utiliza para mostrar un estado de carga mientras se cargan los datos de la página