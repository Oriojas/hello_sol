# Colección NFT para Servicios de Acompañamiento a Adultos Mayores

## Descripción
Contrato NFT ERC-721 que representa servicios de acompañamiento para adultos mayores. Cada NFT es un servicio individual con estados dinámicos y sistema de calificación.

## Estados del Servicio
- **1 = CREADO**: Servicio registrado pero no iniciado
- **2 = ENCONTRADO**: Profesional asignado al servicio  
- **3 = TERMINADO**: Servicio completado
- **4 = CALIFICADO**: Servicio evaluado con calificación 1-5
- **5 = PAGADO**: Servicio pagado (crea NFT de evidencia para el acompañante)

## Funciones Principales

### Creación de Servicios
```solidity
function crearServicio(address destinatario) public returns (uint256)
```
Crea un nuevo NFT de servicio para la dirección especificada.

### Gestión de Estados
```solidity
function cambiarEstadoServicio(uint256 tokenId, uint8 nuevoEstado, uint8 calificacion) public
```
Cambia el estado de un servicio. La calificación (1-5) solo se usa en estado CALIFICADO.

```solidity
function marcarComoPagado(uint256 tokenId) public
```
Función específica para marcar un servicio como pagado (solo si está calificado).

### Asignación de Acompañante
```solidity
function asignarAcompanante(uint256 tokenId, address acompanante) public
```
Asigna un acompañante a un servicio específico.

### Configuración de Metadatos
```solidity
function configurarURIEstado(uint8 estado, string memory nuevaURI) public
```
Configura la URI de metadatos para cada estado del servicio.

### Consultas
```solidity
function obtenerEstadoServicio(uint256 tokenId) public view returns (uint8)
function obtenerCalificacionServicio(uint256 tokenId) public view returns (uint8)
function obtenerAcompanante(uint256 tokenId) public view returns (address)
function obtenerEvidenciaServicio(uint256 tokenId) public view returns (uint256)
function serviciosPorUsuario(address usuario) public view returns (uint256[] memory)
```

## Flujo de Trabajo Paso a Paso

### Paso 1: Desplegar Contrato
1. Compilar `ColeccionServiciosNFT.sol` en Remix
2. Desplegar con la dirección del owner como parámetro

### Paso 2: Configurar URIs de Estados
Antes de crear servicios, configurar las URIs para cada estado:
```javascript
// En Remix, llamar configurarURIEstado para cada estado
configurarURIEstado(1, "https://ejemplo.com/metadata/creado.json")  // CREADO
configurarURIEstado(2, "https://ejemplo.com/metadata/encontrado.json") // ENCONTRADO
configurarURIEstado(3, "https://ejemplo.com/metadata/terminado.json") // TERMINADO
configurarURIEstado(4, "https://ejemplo.com/metadata/calificado.json") // CALIFICADO
configurarURIEstado(5, "https://ejemplo.com/metadata/pagado.json") // PAGADO
```

### Paso 3: Crear Servicios de Ejemplo
Crear varios servicios para diferentes usuarios:
```javascript
// Crear servicio para usuario 1
crearServicio("0xUsuario1") // Retorna tokenId 0

// Crear servicio para usuario 2  
crearServicio("0xUsuario2") // Retorna tokenId 1

// Crear servicio para usuario 3
crearServicio("0xUsuario3") // Retorna tokenId 2
```

### Paso 4: Asignar Acompañantes
Para cada servicio, asignar un acompañante:
```javascript
// Asignar acompañante al servicio 0
asignarAcompanante(0, "0xAcompanante1")

// Asignar acompañante al servicio 1
asignarAcompanante(1, "0xAcompanante2")

// Asignar acompañante al servicio 2
asignarAcompanante(2, "0xAcompanante3")
```

### Paso 5: Progresar Estados del Servicio 0
```javascript
// Cambiar a ENCONTRADO (sin calificación)
cambiarEstadoServicio(0, 2, 0) // ENCONTRADO = 2

// Cambiar a TERMINADO (sin calificación)
cambiarEstadoServicio(0, 3, 0) // TERMINADO = 3

// Cambiar a CALIFICADO con calificación 5
cambiarEstadoServicio(0, 4, 5) // CALIFICADO = 4, calificación 5

// Marcar como PAGADO (crea NFT de evidencia)
marcarComoPagado(0)
```

