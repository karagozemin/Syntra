"use client";
import { AgentCard } from "@/components/AgentCard";
import { AgentWideCard } from "@/components/AgentWideCard";
import { getAllUnifiedAgents } from "@/lib/unifiedAgents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Zap, Users, Rocket, Shield, Database, Code2, ArrowRight, CheckCircle2, Eye, ShoppingCart } from "lucide-react";
import DarkVeil from "@/components/ui/DarkVeil";
import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { INFT_ADDRESS, INFT_ABI, FACTORY_ADDRESS, FACTORY_ABI, AGENT_NFT_ABI } from "@/lib/contracts";

// Helper function to get agent details from individual contract
async function getAgentDetails(agentAddress: string) {
  try {
    const calls = [
      { data: '0x06fdde03', name: 'name' }, // name()
      { data: '0x7284e416', name: 'description' }, // agentDescription()  
      { data: '0x2d06177a', name: 'category' }, // agentCategory()
      { data: '0xa035b1fe', name: 'price' }, // price()
      { data: '0x02d05d3f', name: 'creator' }, // creator()
    ];
    
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology/';
    const results = await Promise.all(calls.map(async (call) => {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: agentAddress, data: call.data }, 'latest'],
          id: 1
        })
      });
      const result = await response.json();
      return { name: call.name, result: result.result };
    }));
    
    // Parse results
    const details: any = {};
    results.forEach(({ name, result }) => {
      if (result && result !== '0x') {
        if (name === 'price') {
          details[name] = (parseInt(result, 16) / 1e18).toString(); // Convert wei to ETH
        } else if (name === 'creator') {
          details[name] = '0x' + result.slice(-40); // Extract address
        } else {
          // Decode string (skip first 64 chars for offset, then length, then data)
          try {
            const hex = result.slice(130); // Skip 0x + offset + length
            details[name] = Buffer.from(hex, 'hex').toString('utf8').replace(/\0/g, '');
          } catch {
            details[name] = '';
          }
        }
      }
    });
    
    return details;
  } catch (error) {
    console.error(`Failed to get details for agent ${agentAddress}:`, error);
    return null;
  }
}

