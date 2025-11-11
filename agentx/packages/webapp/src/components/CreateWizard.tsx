"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, Image as ImageIcon, 
  DollarSign, Settings, Eye, Brain, Zap, Share2, Upload 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AI_MODELS = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", description: "Most capable model", popular: true },
  { id: "gpt-3.5", name: "GPT-3.5 Turbo", provider: "OpenAI", description: "Fast and efficient" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic", description: "Advanced reasoning" },
  { id: "llama-2", name: "Llama 2", provider: "Meta", description: "Open source" },
];

const CAPABILITIES = [
  { id: "nlp", name: "Natural Language Processing", icon: "💬" },
  { id: "automation", name: "Task Automation", icon: "⚡" },
  { id: "analysis", name: "Data Analysis", icon: "📊" },
  { id: "creative", name: "Creative Generation", icon: "🎨" },
  { id: "coding", name: "Code Generation", icon: "💻" },
  { id: "research", name: "Research & Insights", icon: "🔍" },
  { id: "trading", name: "Trading Signals", icon: "📈" },
  { id: "social", name: "Social Media", icon: "📱" },
];

const CATEGORIES = [
  "Trading", "Research", "Gaming", "Art", "Development",
  "Marketing", "Analytics", "Music", "Health", "Education", "DeFi", "Productivity"
];

interface WizardData {
  // Step 1: Basic Info
  name: string;
  description: string;
  image: string;
  
  // Step 2: AI Configuration
  aiModel: string;
  capabilities: string[];
  
  // Step 3: Details & Pricing
  category: string;
  price: string;
  xHandle: string;
  website: string;
}

interface CreateWizardProps {
  onComplete: (data: WizardData) => void;
  isCreating: boolean;
}

