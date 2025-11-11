"use client";

import React from 'react';
import { X, CheckCircle, Clock, AlertCircle, RotateCw, Loader2, ExternalLink } from 'lucide-react';

// ✅ ENHANCED: Backward compatible interface with new optional features
interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error' | 'retrying'; // ✅ Added 'retrying'
  // ✅ NEW: Optional enhanced features
  txHash?: string;
  explorerLink?: string;
  estimatedTime?: string;
  retryCount?: number;
  maxRetries?: number;
}

interface ProgressModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  steps: ProgressStep[];
  currentStepIndex: number;
  progress: number; // 0-100
  assetPreview?: {
    name: string;
    image: string;
    description: string;
  };
  showKeepOpen?: boolean;
  isSuccess?: boolean;
  successData?: {
    title: string;
    subtitle: string;
    actionButtons?: React.ReactNode;
  };
  // ✅ NEW: Optional retry callback
  onRetry?: (stepId: string) => void;
}

export function ProgressModal({
  isOpen,
  onClose,
  title,
  steps,
  currentStepIndex,
  progress,
  assetPreview,
  showKeepOpen = true,
  isSuccess = false,
  successData,
  onRetry
}: ProgressModalProps) {
  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false);

  const handleCloseClick = () => {
    if (isSuccess) {
      // If process is complete, close directly
      onClose?.();
    } else {
      // If process is ongoing, show confirmation
      setShowCloseConfirm(true);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose?.();
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
  };

  if (!isOpen) return null;

  // ✅ Enhanced step icon with new retrying status
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-green-400/30">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        );
      case 'in_progress':
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-blue-400/30">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
        );
      case 'retrying':
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-1 ring-yellow-400/30">
            <RotateCw className="w-4 h-4 text-white animate-spin" />
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-red-400/30">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-600/50 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
        );
    }
  };

  // ✅ Enhanced step text color with retrying status
  const getStepTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'retrying': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500" />
      
      {/* Modal - ✅ Wide but compact for better content display */}
      <div className="relative w-full max-w-2xl max-h-[90vh] animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-gray-600/50 shadow-2xl backdrop-blur-xl transform transition-all duration-300 hover:scale-[1.01]">
          {/* ✅ Enhanced Header with loading indicator */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Loader2 className={`w-6 h-6 text-white ${!isSuccess ? 'animate-spin' : ''}`} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            </div>
            {onClose && (
              <button
                onClick={handleCloseClick}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg group cursor-pointer"
              >
                <X className="w-5 h-5 group-hover:text-red-400" />
              </button>
            )}
          </div>

          {isSuccess && successData ? (
            // Success Screen - ✅ Enhanced with bounce animation
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                {successData.title}
              </h3>
              
              <p className="text-lg text-gray-300 mb-6 max-w-sm mx-auto leading-relaxed">
                {successData.subtitle}
              </p>

              {assetPreview && (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 mb-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300">
                  <div className="text-center">
                    <img 
                      src={assetPreview.image} 
                      alt={assetPreview.name}
                      className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 shadow-xl ring-3 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-300 hover:scale-105"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{assetPreview.name}</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {assetPreview.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {successData.actionButtons}
            </div>
          ) : (
            // Progress Screen
            <>
              {/* ✅ Enhanced Asset Preview - horizontal layout */}
              {assetPreview && (
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center gap-4">
                    <img 
                      src={assetPreview.image} 
                      alt={assetPreview.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-lg ring-2 ring-purple-500/30 hover:ring-purple-500/50 transition-all duration-300"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{assetPreview.name}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {assetPreview.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Enhanced Progress Bar with better styling */}
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold text-gray-200">Overall Progress</span>
                  <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg relative"
                    style={{ 
                      width: `${progress}%`,
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full" />
                  </div>
                </div>
              </div>

              {/* ✅ Enhanced Steps with new features - No scroll version */}
              <div className="p-4">
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
                        step.status === 'in_progress' || step.status === 'retrying' 
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' 
                          : step.status === 'completed'
                          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'
                          : step.status === 'error'
                          ? 'bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20'
                          : 'bg-gray-800/30 border border-gray-700/30'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Step Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getStepIcon(step)}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-base font-semibold ${getStepTextColor(step.status)}`}>
                            {step.title}
                          </h4>
                          {/* ✅ NEW: Estimated time display */}
                          {step.estimatedTime && step.status === 'in_progress' && (
                            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                              ~{step.estimatedTime}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-300 leading-relaxed mb-2">
                          {step.description}
                        </p>

                        {/* ✅ NEW: Transaction Hash with Explorer Link */}
                        {step.txHash && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">Transaction:</span>
                            <a
                              href={step.explorerLink || `${process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://amoy.polygonscan.com'}/tx/${step.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-mono bg-gray-800/50 px-2 py-1 rounded-md hover:bg-gray-700/50"
                            >
                              {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* ✅ NEW: Retry Info Display */}
                        {step.status === 'retrying' && step.retryCount && step.maxRetries && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-yellow-400">
                              Retrying... ({step.retryCount}/{step.maxRetries})
                            </span>
                            {onRetry && (
                              <button
                                onClick={() => onRetry(step.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                Force Retry
                              </button>
                            )}
                          </div>
                        )}

                        {/* ✅ NEW: Error with Retry Button */}
                        {step.status === 'error' && onRetry && (
                          <button
                            onClick={() => onRetry(step.id)}
                            className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-md hover:bg-red-500/30 transition-colors"
                          >
                            Retry Step
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Enhanced Keep Window Open Warning */}
                {showKeepOpen && !isSuccess && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <p className="text-xs text-orange-300 font-medium">
                        Please keep this window open until the process completes. Closing may interrupt the transaction.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {/* ✅ Close Confirmation Dialog - Outside main modal */}
    {showCloseConfirm && (
      <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-red-500/30 shadow-2xl p-6 max-w-md mx-4 animate-in slide-in-from-bottom-2 zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Cancel Process?</h3>
          </div>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            If you close this window, the NFT creation process will be interrupted and may fail. 
            Are you sure you want to cancel?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancelClose}
              className="flex-1 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors font-medium cursor-pointer"
            >
              Continue Process
            </button>
            <button
              onClick={handleConfirmClose}
              className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium border border-red-500/30 hover:border-red-500/50 cursor-pointer"
            >
              Discard & Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}