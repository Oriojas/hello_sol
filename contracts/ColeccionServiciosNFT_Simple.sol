// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.5/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.5/contracts/access/Ownable.sol";

contract ColeccionServiciosNFT_Simple is ERC721, Ownable {
    // Estados: 1=CREADO, 2=ENCONTRADO, 3=TERMINADO, 4=CALIFICADO, 5=PAGADO
    mapping(uint256 => uint8) public estadosServicios;
    mapping(uint256 => uint8) public calificacionesServicios;
    mapping(uint256 => address) public acompanantesServicios;
    mapping(uint256 => string) public tokenURIs;

    uint256 private _nextTokenId;

    event ServicioCreado(uint256 indexed tokenId, address indexed destinatario);
    event EstadoCambiado(
        uint256 indexed tokenId,
        uint8 estadoAnterior,
        uint8 nuevoEstado,
        uint8 calificacion
    );
    event ServicioPagado(
        uint256 indexed tokenId,
        address indexed acompanante,
        uint256 indexed tokenIdEvidencia
    );

    constructor()
        ERC721("ServiciosAcompanamiento", "SERV")
        Ownable(msg.sender)
    {}

    function crearServicio(address destinatario) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(destinatario, tokenId);

        estadosServicios[tokenId] = 1; // CREADO
        calificacionesServicios[tokenId] = 0;
        acompanantesServicios[tokenId] = address(0);
        tokenURIs[tokenId] = "";

        emit ServicioCreado(tokenId, destinatario);
        return tokenId;
    }

    function cambiarEstadoServicio(
        uint256 tokenId,
        uint8 nuevoEstado,
        uint8 calificacion
    ) public {
        require(_exists(tokenId), "Servicio no existe");
        require(nuevoEstado >= 1 && nuevoEstado <= 5, "Estado invalido");

        uint8 estadoAnterior = estadosServicios[tokenId];
        estadosServicios[tokenId] = nuevoEstado;

        if (nuevoEstado == 4) {
            // CALIFICADO
            require(
                calificacion >= 1 && calificacion <= 5,
                "Calificacion invalida"
            );
            calificacionesServicios[tokenId] = calificacion;
        } else {
            calificacionesServicios[tokenId] = 0;
        }

        emit EstadoCambiado(tokenId, estadoAnterior, nuevoEstado, calificacion);
    }

    function asignarAcompanante(uint256 tokenId, address acompanante) public {
        require(_exists(tokenId), "Servicio no existe");
        require(acompanante != address(0), "Acompanante invalido");
        acompanantesServicios[tokenId] = acompanante;
    }

    function marcarComoPagado(uint256 tokenId) public {
        require(_exists(tokenId), "Servicio no existe");
        require(
            estadosServicios[tokenId] == 4,
            "Servicio debe estar calificado"
        );
        require(
            acompanantesServicios[tokenId] != address(0),
            "Acompanante no asignado"
        );

        uint8 estadoAnterior = estadosServicios[tokenId];
        estadosServicios[tokenId] = 5; // PAGADO

        // Crear NFT de evidencia para el acompañante
        uint256 tokenIdEvidencia = _nextTokenId++;
        address acompanante = acompanantesServicios[tokenId];
        _safeMint(acompanante, tokenIdEvidencia);

        estadosServicios[tokenIdEvidencia] = 5;
        calificacionesServicios[tokenIdEvidencia] = calificacionesServicios[
            tokenId
        ];
        acompanantesServicios[tokenIdEvidencia] = acompanante;
        tokenURIs[tokenIdEvidencia] = "";

        emit EstadoCambiado(
            tokenId,
            estadoAnterior,
            5,
            calificacionesServicios[tokenId]
        );
        emit ServicioPagado(tokenId, acompanante, tokenIdEvidencia);
    }

    function establecerTokenURI(uint256 tokenId, string memory uri) public {
        require(_exists(tokenId), "Servicio no existe");
        tokenURIs[tokenId] = uri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Servicio no existe");
        return tokenURIs[tokenId];
    }

    function obtenerEstadoServicio(
        uint256 tokenId
    ) public view returns (uint8) {
        require(_exists(tokenId), "Servicio no existe");
        return estadosServicios[tokenId];
    }

    function obtenerCalificacionServicio(
        uint256 tokenId
    ) public view returns (uint8) {
        require(_exists(tokenId), "Servicio no existe");
        return calificacionesServicios[tokenId];
    }

    function obtenerAcompanante(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Servicio no existe");
        return acompanantesServicios[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
