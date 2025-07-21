# 🧪 Guía de Pruebas - Sistema de Suscripciones

## ✅ **Fase 1 y 2 Completadas**

### 🔍 **Verificar migración:**
```bash
npx tsx scripts/check-migration.ts
```

### 🧪 **Probar límites de suscripción:**
```bash
npx tsx scripts/test-subscription-limits.ts
```

## 🌐 **Pruebas con API (servidor en localhost:3001)**

### 1. **Obtener información de suscripción:**
```
GET http://localhost:3001/api/subscription?company_id=COMPANY_ID
```
*Nota: Necesitas estar autenticado*

### 2. **Crear una operación (debe verificar límites):**
```
POST http://localhost:3001/api/operations
Content-Type: application/json

{
  "type": "ingreso",
  "date": "2025-07-21",
  "client_id": "CLIENT_ID",
  "driver_id": "DRIVER_ID",
  "cereal_id": "CEREAL_ID",
  "silo_id": "SILO_ID",
  "gross_weight": 1000,
  "tare_weight": 200,
  "net_weight": 800,
  "observations": "Prueba de límite de suscripción"
}
```

### 3. **Actualizar plan de empresa (solo system_admin):**
```
PUT http://localhost:3001/api/subscription
Content-Type: application/json

{
  "company_id": "COMPANY_ID",
  "new_plan": "enterprise"
}
```

## 📊 **Estados de prueba actuales:**

### Empresas en base de datos:
- **Todas con plan "basic"** (500 operaciones/mes)
- **Contador en 0** operaciones
- **Ciclo de facturación** configurado correctamente

### Planes disponibles:
- **Free**: 250 operaciones/mes, $0
- **Basic**: 500 operaciones/mes, $29  
- **Enterprise**: Ilimitadas, $299

## 🔄 **Próximos pasos:**
1. ✅ Modelos MongoDB actualizados
2. ✅ API de operaciones con validación de límites
3. ✅ Servicio de suscripciones completo
4. ✅ **Interfaz de usuario para mostrar límites**
5. ✅ **Botones de acciones mejorados (iconos más grandes)**
6. ✅ **API para actualizar operaciones (/api/operations/[id])**
7. ✅ **Función de avance de estado corregida**
8. 🔜 **Siguiente**: Dashboard de administración de suscripciones

## 🐛 **Fixes Aplicados - Problemas en Operaciones:**

### ✅ **Iconos de acciones muy pequeños:**
- Aumentado tamaño de iconos de 4x4 a 5x5
- Aumentado tamaño de botones de 8x8 a 9x9
- Agregados colores distintivos para cada acción
- Aumentado ancho de columna "Acciones" de 48 a 72

### ✅ **Botones no funcionaban:**
- Agregados logs de debug en handleViewOperation y handleEditOperation
- Mejorado OperationViewDialog para manejar casos de operación no encontrada
- Verificación de datos en diálogos

### ✅ **Avance de estado no funcionaba:**
- Reemplazada simulación con llamada real a API
- Creado endpoint PUT /api/operations/[id] para actualizar operaciones
- Agregado manejo de errores y feedback al usuario
- Verificación de permisos por empresa

### ✅ **API de operaciones individuales:**
- GET /api/operations/[id] - Obtener operación específica
- PUT /api/operations/[id] - Actualizar operación
- DELETE /api/operations/[id] - Eliminar operación (solo system_admin)

### 🔧 **Fix Crítico - Mapeo de IDs MongoDB:**
- **Problema**: MongoDB genera `_id` como ObjectId pero el frontend espera `id` como string
- **Solución**: Agregado mapeo automático de `_id` → `id` en todos los endpoints de operaciones
- **Endpoints actualizados**: 
  - GET /api/operations (lista)
  - POST /api/operations (crear)
  - GET /api/operations/[id] (individual)
  - PUT /api/operations/[id] (actualizar)
- **Resultado**: Consistencia entre base de datos y frontend

### 🔧 **Fix Crítico - Esquema de Operaciones:**
- **Problema**: Inconsistencias entre modelo MongoDB y frontend
- **Cambios aplicados**:
  - ✅ Modelo MongoDB: `cereal_id` → `cereal_type_id`
  - ✅ Estado de operación: `"pendiente"` → `"pending"` (default)
  - ✅ Tipo de operación: `operation_type` → `type`
  - ✅ Campo fecha requerido: `date` agregado
  - ✅ Eliminados datos mock que causaban conflictos
  - ✅ Agregados campos de peso faltantes en formulario
  - ✅ **Formulario de nueva operación corregido**
  - ✅ **Función addOperation actualizada con conversión de campos**
  - ✅ **Tipos TypeScript sincronizados con API**
- **Resultado**: Operaciones se crean y actualizan correctamente

## 🐛 **Troubleshooting:**

### Si el endpoint /api/subscription retorna 401:
- Necesitas estar logueado en la aplicación
- O usar Postman/curl con token de autorización

### Para obtener un token de autorización:
1. Loguéate en http://localhost:3001/login
2. Usa las credenciales del admin: `ignacio.gherardi@gmail.com` / `Caprichoso`
3. Inspecciona las cookies para obtener el `auth-token`

### Para simular muchas operaciones rápidamente:
```bash
# Ejecutar script personalizado que cree múltiples operaciones
npx tsx scripts/stress-test-limits.ts
```
