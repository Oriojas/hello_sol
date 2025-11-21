// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ColeccionServiciosNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    // Estados posibles para cada servicio (enteros 1-5)
    // 1 = CREADO, 2 = ENCONTRADO, 3 = TERMINADO, 4 = CALIFICADO, 5 = PAGADO

    // Mapeo de tokenId a estado actual del servicio (1-5)
    mapping(uint256 => uint8) public estadosServicios;

    // Mapeo de tokenId a calificación (1-5)
    mapping(uint256 => uint8) public calificacionesServicios;

    // Mapeo de tokenId a dirección del acompañante
    mapping(uint256 => address) public acompanantesServicios;

    // Mapeo de tokenId original al tokenId de evidencia
    mapping(uint256 => uint256) public evidenciasServicios;

    // Mapeo de URIs por estado (configuración global)
    mapping(uint8 => string) public URIsPorEstado;

    // Contador de servicios en la colección
    uint256 private _nextTokenId;

    // Eventos
    event ServicioCreado(uint256 indexed tokenId, address indexed destinatario);
    event EstadoCambiado(
        uint256 indexed tokenId,
        uint8 estadoAnterior,
        uint8 nuevoEstado,
        uint8 calificacion
    );
    event URIEstadoConfigurada(uint8 estado, string nuevaURI);
    event ServicioPagado(
        uint256 indexed tokenId,
        address indexed acompanante,
        uint256 indexed tokenIdEvidencia
    );

    constructor(
        address initialOwner
    ) ERC721("ColeccionServiciosNFT", "CSNFT") Ownable(initialOwner) {}

    /**
     * @dev Crea un nuevo servicio (NFT) para un destinatario
     * @param destinatario Dirección que recibirá el NFT del servicio
     * @return tokenId del nuevo servicio creado
     */
    function crearServicio(address destinatario) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(destinatario, tokenId);

        // Estado inicial: CREADO (1)
        estadosServicios[tokenId] = 1;
        calificacionesServicios[tokenId] = 0;
        acompanantesServicios[tokenId] = address(0);

        // Asignar URI inicial basada en el estado
        _setTokenURI(tokenId, URIsPorEstado[1]);

        emit ServicioCreado(tokenId, destinatario);
        return tokenId;
    }

    /**
     * @dev Cambia el estado de un servicio específico
     * @param tokenId ID del servicio a modificar
     * @param nuevoEstado Nuevo estado del servicio
     * @param calificacion Calificación del servicio (1-5, solo para estado CALIFICADO)
     */
    function cambiarEstadoServicio(
        uint256 tokenId,
        uint8 nuevoEstado,
        uint8 calificacion
    ) public {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        require(nuevoEstado >= 1 && nuevoEstado <= 5, "Estado invalido");

        uint8 estadoAnterior = estadosServicios[tokenId];
        estadosServicios[tokenId] = nuevoEstado;

        // Validar y asignar calificación
        if (nuevoEstado == 4) {
            // CALIFICADO
            require(
                calificacion >= 1 && calificacion <= 5,
                "Calificacion debe ser entre 1 y 5"
            );
            calificacionesServicios[tokenId] = calificacion;
        } else {
            calificacionesServicios[tokenId] = 0;
        }

        // Si es estado PAGADO, crear NFT de evidencia para el acompañante
        if (nuevoEstado == 5) {
            // PAGADO
            require(
                estadoAnterior == 4, // CALIFICADO
                "Servicio debe estar calificado para pagar"
            );
            address acompanante = acompanantesServicios[tokenId];
            require(acompanante != address(0), "Acompanante no asignado");

            // Crear nuevo NFT de evidencia para el acompañante
            uint256 tokenIdEvidencia = _nextTokenId++;
            _safeMint(acompanante, tokenIdEvidencia);

            // Estado inicial de la evidencia: PAGADO (5)
            estadosServicios[tokenIdEvidencia] = 5;
            calificacionesServicios[tokenIdEvidencia] = calificacionesServicios[
                tokenId
            ];
            acompanantesServicios[tokenIdEvidencia] = acompanante;

            // Asignar URI de evidencia pagada
            _setTokenURI(tokenIdEvidencia, URIsPorEstado[5]);

            // Registrar relación entre token original y evidencia
            evidenciasServicios[tokenId] = tokenIdEvidencia;

            emit ServicioPagado(tokenId, acompanante, tokenIdEvidencia);
        }

        // Actualizar URI según el nuevo estado
        _setTokenURI(tokenId, URIsPorEstado[nuevoEstado]);

        emit EstadoCambiado(tokenId, estadoAnterior, nuevoEstado, calificacion);
    }

    /**
     * @dev Configura la URI para un estado específico
     * @param estado Estado para el cual configurar la URI
     * @param nuevaURI Nueva URI para el estado
     */
    function configurarURIEstado(uint8 estado, string memory nuevaURI) public {
        require(estado >= 1 && estado <= 5, "Estado invalido");
        URIsPorEstado[estado] = nuevaURI;
        emit URIEstadoConfigurada(estado, nuevaURI);
    }

    /**
     * @dev Obtiene el estado actual de un servicio
     * @param tokenId ID del servicio
     * @return Estado actual del servicio
     */
    function obtenerEstadoServicio(
        uint256 tokenId
    ) public view returns (uint8) {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        return estadosServicios[tokenId];
    }

    /**
     * @dev Obtiene la calificación de un servicio
     * @param tokenId ID del servicio
     * @return Calificación del servicio (0 si no está calificado)
     */
    function obtenerCalificacionServicio(
        uint256 tokenId
    ) public view returns (uint8) {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        return calificacionesServicios[tokenId];
    }

    /**
     * @dev Asigna un acompañante a un servicio
     * @param tokenId ID del servicio
     * @param acompanante Dirección del acompañante
     */
    function asignarAcompanante(uint256 tokenId, address acompanante) public {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        require(acompanante != address(0), "Acompanante no valido");
        acompanantesServicios[tokenId] = acompanante;
    }

    /**
     * @dev Obtiene el acompañante asignado a un servicio
     * @param tokenId ID del servicio
     * @return Dirección del acompañante
     */
    function obtenerAcompanante(uint256 tokenId) public view returns (address) {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        return acompanantesServicios[tokenId];
    }

    /**
     * @dev Obtiene el tokenId de evidencia para un servicio
     * @param tokenId ID del servicio original
     * @return tokenId del NFT de evidencia
     */
    function obtenerEvidenciaServicio(
        uint256 tokenId
    ) public view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        return evidenciasServicios[tokenId];
    }

    /**
     * @dev Función específica para marcar servicio como pagado
     * @param tokenId ID del servicio a marcar como pagado
     */
    function marcarComoPagado(uint256 tokenId) public {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        require(
            estadosServicios[tokenId] == 4, // CALIFICADO
            "Servicio debe estar calificado"
        );

        uint8 estadoAnterior = estadosServicios[tokenId];
        estadosServicios[tokenId] = 5; // PAGADO

        address acompanante = acompanantesServicios[tokenId];
        require(acompanante != address(0), "Acompanante no asignado");

        // Crear nuevo NFT de evidencia para el acompañante
        uint256 tokenIdEvidencia = _nextTokenId++;
        _safeMint(acompanante, tokenIdEvidencia);

        // Estado inicial de la evidencia: PAGADO (5)
        estadosServicios[tokenIdEvidencia] = 5;
        calificacionesServicios[tokenIdEvidencia] = calificacionesServicios[
            tokenId
        ];
        acompanantesServicios[tokenIdEvidencia] = acompanante;

        // Asignar URI de evidencia pagada
        _setTokenURI(tokenIdEvidencia, URIsPorEstado[5]);

        // Registrar relación entre token original y evidencia
        evidenciasServicios[tokenId] = tokenIdEvidencia;

        emit EstadoCambiado(
            tokenId,
            estadoAnterior,
            5, // PAGADO
            calificacionesServicios[tokenId]
        );
        emit ServicioPagado(tokenId, acompanante, tokenIdEvidencia);
    }

    /**
     * @dev Obtiene todos los servicios de un usuario
     * @param usuario Dirección del usuario
     * @return Array con los IDs de los servicios del usuario
     */
    function serviciosPorUsuario(
        address usuario
    ) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(usuario);
        uint256[] memory tokens = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(usuario, i);
        }

        return tokens;
    }

    /**
     * @dev Obtiene la URI actual de un servicio
     * @param tokenId ID del servicio
     * @return URI actual del servicio
     */
    function obtenerURIServicio(
        uint256 tokenId
    ) public view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Servicio no existe");
        return tokenURI(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
