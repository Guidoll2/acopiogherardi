@echo off
echo ===================================
echo SOLUCION FINAL - TAILWIND CSS
echo ===================================

echo 1. Instalando Tailwind CSS correctamente...
npm install tailwindcss autoprefixer postcss --save-dev

echo.
echo 2. Limpiando cache...
if exist .next (
    rd /s /q .next
)

echo.
echo 3. Limpiando cache de npm...
npm cache clean --force

echo.
echo 4. Iniciando servidor de desarrollo...
echo Servidor estara disponible en: http://localhost:3000
echo.
npm run dev

pause
