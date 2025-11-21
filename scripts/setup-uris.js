const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(70));
  console.log("⚙️  CONFIGURANDO URIs DE ESTADOS");
  console.log("=".repeat(70));

  try {
    // Obtener información del último despliegue
    const deploymentsDir = path.join(__dirname, "../deployments");
    const latestPath = path.join(deploymentsDir, "latest-deployment.json");

    if (!fs.existsSync(latestPath)) {
      console.error("❌ No se encontró archivo de despliegue reciente");
      console.error("   Ejecuta primero: npm run deploy");
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

    // URIs de ejemplo (reemplazar con URLs reales)
    const uris = {
      1: "https://example.com/metadata/creado.json",
      2: "https://example.com/metadata/encontrado.json",
      3: "https://example.com/metadata/terminado.json",
      4: "https://example.com/metadata/calificado.json",
      5: "https://example.com/metadata/pagado.json",
    };

    const stateNames = {
      1: "CREADO",
      2: "ENCONTRADO",
      3: "TERMINADO",
      4: "CALIFICADO",
      5: "PAGADO",
    };

    console.log("\n" + "=".repeat(70));
    console.log("📝 CONFIGURANDO URIs POR ESTADO");
    console.log("=".repeat(70));

    // Configurar cada URI
    for (let estado = 1; estado <= 5; estado++) {
      const uri = uris[estado];
      const stateName = stateNames[estado];

      console.log(`\n⏳ Configurando estado ${estado} (${stateName})...`);
      console.log(`   URI: ${uri}`);

      const tx = await contract.configurarURIEstado(estado, uri);
      console.log(`   📤 TX: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`   ✅ Configurado en bloque ${receipt.blockNumber}`);
    }

    // Verificar que las URIs fueron configuradas
    console.log("\n" + "=".repeat(70));
    console.log("✓ VERIFICANDO URIs CONFIGURADAS");
    console.log("=".repeat(70));

    for (let estado = 1; estado <= 5; estado++) {
      const configuredUri = await contract.URIsPorEstado(estado);
      const stateName = stateNames[estado];
      console.log(`\n✅ Estado ${estado} (${stateName}):`);
      console.log(`   ${configuredUri}`);
    }

    // Guardar configuración
    const configInfo = {
      timestamp: new Date().toISOString(),
      contractAddress: contractAddress,
      network: deploymentInfo.network,
      uris: uris,
      stateNames: stateNames,
    };

    const configPath = path.join(deploymentsDir, "uri-configuration.json");
    fs.writeFileSync(configPath, JSON.stringify(configInfo, null, 2));
    console.log(`\n💾 Configuración guardada: ${configPath}`);

    console.log("\n" + "=".repeat(70));
    console.log("✅ URIs CONFIGURADAS EXITOSAMENTE");
    console.log("=".repeat(70));

    console.log("\n📝 PRÓXIMOS PASOS:");
    console.log("1. Crear servicios de prueba:");
    console.log("   npx hardhat run scripts/create-test-service.js --network arbitrumSepolia");
    console.log("\n2. Cambiar estados de servicios:");
    console.log("   npx hardhat run scripts/change-service-state.js --network arbitrumSepolia");

    return true;
  } catch (error) {
    console.error("\n❌ ERROR CONFIGURANDO URIs:");
    console.error(error.message);
    if (error.data) console.error("Datos:", error.data);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
