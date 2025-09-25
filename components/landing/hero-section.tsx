"use client"

import { Wheat, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const scrollToLogin = () => {
    const loginSection = document.getElementById('login-section')
    loginSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 opacity-90"></div>
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 rounded-full">
            <Wheat className="h-16 w-16 text-white" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Bienvenido a <br />
          <span className="text-green-200">Cuatro Granos</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed">
          La aplicación moderna y eficiente que resuelve las operaciones diarias 
          de empresas cerealeras, manteniendo comunicado a todo tu equipo de trabajo.
        </p>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Control Total</h3>
            <p className="text-green-100 text-base">Gestiona ingreso, pesaje y egreso de cereales</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Equipo Conectado</h3>
            <p className="text-green-100 text-base">Trabajo remoto y comunicación en tiempo real</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Prueba Gratuita</h3>
            <p className="text-green-100 text-base">Hasta 250 operaciones mensuales sin costo</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={scrollToLogin}
          size="lg" 
          className="bg-green-200 text-gray-700 hover:text-green-600 hover:bg-green-400 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Comenzar Ahora
          <ArrowDown className="ml-2 h-5 w-5" />
        </Button>

        {/* Trust Indicator */}
        <p className="mt-8 mb-8 text-gray-100 text-lg">
          ✓ Sin tarjeta de crédito • ✓ Configuración en minutos • ✓ Soporte incluido
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-100 to-transparent"></div>
    </section>
  )
}