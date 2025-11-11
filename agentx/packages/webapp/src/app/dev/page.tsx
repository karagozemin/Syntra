"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useChainId, useReadContract, useWriteContract } from "wagmi";
import { AGENT_REGISTRY_ABI, AGENT_REGISTRY_ADDRESS, INFT_ABI, INFT_ADDRESS, MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/lib/contracts";
import type { ChatMessage } from "@/lib/compute";
import { testStorageConnection, uploadAgentMetadata, getStorageInfo } from "@/lib/storage";
import { getComputeNetworkStatus, testComputeConnection } from "@/lib/compute";
import { MintINFT, ListNFT, BuyNFT, WalletStatus } from "@/components/WalletActions";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [metadata, setMetadata] = useState("https://example.com/agents/demo.json");
  const [mintUri, setMintUri] = useState("https://example.com/agents/inft-demo.json");
  const [listTokenId, setListTokenId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [buyListingId, setBuyListingId] = useState("");
  const { writeContractAsync, isPending } = useWriteContract();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  
  // Testing states
  const [storageTest, setStorageTest] = useState<{ success: boolean; message: string; details?: unknown; uploadTest?: { success: boolean; rootHash?: string } } | null>(null);
  const [computeTest, setComputeTest] = useState<{ success: boolean; message: string; details?: { testDuration?: number } } | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ network: string; status: string; rpcUrl: string; indexerUrl: string; hasPrivateKey: boolean; localUploads?: number; storageUploads?: number; } | null>(null);
  const [computeStatus, setComputeStatus] = useState<{ network: string; status: string; activeNodes: number; avgResponseTime: number; modelsAvailable: number; networkUtilization: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Load initial status
    loadInitialStatus();
  }, []);
  
  const loadInitialStatus = async () => {
    try {
      const [storage, compute] = await Promise.all([
        getStorageInfo(),
        getComputeNetworkStatus()
      ]);
      setStorageInfo(storage);
      setComputeStatus(compute);
    } catch (error) {
      console.error('Failed to load initial status:', error);
    }
  };
  
  const testStorage = async () => {
    setTestLoading(true);
    try {
      const result = await testStorageConnection();
      setStorageTest(result);
      
      // Also test a sample metadata upload
      if (result.success) {
        const sampleMetadata = {
          name: "Test Agent",
          description: "A test agent for IPFS Storage integration",
          category: "testing",
          creator: "Syntra Developer",
          price: "0",
          capabilities: ["test", "storage"],
          skills: ["polygon-integration"],
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        
        const uploadResult = await uploadAgentMetadata(sampleMetadata);
        setStorageTest(prev => ({ 
          success: prev?.success || false,
          message: prev?.message || '',
          details: prev?.details,
          uploadTest: uploadResult 
        }));
      }
    } catch (error) {
      setStorageTest({ success: false, message: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setTestLoading(false);
    }
  };
  
  const testCompute = async () => {
    setTestLoading(true);
    try {
      const result = await testComputeConnection();
      setComputeTest(result);
    } catch (error) {
      setComputeTest({ success: false, message: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setTestLoading(false);
    }
  };
  const totalAgents = useReadContract({
    address: (AGENT_REGISTRY_ADDRESS || undefined) as `0x${string}` | undefined,
    abi: AGENT_REGISTRY_ABI,
    functionName: "totalAgents",
    query: { enabled: Boolean(AGENT_REGISTRY_ADDRESS) },
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "agent", content: data.reply || "(no response)" }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: "agent", content: "Error contacting agent." }]);
    }
  };

  const wrongNetwork = mounted && chainId !== 16602;

  return (
    <div className="min-h-screen max-w-6xl mx-auto p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold gradient-0g bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">AgentX Dev Console</h1>
          <p className="text-xs text-gray-500">Polygon Network Integration Testing & Development</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs rounded-full border px-2 py-1 text-gray-600">chain: {mounted && chainId ? chainId : "-"}</span>
          <ConnectButton />
        </div>
      </header>

      {wrongNetwork && (
        <div className="rounded-md border border-yellow-400 bg-yellow-50 text-yellow-700 px-3 py-2 text-sm">
          Please switch to Polygon Amoy Testnet (chainId 80002) from your wallet.
        </div>
      )}
      
      {/* Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="border rounded-lg p-4 space-y-3 shadow-sm gradient-card">
          <h2 className="font-medium text-gradient">🏪 IPFS Storage Status</h2>
          {storageInfo && (
            <div className="space-y-2 text-xs">
              <div>Network: <span className="font-mono">{storageInfo.network}</span></div>
              <div>Status: <span className={`font-semibold ${storageInfo.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{storageInfo.status}</span></div>
              <div>RPC: <span className="font-mono text-gray-600">{storageInfo.rpcUrl}</span></div>
              <div>Indexer: <span className="font-mono text-gray-600">{storageInfo.indexerUrl}</span></div>
              <div>Has Private Key: <span className={storageInfo.hasPrivateKey ? 'text-green-600' : 'text-yellow-600'}>{storageInfo.hasPrivateKey ? 'Yes' : 'No (read-only)'}</span></div>
              <div>Local Uploads: {storageInfo.localUploads || storageInfo.storageUploads || 0}</div>
            </div>
          )}
          <button
            onClick={testStorage}
            disabled={testLoading}
            className="w-full px-3 py-2 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {testLoading ? 'Testing...' : 'Test Storage'}
          </button>
          {storageTest && (
            <div className={`text-xs p-2 rounded ${storageTest.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="font-medium">{storageTest.message}</div>
              {storageTest.uploadTest && (
                <div className="mt-1">
                  Upload Test: {storageTest.uploadTest.success ? '✅' : '❌'}
                  {storageTest.uploadTest.rootHash && <div className="font-mono text-xs">Hash: {storageTest.uploadTest.rootHash.slice(0, 20)}...</div>}
                </div>
              )}
            </div>
          )}
        </section>
        
        <section className="border rounded-lg p-4 space-y-3 shadow-sm gradient-card">
          <h2 className="font-medium text-gradient">🧠 AI Compute Status</h2>
          {computeStatus && (
            <div className="space-y-2 text-xs">
              <div>Network: <span className="font-mono">{computeStatus.network}</span></div>
              <div>Status: <span className={`font-semibold ${computeStatus.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>{computeStatus.status}</span></div>
              <div>Active Nodes: <span className="font-semibold">{computeStatus.activeNodes}</span></div>
              <div>Avg Response: <span className="font-mono">{computeStatus.avgResponseTime}ms</span></div>
              <div>Models Available: {computeStatus.modelsAvailable}</div>
              <div>Utilization: {computeStatus.networkUtilization}</div>
            </div>
          )}
          <button
            onClick={testCompute}
            disabled={testLoading}
            className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {testLoading ? 'Testing...' : 'Test Compute'}
          </button>
          {computeTest && (
            <div className={`text-xs p-2 rounded ${computeTest.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="font-medium">{computeTest.message}</div>
              {computeTest.details && (
                <div className="mt-1">
                  Test Duration: {computeTest.details.testDuration}ms
                </div>
              )}
            </div>
          )}
        </section>
            </div>
      
      {/* Wallet Actions Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WalletStatus />
                  <MintINFT />
                  <BuyNFT />
                </div>
                <div className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                  <p className="text-sm text-green-300">
                    <strong>Note:</strong> Listing is now automatic! When you mint an INFT, it's automatically listed on the marketplace.
                  </p>
                </div>
      
      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">⛓️ Register Agent (on Polygon Chain)</h2>
        {AGENT_REGISTRY_ADDRESS && (
          <p className="text-xs text-gray-500 break-all">Registry: {AGENT_REGISTRY_ADDRESS}</p>
        )}
        {typeof totalAgents.data === "bigint" && (
          <p className="text-xs">Total Agents: {totalAgents.data.toString()}</p>
        )}
        <div className="flex gap-2">
          <input
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder="metadata URI (e.g. https://...)"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!AGENT_REGISTRY_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: AGENT_REGISTRY_ADDRESS as `0x${string}`,
                  abi: AGENT_REGISTRY_ABI,
                  functionName: "create",
                  args: [metadata],
                });
                alert("Agent registered!");
              } catch (err) {
                console.error(err);
                alert("Failed to register agent");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            {isPending ? "Submitting..." : "Register"}
          </button>
        </div>
        {!AGENT_REGISTRY_ADDRESS && (
          <p className="text-xs text-gray-500">Set NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS in .env.local</p>
        )}
      </section>

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">Mint INFT</h2>
        {INFT_ADDRESS && (
          <p className="text-xs text-gray-500 break-all">INFT: {INFT_ADDRESS}</p>
        )}
        <div className="flex gap-2">
          <input
            value={mintUri}
            onChange={(e) => setMintUri(e.target.value)}
            placeholder="tokenURI"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!INFT_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: INFT_ADDRESS as `0x${string}`,
                  abi: INFT_ABI,
                  functionName: "mint",
                  args: [mintUri],
                });
                alert("Minted!");
              } catch (err) {
                console.error(err);
                alert("Mint failed");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            Mint
          </button>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">List INFT</h2>
        {MARKETPLACE_ADDRESS && (
          <p className="text-xs text-gray-500 break-all">Marketplace: {MARKETPLACE_ADDRESS}</p>
        )}
        <div className="flex gap-2">
          <input
            value={listTokenId}
            onChange={(e) => setListTokenId(e.target.value)}
            placeholder="tokenId"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <input
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            placeholder="price (wei)"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!INFT_ADDRESS || !MARKETPLACE_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                // approve marketplace to transfer token
                await writeContractAsync({
                  address: INFT_ADDRESS as `0x${string}`,
                  abi: INFT_ABI,
                  functionName: "approve",
                  args: [MARKETPLACE_ADDRESS as `0x${string}`, BigInt(listTokenId || "0")],
                });
                await writeContractAsync({
                  address: MARKETPLACE_ADDRESS as `0x${string}`,
                  abi: MARKETPLACE_ABI,
                  functionName: "list",
                  args: [INFT_ADDRESS as `0x${string}`, BigInt(listTokenId || "0"), BigInt(listPrice || "0")],
                });
                alert("Listed!");
              } catch (err) {
                console.error(err);
                alert("List failed");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            List
          </button>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-3 shadow-sm">
        <h2 className="font-medium">Buy Listing</h2>
        <div className="flex gap-2">
          <input
            value={buyListingId}
            onChange={(e) => setBuyListingId(e.target.value)}
            placeholder="listingId"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <input
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            placeholder="price (wei)"
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            disabled={!MARKETPLACE_ADDRESS || isPending || wrongNetwork}
            onClick={async () => {
              try {
                await writeContractAsync({
                  address: MARKETPLACE_ADDRESS as `0x${string}`,
                  abi: MARKETPLACE_ABI,
                  functionName: "buy",
                  args: [BigInt(buyListingId || "0")],
                  value: BigInt(listPrice || "0"),
                });
                alert("Purchased!");
              } catch (err) {
                console.error(err);
                alert("Purchase failed");
              }
            }}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
          >
            Buy
          </button>
        </div>
      </section>

      <section className="border rounded-lg p-4 h-[60vh] overflow-y-auto bg-white/50 dark:bg-black/20">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Start chatting with your agent…</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, idx) => (
              <li key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className="inline-block px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {m.content}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button onClick={handleSend} className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">
          Send
        </button>
      </div>
    </div>
  );
}
