# 🚀 Guía para Desplegar en Arbitrum Sepolia

## Requisitos Previos

1. **MetaMask instalado** en tu navegador
2. **Arbitrum Sepolia configurada** en MetaMask
3. **ETH de prueba en Arbitrum Sepolia** (faucet)

## Paso 1: Configurar Arbitrum Sepolia en MetaMask

### 1.1 Agregar la Red

1. Abre MetaMask
2. Haz clic en el selector de redes (arriba a la izquierda)
3. Haz clic en **"Agregar red"**
4. Rellena los siguientes datos:

```
Nombre de la red: Arbitrum Sepolia
URL de RPC: https://sepolia-rollup.arbitrum.io:443
ID de cadena: 421614
Símbolo de moneda: ETH
Explorador de bloques: https://sepolia.arbiscan.io/
```

5. Haz clic en **"Guardar"**
6. Ahora deberías ver **"Arbitrum Sepolia"** en tu selector de redes

### 1.2 Obtener ETH de Prueba

1. Ve a: https://faucet.quicknode.com/arbitrum/sepolia
2. Conecta tu MetaMask
3. Solicita ETH de prueba
4. Espera a que llegue (puede tardar unos minutos)

**Verifica en MetaMask que tengas ETH en Arbitrum Sepolia**

## Paso 2: Preparar el Contrato en Remix

### 2.1 Abrir Remix

1. Ve a https://remix.ethereum.org/
2. Crea un nuevo archivo llamado `ColeccionServiciosNFT.sol`
3. Copia el código completo del contrato desde `test_nft/contracts/ColeccionServiciosNFT.sol`
4. Pégalo en Remix

### 2.2 Compilar el Contrato

1. Ve a la pestaña **"Solidity Compiler"** (icono del martillo)
2. Asegúrate de que la versión sea **0.8.19**
3. Haz clic en **"Compile ColeccionServiciosNFT.sol"**
4. Espera a que termine la compilación (sin errores)

## Paso 3: Desplegar en Arbitrum Sepolia

### 3.1 Configurar el Entorno de Despliegue

1. Ve a la pestaña **"Deploy & Run Transactions"** (icono del avión de papel)
2. En **"ENVIRONMENT"** selecciona **"Injected Provider - MetaMask"**
3. **Conecta MetaMask** cuando Remix te lo solicite
4. Verifica que la red mostrada sea **"Arbitrum Sepolia"**

### 3.2 Desplegar el Contrato

1. En la sección **"CONTRACT"**, selecciona **"ColeccionServiciosNFT"**
2. El constructor no requiere parámetros
3. Haz clic en el botón **"Deploy"** (naranja)
4. **Confirma la transacción en MetaMask**
   - Gas estimado: ~1-2 millones
   - Costo: típicamente < 0.01 ETH

### 3.3 Esperar Confirmación

1. Remix mostrará una transacción pendiente
2. Puedes ver el progreso en MetaMask
3. Una vez confirmada, verás la dirección del contrato en **"Deployed Contracts"**

Ejemplo:
```
ColeccionServiciosNFT at 0xABC123... (example)
```

## Paso 4: Interactuar con el Contrato

Una vez desplegado, expande el contrato en la sección "Deployed Contracts" para ver todas las funciones disponibles.

### 4.1 Crear tu Primer Servicio

```javascript
// Función: crearServicio
// Parámetro: destinatario (tu dirección de MetaMask)
crearServicio("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4")
```

1. Haz clic en **"crearServicio"**
2. Ingresa tu dirección de MetaMask (puedes copiarla desde MetaMask)
3. Haz clic en **"transact"**
4. Confirma en MetaMask
5. Espera la confirmación en Arbitrum Sepolia

### 4.2 Configurar URIs (Opcional)

```javascript
// Para estado CREADO (1)
configurarURIEstado(1, "https://ejemplo.com/metadata/creado.json")

// Para estado ENCONTRADO (2)
configurarURIEstado(2, "https://ejemplo.com/metadata/encontrado.json")

// Para estado TERMINADO (3)
configurarURIEstado(3, "https://ejemplo.com/metadata/terminado.json")

// Para estado CALIFICADO (4)
configurarURIEstado(4, "https://ejemplo.com/metadata/calificado.json")

// Para estado PAGADO (5)
configurarURIEstado(5, "https://ejemplo.com/metadata/pagado.json")
```

