@echo off
echo Limpiando cache y rebuilding proyecto...

echo Eliminando node_modules...
if exist node_modules (
    rd /s /q node_modules
)

echo Eliminando .next...
if exist .next (
    rd /s /q .next
)

echo Eliminando package-lock.json...
if exist package-lock.json (
    del package-lock.json
)

echo Instalando dependencias...
npm install

echo Limpiando cache de npm...
npm cache clean --force

echo Iniciando servidor de desarrollo...
npm run dev
