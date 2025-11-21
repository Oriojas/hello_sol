const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(70));
  console.log("🚀 DESPLIEGUE Y VERIFICACIÓN COMPLETA DE CONTRATO NFT");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();
  console.log(`\n👤 Cuenta de despliegue: ${deployer.address}`);

  try {
    // 1. VERIFICAR SALDO
    console.log("\n" + "=".repeat(70));
    console.log("💰 VERIFICANDO SALDO");
    console.log("=".repeat(70));

    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`✅ Saldo: ${balanceEth} ETH`);

    if (balance < ethers.parseEther("0.001")) {
      throw new Error(
        "❌ Saldo insuficiente para desplegar (se requiere > 0.001 ETH)"
      );
    }

    // 2. OBTENER INFORMACIÓN DE LA RED
    console.log("\n" + "=".repeat(70));
    console.log("🌐 INFORMACIÓN DE LA RED");
    console.log("=".repeat(70));

    const network = await ethers.provider.getNetwork();
    console.log(`Red: ${network.name}`);
    console.log(`Chain ID: ${Number(network.chainId)}`);

    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`Bloque actual: ${blockNumber}`);

    // 3. COMPILAR CONTRATO
    console.log("\n" + "=".repeat(70));
    console.log("📦 COMPILANDO CONTRATO");
    console.log("=".repeat(70));

    console.log("Compilando ColeccionServiciosNFT...");
    await hre.run("compile");
    console.log("✅ Compilación exitosa");

    // 4. DESPLEGAR CONTRATO
    console.log("\n" + "=".repeat(70));
    console.log("⚙️  DESPLEGANDO CONTRATO");
    console.log("=".repeat(70));

    const ColeccionServiciosNFT = await ethers.getContractFactory(
      "ColeccionServiciosNFT"
    );
    console.log("Desplegando ColeccionServiciosNFT...");

    const contract = await ColeccionServiciosNFT.deploy();
    console.log(`Transacción: ${contract.deploymentTransaction().hash}`);

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log(`✅ Contrato desplegado en: ${contractAddress}`);

    // Obtener información de despliegue
    const deploymentTx = contract.deploymentTransaction();
    const receipt = await deploymentTx.wait();

    const blockNum = Number(receipt.blockNumber);
    const gasUsed = receipt.gasUsed.toString();
    const gasPrice = receipt.gasPrice.toString();

    console.log(`Bloque: ${blockNum}`);
    console.log(`Gas usado: ${gasUsed}`);
    console.log(`Gas price: ${gasPrice}`);

    // 5. VERIFICAR FUNCIONES BÁSICAS
    console.log("\n" + "=".repeat(70));
    console.log("🧪 VERIFICANDO FUNCIONES BÁSICAS");
    console.log("=".repeat(70));

    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log(`✅ Nombre: ${name}`);
    console.log(`✅ Símbolo: ${symbol}`);

    const nextTokenId = await contract.obtenerProximoTokenId();
    console.log(`✅ Próximo Token ID: ${nextTokenId}`);

    const supportsERC721 = await contract.supportsInterface("0x80ac58cd");
    console.log(`✅ Soporta ERC721: ${supportsERC721}`);

    // 6. GUARDAR INFORMACIÓN DE DESPLIEGUE
    console.log("\n" + "=".repeat(70));
    console.log("💾 GUARDANDO INFORMACIÓN");
    console.log("=".repeat(70));

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployer.address,
      contractAddress: contractAddress,
      transactionHash: deploymentTx.hash,
      blockNumber: Number(blockNum),
      gasUsed: gasUsed,
      gasPrice: gasPrice,
      contract: {
        name: name,
        symbol: symbol,
        nextTokenId: nextTokenId.toString(),
      },
    };

    const timestamp = Date.now();
    const filename = `deployment-${network.name}-${timestamp}.json`;
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`✅ Guardado: ${filename}`);

    const latestPath = path.join(deploymentsDir, "latest-deployment.json");
    fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`✅ Referencia actualizada: latest-deployment.json`);

    // 7. VERIFICAR EN BLOCKCHAIN
    console.log("\n" + "=".repeat(70));
    console.log("✓ VERIFICACIÓN EN BLOCKCHAIN");
    console.log("=".repeat(70));

    const code = await ethers.provider.getCode(contractAddress);
    console.log(`✅ Código encontrado en blockchain`);
    console.log(`   Tamaño: ${(code.length - 2) / 2} bytes`);

    // 8. INTENTAR VERIFICAR EN ARBISCAN
    console.log("\n" + "=".repeat(70));
    console.log("🔍 VERIFICACIÓN EN ARBISCAN");
    console.log("=".repeat(70));

    try {
      console.log("Enviando solicitud de verificación a Arbiscan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
        contract: "contracts/ColeccionServiciosNFT.sol:ColeccionServiciosNFT",
      });
      console.log("✅ Contrato verificado exitosamente en Arbiscan");
    } catch (verifyError) {
      if (verifyError.message.includes("Already Verified")) {
        console.log("ℹ️  Contrato ya está verificado en Arbiscan");
      } else if (verifyError.message.includes("API rate")) {
        console.log(
          "⚠️  Límite de API alcanzado, intenta verificar manualmente"
        );
      } else {
        console.log(
          `⚠️  Error en verificación: ${verifyError.message.substring(0, 100)}`
        );
        console.log("   Puedes verificar manualmente usando Arbiscan");
      }
    }

    // 9. MOSTRAR RESUMEN Y ENLACES
    console.log("\n" + "=".repeat(70));
    console.log("📊 RESUMEN DE DESPLIEGUE");
    console.log("=".repeat(70));

    console.log(`\n✅ Despliegue completado exitosamente`);
    console.log(`\n📍 Dirección del contrato: ${contractAddress}`);
    console.log(
      `🌐 Red: ${network.name} (Chain ID: ${Number(network.chainId)})`
    );
    console.log(`👤 Deployed by: ${deployer.address}`);
    console.log(`⛽ Gas usado: ${gasUsed}`);
    console.log(`📦 Bloque: ${blockNum}`);

    console.log("\n" + "=".repeat(70));
    console.log("🔗 ENLACES ÚTILES");
    console.log("=".repeat(70));

    if (Number(network.chainId) === 421614) {
      console.log(`\n📜 Ver contrato en Arbiscan:`);
      console.log(`   https://sepolia.arbiscan.io/address/${contractAddress}`);

      console.log(`\n📝 Ver transacción de despliegue:`);
      console.log(`   https://sepolia.arbiscan.io/tx/${deploymentTx.hash}`);

      console.log(`\n🎨 Ver en OpenSea (testnet):`);
      console.log(
        `   https://testnets.opensea.io/collection/${contractAddress}`
      );
    }

    console.log("\n" + "=".repeat(70));
    console.log("📚 PRÓXIMOS PASOS");
    console.log("=".repeat(70));

    console.log(`\n1. Verificar contrato en Arbiscan:`);
    console.log(
      `   https://sepolia.arbiscan.io/address/${contractAddress}#code`
    );

    console.log(`\n2. Configurar URIs de estados:`);
    console.log(
      `   npx hardhat run scripts/setup-uris.js --network arbitrumSepolia`
    );

    console.log(`\n3. Crear servicios de prueba:`);
    console.log(
      `   npx hardhat run scripts/create-test-service.js --network arbitrumSepolia`
    );

    console.log("\n" + "=".repeat(70));
    console.log("✅ PROCESO COMPLETADO");
    console.log("=".repeat(70) + "\n");

    return contractAddress;
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ ERROR DURANTE EL DESPLIEGUE Y VERIFICACIÓN");
    console.error("=".repeat(70));
    console.error(`\n${error.message}`);

    if (error.data) {
      console.error("\nDatos adicionales:");
      console.error(error.data);
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
