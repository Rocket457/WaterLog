@echo off
echo ========================================
echo   Iniciando WaterLog na Porta 80
echo ========================================
echo.

echo ⚠️  ATENÇÃO: A porta 80 requer privilégios de administrador
echo.

echo 🔧 Verificando privilégios...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como administrador
) else (
    echo ❌ Execute este script como administrador
    echo    Clique com botão direito → "Executar como administrador"
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servidor WaterLog...
echo 🌐 URL: http://waterlog.servebeer.com
echo 📍 Porta: 80
echo.

cd /d "%~dp0"
node server.js

pause 