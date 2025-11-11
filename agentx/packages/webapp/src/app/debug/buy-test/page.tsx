"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '@/lib/contracts';
import { validateListingExists } from '@/lib/realMarketplace';

export default function BuyTestPage() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  const [listingId, setListingId] = useState('');
  const [price, setPrice] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidate = async () => {
    if (!listingId) return;
    
    setIsValidating(true);
    try {
      const result = await validateListingExists(parseInt(listingId));
      setValidationResult(result);
      
      if (result.exists && result.price) {
        setPrice(result.price);
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleBuyTest = async () => {
    if (!isConnected || !listingId || !price) {
      alert("Please connect wallet and fill all fields");
      return;
    }

    setIsBuying(true);
    try {
      console.log("🛒 Testing buy transaction...");
      console.log("Parameters:", { listingId, price, marketplace: MARKETPLACE_ADDRESS });

      await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "buy",
        args: [BigInt(listingId)],
        value: parseEther(price),
        gas: BigInt(600000),
      });

      console.log("✅ Buy transaction submitted");
      alert("✅ Buy transaction submitted successfully!");

    } catch (error: any) {
      console.error("❌ Buy test failed:", error);
      
      let errorMsg = "Buy test failed: ";
      if (error?.message?.includes("NOT_ACTIVE")) {
        errorMsg += "Listing is not active";
      } else if (error?.message?.includes("BAD_PRICE")) {
        errorMsg += "Price mismatch";
      } else if (error?.message?.includes("execution reverted")) {
        errorMsg += "Transaction reverted (listing may not exist)";
      } else {
        errorMsg += error.message || "Unknown error";
      }
      
      alert(errorMsg);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Buy Function Test</h1>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Buy Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="p-4 rounded-lg bg-gray-700">
              <p className="text-white">
                Wallet: {isConnected ? `✅ Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` : '❌ Not connected'}
              </p>
              <p className="text-white">
                Marketplace: {MARKETPLACE_ADDRESS}
              </p>
            </div>

            {/* Test Parameters */}
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm block mb-2">Listing ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter listing ID to test"
                    value={listingId}
                    onChange={(e) => setListingId(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button 
                    onClick={handleValidate} 
                    disabled={isValidating || !listingId}
                    variant="outline"
                  >
                    {isValidating ? 'Checking...' : 'Validate'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-white text-sm block mb-2">Price (POL)</label>
                <Input
                  placeholder="Enter price in POL"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className="p-4 rounded-lg bg-gray-700">
                <h3 className="text-white font-medium mb-2">Validation Result:</h3>
                <div className="text-sm">
                  <p className={validationResult.exists ? 'text-green-400' : 'text-red-400'}>
                    Exists: {validationResult.exists ? '✅ Yes' : '❌ No'}
                  </p>
                  <p className={validationResult.active ? 'text-green-400' : 'text-red-400'}>
                    Active: {validationResult.active ? '✅ Yes' : '❌ No'}
                  </p>
                  {validationResult.price && (
                    <p className="text-white">Price: {validationResult.price} POL</p>
                  )}
                  {validationResult.seller && (
                    <p className="text-white">Seller: {validationResult.seller}</p>
                  )}
                  {validationResult.error && (
                    <p className="text-red-400">Error: {validationResult.error}</p>
                  )}
                </div>
              </div>
            )}

            {/* Buy Button */}
            <Button
              onClick={handleBuyTest}
              disabled={!isConnected || isBuying || !listingId || !price}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isBuying ? 'Testing Buy...' : 'Test Buy Transaction'}
            </Button>

            {/* Quick Test Buttons */}
            <div className="border-t border-gray-600 pt-4">
              <p className="text-white text-sm mb-2">Quick Tests:</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(id => (
                  <Button
                    key={id}
                    onClick={() => {
                      setListingId(id.toString());
                      setPrice('0.01');
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    ID {id}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>1. Enter a listing ID and validate it first</p>
              <p>2. If validation shows exists=true and active=true, you can test the buy</p>
              <p>3. Make sure you have enough POL tokens in your wallet</p>
              <p>4. Use the quick test buttons to test common listing IDs</p>
              <p>5. Check console for detailed error messages</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
