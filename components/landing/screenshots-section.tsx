"use client"

import { Monitor, Smartphone, Tablet } from "lucide-react"

export function ScreenshotsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Interfaz <span className="text-green-600">Moderna</span> y <span className="text-green-600">Intuitiva</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Diseñado para ser fácil de usar en cualquier dispositivo, 
            con una interfaz clara que reduce errores y aumenta la productividad.
          </p>
        </div>

        {/* Device Mockups */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Desktop View */}
          <div className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-lg mb-4 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <div className="bg-gray-900 rounded-lg p-3 mb-4 h-64 flex flex-col">
                <div className="flex gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-gray-100 flex-1 rounded overflow-hidden">
                  <img 
                    src="/dash.jpg" 
                    alt="Dashboard Completo" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard Completo</h3>
                  <p className="text-gray-600 text-sm">
                    Vista general de operaciones, reportes y estadísticas en tiempo real
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet View */}
          <div className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-lg mb-4 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <div className="bg-gray-800 rounded-lg p-3 mb-4 h-64 flex flex-col mx-auto w-48">
                <div className="bg-gray-100 flex-1 rounded overflow-hidden">
                  <img 
                    src="/garita.jpg" 
                    alt="Control de Garita" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Control de Garita</h3>
                  <p className="text-gray-600 text-sm">
                    Interfaz optimizada para tablets en garita de entrada y salida
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="text-center">
            <div className="bg-white rounded-xl p-4 shadow-lg mb-4 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <div className="bg-gray-800 rounded-xl p-2 mb-4 h-64 flex flex-col mx-auto w-32">
                <div className="bg-gray-100 flex-1 rounded-lg overflow-hidden">
                  <img 
                    src="/responsive.jpg" 
                    alt="App Móvil" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">App Móvil</h3>
                  <p className="text-gray-600 text-sm">
                    Acceso completo desde smartphones para supervisión remota
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Screenshot */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
          <div className="bg-gray-900 rounded-xl p-4 relative overflow-hidden">
            {/* Mock Browser Interface */}
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            
            {/* Main Screenshot */}
            <div className="bg-gray-100 rounded-lg overflow-hidden h-96 md:h-[500px]">
              <img 
                src="/operaciones.jpg" 
                alt="Sistema de Gestión de Operaciones" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>
          
          <div className="text-center mt-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Sistema Completo de Operaciones
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Diseñado específicamente para la industria cerealera con todas las funciones que necesitas. 
              Interfaz intuitiva que facilita la gestión diaria de tu empresa.
            </p>
          </div>
        </div>

        {/* Additional Screenshots Gallery */}
        <div className="mt-16 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Más Funcionalidades del Sistema
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-32 bg-gray-100 overflow-hidden">
                <img 
                  src="/dash.jpg" 
                  alt="Dashboard Principal" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Dashboard</h4>
                <p className="text-xs text-gray-600">Panel de control principal</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-32 bg-gray-100 overflow-hidden">
                <img 
                  src="/garita.jpg" 
                  alt="Control de Garita" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Garita</h4>
                <p className="text-xs text-gray-600">Control de entrada y salida</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-32 bg-gray-100 overflow-hidden">
                <img 
                  src="/operaciones.jpg" 
                  alt="Gestión de Operaciones" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Operaciones</h4>
                <p className="text-xs text-gray-600">Gestión completa de operaciones</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-32 bg-gray-100 overflow-hidden">
                <img 
                  src="/responsive.jpg" 
                  alt="Versión Móvil" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Móvil</h4>
                <p className="text-xs text-gray-600">Acceso desde cualquier dispositivo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Rápido</h4>
            <p className="text-gray-600 text-sm">Carga instantánea</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">📱</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Responsive</h4>
            <p className="text-gray-600 text-sm">Todos los dispositivos</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Intuitivo</h4>
            <p className="text-gray-600 text-sm">Fácil de aprender</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">🔒</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Seguro</h4>
            <p className="text-gray-600 text-sm">Datos protegidos</p>
          </div>
        </div>
      </div>
    </section>
  )
}