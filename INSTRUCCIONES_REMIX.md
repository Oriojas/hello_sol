# 📚 Instrucciones para Desplegar en Remix

## 🚀 Paso 1: Preparar Remix

1. **Abre Remix IDE**
   - Ve a https://remix.ethereum.org/

2. **Crea un nuevo archivo**
   - Haz clic en el botón `+` en la sección "File Explorer"
   - Nombre: `ColeccionServiciosNFT.sol`

3. **Copia el código del contrato**
   - Copia el contenido completo de `test_nft/contracts/ColeccionServiciosNFT.sol`
   - Pégalo en el archivo de Remix

## 🔧 Paso 2: Compilar el Contrato

1. **Ve a la pestaña "Solidity Compiler"** (icono del martillo)
2. **Configura los parámetros:**
   - Compiler Version: `0.8.20`
   - Language: `Solidity`
   - EVM Version: `default`

3. **Haz clic en "Compile ColeccionServiciosNFT.sol"**
   - Debe compilar sin errores (puedes ignorar advertencias)

## 🌐 Paso 3: Desplegar el Contrato

1. **Ve a la pestaña "Deploy & Run Transactions"** (icono con el avión de papel)

2. **Configura el entorno:**
   - **Environment:** Selecciona `JavaScript VM (London)` o `JavaScript VM (Shanghai)`
   - **Account:** Selecciona cualquier dirección (todas tienen fondos simulados)
   - **Gas limit:** Deja el valor por defecto

3. **Datos para desplegar:**
   - El contrato NO requiere parámetros en el constructor
   - Solo haz clic en **"Deploy"**

4. **Espera a que se complete** (debería ser inmediato)

## ✅ Paso 4: Verificar el Despliegue

Una vez desplegado, deberías ver la dirección del contrato en la sección "Deployed Contracts"

```
ColeccionServiciosNFT at 0x1234... (example)
```

## 🎮 Paso 5: Usar el Contrato

### 5.1 Configurar URIs por Estado (Opcional pero recomendado)

```javascript
// Hacer clic en "configurarURIEstado" y llenar:
// estado: 1
// nuevaURI: "https://ejemplo.com/metadata/creado.json"

// Repetir para estados 2, 3, 4, 5 con sus respectivas URIs
```

### 5.2 Crear un Servicio

```javascript
// Hacer clic en "criarServicio" y llenar:
// destinatario: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4

// Transact y esperar
// Retorna: tokenId 0 (primer servicio)
```

### 5.3 Asignar Acompañante

```javascript
// Hacer clic en "asignarAcompanante" y llenar:
// tokenId: 0
// acompanante: 0x0DAB5E6BE8f89aDa0d4f45F8EB8Ae9acb2f50073

// Transact
```

### 5.4 Cambiar a ENCONTRADO

```javascript
// Hacer clic en "cambiarEstadoServicio" y llenar:
// tokenId: 0
// nuevoEstado: 2  (ENCONTRADO)
// calificacion: 0 (sin calificación)

// Transact
```

### 5.5 Cambiar a TERMINADO

```javascript
// Hacer clic en "cambiarEstadoServicio" y llenar:
// tokenId: 0
// nuevoEstado: 3  (TERMINADO)
// calificacion: 0 (sin calificación)

// Transact
```

### 5.6 Cambiar a CALIFICADO con Calificación

```javascript
// Hacer clic en "cambiarEstadoServicio" y llenar:
// tokenId: 0
// nuevoEstado: 4  (CALIFICADO)
// calificacion: 5 (calificación 1-5)

// Transact
```

### 5.7 Marcar como PAGADO

```javascript
// Hacer clic en "marcarComoPagado" y llenar:
// tokenId: 0

// Transact
// Se creará automáticamente un NFT de evidencia para el acompañante
```

## 🔍 Paso 6: Verificar Estados

Después de cada transacción, puedes verificar los resultados:

```javascript
// Para obtener el estado actual (hacer clic en función)
obtenerEstadoServicio(0)
// Debería retornar: 5 (PAGADO después del paso 5.7)

// Para obtener la calificación
obtenerCalificacionServicio(0)
// Debería retornar: 5

// Para obtener el acompañante
obtenerAcompanante(0)
// Debería retornar: 0x0DAB5E6BE8f89aDa0d4f45F8EB8Ae9acb2f50073

// Para obtener la evidencia (NFT creado al pagar)
obtenerEvidenciaServicio(0)
// Debería retornar: 1 (tokenId del NFT de evidencia)

// Para obtener el próximo tokenId
obtenerProximoTokenId()
// Debería retornar: 2
```

## 📊 Crear Múltiples Servicios

Repite los pasos 5.2 a 5.7 para crear más servicios:

```javascript
// Segundo servicio
crearServicio("0xOtraWallet")  // Retorna tokenId 1
asignarAcompanante(1, "0xAcompanante2")
cambiarEstadoServicio(1, 2, 0)  // ENCONTRADO
cambiarEstadoServicio(1, 3, 0)  // TERMINADO
cambiarEstadoServicio(1, 4, 4)  // CALIFICADO con 4 estrellas
marcarComoPagado(1)  // PAGADO

// Tercer servicio
crearServicio("0xTerceraWallet")  // Retorna tokenId 2
asignarAcompanante(2, "0xAcompanante3")
cambiarEstadoServicio(2, 2, 0)  // ENCONTRADO
cambiarEstadoServicio(2, 3, 0)  // TERMINADO
cambiarEstadoServicio(2, 4, 3)  // CALIFICADO con 3 estrellas
marcarComoPagado(2)  // PAGADO
```

## ⚠️ Errores Comunes

### Error: "Failed to fetch"
- **Solución:** Asegúrate de usar `JavaScript VM` en el Environment
- No uses `Injected Provider` si no tienes MetaMask conectado

### Error: "Servicio no existe"
- **Solución:** Verifica que el tokenId sea correcto (empieza desde 0)

### Error: "Acompanante no asignado"
- **Solución:** Debes llamar a `asignarAcompanante` antes de `marcarComoPagado`

### Error: "Servicio debe estar calificado para pagar"
- **Solución:** El estado debe ser 4 (CALIFICADO) antes de marcar como pagado

## 🎯 Resumen de Estados

| Estado | Número | Descripción |
|--------|--------|-------------|
| CREADO | 1 | Servicio registrado |
| ENCONTRADO | 2 | Profesional asignado |
| TERMINADO | 3 | Servicio completado |
| CALIFICADO | 4 | Servicio evaluado (1-5) |
| PAGADO | 5 | Servicio pagado (crea NFT evidencia) |

## 💡 Tips

1. **Copiar direcciones fácilmente:** En Remix, cada cuenta tiene un ícono de copiar al lado
2. **Ver transacciones:** Todas las transacciones aparecen en la consola del navegador
3. **Resetear:** Si necesitas empezar de nuevo, recarga la página
4. **Exportar contrato:** Puedes exportar el ABI para usar en otras herramientas

¡Listo! Ya puedes usar el contrato en Remix sin problemas. 🎉