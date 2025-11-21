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

## 📋 Flujo de Operación (En Orden)

### 1️⃣ CREAR SERVICIO
Crear un nuevo NFT de servicio (estado: CREADO)

**POST** `/servicios/crear`
```json
{
  "destinatario": "0x..."
}
```
**Retorna:** `tokenId`, `transactionHash`, `blockNumber`

---

### 2️⃣ ASIGNAR ACOMPAÑANTE
Asignar un acompañante a un servicio

**POST** `/servicios/{tokenId}/asignar-acompanante`
```json
{
  "acompanante": "0x..."
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

---

### 5️⃣ CONSULTAS - ESTADO
**GET** `/servicios/{tokenId}/estado`

Retorna:
```json
{
  "tokenId": 0,
  "estado": 1,
  "estadoNombre": "CREADO"
}
```

---

### 6️⃣ CONSULTAS - URI
**GET** `/servicios/{tokenId}/uri`

Retorna:
```json
{
  "tokenId": 0,
  "uri": "ipfs://QmXxxx..."
}
```

---

### 7️⃣ CONSULTAS - CALIFICACIÓN
**GET** `/servicios/{tokenId}/calificacion`

Retorna:
```json
{
  "tokenId": 0,
  "calificacion": 5
}
```

---

### 8️⃣ CONSULTAS - ACOMPAÑANTE
**GET** `/servicios/{tokenId}/acompanante`

Retorna:
```json
{
  "tokenId": 0,
  "acompanante": "0x..."
}
```

---

### 9️⃣ CONSULTAS - EVIDENCIA
**GET** `/servicios/{tokenId}/evidencia`

Retorna NFT de evidencia (se crea al pagar - estado 5):
```json
{
  "tokenId": 0,
  "tokenIdEvidencia": 1
}
```

---

### 🔟 CONSULTAS - SERVICIOS POR USUARIO
**GET** `/servicios/usuario/{usuarioAddress}`

Retorna todos los NFTs del usuario:
```json
{
  "usuario": "0x...",
  "cantidad": 3,
  "servicios": [0, 1, 2]
}
```

---

## 🔧 Endpoints Adicionales

### Marcar Como Pagado
**POST** `/servicios/{tokenId}/marcar-pagado`

Marca servicio como pagado y crea NFT de evidencia

---

### Información del Contrato
**GET** `/info/contrato`
```json
{
  "contractAddress": "0xFF2E077849546cCB392f9e38B716A40fDC451798",
  "nombre": "ColeccionServiciosNFT",
  "simbolo": "CSNFT",
  "proximoTokenId": 0,
  "chainId": 421614,
  "rpcUrl": "https://sepolia-rollup.arbitrum.io/rpc"
}
```

### Información de Cuenta Ejecutora
**GET** `/info/cuenta`
```json
{
  "address": "0x...",
  "balanceWei": 1500000000000000000,
  "balanceETH": 1.5
}
```

### Health Check
**GET** `/health`
```json
{
  "status": "healthy",
  "connected": true,
  "blockNumber": 12345678,
  "chainId": 421614
}
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
```

---

## 🔐 Seguridad

- ✅ **Clave privada NO se almacena en repositorio** (usa `.env`)
- ✅ **Variables de entorno protegidas** con `.gitignore`
- ✅ **Transacciones firmadas localmente** antes de enviar
- ✅ **Gas estimado automáticamente** con 20% de margen
- ✅ **Validación de direcciones** en cada endpoint

---

## 📦 Estructura del Proyecto

```
/backend/
├── main.py                      # Aplicación FastAPI principal
├── requirements.txt             # Dependencias Python
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

---

## ❓ Troubleshooting

| Error | Solución |
|-------|----------|
| "PRIVATE_KEY no configurada" | Copia `.env.example` a `.env` y configura la clave privada |
| "Connection refused" | Verifica que RPC_URL sea correcto y esté accesible |
| "Insufficient balance for gas" | El wallet necesita ETH en Arbitrum Sepolia |
| "Invalid address format" | Verifica que las direcciones tengan formato válido (0x...) |
| "No se encontró el ABI" | Ejecuta `npm run compile` en la carpeta raíz del proyecto |

---

## 🔗 Enlaces Útiles

- **Contract en Arbiscan**: https://sepolia.arbiscan.io/address/0xFF2E077849546cCB392f9e38B716A40fDC451798
- **Obtener Testnet ETH**: https://faucet.quicknode.com/arbitrum/sepolia
- **Documentación FastAPI**: https://fastapi.tiangolo.com/
- **Web3.py Docs**: https://docs.web3py.org/
- **Arbitrum Sepolia Info**: https://sepolia.arbiscan.io/

---

**Versión:** 1.0.0 | **Red:** Arbitrum Sepolia | **Status:** Production Ready ✅