import json
import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3

load_dotenv()

app = FastAPI(
    title="NFT Servicios API",
    description="API para gestionar NFTs de servicios de acompañamiento",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
RPC_URL = os.getenv("RPC_URL", "https://sepolia-rollup.arbitrum.io/rpc")
CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS", "0xFF2E077849546cCB392f9e38B716A40fDC451798"
)
CHAIN_ID = int(os.getenv("CHAIN_ID", "421614"))

# Inicializar Web3
web3 = Web3(Web3.HTTPProvider(RPC_URL))

# Validar conexión
if not web3.is_connected():
    raise ConnectionError("No se pudo conectar a la red Arbitrum")

# Cargar ABI desde artifacts de Hardhat
try:
    artifact_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "artifacts",
        "contracts",
        "ColeccionServiciosNFT.sol",
        "ColeccionServiciosNFT.json",
    )
    with open(artifact_path, "r") as f:
        artifact = json.load(f)
        CONTRACT_ABI = artifact["abi"]
except FileNotFoundError:
    raise FileNotFoundError(
        f"No se encontró el ABI en {artifact_path}. "
        "Asegúrate de ejecutar 'npm run compile' en la carpeta raíz del proyecto."
    )

# Inicializar contrato
contract = web3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI
)

# Obtener cuenta desde clave privada
if not PRIVATE_KEY:
    raise ValueError("PRIVATE_KEY no configurada en .env")

account = web3.eth.account.from_key(PRIVATE_KEY)
ACCOUNT_ADDRESS = account.address


# ==================== MODELOS ====================
class CrearServicioRequest(BaseModel):
    destinatario: str


class CambiarEstadoRequest(BaseModel):
    tokenId: int
    nuevoEstado: int
    calificacion: int = 0


class ConfigurarURIRequest(BaseModel):
    estado: int
    nuevaURI: str


class AsignarAcompananteRequest(BaseModel):
    tokenId: int
    acompanante: str


