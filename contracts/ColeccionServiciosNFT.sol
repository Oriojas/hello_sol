// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferFrom(address from, address to, uint256 tokenId) external;

    function approve(address to, uint256 tokenId) external;

    function getApproved(
        uint256 tokenId
    ) external view returns (address operator);

    function setApprovalForAll(address operator, bool approved) external;

    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
}

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract ColeccionServiciosNFT is IERC721Metadata {
    // Estados: 1=CREADO, 2=ENCONTRADO, 3=TERMINADO, 4=CALIFICADO, 5=PAGADO

    string public name = "ColeccionServiciosNFT";
    string public symbol = "CSNFT";

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    mapping(uint256 => uint8) public estadosServicios;
    mapping(uint256 => uint8) public calificacionesServicios;
    mapping(uint256 => address) public acompanantesServicios;
    mapping(uint256 => uint256) public evidenciasServicios;
    mapping(uint8 => string) public URIsPorEstado;
    mapping(uint256 => string) public tokenURIs;

    uint256 private _nextTokenId;

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

    constructor() {
        _nextTokenId = 0;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public pure override returns (bool) {
        return
            interfaceId == 0x80ac58cd ||
            interfaceId == 0x5b5e139f ||
            interfaceId == 0x01ffc9a7;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "Direccion invalida");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token no existe");
        return owner;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_owners[tokenId] != address(0), "Token no existe");
        return tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "No autorizado"
        );
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(
        uint256 tokenId
    ) public view override returns (address) {
        require(_owners[tokenId] != address(0), "Token no existe");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override {
        require(operator != msg.sender, "No puedes aprobiarte a ti mismo");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(_owners[tokenId] != address(0), "Token no existe");
        require(from == _owners[tokenId], "No es el propietario");
        require(to != address(0), "Direccion invalida");
        require(
            msg.sender == from ||
                msg.sender == _tokenApprovals[tokenId] ||
                _operatorApprovals[from][msg.sender],
            "No autorizado"
        );

        _tokenApprovals[tokenId] = address(0);
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public override {
        transferFrom(from, to, tokenId);
    }

    function crearServicio(address destinatario) public returns (uint256) {
        require(destinatario != address(0), "Destinatario invalido");

        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = destinatario;
        _balances[destinatario]++;

        estadosServicios[tokenId] = 1;
        calificacionesServicios[tokenId] = 0;
        acompanantesServicios[tokenId] = address(0);

        if (bytes(URIsPorEstado[1]).length > 0) {
            tokenURIs[tokenId] = URIsPorEstado[1];
        }

        emit ServicioCreado(tokenId, destinatario);
        emit Transfer(address(0), destinatario, tokenId);
        return tokenId;
    }

    function cambiarEstadoServicio(
        uint256 tokenId,
        uint8 nuevoEstado,
        uint8 calificacion
    ) public {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        require(nuevoEstado >= 1 && nuevoEstado <= 5, "Estado invalido");

        uint8 estadoAnterior = estadosServicios[tokenId];
        estadosServicios[tokenId] = nuevoEstado;

        if (nuevoEstado == 4) {
            require(
                calificacion >= 1 && calificacion <= 5,
                "Calificacion debe ser entre 1 y 5"
            );
            calificacionesServicios[tokenId] = calificacion;
        } else {
            calificacionesServicios[tokenId] = 0;
        }

        if (nuevoEstado == 5) {
            require(
                estadoAnterior == 4,
                "Servicio debe estar calificado para pagar"
            );
            address acompanante = acompanantesServicios[tokenId];
            require(acompanante != address(0), "Acompanante no asignado");

            uint256 tokenIdEvidencia = _nextTokenId++;
            _owners[tokenIdEvidencia] = acompanante;
            _balances[acompanante]++;

            estadosServicios[tokenIdEvidencia] = 5;
            calificacionesServicios[tokenIdEvidencia] = calificacionesServicios[
                tokenId
            ];
            acompanantesServicios[tokenIdEvidencia] = acompanante;

            if (bytes(URIsPorEstado[5]).length > 0) {
                tokenURIs[tokenIdEvidencia] = URIsPorEstado[5];
            }

            evidenciasServicios[tokenId] = tokenIdEvidencia;
            emit ServicioPagado(tokenId, acompanante, tokenIdEvidencia);
            emit Transfer(address(0), acompanante, tokenIdEvidencia);
        }

        if (bytes(URIsPorEstado[nuevoEstado]).length > 0) {
            tokenURIs[tokenId] = URIsPorEstado[nuevoEstado];
        }

        emit EstadoCambiado(tokenId, estadoAnterior, nuevoEstado, calificacion);
    }

    function configurarURIEstado(uint8 estado, string memory nuevaURI) public {
        require(estado >= 1 && estado <= 5, "Estado invalido");
        URIsPorEstado[estado] = nuevaURI;
        emit URIEstadoConfigurada(estado, nuevaURI);
    }

    function obtenerEstadoServicio(
        uint256 tokenId
    ) public view returns (uint8) {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        return estadosServicios[tokenId];
    }

    function obtenerCalificacionServicio(
        uint256 tokenId
    ) public view returns (uint8) {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        return calificacionesServicios[tokenId];
    }

    function asignarAcompanante(uint256 tokenId, address acompanante) public {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        require(acompanante != address(0), "Acompanante no valido");
        acompanantesServicios[tokenId] = acompanante;
    }

    function obtenerAcompanante(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        return acompanantesServicios[tokenId];
    }

    function obtenerEvidenciaServicio(
        uint256 tokenId
    ) public view returns (uint256) {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        return evidenciasServicios[tokenId];
    }

    function marcarComoPagado(uint256 tokenId) public {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        require(
            estadosServicios[tokenId] == 4,
            "Servicio debe estar calificado"
        );

        address acompanante = acompanantesServicios[tokenId];
        require(acompanante != address(0), "Acompanante no asignado");

        uint8 estadoAnterior = estadosServicios[tokenId];
        estadosServicios[tokenId] = 5;

        uint256 tokenIdEvidencia = _nextTokenId++;
        _owners[tokenIdEvidencia] = acompanante;
        _balances[acompanante]++;

        estadosServicios[tokenIdEvidencia] = 5;
        calificacionesServicios[tokenIdEvidencia] = calificacionesServicios[
            tokenId
        ];
        acompanantesServicios[tokenIdEvidencia] = acompanante;

        if (bytes(URIsPorEstado[5]).length > 0) {
            tokenURIs[tokenIdEvidencia] = URIsPorEstado[5];
        }

        evidenciasServicios[tokenId] = tokenIdEvidencia;
        emit EstadoCambiado(
            tokenId,
            estadoAnterior,
            5,
            calificacionesServicios[tokenId]
        );
        emit ServicioPagado(tokenId, acompanante, tokenIdEvidencia);
        emit Transfer(address(0), acompanante, tokenIdEvidencia);
    }

    function obtenerURIServicio(
        uint256 tokenId
    ) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Servicio no existe");
        return tokenURIs[tokenId];
    }

    function obtenerProximoTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
}
