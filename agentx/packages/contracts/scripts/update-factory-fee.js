const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Updating Factory Creation Fee...");
  
  const [signer] = await ethers.getSigners();
  console.log("Account:", await signer.getAddress());
  
  // Factory contract address
  const FACTORY_ADDRESS = "0x8B45A879F0b9736Ab6249B80247644589a0F281C";
  
  // Connect to deployed contract
  const Factory = await ethers.getContractFactory("AgentNFTFactory");
  const factory = Factory.attach(FACTORY_ADDRESS);
  
  // Check current fee
  const currentFee = await factory.creationFee();
  console.log("Current creation fee:", ethers.formatEther(currentFee), "MATIC");
  
  // Update to 0.0001 MATIC
  const newFee = ethers.parseEther("0.0001");
  console.log("Setting new fee to:", ethers.formatEther(newFee), "MATIC");
  
  const tx = await factory.updateCreationFee(newFee);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Fee updated successfully!");
  
  // Verify
  const updatedFee = await factory.creationFee();
  console.log("New creation fee:", ethers.formatEther(updatedFee), "MATIC");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