### Paso 6: Progresar Estados del Servicio 1
```javascript
// Cambiar a ENCONTRADO
cambiarEstadoServicio(1, 2, 0)

// Cambiar a TERMINADO
cambiarEstadoServicio(1, 3, 0)

// Cambiar a CALIFICADO con calificación 4
cambiarEstadoServicio(1, 4, 4)

// Marcar como PAGADO
marcarComoPagado(1)
```

### Paso 7: Progresar Estados del Servicio 2
```javascript
// Cambiar a ENCONTRADO
cambiarEstadoServicio(2, 2, 0)

// Cambiar a TERMINADO
cambiarEstadoServicio(2, 3, 0)

// Cambiar a CALIFICADO con calificación 3
cambiarEstadoServicio(2, 4, 3)

// Marcar como PAGADO
marcarComoPagado(2)
```

## Consultas y Verificaciones

### Verificar Estados Finales
```javascript
// Consultar estado del servicio 0
obtenerEstadoServicio(0) // Debería retornar 5 (PAGADO)

// Consultar calificación del servicio 0
obtenerCalificacionServicio(0) // Debería retornar 5

// Consultar acompañante del servicio 0
obtenerAcompanante(0) // Debería retornar 0xAcompanante1

// Consultar evidencia del servicio 0
obtenerEvidenciaServicio(0) // Retorna tokenId del NFT de evidencia
```

### Verificar NFTs de Evidencia
```javascript
// Verificar que los acompañantes recibieron sus NFTs
serviciosPorUsuario("0xAcompanante1") // Debería incluir el tokenId de evidencia
serviciosPorUsuario("0xAcompanante2") // Debería incluir el tokenId de evidencia  
serviciosPorUsuario("0xAcompanante3") // Debería incluir el tokenId de evidencia
```

### Verificar Servicios por Usuario
```javascript
// Verificar servicios del usuario 1
serviciosPorUsuario("0xUsuario1") // Debería retornar [0]

// Verificar servicios del usuario 2
serviciosPorUsuario("0xUsuario2") // Debería retornar [1]

// Verificar servicios del usuario 3
serviciosPorUsuario("0xUsuario3") // Debería retornar [2]
```

## Estructura de Metadatos por Estado

### Ejemplo para Estado CREADO
```json
{
  "name": "Servicio de Acompañamiento #0 - Pendiente",
  "description": "Servicio de acompañamiento para adultos mayores - Estado: Pendiente de asignación",
  "image": "https://tu-plataforma.com/imagenes/estado-creado.png",
  "attributes": [
    {
      "trait_type": "Estado del Servicio",
      "value": "creado"
    }
  ]
}
```

### Ejemplo para Estado CALIFICADO
```json
{
  "name": "Servicio de Acompañamiento #0 - Calificado",
  "description": "Servicio de acompañamiento completado y evaluado",
  "image": "https://tu-plataforma.com/imagenes/estado-calificado.png", 
  "attributes": [
    {
      "trait_type": "Estado del Servicio",
      "value": "calificado"
    },
    {
      "trait_type": "Puntuación",
      "display_type": "number", 
      "value": 5,
      "max_value": 5
    }
  ]
}
```

## Consideraciones para el MVP

- **Sin control de acceso**: Cualquier dirección puede crear y gestionar servicios
- **URIs dinámicas**: Los metadatos cambian automáticamente con cada estado
- **NFT de evidencia**: Se crea automáticamente al marcar como PAGADO
- **Compatibilidad OpenSea**: Metadatos estructurados según estándares

## Próximos Pasos para Producción

1. Implementar control de acceso con roles específicos
2. Agregar sistema de pagos en tokens/ETH
3. Implementar eventos ERC-4906 para actualizaciones de metadatos
4. Agregar más validaciones y restricciones de estado
5. Implementar sistema de reembolsos o disputas