export default function HomePage() {
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [blockchainAgents, setBlockchainAgents] = useState<any[]>([]);

  // Get total agents from Factory contract
  const { data: totalAgents } = useReadContract({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'getTotalAgents',
  });

  // 🎯 UNIFIED AGENT LOADING - Tek merkezi sistem
  useEffect(() => {
    async function loadAllAgents() {
      console.log('Loading INFTs from unified system...');
      const agents: any[] = [];
      
      // 🚀 ÖNCELİK 1: Unified System'den yükle
      try {
        const unifiedResult = await getAllUnifiedAgents({ active: true });
        if (unifiedResult.success && unifiedResult.agents) {
          const unifiedAgents = unifiedResult.agents.map(agent => {
            console.log('DEBUG: INFT from unified system:', {
              name: agent.name,
              listingId: agent.listingId,
              listingIdType: typeof agent.listingId,
              price: agent.price,
              priceType: typeof agent.price
            });
            return {
              id: agent.id,
              name: agent.name,
              description: agent.description,
              image: agent.image,
              category: agent.category,
              owner: `${agent.creator?.slice(0, 6)}...${agent.creator?.slice(-4)}`,
              priceEth: parseFloat(agent.price || "0"),
              listingId: agent.listingId, // ✅ Gerçek marketplace listing ID
              tokenId: agent.tokenId,
              agentContractAddress: agent.agentContractAddress,
              creator: agent.creator,
              trending: agent.trending,
              likes: agent.likes || 0,
              views: agent.views || 0,
              history: [
                {
                  activity: "Created on Polygon",
                  date: agent.createdAt,
                  priceEth: parseFloat(agent.price || "0")
                }
              ]
            };
          });
          agents.push(...unifiedAgents);
          console.log(`Loaded ${unifiedAgents.length} INFTs from unified system`);
        }
      } catch (error) {
        console.error('❌ Failed to load from unified system:', error);
      }
      
      // ✅ Sadece unified system kullan
      if (agents.length === 0) {
        console.log('No INFTs found in unified system');
      }
      
      // 2. ✅ LOCAL AGENTS DEVRE DIŞI - Sadece server/unified system kullan
      // Local agents artık gösterilmiyor, duplicate önlemek için
      console.log('Local INFTs disabled - only showing unified system INFTs');
      
      // 3. REMOVED: Factory contract loading - agents already loaded from unified system
      // This was causing duplicate/mock agents with "0x0x" addresses
      
      setBlockchainAgents(agents);
      console.log(`✅ Total loaded: ${agents.length} unique agents`);
    }
    
    if (mounted) {
      loadAllAgents();
    }
  }, [totalAgents, mounted]);

  // Combine all agents - Sort by creation date (newest first)
  useEffect(() => {
    setMounted(true);
    
    // Sort agents by createdAt (newest first)
    const sortedAgents = [...blockchainAgents].sort((a, b) => {
      const dateA = a.createdAt || a.history?.[0]?.date || '';
      const dateB = b.createdAt || b.history?.[0]?.date || '';
      // If no dates, keep original order (assume last added = newest)
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // a has no date, put it last
      if (!dateB) return -1; // b has no date, put it last
      // Compare dates (newest first)
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    setAllAgents(sortedAgents);
    console.log(`🌐 Sorted ${sortedAgents.length} agents (newest first)`);
  }, [blockchainAgents]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="space-y-12">
      {/* Hero Section with DarkVeil Background */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/20 h-[650px]">
        {/* DarkVeil Animated Background */}
        <div className="absolute inset-0">
          <DarkVeil 
            speed={2.5}
            hueShift={0}
            noiseIntensity={0.03}
            warpAmount={0.3}
          />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center p-16">
          {/* MAINNET LIVE Badge */}
          <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-400/50 px-6 py-2 text-sm font-semibold animate-pulse">
            <Rocket className="w-4 h-4 mr-2 inline" />
            💎 LIVE ON POLYGON
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-gradient">First Intelligent NFT</span>
            <br />
            <span className="text-white drop-shadow-lg">Marketplace</span>
          </h1>
          
          <p className="text-lg text-purple-300 mb-4 font-semibold drop-shadow-md">
            Built on Polygon Network • Lightning Fast • Ultra Low Fees
          </p>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Create, trade, and own AI-powered Intelligent NFTs (INFTs). 
            Powered by Polygon's revolutionary decentralized infrastructure.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button 
              size="lg" 
              className="gradient-0g hover:opacity-90 text-white font-semibold px-8 py-3 cursor-pointer shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                document.getElementById('trending-section')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start' 
                });
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              Explore INFTs
            </Button>
            <Button size="lg" className="bg-black/80 text-white border border-purple-400/50 hover:bg-black/90 hover:border-purple-400/70 px-8 py-3 cursor-pointer backdrop-blur-sm shadow-lg hover:shadow-xl transition-all" asChild>
              <a href="/create">
                <Star className="w-5 h-5 mr-2" />
                Create INFT
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "INFTs Created", value: totalAgents ? totalAgents.toString() : "...", icon: Users, color: "text-purple-400" },
          { label: "Network", value: "Polygon Amoy", icon: Rocket, color: "text-green-400" },
          { label: "Active Listings", value: allAgents.length.toString(), icon: TrendingUp, color: "text-blue-400" },
          { label: "Creation Fee", value: "0.01 POL", icon: Zap, color: "text-yellow-400" }
        ].map((stat, index) => (
          <div key={index} className="gradient-card rounded-2xl p-6 text-center group hover:glow-purple transition-all duration-300">
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Why Syntra Section */}
      <section className="gradient-card rounded-3xl p-12 border border-purple-500/20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Syntra?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The first and only Intelligent NFT marketplace on Polygon Network
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Rocket,
              title: "Polygon Powered",
              description: "Lightning-fast transactions with minimal fees on Polygon Network",
              color: "text-green-400"
            },
            {
              icon: Database,
              title: "Decentralized Storage",
              description: "INFT metadata stored permanently on IPFS network",
              color: "text-blue-400"
            },
            {
              icon: Shield,
              title: "True Ownership",
              description: "Your INFTs, your data, secured on-chain forever",
              color: "text-purple-400"
            },
            {
              icon: Code2,
              title: "AI-Powered NFTs",
              description: "Not just art - functional AI agents inside each INFT",
              color: "text-pink-400"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-black/40 rounded-xl p-6 border border-white/5 hover:border-purple-500/30 transition-all group">
              <feature.icon className={`w-10 h-10 mb-4 ${feature.color} group-hover:scale-110 transition-transform`} />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section - Show only latest 3 INFTs */}
      <section id="featured-section" className="space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Featured INFTs</h2>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
              Latest
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show latest 3 real NFTs */}
          {allAgents.length > 0 ? (
            allAgents.slice(0, 3).map((agent) => {
              console.log('🔍 Featured agent:', { id: agent.id, name: agent.name });
              return (
                <AgentCard key={agent.id} {...agent} />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No featured INFTs yet</p>
                <p className="text-sm">Create your first INFT to see it featured here!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending Section - Show all INFTs + Mock SOLD OUT NFTs */}
      <section id="trending-section" className="space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
              24h
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Price: Low to High
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Recently Listed
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Mock Cyberpunk NFTs - SOLD OUT */}
          {[
            {
              name: "Cyber Sentinel",
              image: "https://dl2.myminifactory.com/object-assets/666ff451f3d4b7.42447182/images/720X720-adacolored.jpg",
              price: "2.5"
            },
            {
              name: "Math in Mind",
              image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop",
              price: "3.8"
            },
            {
              name: "Digital Ghost",
              image: "https://www.shutterstock.com/image-photo/ghost-600nw-2458935755.jpg",
              price: "1.9"
            },
            {
              name: "Neural Nexus",
              image: "https://source.boomplaymusic.com/group10/M00/09/04/67e682456a304aef9eff33d4379b00ebH3000W3000_320_320.jpg",
              price: "5.5"
            },
            {
              name: "Void Walker",
              image: "https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2023/03/2022_twq_void_subclass_large10.jpg?q=50&fit=crop&w=825&dpr=1.5",
              price: "3.2"
            },
            {
              name: "Blockchain",
              image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop",
              price: "4.8"
            },
            {
              name: "Digital Samurai",
              image: "https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/9-samurai-danilov-ilya.jpg",
              price: "6.1"
            },
            {
              name: "Neon Ninja",
              image: "https://img.freepik.com/premium-psd/pulsating-strobe-lights-stealthy-ninja-holding-shurik-png-creative-neon-line-art-designs_1020495-722159.jpg?semt=ais_hybrid&w=740&q=80",
              price: "3.5"
            }
          ].map((mockNft, i) => (
            <div key={`mock-${i}`} className="gradient-card rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group opacity-80">
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={mockNft.image} 
                  alt={mockNft.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale-[30%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-red-500 text-white border-0 font-bold shadow-lg">
                    SOLD OUT
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-2">{mockNft.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 font-semibold">{mockNft.price} POL</span>
                    <Button 
                      size="sm" 
                      disabled
                      className="bg-gray-700 text-gray-500 cursor-not-allowed hover:bg-gray-700"
                    >
                      Sold Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* ✅ Show ALL real INFTs (already sorted newest first) */}
          {allAgents.length > 0 && (
            allAgents.map((agent) => (
              <AgentCard key={agent.id} {...agent} />
            ))
          )}
          
          {/* Empty state - only show if no real NFTs */}
          {allAgents.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">No INFTs listed yet</p>
                <p className="text-sm">Be the first to create an Intelligent NFT on Syntra!</p>
              </div>
              <Button className="mt-6 gradient-0g" asChild>
                <a href="/create">
                  <Star className="w-4 h-4 mr-2" />
                  Create First INFT
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl p-12 border border-purple-500/20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Three simple steps to create and monetize your Intelligent NFTs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              title: "Create Your INFT",
              description: "Design and configure your Intelligent NFT with AI capabilities and pricing",
              icon: Star
            },
            {
              step: "2",
              title: "List on Marketplace",
              description: "Automatically listed after creation with your chosen price and details",
              icon: TrendingUp
            },
            {
              step: "3",
              title: "Earn from Sales",
              description: "Receive payments instantly when collectors buy your INFTs",
              icon: Zap
            }
          ].map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-black/40 rounded-xl p-8 border border-white/10 hover:border-purple-500/30 transition-all text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-2xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
              {index < 2 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 w-8 h-8 text-purple-400/50" />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="gradient-0g hover:opacity-90 text-white font-semibold px-10 py-4" asChild>
            <a href="/create">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}


