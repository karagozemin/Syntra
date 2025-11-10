const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Gas Prices on Polygon Amoy...\n");
  
  const [signer] = await ethers.getSigners();
  
  // Get current gas price
  const feeData = await ethers.provider.getFeeData();
  console.log("Current Gas Prices:");
  console.log("- Gas Price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
  console.log("- Max Fee:", ethers.formatUnits(feeData.maxFeePerGas || 0, "gwei"), "gwei");
  console.log("- Max Priority:", ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, "gwei"), "gwei");
  
  // Get latest block to see actual gas used
  const latestBlock = await ethers.provider.getBlock("latest");
  console.log("\nLatest Block Info:");
  console.log("- Block Number:", latestBlock.number);
  console.log("- Gas Used:", latestBlock.gasUsed.toString());
  console.log("- Gas Limit:", latestBlock.gasLimit.toString());
  console.log("- Base Fee:", ethers.formatUnits(latestBlock.baseFeePerGas || 0, "gwei"), "gwei");
  
  // Try to estimate gas for createAgent
  const FACTORY_ADDRESS = "0x8B45A879F0b9736Ab6249B80247644589a0F281C";
  
  try {
    const Factory = await ethers.getContractAt("AgentNFTFactory", FACTORY_ADDRESS);
    
    const gasEstimate = await Factory.createAgent.estimateGas(
      "Test Agent",
      "Test Description", 
      "General",
      "gpt-4",
      "test-hash",
      ["AI", "Chat"],
      ethers.parseEther("0.1"),
      { 
        value: ethers.parseEther("0.0001"),
        from: await signer.getAddress()
      }
    );
    
    console.log("\n✅ Gas Estimation for createAgent:");
    console.log("- Estimated Gas:", gasEstimate.toString());
    
    const gasCostWei = gasEstimate * (feeData.gasPrice || BigInt(0));
    console.log("- Estimated Cost:", ethers.formatEther(gasCostWei), "MATIC");
    console.log("- In USD (approx):", "$" + (parseFloat(ethers.formatEther(gasCostWei)) * 0.7).toFixed(4));
    
  } catch (err) {
    console.log("\n⚠️ Gas estimation failed:", err.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

