const { ethers } = require("hardhat");

async function main() {
  console.log("🏭 Deploying Agent NFT Factory...");
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const bal = await ethers.provider.getBalance(await signer.getAddress());
  console.log("Network:", network.chainId.toString());
  console.log("Deployer:", await signer.getAddress());
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  // First deploy marketplace if needed
  console.log("\n🏪 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const feeRecipient = await signer.getAddress();
  const marketplace = await Marketplace.deploy(feeRecipient);
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed at:", marketplaceAddress);

  // Deploy Factory
  console.log("\n🏭 Deploying AgentNFTFactory...");
  const AgentNFTFactory = await ethers.getContractFactory("AgentNFTFactory");
  const factory = await AgentNFTFactory.deploy(marketplaceAddress);
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ AgentNFTFactory deployed at:", factoryAddress);
  
  // Test the factory
  console.log("\n🧪 Testing factory...");
  try {
    const creationFee = await factory.creationFee();
    const marketplaceAddr = await factory.marketplace();
    const totalAgents = await factory.getTotalAgents();
    
    console.log("Creation Fee:", ethers.formatEther(creationFee), "MATIC");
    console.log("Marketplace:", marketplaceAddr);
    console.log("Total Agents:", totalAgents.toString());
    
    console.log("✅ Factory test successful!");
  } catch (error) {
    console.error("❌ Factory test failed:", error.message);
  }

  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("AgentNFTFactory:     ", factoryAddress);
  console.log("Marketplace:         ", marketplaceAddress);
  console.log("Fee Recipient:       ", feeRecipient);
  console.log("\n💡 Update your .env file with:");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
