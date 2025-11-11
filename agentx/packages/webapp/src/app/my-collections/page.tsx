"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit3, 
  Save, 
  X, 
  Eye, 
  Trash2, 
  Plus,
  Wallet,
  Calendar,
  Hash,
  ExternalLink,
  ShoppingCart,
  Info
} from "lucide-react";
import { getCreatedAgents, saveCreatedAgent, type CreatedAgent } from "@/lib/createdAgents";
import { useReadContract } from "wagmi";
import { INFT_ADDRESS, INFT_ABI } from "@/lib/contracts";
import { getAllUnifiedAgents } from "@/lib/unifiedAgents";
import { Navbar } from "@/components/Navbar";

export default function MyCollectionsPage() {
  const { address, isConnected } = useAccount();
  const [myAgents, setMyAgents] = useState<CreatedAgent[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<CreatedAgent[]>([]);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreatedAgent>>({});
  const [mounted, setMounted] = useState(false);

  // Blockchain'den NFT balance kontrolü
  const { data: nftBalance } = useReadContract({
    address: INFT_ADDRESS as `0x${string}`,
    abi: INFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    setMounted(true);
    loadMyAgents();
  }, [address]);

  // NFT balance değiştiğinde blockchain'den owned NFT'leri yükle
  useEffect(() => {
    if (address && nftBalance) {
      loadBlockchainNFTs();
    }
  }, [address, nftBalance]);

  // 🎯 UNIFIED AGENT LOADING - My Collections
  const loadMyAgents = async () => {
    if (!address) {
      console.log('⚠️ No wallet address connected');
      return;
    }
    
    console.log('🔍 Loading agents for creator:', address);
    
    // 🚀 ÖNCELİK 1: Unified System'den created agents'ları yükle
    try {
      const unifiedResult = await getAllUnifiedAgents({ creator: address });
      console.log('📊 Unified agents API response:', unifiedResult);
      
      if (unifiedResult.success && unifiedResult.agents) {
        const createdAgents = unifiedResult.agents.map(agent => ({
          id: agent.id,
          tokenId: agent.tokenId,
          name: agent.name,
          description: agent.description,
          image: agent.image,
          category: agent.category,
          creator: agent.creator,
          price: agent.price,
          txHash: agent.txHash,
          storageUri: agent.storageUri,
          listingId: agent.listingId,
          social: agent.social || {},
          createdAt: agent.createdAt
        }));
        setMyAgents(createdAgents);
        console.log(`✅ Loaded ${createdAgents.length} created agents from unified system`);
        console.log('📋 Agent details:', createdAgents);
        return;
      } else {
        console.warn('⚠️ Unified system returned no agents or failed:', unifiedResult.error);
      }
    } catch (error) {
      console.error('❌ Failed to load from unified system:', error);
    }
    
    // 🔄 FALLBACK: localStorage'dan yükle (backward compatibility)
    console.log('🔄 Falling back to localStorage for created agents...');
    const allCreated = getCreatedAgents();
    const userAgents = allCreated.filter(agent => 
      agent.creator.toLowerCase() === address.toLowerCase()
    );
    setMyAgents(userAgents);
    console.log(`📱 Loaded ${userAgents.length} created agents from localStorage (fallback)`);
  };

  // 🎯 UNIFIED PURCHASED AGENT LOADING
  const loadBlockchainNFTs = async () => {
    if (!address || !nftBalance || Number(nftBalance) === 0) {
      setOwnedNFTs([]);
      return;
    }

    console.log(`🔍 User owns ${nftBalance} NFTs, loading purchased agents...`);
    
    try {
      // 🚀 ÖNCELİK 1: Unified System'den purchased agents'ları yükle
      // currentOwner field'ı kullanarak satın alınan agent'ları bul
      const unifiedResult = await getAllUnifiedAgents({ owner: address });
      if (unifiedResult.success && unifiedResult.agents) {
        const purchasedAgents = unifiedResult.agents
          .filter(agent => 
            agent.currentOwner.toLowerCase() === address.toLowerCase() && 
            agent.creator.toLowerCase() !== address.toLowerCase() // Kendi oluşturduğu değil
          )
          .map(agent => ({
            id: agent.id,
            tokenId: agent.tokenId,
            name: agent.name,
            description: agent.description,
            image: agent.image,
            category: agent.category,
            creator: agent.creator,
            price: agent.price,
            txHash: agent.txHash,
            storageUri: agent.storageUri,
            listingId: agent.listingId,
            social: agent.social || {},
            createdAt: agent.createdAt,
            isPurchased: true
          }));
        
        setOwnedNFTs(purchasedAgents);
        console.log(`🎯 Loaded ${purchasedAgents.length} purchased agents from unified system`);
        return;
      }
    } catch (error) {
      console.error('❌ Failed to load purchased agents from unified system:', error);
    }
    
    // 🔄 FALLBACK: Blockchain'den ownership kontrolü (legacy)
    console.log('🔄 Falling back to blockchain ownership check...');
    try {
      const ownedNFTs: CreatedAgent[] = [];
      const balance = Number(nftBalance);
      
      // Basit approach: Check first 50 token IDs for ownership
      for (let tokenId = 1; tokenId <= Math.min(balance + 50, 100); tokenId++) {
        try {
          const ownerResponse = await fetch('/api/blockchain/check-owner', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contractAddress: INFT_ADDRESS,
              tokenId: tokenId.toString(),
              userAddress: address
            })
          });
          
          if (ownerResponse.ok) {
            const { isOwner, tokenURI } = await ownerResponse.json();
            
            if (isOwner) {
              const ownedNFT: CreatedAgent = {
                id: `owned-${tokenId}`,
                tokenId: tokenId.toString(),
                name: `Purchased Agent #${tokenId}`,
                description: "AI Agent purchased from marketplace",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
                category: "Purchased",
                creator: "Unknown",
                price: "N/A",
                txHash: "",
                storageUri: tokenURI || "",
                listingId: 0,
                social: {},
                createdAt: new Date().toISOString(),
                isPurchased: true
              };
              ownedNFTs.push(ownedNFT);
            }
          }
        } catch (tokenError) {
          continue;
        }
      }
      
      console.log(`📱 Found ${ownedNFTs.length} owned NFTs via blockchain check (fallback)`);
      setOwnedNFTs(ownedNFTs);
      
    } catch (error) {
      console.error("❌ Error loading blockchain NFTs:", error);
      setOwnedNFTs([]);
    }
  };

  const startEditing = (agent: CreatedAgent) => {
    setEditingAgent(agent.id);
    setEditForm({
      name: agent.name,
      description: agent.description,
      price: agent.price,
      category: agent.category,
      image: agent.image
    });
  };

  const cancelEditing = () => {
    setEditingAgent(null);
    setEditForm({});
  };

  const saveChanges = (agentId: string) => {
    const agent = myAgents.find(a => a.id === agentId);
    if (!agent) return;

    const updatedAgent: CreatedAgent = {
      ...agent,
      ...editForm,
      // Keep original creation data
      id: agent.id,
      tokenId: agent.tokenId,
      creator: agent.creator,
      txHash: agent.txHash,
      storageUri: agent.storageUri,
      createdAt: agent.createdAt
    };

    // Save to storage
    saveCreatedAgent(updatedAgent);
    
    // Update local state
    setMyAgents(prev => prev.map(a => a.id === agentId ? updatedAgent : a));
    
    // Exit edit mode
    setEditingAgent(null);
    setEditForm({});
    
    console.log("✅ Agent updated successfully:", updatedAgent.name);
  };

  const deleteAgent = (agentId: string) => {
    if (!confirm("Are you sure you want to delete this INFT? This action cannot be undone.")) {
      return;
    }

    // Remove from local storage
    const allAgents = getCreatedAgents();
    const filteredAgents = allAgents.filter(a => a.id !== agentId);
    localStorage.setItem('agentx_created_agents', JSON.stringify(filteredAgents));
    
    // Update local state
    setMyAgents(prev => prev.filter(a => a.id !== agentId));
    
    console.log("🗑️ Agent deleted successfully");
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <Navbar />
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="gradient-card rounded-3xl p-12">
              <Wallet className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-gray-300 mb-8">
                Please connect your wallet to view and manage your Intelligent NFT collections.
              </p>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar />
      <div className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">My Collections</h1>
            <p className="text-gray-300">
              Manage your Intelligent NFTs (INFTs) created on the 0G Network
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                {myAgents.length} Created
              </Badge>
              {ownedNFTs.length > 0 && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                  {ownedNFTs.length} Purchased
                </Badge>
              )}
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                {myAgents.length + ownedNFTs.length} Total
              </Badge>
            </div>
            <Button 
              className="gradient-0g cursor-pointer"
              onClick={() => window.location.href = '/create'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New INFT
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card className="gradient-card border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connected Wallet</p>
                  <p className="font-mono text-purple-300">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-400">Network</p>
                <p className="text-green-400">0G Galileo Testnet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections Grid */}
        {myAgents.length === 0 && ownedNFTs.length === 0 ? (
          <div className="space-y-6">
            {/* Debug Info Card */}
            <Card className="gradient-card border-yellow-400/30 bg-yellow-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                      🔍 NFT'ler Görünmüyor mu?
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <p>Eğer agent oluşturduysanız ama burada görünmüyorsa:</p>
                      <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Browser console'u açın (F12) ve hata mesajlarını kontrol edin</li>
                        <li>Supabase bağlantısının çalışıp çalışmadığını test edin: 
                          <a 
                            href="/api/supabase/test" 
                            target="_blank"
                            className="text-blue-400 hover:text-blue-300 ml-2 underline"
                          >
                            Supabase Test
                          </a>
                        </li>
                        <li>Environment variables (.env.local) dosyanızda Supabase anahtarlarının olduğundan emin olun</li>
                        <li>Sayfa yenilenince NFT'ler kayboluyorsa, Supabase bağlantısı eksiktir</li>
                      </ul>
                      <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400 mb-2">Gerekli environment variables:</p>
                        <code className="text-xs text-green-300 block">
                          NEXT_PUBLIC_SUPABASE_URL={process.env.NEXT_PUBLIC_SUPABASE_URL}<br/>
                          NEXT_PUBLIC_SUPABASE_ANON_KEY={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Plus className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No INFTs Created Yet</h3>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  Start building your Intelligent NFT collection on the 0G Network. 
                  Create your first INFT today!
                </p>
                <Button 
                  className="gradient-0g px-8 py-3 cursor-pointer"
                  onClick={() => window.location.href = '/create'}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First INFT
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Created Agents Section */}
            {myAgents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-purple-400" />
                  Created INFTs ({myAgents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAgents.map((agent) => (
              <Card key={agent.id} className="gradient-card border-white/10 group hover:glow-purple transition-all duration-300">
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img 
                      src={agent.image} 
                      alt={agent.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {editingAgent === agent.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <Textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-white/5 border-white/10 text-white"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Price (0G)</label>
                          <Input
                            type="number"
                            step="0.001"
                            value={editForm.price || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                          <Input
                            value={editForm.category || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="gradient-0g flex-1 cursor-pointer"
                          onClick={() => saveChanges(agent.id)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-gray-600 text-gray-300 cursor-pointer"
                          onClick={cancelEditing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{agent.name}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2">{agent.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Price</p>
                          <p className="font-semibold text-purple-300">{agent.price} 0G</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                          {agent.category}
                        </Badge>
                      </div>
                      
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <Calendar className="w-3 h-3" />
                          Created: {new Date(agent.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{agent.txHash.slice(0, 10)}...{agent.txHash.slice(-8)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-purple-400/50 text-purple-300 hover:bg-purple-400/10 cursor-pointer"
                            onClick={() => window.location.href = `/agent/${agent.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="gradient-0g flex-1 cursor-pointer"
                            onClick={() => startEditing(agent)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-400/50 text-red-300 hover:bg-red-400/10 cursor-pointer"
                            onClick={() => deleteAgent(agent.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Purchased NFTs Section */}
            {ownedNFTs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                  Purchased INFTs ({ownedNFTs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedNFTs.map((agent) => (
                    <Card key={agent.id} className="gradient-card border-white/10 group hover:glow-green transition-all duration-300">
                      <CardHeader className="p-0">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                          <img 
                            src={agent.image} 
                            alt={agent.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                              Purchased
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                              {agent.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="bg-gray-700/50 text-gray-300">
                                {agent.category}
                              </Badge>
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                                Token #{agent.tokenId}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Purchased
                              </div>
                              <div className="flex items-center gap-1">
                                <Hash className="w-4 h-4" />
                                #{agent.tokenId}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                            onClick={() => window.location.href = `/agent/${agent.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-400/50 text-blue-300 hover:bg-blue-400/10 cursor-pointer"
                            onClick={() => window.open(`https://chainscan-galileo.0g.ai/token/${INFT_ADDRESS}?a=${agent.tokenId}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
