const { ethers } = require("hardhat");

async function main() {
  console.log("🏭 Deploying ONLY Factory (using existing Marketplace)...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC\n");

  // Use existing Marketplace from .env
  const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || "0x5022bE23cE25B214e656FCE7E22De76B55f9E353";
  console.log("Using existing Marketplace:", MARKETPLACE_ADDRESS);

  // Deploy Factory
  const Factory = await ethers.getContractFactory("AgentNFTFactory");
  const factory = await Factory.deploy(MARKETPLACE_ADDRESS);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("\n✅ DEPLOYMENT COMPLETE!");
  console.log("========================");
  console.log("Factory Address:", factoryAddress);
  console.log("Marketplace Address:", MARKETPLACE_ADDRESS);
  
  // Test
  const creationFee = await factory.creationFee();
  console.log("\n🔍 Verification:");
  console.log("Creation Fee:", ethers.formatEther(creationFee), "MATIC");
  
  console.log("\n📝 Update your .env:");
  console.log(`FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`MARKETPLACE_ADDRESS=${MARKETPLACE_ADDRESS}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

