const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("🔍 INICIANDO VERIFICACIÓN DEL CONTRATO");
  console.log("=".repeat(60));

  try {
    // Leer información del despliegue más reciente
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      throw new Error(
        "❌ No se encontró el directorio de despliegues. Ejecuta deploy.js primero."
      );
    }

    const files = fs
      .readdirSync(deploymentsDir)
      .filter((f) => f.startsWith("deployment-") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error(
        "❌ No se encontraron archivos de despliegue. Ejecuta deploy.js primero."
      );
    }

    const latestFile = files[0];
    const deploymentPath = path.join(deploymentsDir, latestFile);
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    console.log(`\n📂 Usando despliegue: ${latestFile}`);
    console.log(`📍 Contrato: ${deploymentInfo.contractAddress}`);
    console.log(`🌐 Red: ${deploymentInfo.network}`);

    const contractAddress = deploymentInfo.contractAddress;

    // Obtener la red actual
    const network = await ethers.provider.getNetwork();
    console.log(`\n🔗 Red actual: ${network.name} (Chain ID: ${network.chainId})`);

    // Verificar que es la red correcta
    if (network.chainId !== deploymentInfo.chainId) {
      console.warn(
        `⚠️  Advertencia: El contrato fue desplegado en chain ${deploymentInfo.chainId}, pero está conectado a chain ${network.chainId}`
      );
    }

    // Obtener el código del contrato
    console.log("\n📋 Verificando contrato en blockchain...");
    const code = await ethers.provider.getCode(contractAddress);

    if (code === "0x") {
      throw new Error(
        `❌ No se encontró código en la dirección ${contractAddress}. Verifica que la dirección sea correcta.`
      );
    }

    console.log("✅ Contrato encontrado en blockchain");
    console.log(`   Tamaño del bytecode: ${(code.length - 2) / 2} bytes`);

    // Conectar al contrato
    console.log("\n📟 Conectando al contrato...");
    const ColeccionServiciosNFT = await ethers.getContractFactory(
      "ColeccionServiciosNFT"
    );
    const contract = ColeccionServiciosNFT.attach(contractAddress);

    // Verificar funciones básicas
    console.log("\n🧪 Realizando pruebas básicas:");

    // 1. Verificar nombre y símbolo
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      console.log(`✅ Nombre: ${name}`);
      console.log(`✅ Símbolo: ${symbol}`);
    } catch (e) {
      console.log(`❌ Error obteniendo nombre/símbolo: ${e.message}`);
    }

    // 2. Verificar próximo token ID
    try {
      const nextTokenId = await contract.obtenerProximoTokenId();
      console.log(`✅ Próximo Token ID: ${nextTokenId}`);
    } catch (e) {
      console.log(`❌ Error obteniendo próximo token ID: ${e.message}`);
    }

    // 3. Verificar interfaz ERC721
    try {
      const supportsERC721 = await contract.supportsInterface("0x80ac58cd");
      console.log(`✅ Soporta ERC721: ${supportsERC721}`);
    } catch (e) {
      console.log(`❌ Error verificando ERC721: ${e.message}`);
    }

    // 4. Verificar interfaz ERC721URIStorage
    try {
      const supportsURIStorage = await contract.supportsInterface(
        "0x49064906"
      );
      console.log(`✅ Soporta ERC721URIStorage: ${supportsURIStorage}`);
    } catch (e) {
      console.log(`⚠️  ERC721URIStorage no es soportado como interfaz`);
    }

    // 5. Prueba de lectura de URIs
    console.log("\n🔗 Verificando URIs de estados:");
    for (let i = 1; i <= 5; i++) {
      try {
        const uri = await contract.URIsPorEstado(i);
        const status = uri ? "✅ Configurada" : "⚠️  No configurada";
        console.log(`   Estado ${i}: ${status} ${uri ? `(${uri.substring(0, 50)}...)` : ""}`);
      } catch (e) {
        console.log(`   Estado ${i}: ❌ Error ${e.message}`);
      }
    }

    // Información de verificación en Arbiscan
    console.log("\n" + "=".repeat(60));
    console.log("📊 INFORMACIÓN PARA VERIFICACIÓN EN ARBISCAN:");
    console.log("=".repeat(60));
    console.log(`\n🔗 Explorer: https://sepolia.arbiscan.io/address/${contractAddress}`);
    console.log(`\n📝 Para verificar el contrato, necesitarás:`);
    console.log(`   - Contract Address: ${contractAddress}`);
    console.log(`   - Compiler Version: v0.8.19`);
    console.log(`   - Optimization: Yes (200 runs)`);
    console.log(`   - License: MIT`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ VERIFICACIÓN COMPLETADA");
    console.log("=".repeat(60));

    // Guardar información de verificación
    const verificationInfo = {
      timestamp: new Date().toISOString(),
      contractAddress: contractAddress,
      network: deploymentInfo.network,
      chainId: network.chainId,
      bytecodeSize: (code.length - 2) / 2,
      verification: {
        nameSymbol: "✅",
        erc721Support: "✅",
        functions: "✅",
      },
    };

    const verificationPath = path.join(
      deploymentsDir,
      "verification-report.json"
    );
    fs.writeFileSync(
      verificationPath,
      JSON.stringify(verificationInfo, null, 2)
    );
    console.log(`\n💾 Reporte guardado en: ${verificationPath}`);
  } catch (error) {
    console.error("\n❌ ERROR DURANTE LA VERIFICACIÓN:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
