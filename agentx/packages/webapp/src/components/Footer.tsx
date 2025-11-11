import Link from "next/link";
import Image from "next/image";
import { Twitter, Github,} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-purple-900/10 via-black to-blue-900/10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Syntra Logo" 
                  width={200} 
                  height={80}
                  className="h-20 w-auto"
                  priority
                />
              </Link>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              The future of AI-powered digital assets on Polygon Network. Create, trade, and explore intelligent NFT agents.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Marketplace</h3>
            <div className="space-y-2">
              <Link href="/explore" className="block text-sm text-gray-400 hover:text-purple-300 transition-colors">
                Explore Agents
              </Link>
              <Link href="/create" className="block text-sm text-gray-400 hover:text-purple-300 transition-colors">
                Create Agent
              </Link>
              <Link href="" className="block text-sm text-gray-400 hover:text-purple-300 transition-colors">
                Trending
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Resources</h3>
            <div className="space-y-2">
              <Link href="/docs" className="block text-sm text-gray-400 hover:text-purple-300 transition-colors">
                Documentation
              </Link>
              <Link href="/about" className="block text-sm text-gray-400 hover:text-purple-300 transition-colors">
                About
              </Link>
              <Link href="/faq" className="block text-sm text-gray-400 hover:text-purple-300 transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Community</h3>
            <div className="flex gap-3">
              <a 
                href="https://x.com/kaptan_web3" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-400/30 transition-all"
              >
                <Twitter className="w-4 h-4 text-gray-400 hover:text-purple-300" />
              </a>
              <a 
                href="https://github.com/karagozemin/syntra" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-400/30 transition-all"
              >
                <Github className="w-4 h-4 text-gray-400 hover:text-purple-300" />
              </a>
              
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-400">
            © 2025 Syntra. Built on Polygon Network.
          </span>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-purple-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-purple-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