# ==================== FUNCIONES AUXILIARES ====================
def build_and_send_transaction(function_call):
    """Construye y envía una transacción"""
    try:
        nonce = web3.eth.get_transaction_count(ACCOUNT_ADDRESS)
        gas_estimate = function_call.estimate_gas({"from": ACCOUNT_ADDRESS})
        gas_price = web3.eth.gas_price

        tx_dict = function_call.build_transaction(
            {
                "nonce": nonce,
                "gas": int(gas_estimate * 1.2),
                "gasPrice": gas_price,
                "from": ACCOUNT_ADDRESS,
                "chainId": CHAIN_ID,
            }
        )

        signed_tx = web3.eth.account.sign_transaction(tx_dict, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "transactionHash": tx_hash.hex(),
            "blockNumber": receipt["blockNumber"],
            "gasUsed": receipt["gasUsed"],
            "status": receipt["status"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ENDPOINTS - 1. CREAR SERVICIO ====================
@app.post("/servicios/crear")
async def crear_servicio(request: CrearServicioRequest):
    """
    1. Crear un nuevo servicio NFT
    - Asigna el NFT a un destinatario
    - Estado inicial: CREADO (1)
    - Retorna tokenId
    """
    try:
        destinatario = Web3.to_checksum_address(request.destinatario)
        function = contract.functions.crearServicio(destinatario)

        tx_result = build_and_send_transaction(function)

        # Obtener tokenId del evento
        receipt = web3.eth.get_transaction_receipt(tx_result["transactionHash"])
        logs = contract.events.ServicioCreado().process_receipt(receipt)

        token_id = logs[0]["args"]["tokenId"] if logs else None

        return {
            "success": True,
            "tokenId": token_id,
            "destinatario": destinatario,
            "estado": 1,
            "transaction": tx_result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ENDPOINTS - 2. CAMBIAR ESTADO ====================
@app.post("/servicios/{tokenId}/cambiar-estado")
async def cambiar_estado_servicio(tokenId: int, request: CambiarEstadoRequest):
    """
    2. Cambiar el estado de un servicio
    - Estados: 1=CREADO, 2=ENCONTRADO, 3=TERMINADO, 4=CALIFICADO, 5=PAGADO
    - Si es CALIFICADO (4), se requiere calificación (1-5)
    - Si es PAGADO (5), crea NFT de evidencia automáticamente
    """
    try:
        if request.nuevoEstado < 1 or request.nuevoEstado > 5:
            raise ValueError("Estado debe estar entre 1 y 5")

        if request.nuevoEstado == 4:
            if request.calificacion < 1 or request.calificacion > 5:
                raise ValueError("Calificación debe estar entre 1 y 5")

        function = contract.functions.cambiarEstadoServicio(
            tokenId, request.nuevoEstado, request.calificacion
        )

        tx_result = build_and_send_transaction(function)

        receipt = web3.eth.get_transaction_receipt(tx_result["transactionHash"])
        logs = contract.events.EstadoCambiado().process_receipt(receipt)

        estado_anterior = logs[0]["args"]["estadoAnterior"] if logs else None

        return {
            "success": True,
            "tokenId": tokenId,
            "estadoAnterior": estado_anterior,
            "nuevoEstado": request.nuevoEstado,
            "calificacion": request.calificacion,
            "transaction": tx_result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ENDPOINTS - 3. CONFIGURAR URIs ====================
@app.post("/configuracion/uri-estado")
async def configurar_uri_estado(request: ConfigurarURIRequest):
    """
    3. Configurar el URI (metadata) para cada estado
    - Define el URI que se asignará a los NFTs según su estado
    - Estados: 1, 2, 3, 4, 5
    """
    try:
        if request.estado < 1 or request.estado > 5:
            raise ValueError("Estado debe estar entre 1 y 5")

        function = contract.functions.configurarURIEstado(
            request.estado, request.nuevaURI
        )

        tx_result = build_and_send_transaction(function)

        return {
            "success": True,
            "estado": request.estado,
            "uri": request.nuevaURI,
            "transaction": tx_result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ENDPOINTS - 4. CONSULTAS ====================
@app.get("/servicios/{tokenId}/estado")
async def obtener_estado_servicio(tokenId: int):
    """
    4a. Obtener el estado actual de un servicio
    """
    try:
        estado = contract.functions.obtenerEstadoServicio(tokenId).call()
        estados_map = {
            1: "CREADO",
            2: "ENCONTRADO",
            3: "TERMINADO",
            4: "CALIFICADO",
            5: "PAGADO",
        }
        return {
            "tokenId": tokenId,
            "estado": estado,
            "estadoNombre": estados_map.get(estado, "DESCONOCIDO"),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/servicios/{tokenId}/uri")
async def obtener_uri_servicio(tokenId: int):
    """
    4b. Obtener el URI (metadata) de un servicio
    """
    try:
        uri = contract.functions.obtenerURIServicio(tokenId).call()
        return {"tokenId": tokenId, "uri": uri}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/servicios/{tokenId}/calificacion")
async def obtener_calificacion_servicio(tokenId: int):
    """
    4c. Obtener la calificación de un servicio
    """
    try:
        calificacion = contract.functions.obtenerCalificacionServicio(tokenId).call()
        return {"tokenId": tokenId, "calificacion": calificacion}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/servicios/{tokenId}/acompanante")
async def obtener_acompanante(tokenId: int):
    """
    4d. Obtener el acompañante asignado a un servicio
    """
    try:
        acompanante = contract.functions.obtenerAcompanante(tokenId).call()
        return {"tokenId": tokenId, "acompanante": acompanante}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/servicios/{tokenId}/evidencia")
async def obtener_evidencia_servicio(tokenId: int):
    """
    4e. Obtener el NFT de evidencia (se crea al pagar)
    """
    try:
        evidencia = contract.functions.obtenerEvidenciaServicio(tokenId).call()
        return {"tokenId": tokenId, "tokenIdEvidencia": evidencia}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/servicios/usuario/{usuarioAddress}")
async def obtener_servicios_usuario(usuarioAddress: str):
    """
    4f. Obtener todos los servicios de un usuario (NFTs)
    """
    try:
        usuario = Web3.to_checksum_address(usuarioAddress)
        balance = contract.functions.balanceOf(usuario).call()

        servicios = []
        for i in range(balance):
            token_id = contract.functions.tokenOfOwnerByIndex(usuario, i).call()
            servicios.append(token_id)

        return {"usuario": usuario, "cantidad": balance, "servicios": servicios}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== ENDPOINTS ADICIONALES ====================
@app.post("/servicios/{tokenId}/asignar-acompanante")
async def asignar_acompanante(tokenId: int, request: AsignarAcompananteRequest):
    """
    Asignar un acompañante a un servicio
    """
    try:
        acompanante = Web3.to_checksum_address(request.acompanante)
        function = contract.functions.asignarAcompanante(tokenId, acompanante)

        tx_result = build_and_send_transaction(function)

        return {
            "success": True,
            "tokenId": tokenId,
            "acompanante": acompanante,
            "transaction": tx_result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/servicios/{tokenId}/marcar-pagado")
async def marcar_como_pagado(tokenId: int):
    """
    Marcar un servicio como pagado (crea NFT de evidencia)
    """
    try:
        function = contract.functions.marcarComoPagado(tokenId)

        tx_result = build_and_send_transaction(function)

        receipt = web3.eth.get_transaction_receipt(tx_result["transactionHash"])
        logs = contract.events.ServicioPagado().process_receipt(receipt)

        token_id_evidencia = logs[0]["args"]["tokenIdEvidencia"] if logs else None

        return {
            "success": True,
            "tokenId": tokenId,
            "tokenIdEvidencia": token_id_evidencia,
            "transaction": tx_result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/info/contrato")
async def obtener_info_contrato():
    """
    Obtener información del contrato
    """
    try:
        nombre = contract.functions.name().call()
        simbolo = contract.functions.symbol().call()
        proximo_token_id = contract.functions.obtenerProximoTokenId().call()

        return {
            "contractAddress": CONTRACT_ADDRESS,
            "nombre": nombre,
            "simbolo": simbolo,
            "proximoTokenId": proximo_token_id,
            "chainId": CHAIN_ID,
            "rpcUrl": RPC_URL,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/info/cuenta")
async def obtener_info_cuenta():
    """
    Obtener información de la cuenta ejecutora
    """
    try:
        balance = web3.eth.get_balance(ACCOUNT_ADDRESS)
        balance_eth = web3.from_wei(balance, "ether")

        return {
            "address": ACCOUNT_ADDRESS,
            "balanceWei": balance,
            "balanceETH": float(balance_eth),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/health")
async def health_check():
    """
    Verificar estado de la API y conexión a la red
    """
    try:
        is_connected = web3.is_connected()
        block_number = web3.eth.block_number if is_connected else None

        return {
            "status": "healthy" if is_connected else "disconnected",
            "connected": is_connected,
            "blockNumber": block_number,
            "chainId": CHAIN_ID,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
