export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const { message } = req.body;
    
    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty',
        timestamp: new Date().toISOString()
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long (max 1000 characters)',
        timestamp: new Date().toISOString()
      });
    }
    
    // Enhanced AI responses based on message content
    const lowerMessage = message.toLowerCase();
    let responses;
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      responses = [
        "Hello! How can I help you today?",
        "Hi there! What's on your mind?",
        "Hey! Great to meet you. What would you like to talk about?"
      ];
    } else if (lowerMessage.includes('?')) {
      responses = [
        "That's an interesting question! Let me think about that.",
        "Great question! I'd be happy to help you explore that.",
        "I understand what you're asking. Here's my perspective..."
      ];
    } else if (lowerMessage.includes('thank')) {
      responses = [
        "You're very welcome! I'm here to help.",
        "My pleasure! Feel free to ask me anything else.",
        "Happy to help! What else can I assist you with?"
      ];
    } else {
      responses = [
        "That's interesting! Tell me more about your thoughts.",
        "I find that really intriguing. Can you elaborate?",
        "How does that make you feel?",
        "Can you elaborate on that?",
        "That's a thoughtful point. What led you to think about that?"
      ];
    }
    
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
      success: true,
      response: selectedResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
