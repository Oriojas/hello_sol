# ⚡ Quick Start - Despliegue en 5 Minutos

## 📋 Resumen
Framework **Hardhat** completamente configurado para desplegar el contrato NFT `ColeccionServiciosNFT` en Arbitrum Sepolia.

**✅ Estado Actual**: Contrato desplegado exitosamente en Arbitrum Sepolia
- **Dirección**: `0xFF2E077849546cCB392f9e38B716A40fDC451798`
- **Arbiscan**: https://sepolia.arbiscan.io/address/0xFF2E077849546cCB392f9e38B716A40fDC451798

---

## 🚀 Instalación (2 minutos)

```bash
npm install
```

Instala:
- `hardhat` - Framework de desarrollo
- `@openzeppelin/contracts` - Librerías auditadas
- `ethers.js` - Web3 library
- Plugins necesarios

---

## ⚙️ Configurar Variables de Entorno (3 minutos)

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```env
# URL del RPC de Arbitrum Sepolia (puedes usar este)
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Tu clave privada (SIN el prefijo 0x)
# Obtén de MetaMask: Menu (3 puntos) > Cuenta > Exportar clave privada
# Ejemplo: abc123def456... (64 caracteres hexadecimales)
PRIVATE_KEY=tu_clave_privada_sin_0x

# API Key de Arbiscan (para verificación automática)
# Obtén de: https://arbiscan.io/apis
# ES OPCIONAL - si no tienes, el despliegue funciona igual
ARBISCAN_API_KEY=tu_arbiscan_api_key
```

### ⚠️ IMPORTANTE - Obtener ETH de Prueba

Tu wallet necesita **> 0.001 ETH** en Arbitrum Sepolia:

1. Ve a: https://faucet.quicknode.com/arbitrum/sepolia
2. Pega tu dirección de wallet
3. Solicita ETH gratis
4. Espera confirmación (5-10 minutos)

---

## 🔨 Compilar (30 segundos)

```bash
npm run compile
```

Salida esperada:
```
✓ Compiled successfully
Compiled 20 Solidity files successfully (evm target: cancun).
```

---

## 🌐 DESPLEGAR Y VERIFICAR (2-5 minutos) ⭐ PASO PRINCIPAL

```bash
npm run deploy-and-verify
```

**Este comando automáticamente:**
1. ✅ Compila el contrato
2. ✅ Despliega en Arbitrum Sepolia
3. ✅ Verifica en Arbiscan
4. ✅ Guarda información del despliegue

**Salida esperada:**
```
======================================================================
🚀 DESPLIEGUE Y VERIFICACIÓN COMPLETA DE CONTRATO NFT
======================================================================

✅ Contrato desplegado en: 0x...
🌐 Red: arbitrumSepolia (Chain ID: 421614)
⛽ Gas usado: 1935642
📦 Bloque: 217596257

✅ DESPLIEGUE Y VERIFICACIÓN COMPLETADOS
======================================================================

📍 Dirección del contrato: 0x...
🔗 Arbiscan: https://sepolia.arbiscan.io/address/0x...
```

**¡LISTO! Tu contrato está en Arbitrum Sepolia**

---

## 📁 Archivos Generados

Después del despliegue:

```
deployments/
├── latest-deployment.json                # Info del último despliegue
└── deployment-arbitrumSepolia-*.json    # Histórico de despliegues
```

Contiene:
- Dirección del contrato
- Hash de transacción
- Bloque de despliegue
- Gas utilizado
- Información del contrato (nombre, símbolo, etc.)

---

## 🧪 Scripts Adicionales (Opcionales)

### Configurar URIs de Metadatos
```bash
npm run setup-uris
```
Configura las URLs de metadatos para cada estado (1-5).

### Crear Servicio de Prueba
```bash
npm run create-service
```
Crea un NFT de servicio de ejemplo para validar funcionalidad.

### Exportar ABI del Contrato
```bash
npm run export-abi
```
Genera archivos ABI para usar en frontend/backend:
- `abi/ColeccionServiciosNFT.json` (JSON estándar)
- `abi/ColeccionServiciosNFT.js` (CommonJS)
- `abi/ColeccionServiciosNFT.ts` (TypeScript)

---

## 📋 Checklist Rápido

- [ ] `npm install` completado
- [ ] `.env` configurado con PRIVATE_KEY
- [ ] ETH de prueba en wallet (> 0.001)
- [ ] `npm run compile` exitoso
- [ ] `npm run deploy-and-verify` exitoso
- [ ] Contrato visible en Arbiscan
- [ ] Dirección guardada en lugar seguro

---

## 🔗 Links Útiles

| Recurso | URL |
|---------|-----|
| Arbiscan Sepolia | https://sepolia.arbiscan.io/ |
| Faucet ETH | https://faucet.quicknode.com/arbitrum/sepolia |
| OpenSea Testnet | https://testnets.opensea.io/ |
| Hardhat Docs | https://hardhat.org/ |
| Solidity Docs | https://docs.soliditylang.org/ |

---

## 🆘 Problemas Comunes

**Error: "Cannot find module 'hardhat'"**
```bash
npm install
```

**Error: "Invalid private key"**
- Asegúrate que `PRIVATE_KEY` NO tenga `0x`
- Debe tener 64 caracteres hexadecimales

**Error: "Insufficient balance"**
- Necesitas > 0.001 ETH en testnet
- Faucet: https://faucet.quicknode.com/arbitrum/sepolia

**Error: "Already Verified"**
- El contrato ya está verificado
- No es un error real, puedes ignorarlo

---

## ⚠️ Seguridad

- **NUNCA** hagas commit de `.env`
- **NUNCA** compartas tu `PRIVATE_KEY`
- Usa wallets separadas para testnet y mainnet
- Verifica transacciones en Arbiscan

---

## 📚 Documentación Completa

- **Plan Técnico**: Ver `plan_trabajo_nft.md`
- **README Completo**: Ver `README.md`

---

## 🎉 ¡Listo!

Una vez ejecutes `npm run deploy-and-verify` exitosamente:

1. ✅ Tu contrato está en Arbitrum Sepolia
2. ✅ Tu contrato está verificado en Arbiscan
3. ✅ Puedes interactuar con él desde Arbiscan
4. ✅ Puedes obtener el ABI para frontend

**Próximos pasos:**
- Configurar URIs: `npm run setup-uris`
- Crear servicios: `npm run create-service`
- Exportar ABI: `npm run export-abi`
- Integrar en frontend

---

**Fecha**: 2025 | **Estado**: ✅ COMPLETADO