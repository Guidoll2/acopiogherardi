Scripts administrativos para buscar y limpiar emails en la base de datos.

IMPORTANTE:
- Estos scripts se deben ejecutar manualmente desde el entorno de desarrollo o desde una terminal segura.
- No deben correrse automáticamente en producción sin revisión.
- Requieren que la string de conexión en el repo apunte a la base de datos correcta.

Archivos:
- find-email-in-db.js : Busca un email (case-insensitive) en colecciones comunes y muestra muestras.
- delete-email-everywhere.js : Elimina coincidencias exactas de email en `users`, `clients` y `drivers`.
- delete-user-by-email.js : Script auxiliar para listar y eliminar en `users`.

Uso:
  node scripts\\admin\\find-email-in-db.js
  node scripts\\admin\\delete-email-everywhere.js
  node scripts\\admin\\delete-user-by-email.js

Seguridad:
- Hacer backup antes de ejecutar operaciones destructivas.
- Preferir usar `find-email-in-db.js` primero para inspeccionar.
