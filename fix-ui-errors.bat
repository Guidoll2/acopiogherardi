@echo off
echo =======================================
echo LIMPIEZA COMPLETA DE CACHE VS CODE + TYPESCRIPT
echo =======================================

echo.
echo 1. Eliminando cache de Next.js...
if exist .next (
    rd /s /q .next
)

echo.
echo 2. Eliminando cache de node_modules...
if exist node_modules\.cache (
    rd /s /q node_modules\.cache
)

echo.
echo 3. Eliminando cache de TypeScript...
if exist tsconfig.tsbuildinfo (
    del tsconfig.tsbuildinfo
)

echo.
echo 4. Limpiando cache de npm...
npm cache clean --force

echo.
echo 5. Verificando errores de TypeScript...
npx tsc --noEmit

echo.
echo 6. Iniciando servidor de desarrollo...
echo Servidor estara disponible en: http://localhost:3000
echo.
npm run dev

pause
