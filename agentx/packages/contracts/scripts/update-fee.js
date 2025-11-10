const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Updating INFT Creation Fee...");
  
  const [signer] = await ethers.getSigners();
  console.log("Account:", await signer.getAddress());
  
  // INFT contract address
  const INFT_ADDRESS = "0x80Cb977FBC5d9d7B325257cAc4942EAB35418770";
  
  // Connect to deployed contract
  const INFT = await ethers.getContractFactory("INFT");
  const inft = INFT.attach(INFT_ADDRESS);
  
  // Check current fee
  const currentFee = await inft.creationFee();
  console.log("Current creation fee:", ethers.formatEther(currentFee), "MATIC");
  
  // Update to 0.0001 MATIC
  const newFee = ethers.parseEther("0.0001");
  console.log("Setting new fee to:", ethers.formatEther(newFee), "MATIC");
  
  const tx = await inft.updateCreationFee(newFee);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Fee updated successfully!");
  
  // Verify
  const updatedFee = await inft.creationFee();
  console.log("New creation fee:", ethers.formatEther(updatedFee), "MATIC");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

