Cambio: email_normalized

Se añadió el campo `email_normalized` en `app/mongoDB/models/user.ts` y middleware para mantenerlo sincronizado.

Propósito:
- Compatibilidad con proveedores MongoDB que no soportan índices con `collation` (e.g., algunas versiones de Azure Cosmos).
- Permitir un índice único y búsquedas case-insensitive de forma portable.

Notas de implementación:
- `email_normalized` se guarda siempre en lowercase y sin espacios.
- Índice único creado: `{ email_normalized: 1 }`.
- Middleware `pre('save')` y `pre('findOneAndUpdate')` se encargan de poblar/normalizar el campo.

Recomendación:
- Asegurar que `MONGODB_URI` apunte a la base canónica en producción (por ejemplo `/cuatrogranos`).
- Reiniciar la app tras desplegar este cambio.
