const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(70));
  console.log("🎯 CREANDO SERVICIO DE PRUEBA");
  console.log("=".repeat(70));

  try {
    // Obtener información del despliegue
    const deploymentsDir = path.join(__dirname, "../deployments");
    const latestPath = path.join(deploymentsDir, "latest-deployment.json");

    if (!fs.existsSync(latestPath)) {
      console.error("❌ No se encontró archivo de despliegue reciente");
      console.error("   Ejecuta primero: npm run deploy:arbitrum");
      process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(latestPath, "utf8"));
    const contractAddress = deploymentInfo.contractAddress;

    console.log(`\n📍 Contrato: ${contractAddress}`);
    console.log(`🌐 Red: ${deploymentInfo.network}`);

    // Conectar al contrato
    const [deployer] = await hre.ethers.getSigners();
    console.log(`\n👤 Cuenta: ${deployer.address}`);

    const ColeccionServiciosNFT = await hre.ethers.getContractFactory(
      "ColeccionServiciosNFT"
    );
    const contract = ColeccionServiciosNFT.attach(contractAddress);

    // Crear un servicio de prueba
    console.log("\n" + "=".repeat(70));
    console.log("📝 CREANDO SERVICIO");
    console.log("=".repeat(70));

    const recipientAddress = deployer.address;
    console.log(`\n📦 Creando servicio para: ${recipientAddress}`);

    const tx = await contract.crearServicio(recipientAddress);
    console.log(`📤 Transacción enviada: ${tx.hash}`);
    console.log("⏳ Esperando confirmación...");

    const receipt = await tx.wait();
    console.log(`✅ Servicio creado exitosamente`);
    console.log(`📦 Bloque: ${receipt.blockNumber}`);
    console.log(`⛽ Gas usado: ${receipt.gasUsed.toString()}`);

    // Obtener el token ID del evento
    const iface = new hre.ethers.Interface(
      await hre.artifacts.readArtifact("ColeccionServiciosNFT").then(
        (a) => a.abi
      )
    );

    let tokenId = 0;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === "ServicioCreado") {
          tokenId = parsed.args.tokenId;
          console.log(`\n🎫 Token ID: ${tokenId}`);
          break;
        }
      } catch (e) {
        // Ignorar logs no parseables
      }
    }

    // Obtener próximo token ID para confirmación
    const nextTokenId = await contract.obtenerProximoTokenId();
    console.log(`📊 Próximo Token ID: ${nextTokenId}`);

    // Asignar acompañante
    console.log("\n" + "=".repeat(70));
    console.log("👥 ASIGNANDO ACOMPAÑANTE");
    console.log("=".repeat(70));

    const companionAddress = deployer.address;
    console.log(`\n👨‍⚕️  Acompañante: ${companionAddress}`);

    const assignTx = await contract.asignarAcompanante(tokenId, companionAddress);
    console.log(`📤 Transacción enviada: ${assignTx.hash}`);

    await assignTx.wait();
    console.log("✅ Acompañante asignado");

    // Verificar estado
    console.log("\n" + "=".repeat(70));
    console.log("📋 INFORMACIÓN DEL SERVICIO");
    console.log("=".repeat(70));

    const estado = await contract.obtenerEstadoServicio(tokenId);
    const acompanante = await contract.obtenerAcompanante(tokenId);
    const calificacion = await contract.obtenerCalificacionServicio(tokenId);

    console.log(`\n📍 Token ID: ${tokenId}`);
    console.log(`🔄 Estado: ${estado} (1=CREADO, 2=ENCONTRADO, 3=TERMINADO, 4=CALIFICADO, 5=PAGADO)`);
    console.log(`👥 Acompañante: ${acompanante}`);
    console.log(`⭐ Calificación: ${calificacion}`);

    // Guardar información del servicio creado
    const servicoInfo = {
      timestamp: new Date().toISOString(),
      contractAddress: contractAddress,
      tokenId: tokenId.toString(),
      owner: recipientAddress,
      companion: companionAddress,
      estado: estado.toString(),
      transactionHash: tx.hash,
      createdAt: {
        block: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      },
    };

    const servicesDir = path.join(__dirname, "../services");
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
    }

    const servicePath = path.join(servicesDir, `service-${tokenId}.json`);
    fs.writeFileSync(servicePath, JSON.stringify(servicoInfo, null, 2));
    console.log(`\n💾 Información guardada: service-${tokenId}.json`);

    console.log("\n" + "=".repeat(70));
    console.log("✅ SERVICIO CREADO EXITOSAMENTE");
    console.log("=".repeat(70));

    console.log("\n📝 PRÓXIMOS PASOS:");
    console.log("1. Cambiar estado del servicio:");
    console.log(`   npx hardhat run scripts/change-service-state.js --network arbitrumSepolia`);
    console.log("\n2. Configurar URIs de metadatos:");
    console.log(`   npx hardhat run scripts/setup-uris.js --network arbitrumSepolia`);
    console.log("\n3. Ver en Arbiscan:");
    console.log(`   https://sepolia.arbiscan.io/address/${contractAddress}#readContract`);

    return tokenId;
  } catch (error) {
    console.error("\n❌ ERROR CREANDO SERVICIO:");
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
