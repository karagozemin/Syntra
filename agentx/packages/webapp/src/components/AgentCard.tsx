"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Eye, Zap, ShoppingCart, TrendingUp, Star, Activity } from "lucide-react";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/lib/contracts";
import { parseEther } from "viem";
import { deactivateListing } from "@/lib/marketplaceListings";

export function AgentCard({ 
  id, 
  name, 
  owner, 
  image, 
  priceEth, 
  category, 
  listingId,
  tokenId,
  views,
  likes,
  trending
}: {
  id: string; 
  name: string; 
  owner: string; 
  image: string; 
  priceEth: number; 
  category: string;
  listingId?: number;
  tokenId?: string;
  views?: number;
  likes?: number;
  trending?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likes || 0);
  const [isBuying, setIsBuying] = useState(false);
  const { isConnected, address } = useAccount();
  const { writeContract: buyNFT, data: buyHash, error: buyError } = useWriteContract();
  const { isLoading: isBuyLoading, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!listingId || listingId <= 0) {
      console.error("❌ Invalid listingId:", listingId);
      alert("This NFT is not available for purchase (invalid listing ID)");
      return;
    }
    
    if (owner.toLowerCase() === address?.toLowerCase()) {
      alert("You cannot buy your own NFT");
      return;
    }
    
    setIsBuying(true);
    
    try {
      console.log("🛒 Buying NFT from marketplace...");
      console.log("🔍 DEBUG: listingId:", listingId, "type:", typeof listingId);
      console.log("🔍 DEBUG: priceEth:", priceEth, "type:", typeof priceEth);
      console.log("🔍 DEBUG: MARKETPLACE_ADDRESS:", MARKETPLACE_ADDRESS);
      
      // ✅ FIX: priceEth validation
      if (!priceEth || isNaN(priceEth)) {
        console.error("❌ Invalid priceEth:", priceEth);
        alert("Invalid price for this NFT");
        setIsBuying(false);
        return;
      }
      
      // ✅ FIX: Marketplace'de listing var mı kontrol et
      try {
        const listingResponse = await fetch(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: MARKETPLACE_ADDRESS,
              data: '0x3f26479e' + (listingId || 0).toString(16).padStart(64, '0') // listings(uint256)
            }, 'latest'],
            id: 1
          })
        });
        
        const listingResult = await listingResponse.json();
        console.log("🔍 DEBUG: Marketplace listing check:", listingResult);
        
        if (!listingResult.result || listingResult.result === '0x') {
          throw new Error("Listing not found on marketplace");
        }
      } catch (validationError) {
        console.error("❌ Marketplace validation failed:", validationError);
        alert("This listing is not available on the marketplace. Please refresh the page.");
        setIsBuying(false);
        return;
      }
      
      buyNFT({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "buy",
        args: [BigInt(listingId)],
        value: parseEther(priceEth.toString() || "0"),
        gas: BigInt(500000), // Polygon Network için yeterli gas
      });
    } catch (error: any) {
      console.error("Buy failed:", error);
      
      // Gelişmiş error handling
      let errorMessage = "Purchase failed. Please try again.";
      
      if (error?.message?.includes("out of gas") || error?.message?.includes("gas")) {
        errorMessage = "Transaction failed due to insufficient gas. The network may be congested. Please try again.";
      } else if (error?.message?.includes("NOT_ACTIVE")) {
        errorMessage = "This NFT is no longer available for purchase.";
      } else if (error?.message?.includes("BAD_PRICE")) {
        errorMessage = "Price mismatch. The NFT price may have changed.";
      } else if (error?.message?.includes("User rejected") || error?.code === 4001) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error?.message?.includes("network") || error?.message?.includes("timeout")) {
        errorMessage = "Network timeout. Please check your connection and try again.";
      } else if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet.";
      }
      
      alert(errorMessage);
      setIsBuying(false);
    }
  };
  
  // Handle buy success
  if (isBuySuccess && buyHash) {
    // Deactivate listing after successful purchase
    if (listingId) {
      deactivateListing(listingId).then(result => {
        if (result.success) {
          console.log(`✅ Listing ${listingId} deactivated after purchase`);
        } else {
          console.error(`❌ Failed to deactivate listing ${listingId}:`, result.error);
        }
      });
    }

    // 🚀 NEW: Mark agent as sold in database after successful purchase
    fetch('/api/agents', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: id,
        buyerAddress: address
      }),
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log('INFT marked as sold in database');
        // Refresh the page after successful purchase and database update
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('Failed to mark INFT as sold:', result.error);
      }
    })
    .catch(error => {
      console.error('Failed to update INFT status:', error);
      // Don't fail the entire purchase for this
    });

    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group"
      >
        <Card className="overflow-hidden gradient-card border-green-400/30">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Purchase Successful!</h3>
            <p className="text-sm text-gray-400 mb-4">You now own {name}</p>
            <Badge variant="outline" className="border-green-400/50 text-green-300 bg-green-500/10">
              Owned by You
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group cursor-pointer"
        onClick={() => window.location.href = `/agent/${id}`}
      >
        <Card className="overflow-hidden gradient-card hover:glow-purple-lg transition-all duration-500 border-white/10 p-0 relative">
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 overflow-hidden">
            {/* Trending Badge */}
            {trending && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-3 left-3 z-20"
              >
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-none text-xs font-bold shadow-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              </motion.div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            
            {/* Hover Actions */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-9 h-9 p-0 bg-black/60 backdrop-blur-md hover:bg-red-500/70 border border-white/10 cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                  setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
                }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
            </div>

            {/* Stats Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {likesCount}
                  </span>
                </div>
                <Badge variant="outline" className="border-white/30 text-white text-[10px] bg-white/10">
                  {category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5 space-y-4 bg-gradient-to-b from-transparent to-black/20">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white text-lg truncate group-hover:text-purple-300 transition-colors flex-1">
                  {name}
                </h3>
                <Badge variant="outline" className="border-purple-400/60 text-purple-300 bg-purple-500/20 font-semibold text-sm px-2.5 py-0.5 whitespace-nowrap">
                  {priceEth} POL
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate">by {owner}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Activity className="w-3 h-3" />
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {listingId && listingId > 0 && owner.toLowerCase() !== address?.toLowerCase() ? (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-purple-400/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400/70 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/agent/${id}`;
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-[1.5] gradient-0g hover:opacity-90 text-white font-semibold cursor-pointer shadow-lg hover:shadow-purple-500/50 transition-all"
                    onClick={handleBuyNow}
                    disabled={isBuying || isBuyLoading}
                  >
                    {isBuying || isBuyLoading ? (
                      <>
                        <div className="w-4 h-4 mr-1.5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                        Buying...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium opacity-60 cursor-not-allowed"
                  disabled
                >
                  {owner.toLowerCase() === address?.toLowerCase() ? (
                    <>
                      <Star className="w-4 h-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                      You Own This
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-1.5" />
                      Not Available
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