### 4.3 Asignar Acompañante

```javascript
asignarAcompanante(0, "0x0DAB5E6BE8f89aDa0d4f45F8EB8Ae9acb2f50073")
```

### 4.4 Cambiar Estados

```javascript
// A ENCONTRADO (estado 2)
cambiarEstadoServicio(0, 2, 0)

// A TERMINADO (estado 3)
cambiarEstadoServicio(0, 3, 0)

// A CALIFICADO (estado 4) con calificación 5
cambiarEstadoServicio(0, 4, 5)

// A PAGADO (crea NFT de evidencia)
marcarComoPagado(0)
```

### 4.5 Consultar Información

```javascript
// Estado actual
obtenerEstadoServicio(0)

// Calificación
obtenerCalificacionServicio(0)

// Acompañante
obtenerAcompanante(0)

// NFT de evidencia
obtenerEvidenciaServicio(0)

// URI del servicio
obtenerURIServicio(0)

// Próximo token a crear
obtenerProximoTokenId()
```

## Paso 5: Verificar en Arbiscan

### 5.1 Ver tu Contrato

1. Ve a https://sepolia.arbiscan.io/
2. Pega la dirección de tu contrato en el buscador
3. Verás todos los detalles de tu contrato desplegado

### 5.2 Ver tus Transacciones

1. En Arbiscan, pega tu dirección de MetaMask
2. Verás todas las transacciones relacionadas con tus servicios

## ⚠️ Errores Comunes y Soluciones

### Error: "Wrong Network"
- **Solución:** Asegúrate de que MetaMask esté en Arbitrum Sepolia
- Ve a MetaMask → selector de redes → Arbitrum Sepolia

### Error: "Insufficient Funds"
- **Solución:** No tienes suficiente ETH de prueba
- Vuelve al faucet y solicita más ETH

### Error: "Transaction Failed"
- **Solución:** Aumenta el gas limit en MetaMask
- Intenta de nuevo con más gas

### Error: "Wrong Constructor Parameters"
- **Solución:** El constructor no requiere parámetros
- Solo haz clic en Deploy sin ingresar nada

## 🎯 Flujo Completo Ejemplo

```javascript
// 1. Crear servicio
crearServicio("0xTuDireccion")  // Obtiene tokenId 0

// 2. Asignar acompañante
asignarAcompanante(0, "0xAcompanante")

// 3. Cambiar a ENCONTRADO
cambiarEstadoServicio(0, 2, 0)

// 4. Cambiar a TERMINADO
cambiarEstadoServicio(0, 3, 0)

// 5. Cambiar a CALIFICADO con 5 estrellas
cambiarEstadoServicio(0, 4, 5)

// 6. Marcar como PAGADO
marcarComoPagado(0)  // Crea NFT de evidencia

// 7. Verificar
obtenerEstadoServicio(0)  // Debería retornar 5
obtenerEvidenciaServicio(0)  // Debería retornar 1
```

## 📚 Recursos Útiles

- **Remix IDE:** https://remix.ethereum.org/
- **Arbitrum Sepolia Faucet:** https://faucet.quicknode.com/arbitrum/sepolia
- **Arbiscan (Explorador):** https://sepolia.arbiscan.io/
- **Documentación Arbitrum:** https://docs.arbitrum.io/

## 💡 Tips Importantes

1. **Guarda la dirección del contrato** - La necesitarás para futuras interacciones
2. **Cada cambio cuesta gas** - Aunque sea mínimo en testnet
3. **Los cambios son permanentes** - Una vez transaccionado, no se puede deshacer
4. **Verifica en Arbiscan** - Para confirmar que todo se ejecutó correctamente

¡Listo! Tu contrato está desplegado en Arbitrum Sepolia y listo para la hackathon. 🎉