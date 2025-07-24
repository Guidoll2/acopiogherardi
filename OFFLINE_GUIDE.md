# Guía de Funcionalidad Offline - Acopio GH

## ✅ Funcionalidades Implementadas

### 🔧 Infraestructura PWA
- **Service Worker**: Cacheo inteligente de recursos
- **Manifest**: Configuración PWA completa
- **Iconos**: Generados automáticamente para todas las resoluciones

### 💾 Almacenamiento Offline
- **IndexedDB**: Base de datos local para operaciones offline
- **Cola de Sincronización**: Queue automática para cambios pendientes
- **Datos Temporales**: IDs temporales para nuevos registros

### 🔄 Sincronización Inteligente
- **Sync Automático**: Al recuperar conexión
- **Resolución de Conflictos**: Estrategias automáticas
- **Retry Logic**: Reintentos automáticos con backoff

### 📱 Experiencia de Usuario
- **Indicador de Estado**: Muestra estado online/offline
- **Progreso de Sync**: Barra de progreso durante sincronización
- **Notificaciones**: Alertas de cambios pendientes

## 🚀 Cómo Funciona

### Modo Online
1. Todas las operaciones van directamente al servidor
2. Los datos se guardan automáticamente en caché local
3. El indicador muestra estado "online" (verde)

### Modo Offline
1. Las operaciones se guardan en IndexedDB local
2. Se asignan IDs temporales a nuevos registros
3. El indicador muestra estado "offline" (rojo)
4. Las operaciones aparecen como "pendientes de sincronización"

### Recuperación de Conexión
1. Detección automática de conexión
2. Sincronización automática de cambios pendientes
3. Resolución de conflictos si es necesario
4. Actualización de la UI con datos del servidor

## 📋 Operaciones Soportadas Offline

### ✅ Completamente Soportadas
- **Operaciones**: Crear, editar, eliminar
- **Clientes**: Crear, editar, eliminar
- **Choferes**: Crear, editar, eliminar
- **Empresas**: Crear, editar, eliminar
- **Cereales**: Crear, editar, eliminar
- **Silos**: Crear, editar, eliminar
- **Usuarios**: Crear, editar, eliminar

### 📊 Datos Disponibles Offline
- Todos los datos se mantienen sincronizados localmente
- Búsquedas y filtros funcionan completamente offline
- Reportes básicos disponibles con datos locales

## 🎛️ Controles de Usuario

### Indicador de Estado Offline
**Ubicación**: Esquina superior derecha de la aplicación

**Estados**:
- 🟢 **Online**: Conectado al servidor
- 🟡 **Sincronizando**: Enviando cambios pendientes
- 🔴 **Offline**: Sin conexión

**Acciones Disponibles**:
- **Forzar Sincronización**: Botón manual para sincronizar
- **Ver Pendientes**: Lista de cambios por sincronizar
- **Limpiar Caché**: Resetear datos locales (emergencia)

### Notificaciones
- **Cambios Guardados**: Confirmación de operaciones offline
- **Sync Completado**: Cuando se envían cambios al servidor
- **Conflictos**: Cuando hay datos duplicados o conflictivos

## 🔧 Configuración y Mantenimiento

### Instalación PWA
1. Abrir la aplicación en Chrome/Edge
2. Buscar el ícono "Instalar" en la barra de direcciones
3. Seguir las instrucciones del navegador
4. La app aparecerá como aplicación nativa

### Límites de Almacenamiento
- **IndexedDB**: ~50MB por dominio (navegador dependiente)
- **Service Worker Cache**: ~20MB adicionales
- **Limpieza Automática**: Datos antiguos se eliminan automáticamente

### Resolución de Problemas
1. **Cache Corrupto**: Usar "Limpiar Caché" en el indicador offline
2. **Sync Fallido**: Verificar conexión y reintentir manualmente
3. **Datos Duplicados**: El sistema resolverá automáticamente conflictos

## 📝 Notas Técnicas

### Estrategias de Caché
- **API Calls**: Network-first con fallback a caché
- **Recursos Estáticos**: Cache-first para mejor rendimiento
- **HTML**: Network-first para actualizaciones

### Detección de Red
- **Navigator.onLine**: Detección básica de conectividad
- **Ping API**: Verificación real de conectividad al servidor
- **Calidad de Conexión**: Medición de latencia y velocidad

### Persistencia de Datos
- **Datos Críticos**: Nunca se eliminan automáticamente
- **Caché Temporal**: Se limpia después de 30 días
- **Configuración Usuario**: Persiste entre sesiones

## 🎯 Próximas Mejoras

### Funcionalidades Avanzadas
- [ ] Sync selectivo por tipo de datos
- [ ] Compresión de datos locales
- [ ] Exportación de datos offline
- [ ] Modo "Solo Lectura" para dispositivos limitados

### Optimizaciones
- [ ] Lazy loading de datos grandes
- [ ] Compresión de imágenes offline
- [ ] Precarga inteligente de datos frecuentes

---

## 🆘 Soporte

Para problemas con la funcionalidad offline:
1. Verificar que el navegador soporte Service Workers
2. Asegurar que el sitio se accede por HTTPS
3. Revisar la consola del navegador para errores
4. Usar las herramientas de desarrollador para inspeccionar IndexedDB

**Navegadores Compatibles**: Chrome 40+, Firefox 44+, Safari 11.1+, Edge 17+
