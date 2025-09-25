"use client"

import { 
  Scale, 
  Truck, 
  BarChart3, 
  Users, 
  Clock, 
  Shield,
  Smartphone,
  Globe,
  CheckCircle
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Scale,
      title: "Control de Pesaje",
      description: "Registro preciso del peso de entrada y salida de cereales con integración a básculas digitales."
    },
    {
      icon: Truck,
      title: "Gestión de Transporte",
      description: "Control completo de vehículos, choferes y documentación de carga."
    },
    {
      icon: BarChart3,
      title: "Reportes en Tiempo Real",
      description: "Visualización instantánea de operaciones, stock y movimientos de cereales."
    },
    {
      icon: Users,
      title: "Equipo Conectado",
      description: "Comunicación fluida entre garita, administración y campo en tiempo real."
    },
    {
      icon: Clock,
      title: "Operación 24/7",
      description: "Sistema disponible las 24 horas para operaciones continuas."
    },
    {
      icon: Shield,
      title: "Datos Seguros",
      description: "Información protegida con respaldos automáticos y acceso controlado."
    },
    {
      icon: Smartphone,
      title: "Acceso Móvil",
      description: "Funciona perfectamente en computadoras, tablets y smartphones."
    },
    {
      icon: Globe,
      title: "Trabajo Remoto",
      description: "Acceso desde cualquier lugar con conexión a internet."
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Todo lo que necesitas para gestionar 
            <span className="text-green-600"> tu cerealera</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cuatro Granos moderniza la gestión de cereales con herramientas 
            intuitivas que simplifican las operaciones diarias de tu empresa.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Process Flow */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Proceso Simplificado
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ingreso</h4>
              <p className="text-gray-600 text-sm">
                Registro del vehículo y primera pesada en garita
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Operación</h4>
              <p className="text-gray-600 text-sm">
                Carga/descarga de cereales y actualización de stock
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Egreso</h4>
              <p className="text-gray-600 text-sm">
                Pesada final, documentación y salida del establecimiento
              </p>
            </div>
          </div>
        </div>

        {/* Trial Info */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Prueba Gratuita Sin Compromiso
          </h3>
          <p className="text-xl text-green-100 mb-6">
            Comienza con hasta 250 operaciones mensuales completamente gratis
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-200" />
              <span className="text-green-100">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-200" />
              <span className="text-green-100">Configuración incluida</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-200" />
              <span className="text-green-100">Soporte técnico</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}