const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("📤 EXPORTANDO ABI DEL CONTRATO");
  console.log("=".repeat(60));

  try {
    // Obtener el ABI del contrato compilado
    const artifactPath = path.join(
      __dirname,
      "../artifacts/contracts/ColeccionServiciosNFT.sol/ColeccionServiciosNFT.json"
    );

    if (!fs.existsSync(artifactPath)) {
      console.error("❌ Artifact no encontrado. Compila primero con: npx hardhat compile");
      process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    console.log(`\n✅ ABI obtenido exitosamente`);
    console.log(`📋 Número de funciones/eventos: ${abi.length}`);

    // Crear directorio de salida si no existe
    const outputDir = path.join(__dirname, "../abi");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Guardar ABI completo
    const abiPath = path.join(outputDir, "ColeccionServiciosNFT.json");
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    console.log(`\n✅ ABI guardado en: ${abiPath}`);

    // Guardar ABI formateado para web3
    const abiForWeb3 = JSON.stringify(abi);
    const web3AbiPath = path.join(outputDir, "ColeccionServiciosNFT.web3.json");
    fs.writeFileSync(web3AbiPath, abiForWeb3);
    console.log(`✅ ABI minificado guardado: ColeccionServiciosNFT.web3.json`);

    // Generar archivo JavaScript para importar
    const jsAbiPath = path.join(outputDir, "ColeccionServiciosNFT.js");
    const jsContent = `// Auto-generated ABI export
// Generated: ${new Date().toISOString()}

module.exports = ${abiForWeb3};
`;
    fs.writeFileSync(jsAbiPath, jsContent);
    console.log(`✅ ABI exportada como módulo JS: ColeccionServiciosNFT.js`);

    // Generar archivo TypeScript para importar
    const tsAbiPath = path.join(outputDir, "ColeccionServiciosNFT.ts");
    const tsContent = `// Auto-generated ABI export
// Generated: ${new Date().toISOString()}

export const ColeccionServiciosNFTABI = ${abiForWeb3} as const;

export default ColeccionServiciosNFTABI;
`;
    fs.writeFileSync(tsAbiPath, tsContent);
    console.log(`✅ ABI exportada como módulo TS: ColeccionServiciosNFT.ts`);

    // Generar resumen de funciones
    console.log("\n" + "=".repeat(60));
    console.log("📋 RESUMEN DE FUNCIONES");
    console.log("=".repeat(60));

    const functions = abi.filter((item) => item.type === "function");
    const events = abi.filter((item) => item.type === "event");
    const constructor = abi.filter((item) => item.type === "constructor");

    console.log(`\n👷 Constructor: ${constructor.length}`);
    console.log(`📝 Funciones: ${functions.length}`);
    console.log(`📢 Eventos: ${events.length}`);

    console.log("\n📝 Funciones principales:");
    functions.slice(0, 10).forEach((fn) => {
      const params = fn.inputs.map((p) => p.type).join(", ");
      console.log(`   - ${fn.name}(${params})`);
    });

    if (functions.length > 10) {
      console.log(`   ... y ${functions.length - 10} funciones más`);
    }

    console.log("\n📢 Eventos:");
    events.slice(0, 5).forEach((evt) => {
      console.log(`   - ${evt.name}`);
    });

    if (events.length > 5) {
      console.log(`   ... y ${events.length - 5} eventos más`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ EXPORTACIÓN COMPLETADA");
    console.log("=".repeat(60));

    console.log(`\n📁 Archivos generados en: ./abi/`);
    console.log(`   - ColeccionServiciosNFT.json (formato standard)`);
    console.log(`   - ColeccionServiciosNFT.web3.json (minificado)`);
    console.log(`   - ColeccionServiciosNFT.js (módulo CommonJS)`);
    console.log(`   - ColeccionServiciosNFT.ts (módulo TypeScript)`);

    console.log("\n💡 Usa en tus proyectos:");
    console.log(`\n   JavaScript/CommonJS:`);
    console.log(`   const ABI = require('./abi/ColeccionServiciosNFT.js');`);

    console.log(`\n   TypeScript:`);
    console.log(`   import { ColeccionServiciosNFTABI } from './abi/ColeccionServiciosNFT';`);

    console.log("\n");
  } catch (error) {
    console.error("\n❌ ERROR EXPORTANDO ABI:");
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