export function CreateWizard({ onComplete, isCreating }: CreateWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [data, setData] = useState<WizardData>({
    name: "",
    description: "",
    image: "",
    aiModel: "gpt-4",
    capabilities: ["nlp", "automation"],
    category: "",
    price: "0.075",
    xHandle: "",
    website: ""
  });

  const steps = [
    { id: 0, title: "Basic Info", icon: Sparkles },
    { id: 1, title: "AI Configuration", icon: Brain },
    { id: 2, title: "Details & Pricing", icon: Settings },
    { id: 3, title: "Preview", icon: Eye },
  ];

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleCapability = (capId: string) => {
    const newCaps = data.capabilities.includes(capId)
      ? data.capabilities.filter(c => c !== capId)
      : [...data.capabilities, capId];
    updateData({ capabilities: newCaps });
  };

  // Compress image to reduce size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Max dimensions (800x800)
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 70% quality
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          
          console.log(`📦 Image compressed: ${file.size} bytes → ${compressed.length * 0.75} bytes (${Math.round((1 - (compressed.length * 0.75 / file.size)) * 100)}% reduction)`);
          
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle image file selection with compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setImageFile(file);

    try {
      // Compress and convert to base64
      const compressedImage = await compressImage(file);
      updateData({ image: compressedImage });
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Failed to process image. Please try another file.');
      setImageFile(null);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.name.trim() && data.description.trim();
      case 1:
        return data.aiModel && data.capabilities.length > 0;
      case 2:
        return data.category && data.price && parseFloat(data.price) > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="relative z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? "bg-green-500 border-green-500"
                      : isCurrent
                      ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/50"
                      : "bg-gray-800 border-gray-600"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isCurrent ? "text-white" : "text-gray-400"}`} />
                  )}
                </div>
                <span className={`text-xs font-medium ${isCurrent ? "text-white" : "text-gray-400"}`}>
                  {step.title}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="gradient-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="w-5 h-5 text-purple-400" />;
                })()}
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 0: Basic Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Agent Name *</label>
                    <Input
                      placeholder="e.g., Trading Assistant Pro"
                      value={data.name}
                      onChange={(e) => updateData({ name: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Description *</label>
                    <Textarea
                      placeholder="Describe what your AI agent can do, its capabilities, and unique features..."
                      value={data.description}
                      onChange={(e) => updateData({ description: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Agent Image
                    </label>
                    
                    {/* File Upload */}
                    <label htmlFor="wizard-image-upload" className="cursor-pointer block">
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-purple-400/50 transition-colors bg-white/5">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-purple-400" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-300">
                              {imageFile ? imageFile.name : 'Click to upload image'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                    <input
                      id="wizard-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-white/10"></div>
                      <span className="text-xs text-gray-500">or</span>
                      <div className="flex-1 border-t border-white/10"></div>
                    </div>

                    {/* URL Input */}
                    <Input
                      placeholder="https://example.com/image.png"
                      value={imageFile ? '' : data.image}
                      onChange={(e) => {
                        updateData({ image: e.target.value });
                        setImageFile(null);
                      }}
                      disabled={!!imageFile}
                      className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white disabled:opacity-50"
                    />
                    
                    {/* Preview */}
                    {data.image && (
                      <div className="relative mt-3 rounded-lg overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={data.image}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateData({ image: '' });
                            setImageFile(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: AI Configuration */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Model *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AI_MODELS.map((model) => (
                        <div
                          key={model.id}
                          onClick={() => updateData({ aiModel: model.id })}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            data.aiModel === model.id
                              ? "border-purple-400 bg-purple-500/20"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-white">{model.name}</h4>
                              <p className="text-xs text-gray-400">{model.provider}</p>
                            </div>
                            {model.popular && (
                              <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{model.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      Capabilities * (Select at least one)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {CAPABILITIES.map((cap) => (
                        <Badge
                          key={cap.id}
                          variant="outline"
                          className={`cursor-pointer transition-all p-3 justify-start ${
                            data.capabilities.includes(cap.id)
                              ? "bg-blue-500/20 text-blue-200 border-blue-400/60"
                              : "border-white/10 text-gray-400 hover:text-white hover:bg-blue-500/10"
                          }`}
                          onClick={() => toggleCapability(cap.id)}
                        >
                          <span className="mr-2">{cap.icon}</span>
                          <span className="text-xs">{cap.name}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Details & Pricing */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category *</label>
                    <select
                      value={data.category}
                      onChange={(e) => updateData({ category: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:border-purple-400/50 text-white"
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      Price (0G) *
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.075"
                      value={data.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive numbers
                        if (value === '' || parseFloat(value) >= 0) {
                          updateData({ price: value });
                        }
                      }}
                      className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Share2 className="w-4 h-4 text-purple-400" />
                      <h3 className="font-medium text-white">Social Links</h3>
                      <span className="text-xs text-gray-500">(Optional)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">X (Twitter) Handle</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                          <Input
                            placeholder="username"
                            value={data.xHandle.replace('@', '')}
                            onChange={(e) => updateData({ xHandle: e.target.value.replace('@', '') })}
                            className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Website</label>
                        <Input
                          placeholder="https://yourwebsite.com"
                          value={data.website}
                          onChange={(e) => updateData({ website: e.target.value })}
                          className="bg-white/5 border-white/10 focus:border-purple-400/50 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="gradient-card rounded-2xl overflow-hidden border-white/10">
                    {data.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.image} alt={data.name} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{data.name || "Agent Name"}</h3>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                            {data.category || "Category"}
                          </Badge>
                        </div>
                        <Badge className="bg-purple-500/30 text-purple-200 text-lg px-3 py-1">
                          {data.price} 0G
                        </Badge>
                      </div>

                      <p className="text-gray-300">{data.description || "Description"}</p>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">AI Model</h4>
                        <Badge variant="outline" className="border-purple-400/50 text-purple-300">
                          {AI_MODELS.find(m => m.id === data.aiModel)?.name}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">Capabilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.capabilities.map(capId => {
                            const cap = CAPABILITIES.find(c => c.id === capId);
                            return cap ? (
                              <Badge key={capId} variant="outline" className="border-blue-400/50 text-blue-300">
                                {cap.icon} {cap.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {(data.xHandle || data.website) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-white">Social Links</h4>
                          <div className="flex gap-2">
                            {data.xHandle && (
                              <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                                @{data.xHandle}
                              </Badge>
                            )}
                            {data.website && (
                              <Badge variant="outline" className="border-green-400/50 text-green-300">
                                🌐 Website
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isCreating}
          className="border-gray-400/50 text-gray-300 bg-gray-500/10 hover:bg-gray-500/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isCreating}
          className="gradient-0g hover:opacity-90 text-white font-semibold"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
              Creating...
            </>
          ) : currentStep === steps.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Agent
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

