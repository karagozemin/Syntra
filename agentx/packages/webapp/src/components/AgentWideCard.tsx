"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, Eye, Zap, Star } from "lucide-react";
import { useState } from "react";

export function AgentWideCard({ id, name, owner, image, priceEth, tag }: {
  id: string; name: string; owner: string; image: string; priceEth: number; tag?: string;
}) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }} 
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="min-w-[380px] md:min-w-[480px] rounded-3xl overflow-hidden gradient-card hover:glow-purple transition-all duration-300 group border-white/10"
    >
      <Link href={`/agent/${id}`}>
        <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-900/30 via-gray-900 to-blue-900/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105" 
          />
          
          {/* Overlay Actions */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              variant="ghost"
              className="w-10 h-10 p-0 bg-black/60 backdrop-blur-md hover:bg-purple-500/60 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-10 h-10 p-0 bg-black/60 backdrop-blur-md hover:bg-purple-500/60 cursor-pointer"
            >
              <Eye className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Tag Badge */}
          {tag && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-none font-semibold">
                <Star className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white truncate group-hover:text-gradient transition-all duration-300">{name}</h3>
            <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10 font-semibold">
              {priceEth} POL
            </Badge>
          </div>
          <p className="text-sm text-gray-400 truncate">by {owner}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" className="flex-1 gradient-0g hover:opacity-90 text-white font-semibold cursor-pointer" asChild>
            <Link href={`/agent/${id}`}>
              <Zap className="w-4 h-4 mr-2" />
              Buy Now
            </Link>
          </Button>
          <Button size="sm" className="bg-black/80 text-white border border-purple-400/50 hover:bg-black/90 hover:border-purple-400/70 cursor-pointer backdrop-blur-sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


