#!/bin/bash

# Script de Despliegue para Backend NFT Servicios
# Este script configura un entorno virtual Python y despliega el backend

set -e  # Exit on any error

echo "🚀 Iniciando despliegue del Backend NFT Servicios"
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: No se encontró requirements.txt. Ejecuta desde la carpeta backend."
    exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python3 no está instalado"
    echo "Instala con: sudo apt update && sudo apt install python3 python3-pip python3-venv"
    exit 1
fi

# Crear entorno virtual
echo "📦 Creando entorno virtual Python..."
python3 -m venv venv

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "🔄 Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "📚 Instalando dependencias..."
pip install -r requirements.txt

# Verificar instalación
echo "✅ Verificando instalación..."
python -c "import fastapi, web3, uvicorn; print('✅ Dependencias cargadas correctamente')"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "⚠️  Creando archivo .env desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Edita el archivo .env con tus configuraciones antes de ejecutar el servidor"
    else
        echo "❌ No se encontró .env.example. Crea manualmente el archivo .env"
    fi
fi

# Mostrar información del sistema
echo ""
echo "📊 Información del Sistema:"
echo "==========================="
python --version
pip --version
echo "Entorno virtual: $(which python)"

# Instrucciones para ejecutar
echo ""
echo "🎯 Para ejecutar el servidor:"
echo "============================="
echo "1. Configura las variables en .env:"
echo "   - PRIVATE_KEY"
echo "   - RPC_URL"
echo "   - CONTRACT_ADDRESS"
echo "   - CHAIN_ID"
echo ""
echo "2. Activa el entorno virtual:"
echo "   source venv/bin/activate"
echo ""
echo "3. Ejecuta el servidor:"
echo "   python main.py"
echo ""
echo "4. El servidor estará en: http://localhost:8000"
echo "   - Documentación: http://localhost:8000/docs"
echo "   - Health check: http://localhost:8000/health"

echo ""
echo "✅ Despliegue completado. Sigue las instrucciones arriba para ejecutar el servidor."
