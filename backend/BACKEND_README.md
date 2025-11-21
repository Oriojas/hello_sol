# NFT Servicios Backend - FastAPI

Backend REST para gestionar NFTs de servicios de acompañamiento a adultos mayores en Arbitrum Sepolia. Todas las transacciones se ejecutan automáticamente con la clave privada configurada.

## 🚀 Setup Rápido

### 1. Instalar Dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno
Copia `.env.example` a `.env` y completa:
```bash
cp .env.example .env
```

Edita el archivo `.env`:
```
PRIVATE_KEY=0xtuclaveprívadadelwallet
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
CONTRACT_ADDRESS=0xFF2E077849546cCB392f9e38B716A40fDC451798
CHAIN_ID=421614
```

### 3. Ejecutar Servidor
```bash
python main.py
```

API estará disponible en `http://localhost:8000`
- Documentación interactiva (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📋 Endpoints Principales (Flujo de Operación)

### 1️⃣ CREAR SERVICIO
Crear un nuevo NFT de servicio (estado: CREADO)

**POST** `/servicios/crear`
```json
{
  "destinatario": "0x..."
}
```
**Retorna:**
```json
{
  "success": true,
  "tokenId": 3,
  "destinatario": "0xa92d504731aA3E99DF20ffd200ED03F9a55a6219",
  "estado": 1,
  "transaction": {
    "transactionHash": "f7ac30bbb621be2e131d1627a109597286980a32a747353980a7a0907f0ec59a",
    "blockNumber": 217621429,
    "gasUsed": 87663,
    "status": 1
  }
}
```

---

### 2️⃣ ASIGNAR ACOMPAÑANTE
Asignar un acompañante a un servicio

**POST** `/servicios/{tokenId}/asignar-acompanante`
```json
{
  "acompanante": "0x..."
}
```
**Retorna:**
```json
{
  "success": true,
  "tokenId": 3,
  "acompanante": "0x...",
  "transaction": {
    "transactionHash": "...",
    "blockNumber": 217621516,
    "gasUsed": 36070,
    "status": 1
  }
}
```

---

### 3️⃣ CONFIGURAR URIs (Metadatos)
Establecer el URI (metadata) para cada estado (opcional pero recomendado)

**POST** `/configuracion/uri-estado`
```json
{
  "estado": 1,
  "nuevaURI": "ipfs://QmXxxx..."
}
```
**Estados disponibles:** 1 (CREADO), 2 (ENCONTRADO), 3 (TERMINADO), 4 (CALIFICADO), 5 (PAGADO)

**Retorna:**
```json
{
  "success": true,
  "estado": 1,
  "uri": "ipfs://QmXxxx...",
  "transaction": {
    "transactionHash": "...",
    "blockNumber": 217621516,
    "gasUsed": 36070,
    "status": 1
  }
}
```

---

### 4️⃣ CAMBIAR ESTADO
Cambiar el estado del servicio en el flujo:
- 1 = CREADO (inicial)
- 2 = ENCONTRADO
- 3 = TERMINADO
- 4 = CALIFICADO (requiere calificación 1-5)
- 5 = PAGADO (crea NFT de evidencia automáticamente)

**POST** `/servicios/{tokenId}/cambiar-estado`
```json
{
  "nuevoEstado": 2,
  "calificacion": 0
}
```
**Ejemplo con calificación (estado 4):**
```json
{
  "nuevoEstado": 4,
  "calificacion": 5
}
```
**Retorna:**
```json
{
  "success": true,
  "tokenId": 3,
  "estadoAnterior": 1,
  "nuevoEstado": 2,
  "calificacion": 0,
  "transaction": {
    "transactionHash": "...",
    "blockNumber": 217621516,
    "gasUsed": 36070,
    "status": 1
  }
}
```

---

### 5️⃣ MARCAR COMO PAGADO
Marcar servicio como pagado (crea NFT de evidencia automáticamente)

**POST** `/servicios/{tokenId}/marcar-pagado`
**Retorna:**
```json
{
  "success": true,
  "tokenId": 3,
  "tokenIdEvidencia": 4,
  "estado": 5,
  "transaction": {
    "transactionHash": "...",
    "blockNumber": 217621516,
    "gasUsed": 36070,
    "status": 1
  }
}
```

---

## 🔍 Endpoints de Consulta (No gastan gas)

### 6️⃣ OBTENER ESTADO DEL SERVICIO
**GET** `/servicios/{tokenId}/estado`
**Retorna:**
```json
{
  "tokenId": 3,
  "estado": 2,
  "estadoNombre": "ENCONTRADO"
}
```

### 7️⃣ OBTENER URI DEL SERVICIO
**GET** `/servicios/{tokenId}/uri`
**Retorna:**
```json
{
  "tokenId": 3,
  "uri": "ipfs://QmXxxx..."
}
```

### 8️⃣ OBTENER CALIFICACIÓN DEL SERVICIO
**GET** `/servicios/{tokenId}/calificacion`
**Retorna:**
```json
{
  "tokenId": 3,
  "calificacion": 5
}
```

### 9️⃣ OBTENER ACOMPAÑANTE ASIGNADO
**GET** `/servicios/{tokenId}/acompanante`
**Retorna:**
```json
{
  "tokenId": 3,
  "acompanante": "0x..."
}
```

### 🔟 OBTENER NFT DE EVIDENCIA
**GET** `/servicios/{tokenId}/evidencia`
**Retorna:**
```json
{
  "tokenId": 3,
  "tokenIdEvidencia": 4
}
```

### 1️⃣1️⃣ LISTAR SERVICIOS POR USUARIO
**GET** `/servicios/usuario/{usuarioAddress}`
**Retorna:**
```json
{
  "usuario": "0xa92d504731aA3E99DF20ffd200ED03F9a55a6219",
  "cantidad": 3,
  "servicios": [0, 1, 2]
}
```

---

## 📊 Endpoints de Logs y Monitoreo

### 1️⃣2️⃣ OBTENER HISTORIAL DE TRANSACCIONES
**GET** `/logs/transacciones?limit=50`
**Parámetros opcionales:**
- `limit`: Número máximo de transacciones a retornar (default: 50)

**Retorna:**
```json
{
  "total": 5,
  "transactions": [
    {
      "timestamp": "2025-11-21T18:03:31.904657",
      "transaction_hash": "edf69ca139d865e0eb9d9c9e6c742bef02927fa4ff6ce33ed681832351951f17",
      "arbiscan_url": "https://sepolia.arbiscan.io/tx/edf69ca139d865e0eb9d9c9e6c742bef02927fa4ff6ce33ed681832351951f17",
      "function": "cambiarEstadoServicio",
      "parameters": {
        "tokenId": 3,
        "nuevoEstado": 2,
        "calificacion": 0
      },
      "result": {
        "estadoAnterior": 1,
        "nuevoEstado": 2,
        "transactionHash": "edf69ca139d865e0eb9d9c9e6c742bef02927fa4ff6ce33ed681832351951f17",
        "blockNumber": 217621516,
        "gasUsed": 36070,
        "status": 1
      },
      "status": "success",
      "block_number": 217621516,
      "gas_used": 36070,
      "network": "arbitrumSepolia"
    }
  ]
}
```

### 1️⃣3️⃣ OBTENER ESTADÍSTICAS DE LOGS
**GET** `/logs/estadisticas`
**Retorna:**
```json
{
  "total_transactions": 5,
  "function_counts": {
    "crearServicio": 2,
    "cambiarEstadoServicio": 3
  },
  "status_counts": {
    "success": 5
  },
  "total_gas_used": 250000,
  "first_transaction": "2025-11-21T18:03:09.511162",
  "last_transaction": "2025-11-21T18:05:12.123456"
}
```

### 1️⃣4️⃣ BUSCAR TRANSACCIÓN POR HASH
**GET** `/logs/transaccion/{tx_hash}`
**Retorna:**
```json
{
  "timestamp": "2025-11-21T18:03:09.511162",
  "transaction_hash": "f7ac30bbb621be2e131d1627a109597286980a32a747353980a7a0907f0ec59a",
  "arbiscan_url": "https://sepolia.arbiscan.io/tx/f7ac30bbb621be2e131d1627a109597286980a32a747353980a7a0907f0ec59a",
  "function": "crearServicio",
  "parameters": {
    "destinatario": "0xa92d504731aA3E99DF20ffd200ED03F9a55a6219"
  },
  "result": {
    "tokenId": 3,
    "estado": 1,
    "transactionHash": "f7ac30bbb621be2e131d1627a109597286980a32a747353980a7a0907f0ec59a",
    "blockNumber": 217621429,
    "gasUsed": 87663,
    "status": 1
  },
  "status": "success",
  "block_number": 217621429,
  "gas_used": 87663,
  "network": "arbitrumSepolia"
}
```

---

## ℹ️ Endpoints de Información

### 1️⃣5️⃣ INFORMACIÓN DEL CONTRATO
**GET** `/info/contrato`
**Retorna:**
```json
{
  "contractAddress": "0xFF2E077849546cCB392f9e38B716A40fDC451798",
  "nombre": "ColeccionServiciosNFT",
  "simbolo": "CSNFT",
  "proximoTokenId": 4,
  "chainId": 421614,
  "rpcUrl": "https://sepolia-rollup.arbitrum.io/rpc"
}
```

### 1️⃣6️⃣ INFORMACIÓN DE CUENTA EJECUTORA
**GET** `/info/cuenta`
**Retorna:**
```json
{
  "address": "0xa92d504731aA3E99DF20ffd200ED03F9a55a6219",
  "balanceWei": 887159761163200000,
  "balanceETH": 0.8871597611632
}
```

### 1️⃣7️⃣ HEALTH CHECK
**GET** `/health`
**Retorna:**
```json
{
  "status": "healthy",
  "connected": true,
  "blockNumber": 217621824,
  "chainId": 421614
}
```

---

## 🛠️ Herramientas de Logs

### Visualizador de Logs
```bash
# Ver todas las transacciones
python3 view_logs.py

# Solo estadísticas
python3 view_logs.py stats

# Buscar transacción específica
python3 view_logs.py search f7ac30bbb621be2e131d1627a109597286980a32a747353980a7a0907f0ec59a
```

### Script de Diagnóstico
```bash
python3 diagnostic.py
```

---

## 💡 Ejemplo Completo con curl

```bash
# 1. Crear servicio
curl -X POST "http://localhost:8000/servicios/crear" \
  -H "Content-Type: application/json" \
  -d '{"destinatario": "0x..."}'

# 2. Asignar acompañante
curl -X POST "http://localhost:8000/servicios/0/asignar-acompanante" \
  -H "Content-Type: application/json" \
  -d '{"acompanante": "0x..."}'

# 3. Configurar URI para estado CREADO
curl -X POST "http://localhost:8000/configuracion/uri-estado" \
  -H "Content-Type: application/json" \
  -d '{"estado": 1, "nuevaURI": "ipfs://Qm..."}'

# 4. Cambiar a ENCONTRADO (estado 2)
curl -X POST "http://localhost:8000/servicios/0/cambiar-estado" \
  -H "Content-Type: application/json" \
  -d '{"nuevoEstado": 2, "calificacion": 0}'

# 5. Cambiar a TERMINADO (estado 3)
curl -X POST "http://localhost:8000/servicios/0/cambiar-estado" \
  -H "Content-Type: application/json" \
  -d '{"nuevoEstado": 3, "calificacion": 0}'

# 6. Cambiar a CALIFICADO (estado 4) con calificación 5
curl -X POST "http://localhost:8000/servicios/0/cambiar-estado" \
  -H "Content-Type: application/json" \
  -d '{"nuevoEstado": 4, "calificacion": 5}'

# 7. Cambiar a PAGADO (estado 5) - crea NFT de evidencia
curl -X POST "http://localhost:8000/servicios/0/cambiar-estado" \
  -H "Content-Type: application/json" \
  -d '{"nuevoEstado": 5, "calificacion": 0}'

# 8. Verificar estado actual
curl "http://localhost:8000/servicios/0/estado"

# 9. Listar todos los servicios de un usuario
curl "http://localhost:8000/servicios/usuario/0x..."

# 10. Ver logs de transacciones
curl "http://localhost:8000/logs/transacciones"

# 11. Ver estadísticas
curl "http://localhost:8000/logs/estadisticas"
```

---

## 🔐 Seguridad

- ✅ **Clave privada NO se almacena en repositorio** (usa `.env`)
- ✅ **Variables de entorno protegidas** con `.gitignore`
- ✅ **Transacciones firmadas localmente** antes de enviar
- ✅ **Gas estimado automáticamente** con 20% de margen
- ✅ **Validación de direcciones** en cada endpoint
- ✅ **Registro completo** de todas las transacciones en `transfer_log.json`

---

## 📦 Estructura del Proyecto

```
/backend/
├── main.py                      # Aplicación FastAPI principal
├── requirements.txt             # Dependencias Python
├── transaction_logger.py        # Sistema de logging automático
├── view_logs.py                 # Visualizador de logs
├── diagnostic.py                # Script de diagnóstico
├── transfer_log.json            # Registro de transacciones (auto-generado)
├── .env.example                 # Template variables de entorno
├── .gitignore                   # Excluye archivos sensibles
└── BACKEND_README.md            # Esta documentación
```

**Nota:** El ABI del contrato se carga automáticamente desde los artifacts de Hardhat en:
```
/artifacts/contracts/ColeccionServiciosNFT.sol/ColeccionServiciosNFT.json
```

---

## 📝 Dependencias

- **FastAPI** - Framework web moderno asincrónico
- **Uvicorn** - Servidor ASGI
- **Web3.py** - Interacción con Ethereum/Arbitrum
- **Pydantic** - Validación de datos
- **python-dotenv** - Manejo de variables de entorno
- **eth-account** - Gestión de cuentas Ethereum

---

## 🚨 Notas Importantes

- ⚠️ **Todas las transacciones pagan gas** (requiere ETH en Arbitrum Sepolia)
- ⚠️ **El gas se estima automáticamente** con 20% de margen de seguridad
- ✅ **Las consultas (GET) NO gastan gas**
- 🔢 **Los tokenIds son secuenciales** comenzando en 0
- ⏱️ **Cada transacción espera confirmación** (timeout: 120 segundos)
- 📊 **Máximo 5 estados** por servicio (1-5)
- ⭐ **Las calificaciones solo aplican** en estado 4 (CALIFICADO)
- 🎫 **NFT de evidencia se crea automáticamente** al estado 5 (PAGADO)
- 📝 **Todas las transacciones se registran** automáticamente en `transfer_log.json`
- 🔗 **URLs de Arbiscan** se generan automáticamente para cada transacción

---

## ❓ Troubleshooting

| Error | Solución |
|-------|----------|
| "PRIVATE_KEY no configurada" | Copia `.env.example` a `.env` y configura la clave privada |
| "Connection refused" | Verifica que RPC_URL sea correcto y esté accesible |
| "Insufficient balance for gas" | El wallet necesita ETH en Arbitrum Sepolia |
| "Invalid address format" | Verifica que las direcciones tengan formato válido (0x...) |
| "No se encontró el ABI" | Ejecuta `npm run compile` en la carpeta raíz del proyecto |
| "transfer_log.json no encontrado" | Se crea automáticamente con la primera transacción |

---

## 🔗 Enlaces Útiles

- **Contract en Arbiscan**: https://sepolia.arbiscan.io/address/0xFF2E077849546cCB392f9e38B716A40fDC451798
- **Obtener Testnet ETH**: https://faucet.quicknode.com/arbitrum/sepolia
- **Documentación FastAPI**: https://fastapi.tiangolo.com/
- **Web3.py Docs**: https://docs.web3py.org/
- **Arbitrum Sepolia Info**: https://sepolia.arbiscan.io/

---

**Versión:** 2.0.0 | **Red:** Arbitrum Sepolia | **Status:** Production Ready ✅