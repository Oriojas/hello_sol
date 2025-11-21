const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Iniciando despliegue del contrato ColeccionServiciosNFT...\n");

  // Obtener información del deployment
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Cuenta de despliegue: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Compilar contrato
  console.log("📦 Compilando contrato...");
  await hre.run("compile");
  console.log("✅ Compilación exitosa\n");

  // Desplegar contrato
  console.log("⏳ Desplegando contrato...");
  const ColeccionServiciosNFT = await hre.ethers.getContractFactory("ColeccionServiciosNFT");
  const contract = await ColeccionServiciosNFT.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`✅ Contrato desplegado exitosamente`);
  console.log(`📍 Dirección: ${contractAddress}\n`);

  // Obtener información de la transacción
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    const receipt = await deploymentTx.wait();
    console.log(`📋 Hash de transacción: ${receipt.hash}`);
    console.log(`⛽ Gas utilizado: ${receipt.gasUsed.toString()}`);
    console.log(`📦 Block number: ${receipt.blockNumber}\n`);
  }

  // Verificar funciones básicas
  console.log("✓ Verificando funciones básicas...");
  try {
    const nextTokenId = await contract.obtenerProximoTokenId();
    console.log(`✓ Token ID inicial: ${nextTokenId}`);

    const supportsInterface = await contract.supportsInterface("0x80ac58cd"); // ERC721
    console.log(`✓ Soporta ERC721: ${supportsInterface}`);
  } catch (error) {
    console.log(`⚠️  Error verificando funciones: ${error.message}`);
  }

  // Guardar información del despliegue
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    timestamp: new Date().toISOString(),
    solcVersion: "0.8.19",
  };

  const deploymentPath = path.join(__dirname, "../deployments.json");
  const deployments = fs.existsSync(deploymentPath) ? JSON.parse(fs.readFileSync(deploymentPath)) : {};

  deployments[hre.network.name] = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log("💾 Información de despliegue guardada en deployments.json\n");

  // Instrucciones siguientes
  console.log("📌 Próximos pasos:");
  console.log("1. Verificar el contrato en Arbiscan:");
  console.log(`   https://sepolia.arbiscan.io/address/${contractAddress}`);
  console.log("\n2. Configurar URIs de estados:");
  console.log("   npx hardhat run scripts/setup-uris.js --network arbitrumSepolia");
  console.log("\n3. Crear servicios de ejemplo:");
  console.log("   npx hardhat run scripts/create-services.js --network arbitrumSepolia");
  console.log("\n4. Verificar contrato en Arbiscan:");
  console.log("   npx hardhat run scripts/verify.js --network arbitrumSepolia");

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Despliegue completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error durante el despliegue:", error);
    process.exit(1);
  });
