import json
import os
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3


def diagnostic_check():
    """Script de diagnóstico para verificar la configuración del backend"""
    print("🔍 INICIANDO DIAGNÓSTICO DEL BACKEND")
    print("=" * 50)

    # 1. Verificar variables de entorno
    print("\n📋 1. VERIFICANDO VARIABLES DE ENTORNO")
    print("-" * 30)

    load_dotenv()

    env_vars = {
        "PRIVATE_KEY": os.getenv("PRIVATE_KEY"),
        "RPC_URL": os.getenv("RPC_URL", "https://sepolia-rollup.arbitrum.io/rpc"),
        "CONTRACT_ADDRESS": os.getenv(
            "CONTRACT_ADDRESS", "0xFF2E077849546cCB392f9e38B716A40fDC451798"
        ),
        "CHAIN_ID": os.getenv("CHAIN_ID", "421614"),
    }

    for key, value in env_vars.items():
        if value:
            if key == "PRIVATE_KEY":
                masked_value = (
                    value[:6] + "..." + value[-4:] if len(value) > 10 else "***"
                )
                print(f"✅ {key}: {masked_value}")
            else:
                print(f"✅ {key}: {value}")
        else:
            print(f"❌ {key}: NO CONFIGURADA")

    # 2. Verificar conexión Web3
    print("\n🌐 2. VERIFICANDO CONEXIÓN WEB3")
    print("-" * 30)

    try:
        w3 = Web3(Web3.HTTPProvider(env_vars["RPC_URL"]))
        if w3.is_connected():
            block_number = w3.eth.block_number
            print(f"✅ Conectado a Arbitrum Sepolia")
            print(f"   📦 Bloque actual: {block_number}")
        else:
            print("❌ No se pudo conectar a la red")
            return False
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

    # 3. Verificar cuenta
    print("\n👤 3. VERIFICANDO CUENTA")
    print("-" * 30)

    if env_vars["PRIVATE_KEY"]:
        try:
            account = w3.eth.account.from_key(env_vars["PRIVATE_KEY"])
            balance = w3.eth.get_balance(account.address)
            balance_eth = w3.from_wei(balance, "ether")

            print(f"✅ Dirección: {account.address}")
            print(f"💰 Balance: {balance_eth} ETH ({balance} wei)")

            if balance == 0:
                print("⚠️  ADVERTENCIA: La cuenta no tiene ETH para gas")
            else:
                print("✅ La cuenta tiene ETH para transacciones")

        except Exception as e:
            print(f"❌ Error con la clave privada: {e}")
            return False
    else:
        print("❌ PRIVATE_KEY no configurada")
        return False

    # 4. Verificar artifacts del contrato
    print("\n📄 4. VERIFICANDO ARTIFACTS DEL CONTRATO")
    print("-" * 30)

    artifact_path = (
        Path(__file__).parent.parent
        / "artifacts"
        / "contracts"
        / "ColeccionServiciosNFT.sol"
        / "ColeccionServiciosNFT.json"
    )

    if artifact_path.exists():
        try:
            with open(artifact_path, "r") as f:
                artifact = json.load(f)

            print(f"✅ Artifact encontrado: {artifact_path}")
            print(f"   📝 Contrato: {artifact.get('contractName', 'N/A')}")
            print(f"   📋 ABI: {len(artifact.get('abi', []))} funciones")

        except Exception as e:
            print(f"❌ Error leyendo artifact: {e}")
            return False
    else:
        print(f"❌ Artifact no encontrado en: {artifact_path}")
        print("💡 Ejecuta: npm run compile en la carpeta raíz")
        return False

    # 5. Verificar contrato en blockchain
    print("\n📡 5. VERIFICANDO CONTRATO EN BLOCKCHAIN")
    print("-" * 30)

    try:
        contract_address = Web3.to_checksum_address(env_vars["CONTRACT_ADDRESS"])
        contract = w3.eth.contract(address=contract_address, abi=artifact["abi"])

        # Intentar llamar a una función view
        name = contract.functions.name().call()
        symbol = contract.functions.symbol().call()
        next_token_id = contract.functions.obtenerProximoTokenId().call()

        print(f"✅ Contrato encontrado en blockchain")
        print(f"   🏷️  Nombre: {name}")
        print(f"   🔤 Símbolo: {symbol}")
        print(f"   🔢 Próximo Token ID: {next_token_id}")
        print(f"   📍 Dirección: {contract_address}")

    except Exception as e:
        print(f"❌ Error interactuando con el contrato: {e}")
        return False

    # 6. Verificar dependencias
    print("\n📦 6. VERIFICANDO DEPENDENCIAS")
    print("-" * 30)

    try:
        import eth_account
        import fastapi
        import pydantic
        import uvicorn

        print(f"✅ FastAPI: {fastapi.__version__}")
        print(f"✅ Uvicorn: {uvicorn.__version__}")
        print(f"✅ Pydantic: {pydantic.__version__}")
        print(f"✅ Web3: {web3.__version__}")
        print(f"✅ eth-account: {eth_account.__version__}")

    except ImportError as e:
        print(f"❌ Dependencia faltante: {e}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False

    # Resumen final
    print("\n" + "=" * 50)
    print("🎉 DIAGNÓSTICO COMPLETADO")
    print("=" * 50)
    print("✅ El backend está configurado correctamente")
    print("🚀 Puedes ejecutar: python main.py")
    print("📚 Documentación: http://localhost:8000/docs")

    return True


def test_transaction():
    """Probar una transacción simple"""
    print("\n🧪 PROBANDO TRANSACCIÓN")
    print("-" * 30)

    load_dotenv()
    w3 = Web3(
        Web3.HTTPProvider(
            os.getenv("RPC_URL", "https://sepolia-rollup.arbitrum.io/rpc")
        )
    )

    if not w3.is_connected():
        print("❌ No conectado a la red")
        return

    try:
        # Cargar contrato
        artifact_path = (
            Path(__file__).parent.parent
            / "artifacts"
            / "contracts"
            / "ColeccionServiciosNFT.sol"
            / "ColeccionServiciosNFT.json"
        )
        with open(artifact_path, "r") as f:
            artifact = json.load(f)

        contract_address = Web3.to_checksum_address(
            os.getenv("CONTRACT_ADDRESS", "0xFF2E077849546cCB392f9e38B716A40fDC451798")
        )
        contract = w3.eth.contract(address=contract_address, abi=artifact["abi"])

        # Probar función view (no requiere gas)
        next_token_id = contract.functions.obtenerProximoTokenId().call()
        print(f"✅ Función view probada - Próximo Token ID: {next_token_id}")

        # Verificar balance para transacciones
        account = w3.eth.account.from_key(os.getenv("PRIVATE_KEY"))
        balance = w3.eth.get_balance(account.address)

        if balance > 0:
            print(
                f"✅ Balance suficiente para transacciones: {w3.from_wei(balance, 'ether')} ETH"
            )
        else:
            print("❌ Balance insuficiente para transacciones")

    except Exception as e:
        print(f"❌ Error en prueba de transacción: {e}")


if __name__ == "__main__":
    diagnostic_check()
    test_transaction()
