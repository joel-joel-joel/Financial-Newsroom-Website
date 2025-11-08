/**
 * Simplified LiveChat - Base class without AI
 * This ensures basic chat functionality works first
 */
class LiveChat {
  constructor() {
    // Get DOM elements from your HTML
    this.messagesContainer = document.querySelector('.chat-messages');
    this.input = document.querySelector('.comments-box input');
    this.sendButton = document.querySelector('.comments-box button');
    
    console.log('🔍 LiveChat DOM Check:', {
      messagesContainer: !!this.messagesContainer,
      input: !!this.input,
      sendButton: !!this.sendButton
    });
    
    // Exit if elements not found
    if (!this.messagesContainer || !this.input || !this.sendButton) {
      console.error('❌ LiveChat: Required DOM elements not found!');
      console.log('Make sure your HTML has:');
      console.log('  - .chat-messages div');
      console.log('  - .comments-box input');
      console.log('  - .comments-box button');
      return;
    }
    
    this.username = this.getStoredUsername();
    this.autoScroll = true;
    this.maxChars = 200;
    
    console.log('✅ LiveChat initialized with username:', this.username);
    this.init();
  }
  
  init() {
    console.log('🚀 Initializing LiveChat...');
    
    // Event listeners
    this.sendButton.addEventListener('click', () => {
      console.log('🖱️ Send button clicked');
      this.sendMessage();
    });
    
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        console.log('⌨️ Enter key pressed');
        this.sendMessage();
      }
    });
    
    // Character counter
    this.input.addEventListener('input', () => this.updateCharacterCount());
    
    // Scroll detection
    this.messagesContainer.addEventListener('scroll', () => this.handleScroll());
    
    // Test message to verify chat works
    setTimeout(() => {
      this.addMessage('@System', 'Welcome to the live chat! 🎉', false);
      console.log('✅ Test message added');
    }, 500);
    
    // Simulate some initial activity
    setTimeout(() => this.simulateInitialMessages(), 1000);
  }
  
  getStoredUsername() {
    try {
      const stored = localStorage.getItem('ff_chat_username');
      if (stored) return stored;
      
      const randomNum = Math.floor(Math.random() * 10000);
      const username = `@user${randomNum}`;
      localStorage.setItem('ff_chat_username', username);
      return username;
    } catch (e) {
      return '@guest';
    }
  }
  
  sendMessage() {
    const message = this.input.value.trim();
    console.log('📤 sendMessage called with:', message);
    
    if (!message) {
      console.log('⚠️ Empty message, ignoring');
      return;
    }
    
    if (message.length > this.maxChars) {
      alert(`Message too long! Maximum ${this.maxChars} characters.`);
      return;
    }
    
    // Add the message
    this.addMessage(this.username, message, true);
    
    // Clear input
    this.input.value = '';
    this.updateCharacterCount();
    
    console.log('✅ Message sent successfully');
  }
  
  addMessage(username, text, isOwnMessage = false) {
    console.log('➕ addMessage:', { username, text, isOwnMessage });
    
    if (!this.messagesContainer) {
      console.error('❌ messagesContainer not found!');
      return;
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    if (isOwnMessage) {
      messageDiv.classList.add('own-message');
    }
    
    // Format timestamp
    const timestamp = new Date();
    const timeStr = this.formatRelativeTime(timestamp);
    
    // Build message HTML
    messageDiv.innerHTML = `
      <span class="message-header">
        <strong>${this.escapeHtml(username)}:</strong>
        <span class="timestamp">${timeStr}</span>
      </span>
      <span class="message-text">${this.escapeHtml(text)}</span>
    `;
    
    // Add to container
    this.messagesContainer.appendChild(messageDiv);
    console.log('  ✓ Message appended. Total messages:', this.messagesContainer.children.length);
    
    // Scroll to bottom if enabled
    if (this.autoScroll) {
      this.scrollToBottom();
    }
    
    // Cleanup old messages
    this.cleanupOldMessages();
  }
  
  formatRelativeTime(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  handleScroll() {
    const container = this.messagesContainer;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    
    // Enable auto-scroll if within 100px of bottom
    this.autoScroll = (scrollHeight - scrollTop - clientHeight) < 100;
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  updateCharacterCount() {
    const length = this.input.value.length;
    let counter = document.querySelector('.character-counter');
    
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'character-counter';
      this.input.parentNode.insertBefore(counter, this.input.nextSibling);
    }
    
    if (length > 0) {
      counter.style.display = 'block';
      counter.textContent = `${length}/${this.maxChars}`;
      counter.classList.toggle('warning', length > this.maxChars * 0.9);
    } else {
      counter.style.display = 'none';
    }
  }
  
  cleanupOldMessages() {
    const messages = this.messagesContainer.querySelectorAll('.chat-message');
    const maxMessages = 100;
    
    if (messages.length > maxMessages) {
      for (let i = 0; i < messages.length - maxMessages; i++) {
        messages[i].remove();
      }
    }
  }
  
  simulateInitialMessages() {
    const messages = [
      { user: '@sarah_trader', text: 'Market looking interesting today 📈' },
      { user: '@mike_analyst', text: 'Anyone watching the Fed announcement?' },
      { user: '@crypto_fan', text: 'Bitcoin is pumping! 🚀' },
      { user: '@news_junkie', text: 'Great stream, thanks for the insights!' }
    ];
    
    messages.forEach((msg, index) => {
      setTimeout(() => {
        this.addMessage(msg.user, msg.text, false);
      }, index * 800);
    });
  }
}

/**
 * AIEnhancedLiveChat - Extends LiveChat with AI capabilities
 */
class AIEnhancedLiveChat extends LiveChat {
  constructor() {
    super();
    
    // Only initialize AI if base chat works
    if (!this.messagesContainer) {
      console.error('❌ Cannot initialize AI - base chat failed');
      return;
    }
    
    console.log('🤖 Initializing AI features...');
    
    this.aiConfig = {
      provider: 'gemini',
      apiEndpoint: '/api/chat',
      enabled: true,
      timeout: 15000,
      rateLimit: {
        maxRequestsPerMinute: 5,
        requestCount: 0,
        resetTime: Date.now() + 60000
      }
    };
    
    this.pendingResponses = new Map();
    
    // Health check
    this.checkAPIHealth();
  }
  
  async checkAPIHealth() {
    console.log('🏥 Checking AI API health...');
    try {
      const response = await fetch(this.aiConfig.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' })
      });
      
      if (response.ok) {
        console.log('✅ AI API is healthy');
        // Add system message
        setTimeout(() => {
          this.addMessage('@System', '🤖 AI assistant is online! Type /ai [question] to ask.', false);
        }, 2000);
      } else {
        console.warn('⚠️ AI API returned:', response.status);
        this.aiConfig.enabled = false;
      }
    } catch (error) {
      console.error('❌ AI API check failed:', error);
      this.aiConfig.enabled = false;
    }
  }
  
  sendMessage() {
    const message = this.input.value.trim();
    
    if (!message) return;
    
    // Check for AI command
    if (this.aiConfig.enabled && message.startsWith('/ai ')) {
      const prompt = message.slice(4).trim();
      console.log('🤖 AI command detected:', prompt);
      
      if (!prompt) {
        this.addMessage('@System', 'Please provide a question after /ai', false);
        this.input.value = '';
        return;
      }
      
      this.handleAICommand(prompt);
      this.input.value = '';
      this.updateCharacterCount();
      return;
    }
    
    // Regular message
    super.sendMessage();
  }
  
  async handleAICommand(prompt) {
    console.log('🎯 Handling AI command:', prompt);
    
    // Check rate limit
    if (!this.checkRateLimit()) {
      this.addMessage('@System', '⏱️ Please wait before asking another question.', false);
      return;
    }
    
    // Show user's command
    this.addMessage(this.username, `/ai ${prompt}`, true);
    
    // Add "thinking" message with unique ID
    const thinkingId = `thinking-${Date.now()}`;
    this.addMessageWithId(thinkingId, '@AI_Bot', '🤔 Thinking...', false);
    
    try {
      // Call API
      console.log('📞 Calling AI API...');
      const response = await this.callAIAPI(prompt);
      console.log('📥 Got response:', response);
      
      // Update the thinking message
      const success = this.updateMessageById(thinkingId, response);
      console.log('🔄 Update result:', success);
      
      if (!success) {
        // Fallback: add new message
        console.warn('⚠️ Update failed, adding new message');
        this.addMessage('@AI_Bot', response, false);
      }
      
    } catch (error) {
      console.error('❌ AI error:', error);
      this.updateMessageById(thinkingId, `❌ ${this.getErrorMessage(error)}`);
    }
  }
  
  async callAIAPI(prompt) {
    this.aiConfig.rateLimit.requestCount++;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.aiConfig.timeout);
    
    try {
      const response = await fetch(this.aiConfig.apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('API Response:', {
        status: response.status,
        ok: response.ok
      });
      
      const data = await response.json();
      console.log('API Data:', data);
      
      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP ${response.status}`);
      }
      
      if (!data.reply) {
        throw new Error('No reply in response');
      }
      
      return data.reply.trim();
      
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
  
  addMessageWithId(id, username, text, isOwnMessage = false) {
    console.log('➕ addMessageWithId:', { id, username, text });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.setAttribute('data-message-id', id);
    
    if (isOwnMessage) {
      messageDiv.classList.add('own-message');
    }
    
    const timestamp = new Date();
    const timeStr = this.formatRelativeTime(timestamp);
    
    messageDiv.innerHTML = `
      <span class="message-header">
        <strong>${this.escapeHtml(username)}:</strong>
        <span class="timestamp">${timeStr}</span>
      </span>
      <span class="message-text">${this.escapeHtml(text)}</span>
    `;
    
    this.messagesContainer.appendChild(messageDiv);
    
    if (this.autoScroll) {
      this.scrollToBottom();
    }
    
    console.log('  ✓ Message with ID added. Total:', this.messagesContainer.children.length);
  }
  
  updateMessageById(messageId, newText) {
    console.log('🔄 updateMessageById:', { messageId, newText: newText.substring(0, 50) });
    
    const messageDiv = this.messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
    
    if (!messageDiv) {
      console.error('❌ Message not found:', messageId);
      return false;
    }
    
    const textSpan = messageDiv.querySelector('.message-text');
    
    if (!textSpan) {
      console.error('❌ Text span not found in message');
      return false;
    }
    
    textSpan.textContent = newText;
    console.log('✅ Message updated successfully');
    return true;
  }
  
  checkRateLimit() {
    const now = Date.now();
    
    if (now > this.aiConfig.rateLimit.resetTime) {
      this.aiConfig.rateLimit.requestCount = 0;
      this.aiConfig.rateLimit.resetTime = now + 60000;
    }
    
    return this.aiConfig.rateLimit.requestCount < this.aiConfig.rateLimit.maxRequestsPerMinute;
  }
  
  getErrorMessage(error) {
    const msg = error.message || '';
    
    if (msg.includes('timeout')) return 'Request timed out. Try again.';
    if (msg.includes('network')) return 'Connection error.';
    if (msg.includes('rate limit')) return 'Too many requests.';
    
    return 'Something went wrong. Try again.';
  }
}

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Page loaded, initializing chat in 1 second...');
  
  setTimeout(() => {
    try {
      console.log('🎬 Creating chat instance...');
      window.chatInstance = new AIEnhancedLiveChat();
      
      if (window.chatInstance && window.chatInstance.messagesContainer) {
        console.log('✅ Chat initialized successfully!');
        console.log('💡 Try typing: /ai What is inflation?');
        
        // Expose test function
        window.testChat = () => {
          console.log('🧪 Running chat test...');
          window.chatInstance.addMessage('@TestBot', 'Test message from console', false);
        };
        
        window.testAI = (prompt = 'Hello') => {
          console.log('🧪 Running AI test with prompt:', prompt);
          window.chatInstance.handleAICommand(prompt);
        };
        
        console.log('💡 Test commands available:');
        console.log('  - window.testChat() - Add a test message');
        console.log('  - window.testAI("your question") - Test AI');
      } else {
        console.error('❌ Chat instance created but DOM elements missing');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
      console.error('Stack:', error.stack);
    }
  }, 1000);
});