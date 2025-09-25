"use client"

import { Wheat, Mail, Github, Linkedin, ExternalLink } from "lucide-react"

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToLogin = () => {
    const loginSection = document.getElementById('login-section')
    loginSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Wheat className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Cuatro Granos</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Sistema moderno de gestión de cereales que conecta a todo tu equipo de trabajo. 
              Controla ingreso, pesaje y egreso de cereales desde cualquier dispositivo.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={scrollToLogin}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-300"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={scrollToTop}
                className="border border-gray-600 hover:border-green-600 px-6 py-2 rounded-lg font-semibold transition-colors duration-300"
              >
                Volver Arriba
              </button>
            </div>
          </div>

          {/* Features Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Características</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• Control de Pesaje</li>
              <li>• Gestión de Transporte</li>
              <li>• Reportes en Tiempo Real</li>
              <li>• Trabajo Remoto</li>
              <li>• Acceso Móvil</li>
              <li>• Datos Seguros</li>
            </ul>
          </div>

          {/* Trial Info Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Prueba Gratuita</h4>
            <div className="text-gray-300 space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                250 operaciones gratis
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Sin tarjeta de crédito
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Configuración incluida
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Soporte técnico
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-2 text-green-400">Desarrollado por</h4>
              <a href="http://guidollaurado.vercel.app" target="_blank" rel="noopener noreferrer">
                <span className="font-semibold">Guido Llaurado</span> - Desarrollador Full Stack
              </a>
              <p className="text-gray-400 text-sm">
                Especialista en aplicaciones web modernas y sistemas de gestión
              </p>
            </div>
            
            <div className="flex gap-4">
              <a 
                href="mailto:guido.llaurado@gmail.com" 
                className="bg-gray-800 hover:bg-green-600 p-3 rounded-lg transition-colors duration-300 group"
                title="Contacto por Email"
              >
                <Mail className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="https://github.com/guidoll2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-green-600 p-3 rounded-lg transition-colors duration-300 group"
                title="GitHub Profile"
              >
                <Github className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
              <a 
                href="https://www.linkedin.com/in/guido-llaurado-381316118/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-green-600 p-3 rounded-lg transition-colors duration-300 group"
                title="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} Cuatro Granos. Todos los derechos reservados.
            </p>
    
          </div>
        </div>
      </div>
    </footer>
  )
}