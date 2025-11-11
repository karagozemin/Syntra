"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { X, GitCompare, Check, Minus, Eye, Heart, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  image: string;
  priceEth: number;
  category: string;
  owner: string;
  views?: number;
  likes?: number;
  trending?: boolean;
  capabilities?: string[];
  description?: string;
}

interface AgentComparisonProps {
  agents: Agent[];
  onClose: () => void;
}

export function AgentComparison({ agents, onClose }: AgentComparisonProps) {
  if (agents.length === 0) return null;

  const allCapabilities = Array.from(
    new Set(agents.flatMap(agent => agent.capabilities || []))
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="gradient-card border-purple-400/30">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-white">
                  <GitCompare className="w-6 h-6 text-purple-400" />
                  Compare Agents ({agents.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-semibold text-gray-400 sticky left-0 bg-[#0f0f16] z-10">
                        Feature
                      </th>
                      {agents.map((agent) => (
                        <th key={agent.id} className="p-4 min-w-[250px]">
                          <div className="space-y-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={agent.image}
                              alt={agent.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-white text-base mb-1">
                                {agent.name}
                              </h3>
                              <p className="text-sm text-gray-400">{agent.owner}</p>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Price */}
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                        Price
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="p-4 text-center">
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/50">
                            {agent.priceEth} POL
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    {/* Category */}
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                        Category
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="p-4 text-center">
                          <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                            {agent.category}
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    {/* Stats */}
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                        Popularity
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="p-4">
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {agent.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {agent.likes || 0}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Trending */}
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                        Trending
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="p-4 text-center">
                          {agent.trending ? (
                            <TrendingUp className="w-5 h-5 text-green-400 mx-auto" />
                          ) : (
                            <Minus className="w-5 h-5 text-gray-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Description */}
                    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                        Description
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="p-4">
                          <p className="text-sm text-gray-400 line-clamp-3">
                            {agent.description || "No description available"}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Capabilities */}
                    {allCapabilities.map((capability) => (
                      <tr key={capability} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                          {capability}
                        </td>
                        {agents.map((agent) => (
                          <td key={agent.id} className="p-4 text-center">
                            {agent.capabilities?.includes(capability) ? (
                              <Check className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}

                    {/* Actions */}
                    <tr>
                      <td className="p-4 text-sm text-gray-300 font-medium sticky left-0 bg-[#0f0f16] z-10">
                        Actions
                      </td>
                      {agents.map((agent) => (
                        <td key={agent.id} className="p-4">
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="w-full gradient-0g hover:opacity-90 text-white font-medium"
                              onClick={() => window.location.href = `/agent/${agent.id}`}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-400/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
                              onClick={() => window.location.href = `/agent/${agent.id}`}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

