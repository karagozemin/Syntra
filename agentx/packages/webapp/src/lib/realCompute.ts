// Mock AI Compute implementation (simulation mode)
// Provides realistic AI-like responses without external AI service dependencies

export interface ComputeRequest {
  agentId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export type ComputeResponse = {
  success: boolean;
  response?: string;
  error?: string;
  computeTime?: number;
  nodeId?: string;
  provider?: string;
  cost?: string;
};

// Mock AI response templates based on agent categories
const RESPONSE_TEMPLATES = {
  trading: [
    "Based on current market conditions, I'd recommend monitoring key support and resistance levels. Technical indicators suggest {trend} momentum.",
    "The trading strategy should consider {factor}. Always implement proper risk management with stop-loss orders.",
    "Market analysis shows {observation}. Consider diversifying your portfolio to manage risk effectively."
  ],
  gaming: [
    "Great question about game mechanics! {topic} is crucial for optimizing your gameplay strategy.",
    "In my experience, focusing on {strategy} can significantly improve your performance in competitive matches.",
    "The game meta currently favors {approach}. Adapting your playstyle accordingly could give you an edge."
  ],
  development: [
    "For this coding challenge, I suggest using {technology}. This approach offers better performance and maintainability.",
    "The best practice here would be to implement {pattern}. It ensures code quality and scalability.",
    "Consider using {tool} for this task. It's well-documented and has strong community support."
  ],
  defi: [
    "DeFi protocols require careful consideration of {aspect}. Always audit smart contracts before interacting.",
    "The optimal yield farming strategy involves {method}. Remember to account for impermanent loss.",
    "For liquidity provision, {recommendation} offers better risk-adjusted returns based on current APY rates."
  ],
  art: [
    "Your creative vision for {element} is inspiring! Consider exploring {technique} to enhance the composition.",
    "The artistic style you're describing reminds me of {reference}. Experimenting with {method} could yield interesting results.",
    "Color theory suggests {principle} would work well here. Balance is key in creating visually appealing art."
  ],
  default: [
    "That's an interesting question! Based on {context}, I'd suggest {recommendation}.",
    "Let me help you with that. {insight} is important to consider in this situation.",
    "From my analysis, {observation}. This approach has proven effective in similar scenarios."
  ]
};

// Extract category-appropriate template
function getResponseTemplate(agentId: string): string[] {
  // Simple category detection from agentId or use default
  const lowerAgentId = agentId.toLowerCase();
  
  if (lowerAgentId.includes('trad') || lowerAgentId.includes('finance')) {
    return RESPONSE_TEMPLATES.trading;
  } else if (lowerAgentId.includes('game') || lowerAgentId.includes('play')) {
    return RESPONSE_TEMPLATES.gaming;
  } else if (lowerAgentId.includes('dev') || lowerAgentId.includes('code')) {
    return RESPONSE_TEMPLATES.development;
  } else if (lowerAgentId.includes('defi') || lowerAgentId.includes('yield')) {
    return RESPONSE_TEMPLATES.defi;
  } else if (lowerAgentId.includes('art') || lowerAgentId.includes('creative')) {
    return RESPONSE_TEMPLATES.art;
  }
  
  return RESPONSE_TEMPLATES.default;
}

// Generate contextual variables for template
function generateContextVariables(userMessage: string): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Analyze user message for context
  const messageLower = userMessage.toLowerCase();
  
  // Technical terms
  if (messageLower.includes('price') || messageLower.includes('market')) {
    variables.trend = 'bullish';
    variables.observation = 'increased volume and volatility';
    variables.factor = 'market sentiment and volume';
  }
  
  // Strategy terms
  if (messageLower.includes('how') || messageLower.includes('strategy')) {
    variables.strategy = 'resource management and timing';
    variables.approach = 'adaptive tactics based on opponent behavior';
    variables.method = 'dollar-cost averaging with rebalancing';
  }
  
  // Technical development
  if (messageLower.includes('code') || messageLower.includes('build')) {
    variables.technology = 'React with TypeScript';
    variables.pattern = 'the repository pattern';
    variables.tool = 'Next.js with server components';
  }
  
  // Creative terms
  if (messageLower.includes('design') || messageLower.includes('create')) {
    variables.element = 'visual hierarchy';
    variables.technique = 'layering and depth';
    variables.principle = 'the 60-30-10 rule';
  }
  
  // Generic fallbacks
  variables.context = 'the current situation';
  variables.recommendation = 'taking a systematic approach';
  variables.insight = 'understanding the fundamentals';
  variables.topic = 'this aspect';
  variables.reference = 'modern innovative approaches';
  
  return variables;
}

// Replace template variables with actual values
function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(`{${key}}`, value);
  }
  
  // Remove any remaining unfilled placeholders
  result = result.replace(/\{[^}]+\}/g, 'key factors');
  
  return result;
}

/**
 * Mock AI compute that generates contextual responses
 */
export async function callRealCompute(request: ComputeRequest): Promise<ComputeResponse> {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Starting mock AI compute...');
    console.log(`📝 Agent: ${request.agentId}`);
    console.log(`💬 Messages: ${request.messages.length}`);
    
    // Simulate realistic AI processing time (300-800ms)
    const processingTime = 300 + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Get the last user message
    const userMessage = request.messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || '';
    
    if (!userMessage) {
      throw new Error('No user message found');
    }
    
    // Select appropriate template based on agent
    const templates = getResponseTemplate(request.agentId);
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate context variables from user message
    const variables = generateContextVariables(userMessage);
    
    // Fill template with variables
    let response = fillTemplate(selectedTemplate, variables);
    
    // Add conversational elements for natural feel
    const conversationalPrefixes = [
      '',
      'Interesting question! ',
      'Let me think about that. ',
      'Good point. ',
      'I understand what you\'re asking. '
    ];
    
    const prefix = conversationalPrefixes[Math.floor(Math.random() * conversationalPrefixes.length)];
    response = prefix + response;
    
    // Add helpful closing for some responses
    if (Math.random() > 0.7) {
      const closings = [
        ' Let me know if you need clarification!',
        ' Feel free to ask more questions!',
        ' Hope this helps!',
        ' Would you like me to elaborate on any part?'
      ];
      response += closings[Math.floor(Math.random() * closings.length)];
    }
    
    const computeTime = Date.now() - startTime;
    
    console.log(`✅ Mock AI response generated in ${computeTime}ms`);
    console.log(`📤 Response length: ${response.length} characters`);
    
    return {
      success: true,
      response,
      computeTime,
      nodeId: `mock-node-${Math.random().toString(36).substring(7)}`,
      provider: 'Mock AI Provider',
      cost: '0.00 POL'
    };
    
  } catch (error) {
    console.error('❌ Mock compute failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Mock compute failed',
      computeTime: Date.now() - startTime
    };
  }
}

/**
 * Test compute connection (always succeeds in mock mode)
 */
export async function testComputeConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  provider?: string;
  mode?: string;
}> {
  console.log('🔍 Testing mock AI compute...');
  
  // Simulate connection test delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: 'Mock AI compute ready',
    provider: 'Mock AI Provider',
    mode: 'Simulation'
  };
}

/**
 * Get available AI models (mock list)
 */
export async function getAvailableModels(): Promise<string[]> {
  return [
    'mock-gpt-4',
    'mock-claude-3',
    'mock-llama-3',
    'mock-general-ai'
  ];
}
