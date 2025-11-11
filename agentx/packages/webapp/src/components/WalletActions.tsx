"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { INFT_ADDRESS, INFT_ABI, MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/lib/contracts";
import { uploadAgentMetadata } from "@/lib/storage";
import type { AgentMetadata } from "@/lib/storage";
import { ProgressModal } from "./ui/progress-modal";
import { Button } from "./ui/button";

export function MintINFT() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  // Progress Modal States
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  
  const mintSteps = [
    {
      id: 'metadata',
      title: 'Preparing Your Asset',
      description: 'Creating metadata and uploading to IPFS',
      status: 'pending' as const
    },
    {
      id: 'blockchain',
      title: 'Blockchain Verification',
      description: 'Confirming transaction on Polygon Network',
      status: 'pending' as const
    },
    {
      id: 'mint',
      title: 'NFT Minting',
      description: 'Minting your INFT on the blockchain',
      status: 'pending' as const
    }
  ];
  
  const [steps, setSteps] = useState(mintSteps);
  
  const updateModalProgress = (stepId: string, status: 'in_progress' | 'completed' | 'error') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
    
    if (status === 'in_progress') {
      const stepIndex = mintSteps.findIndex(s => s.id === stepId);
      setCurrentStepIndex(stepIndex);
      setProgressPercentage((stepIndex / mintSteps.length) * 100);
    } else if (status === 'completed') {
      const stepIndex = mintSteps.findIndex(s => s.id === stepId);
      setProgressPercentage(((stepIndex + 1) / mintSteps.length) * 100);
    }
  };

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const handleMint = async () => {
    if (!address || !INFT_ADDRESS) return;
    
    setIsLoading(true);
    setShowProgressModal(true);
    setIsProcessComplete(false);
    setSteps(mintSteps);
    setCurrentStepIndex(0);
    setProgressPercentage(0);
    
    try {
      updateModalProgress('metadata', 'in_progress');
      // 1. Create sample agent metadata
      const metadata: AgentMetadata = {
        name: `AI Agent #${Date.now()}`,
        description: "A powerful AI agent created on Polygon Network",
        category: "utility",
        creator: address,
        price: "0.01",
        capabilities: ["chat", "analysis", "automation"],
        skills: ["polygon-integration", "smart-contracts"],
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      console.log("🔥 Step 1: Uploading metadata to IPFS...");
      
      // 2. Upload to IPFS
      const storageResult = await uploadAgentMetadata(metadata);
      
      if (!storageResult.success) {
        throw new Error(`Storage upload failed: ${storageResult.error}`);
      }

      console.log("✅ Step 2: Metadata uploaded successfully!");
      console.log("📦 Storage URI:", storageResult.uri);
      
      updateModalProgress('metadata', 'completed');
      updateModalProgress('blockchain', 'in_progress');

      // 3. Mint INFT with storage URI
      console.log("🔗 Step 3: Minting INFT on Polygon...");
      updateModalProgress('blockchain', 'completed');
      updateModalProgress('mint', 'in_progress');
      
      const hash = await writeContractAsync({
        address: INFT_ADDRESS as `0x${string}`,
        abi: INFT_ABI,
        functionName: "mint",
        args: [storageResult.uri!],
        value: parseEther("0.005"), // 0.005 POL creation fee
      });

      setTxHash(hash);
      updateModalProgress('mint', 'completed');
      setProgressPercentage(100);
      
      setTimeout(() => {
        setIsProcessComplete(true);
      }, 1000);
      
      console.log("⛓️ Transaction submitted:", hash);
      
    } catch (error) {
      console.error("❌ Mint failed:", error);
      
      // Update current step to error
      const currentStep = steps.find(s => s.status === 'in_progress');
      if (currentStep) {
        updateModalProgress(currentStep.id, 'error');
      }
      
      alert(`Mint failed: ${error instanceof Error ? error.message : error}`);
      setTimeout(() => setShowProgressModal(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => !isLoading && setShowProgressModal(false)}
        title={isProcessComplete ? "Minting Successful!" : "Minting in Progress"}
        steps={steps}
        currentStepIndex={currentStepIndex}
        progress={progressPercentage}
        assetPreview={{
          name: `AI Agent #${Date.now()}`,
          image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
          description: "A powerful AI agent created on 0G Network"
        }}
        showKeepOpen={!isProcessComplete}
        isSuccess={isProcessComplete}
        successData={isProcessComplete ? {
          title: "Minting Successful!",
          subtitle: "Your INFT was minted successfully.",
          actionButtons: (
            <Button 
              onClick={() => setShowProgressModal(false)}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Done
            </Button>
          )
        } : undefined}
      />
      
      <div className="space-y-4 p-6 border rounded-lg gradient-card">
        <h3 className="text-lg font-semibold text-gradient">🎯 Mint INFT</h3>
        <p className="text-sm text-gray-400">Create a new AI Agent NFT with IPFS metadata</p>
      
      <button
        onClick={handleMint}
        disabled={isLoading || !address || !INFT_ADDRESS}
        className="w-full px-4 py-3 rounded-md gradient-0g text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? "🔄 Minting..." : "🚀 Mint INFT"}
      </button>

      {txHash && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Transaction:</span>
            <span className="font-mono text-purple-300">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
          </div>
          {receipt && (
            <div className="flex justify-between text-green-400">
              <span>Status:</span>
              <span>✅ Confirmed</span>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}

export function ListNFT() {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const handleList = async () => {
    if (!address || !INFT_ADDRESS || !MARKETPLACE_ADDRESS || !tokenId || !price) return;
    
    setIsLoading(true);
    try {
      console.log("🏪 Step 1: Approving marketplace...");
      
      // 1. Approve marketplace to transfer NFT
      const approveHash = await writeContractAsync({
        address: INFT_ADDRESS as `0x${string}`,
        abi: INFT_ABI,
        functionName: "approve",
        args: [MARKETPLACE_ADDRESS as `0x${string}`, BigInt(tokenId)],
      });

      console.log("✅ Approval transaction:", approveHash);
      console.log("🏪 Step 2: Listing on marketplace...");

      // 2. List on marketplace (no listing fee)
      const listHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "list",
        args: [
          INFT_ADDRESS as `0x${string}`,
          BigInt(tokenId),
          parseEther(price)
        ],
      });

      setTxHash(listHash);
      console.log("⛓️ Listed successfully:", listHash);
      
    } catch (error) {
      console.error("❌ List failed:", error);
      alert(`List failed: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg gradient-card">
      <h3 className="text-lg font-semibold text-gradient">🏪 List NFT</h3>
      <p className="text-sm text-gray-400">List your INFT on the Syntra marketplace</p>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Token ID</label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price (POL)</label>
          <input
            type="number"
            step="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.1"
            className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <button
        onClick={handleList}
        disabled={isLoading || !address || !tokenId || !price}
        className="w-full px-4 py-3 rounded-md gradient-0g text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? "🔄 Listing..." : "📋 List NFT"}
      </button>

      {txHash && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Transaction:</span>
            <span className="font-mono text-purple-300">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
          </div>
          {receipt && (
            <div className="flex justify-between text-green-400">
              <span>Status:</span>
              <span>✅ Confirmed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BuyNFT() {
  const [listingId, setListingId] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const handleBuy = async () => {
    if (!address || !MARKETPLACE_ADDRESS || !listingId || !price) return;
    
    setIsLoading(true);
    try {
      console.log("💰 Purchasing NFT from marketplace...");
      
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "buy",
        args: [BigInt(listingId)],
        value: parseEther(price),
        gas: BigInt(300000), // Gas limit for buy operation
      });

      setTxHash(hash);
      console.log("✅ Purchase successful:", hash);
      
    } catch (error) {
      console.error("❌ Purchase failed:", error);
      alert(`Purchase failed: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg gradient-card">
      <h3 className="text-lg font-semibold text-gradient">💰 Buy NFT</h3>
      <p className="text-sm text-gray-400">Purchase an INFT from the marketplace</p>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Listing ID</label>
          <input
            type="number"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-gray-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price (POL)</label>
          <input
            type="number"
            step="0.001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.1"
            className="w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 text-white placeholder-gray-500"
          />
        </div>
      </div>

      <button
        onClick={handleBuy}
        disabled={isLoading || !address || !listingId || !price}
        className="w-full px-4 py-3 rounded-md gradient-0g text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isLoading ? "🔄 Buying..." : "🛒 Buy NFT"}
      </button>

      {txHash && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Transaction:</span>
            <span className="font-mono text-purple-300">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
          </div>
          {receipt && (
            <div className="flex justify-between text-green-400">
              <span>Status:</span>
              <span>✅ Confirmed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WalletStatus() {
  const { address, isConnected } = useAccount();

  const balance = useReadContract({
    address: INFT_ADDRESS as `0x${string}`,
    abi: INFT_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  if (!isConnected) {
    return (
      <div className="p-6 border rounded-lg gradient-card text-center">
        <h3 className="text-lg font-semibold text-gradient mb-2">👛 Wallet Status</h3>
        <p className="text-gray-400">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg gradient-card">
      <h3 className="text-lg font-semibold text-gradient mb-4">👛 Wallet Status</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Address:</span>
          <span className="font-mono text-purple-300">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Network:</span>
          <span className="text-green-400">Polygon Amoy Testnet</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">INFTs Owned:</span>
          <span className="font-semibold">
            {balance.data ? balance.data.toString() : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}
