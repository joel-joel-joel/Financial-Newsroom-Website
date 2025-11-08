// Global instances
let apiService = null;
let uiRenderer = null;

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Financial Frontier initializing...');

  // Create service instances
  apiService = new APIService(API_CONFIG);
  uiRenderer = new UIRenderer();

  // Display current date
  displayCurrentDate();

  // Load homepage data
  await loadHomepageData();

  // Initialize carousel
  await initializeCarousel();

  // Set up auto-refresh
  setUpAutoRefresh();

  console.log('✅ Application fully loaded');
});

/**
 * Display current date in header
 */
function displayCurrentDate() {
  const dateElement = document.querySelector(".date");
  if (dateElement) {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
  }
}

/**
 * Load all homepage data from APIs
 */
async function loadHomepageData() {
  try {
    console.log('📰 Loading homepage data...');

    // Load all sections in parallel for faster loading
    const [heroData, picksData, headlinesData, trendingData, topStoriesData] = await Promise.all([
      apiService.searchArticles('global market crash', 1, 1),
      apiService.searchArticles('market analysis', 3, 1),
      apiService.getTopHeadlines('business', 15),
      apiService.searchArticles('stock market', 10, 1),
      apiService.searchArticles('finance technology', 15, 1)
    ]);

    // ----- Hero Article -----
    if (heroData.articles?.length) {
      const enrichedHero = await apiService.getEnrichedArticle(heroData.articles[0]);
      renderHeroArticle(enrichedHero);
      console.log('✓ Hero article loaded');
    }

    // ----- Editor's Picks (3 articles) -----
    if (picksData.articles?.length >= 3) {
      const enrichedPicks = await Promise.all(
        picksData.articles.slice(0, 3).map(a => apiService.getEnrichedArticle(a, false))
      );
      uiRenderer.renderEditorsPicksAPI(enrichedPicks);
    }

    // ----- News Ticker -----
    if (headlinesData?.length) {
      uiRenderer.renderNewsTicker(headlinesData);
    }

    // ----- Trending Section -----
    if (trendingData.articles?.length) {
      const enrichedTrending = await Promise.all(
        trendingData.articles.map(a => apiService.getEnrichedArticle(a))
      );
      uiRenderer.renderTrendingSection(enrichedTrending);
    }

    // ----- Top Stories Carousel -----
    if (topStoriesData.articles?.length) {
      const enrichedStories = await Promise.all(
        topStoriesData.articles.map(a => apiService.getEnrichedArticle(a, false))
      );
      uiRenderer.renderTopStories(enrichedStories);
    }

    console.log('✅ All homepage data loaded successfully');

  } catch (error) {
    console.error('❌ Error loading homepage data:', error);
    uiRenderer.showError(
      document.querySelector('.main-container'),
      'Unable to load news. Please check your API configuration.'
    );
  }
}

/**
 * Render the hero article at the top of the page
 */
function renderHeroArticle(article) {
  const box = document.querySelector('.main-content');
  if (!box) {
    console.warn('⚠️ Hero article: .main-content container not found');
    return;
  }
  
  const id = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  sessionStorage.setItem(`art_${id}`, JSON.stringify(article));
  
  const imageUrl = article.image || article.urlToImage || 'https://via.placeholder.com/800x600';
  const author = article.author || 'Staff Writer';
  const source = article.source?.name || 'Staff';
  const description = article.description || '';
  
  box.innerHTML = `
    <img src="${imageUrl}" 
         alt="${article.title}" 
         class="main-img"
         onerror="this.src='https://via.placeholder.com/800x600'">
    <a href="article.html?id=${id}">${article.title}</a>
    <div class="text-container">
      <p class="author">${author}<br>Photographed by ${source}</p>
      <p class="description">${description}</p>
    </div>
  `;
}

/**
 * Initialize carousel with infinite scroll
 */
async function initializeCarousel() {
  try {
    const storiesContainer = document.querySelector(".top-stories");

    if (!storiesContainer) {
      console.warn('⚠️ Carousel: Stories container not found');
      return;
    }

    // Wait a bit for DOM to fully render
    await new Promise(resolve => setTimeout(resolve, 100));

    const stories = Array.from(document.querySelectorAll(".story"));
    const storiesPerView = 5;
    const totalStories = stories.length;

    if (totalStories === 0) {
      console.warn('⚠️ Carousel: No stories found');
      return;
    }

    console.log(`🎠 Initializing carousel with ${totalStories} stories`);

    // Duplicate stories for infinite scroll effect
    stories.forEach(story => {
      const clone = story.cloneNode(true);
      storiesContainer.appendChild(clone);
    });

    let index = 0;
    const storyWidthPercent = 100 / storiesPerView;

    function slideStories() {
      index++;
      storiesContainer.style.transition = "transform 0.5s ease-in-out";
      storiesContainer.style.transform = `translateX(-${index * storyWidthPercent}%)`;

      if (index >= totalStories) {
        setTimeout(() => {
          storiesContainer.style.transition = "none";
          storiesContainer.style.transform = "translateX(0)";
          index = 0;
        }, 500);
      }
    }

    // Start carousel
    let carouselInterval = setInterval(slideStories, 3000);
    console.log('✓ Carousel started');

    // Pause/resume on hover
    const wrapper = document.querySelector(".top-stories-wrapper");
    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
      });

      wrapper.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(slideStories, 3000);
      });
    }

  } catch (error) {
    console.error('❌ Error initializing carousel:', error);
  }
}

/**
 * Auto-refresh data every 10 minutes
 */
function setUpAutoRefresh() {
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  setInterval(() => {
    console.log('🔄 Auto-refreshing data...');
    apiService.clearCache();
    loadHomepageData();
  }, REFRESH_INTERVAL);

  console.log('✓ Auto-refresh enabled (10 minutes)');
}

/**
 * Global function to navigate to article
 */
function navigateToArticle(article) {
  const hash = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  sessionStorage.setItem(`art_${hash}`, JSON.stringify(article));
  location.href = `article.html?id=${hash}`;
}

/**
 * Global function to search articles
 */
async function searchArticles(query) {
  if (!query?.trim()) {
    alert('Please enter a search term');
    return;
  }

  try {
    const container = document.querySelector('.main-container');
    uiRenderer.showLoading(container);

    const results = await apiService.searchArticles(query, 20, 1);
    
    if (results.articles?.length) {
      const enriched = await Promise.all(
        results.articles.map(article => apiService.getEnrichedArticle(article))
      );
      uiRenderer.renderTopStories(enriched);
      console.log(`✓ Search: ${enriched.length} articles found for "${query}"`);
    } else {
      uiRenderer.showError(container, `No articles found for "${query}"`);
    }
  } catch (error) {
    console.error('❌ Search error:', error);
    uiRenderer.showError(
      document.querySelector('.main-container'),
      'Search failed. Please try again.'
    );
  }
}

/**
 * Global error handler
 */
function handleAPIError(error, context = 'API') {
  console.error(`${context} Error:`, error);

  if (API_CONFIG?.app?.enableLogging) {
    console.error(`[${new Date().toISOString()}] ${context}: ${error.message}`);
  }

  const message = error.message?.includes('API') 
    ? 'API Error - Please check your configuration' 
    : 'An error occurred. Please try again.';

  return message;
}

/**
 * LiveChat - YouTube-style live chat functionality
 * Features:
 * - Real-time message posting with Enter key or send button
 * - Auto-scroll that pauses when user scrolls up
 * - Character counter (200 character limit)
 * - Relative timestamps ("just now", "1 min ago")
 * - Persistent username via localStorage
 * - XSS protection and message cleanup
 */
class LiveChat {
  constructor() {
    this.messagesContainer = document.querySelector('.chat-messages');
    this.input = document.querySelector('.comments-box input');
    this.sendButton = document.querySelector('.comments-box button');
    
    // Exit if elements not found
    if (!this.messagesContainer || !this.input || !this.sendButton) {
      console.warn('LiveChat: Required DOM elements not found');
      return;
    }
    
    this.username = this.getStoredUsername();
    this.autoScroll = true;
    this.maxChars = 200;
    
    this.init();
  }
  
  init() {
    // Add dynamic styles for chat elements
    this.addChatStyles();
    
    // Event listeners
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Character counter
    this.input.addEventListener('input', () => this.updateCharacterCount());
    
    // Scroll detection for auto-scroll control
    this.messagesContainer.addEventListener('scroll', () => this.handleScroll());
    
    // Simulate initial activity
    this.simulateInitialMessages();
    
    // Start periodic random messages
    this.startRandomMessages();
  }
  
  addChatStyles() {
    const styleId = 'live-chat-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .chat-message {
        padding: 4px 8px;
        margin-bottom: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        line-height: 1.4;
      }
      
      .chat-message:hover {
        background-color: #2a2a2a;
      }
      
      .chat-message.own-message {
        background-color: #1a1a1a;
        border-left: 2px solid crimson;
      }
      
      .message-header {
        flex-shrink: 0;
        margin-right: 8px;
      }
      
      .message-text {
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: pre-wrap;
        flex: 1;
        min-width: 0;
        font-family: 'Apple Garamond', sans-serif;
      }
      
      .timestamp {
        font-size: 11px;
        color: #aaa;
        margin-left: 8px;
        flex-shrink: 0;
        font-family: 'Apple Garamond Light', sans-serif;

      }
      
      .character-counter {
        font-size: 12px;
        color: #aaa;
        text-align: right;
        margin-top: -8px;
        margin-bottom: 5px;
        display: none;
      }
      
      .character-counter.warning {
        color: #ff6b6b;
      }
    `;
    document.head.appendChild(style);
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
  
  formatRelativeTime(timestamp) {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;
    
    if (message.length > this.maxChars) {
      alert(`Message too long! Maximum ${this.maxChars} characters.`);
      return;
    }
    
    this.addMessage(this.username, message, true);
    this.input.value = '';
    this.updateCharacterCount();
    
    // Simulate a response from another user
    setTimeout(() => {
      this.simulateRandomMessage();
    }, Math.random() * 3000 + 1000);
  }
  
  addMessage(username, text, isOwnMessage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
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
    
    // Keep only last 100 messages
    this.cleanupOldMessages();
  }
  
  handleScroll() {
    const container = this.messagesContainer;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    
    // Enable auto-scroll if within 100px of bottom
    this.autoScroll = (scrollHeight - scrollTop - clientHeight) < 100;
  }
  
  updateCharacterCount() {
    const length = this.input.value.length;
    let counter = document.querySelector('.character-counter');
    
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'character-counter';
      this.input.parentNode.insertBefore(counter, this.input);
    }
    
    if (length > 0) {
      counter.style.display = 'block';
      counter.textContent = `${length}/${this.maxChars}`;
      counter.classList.toggle('warning', length > this.maxChars * 0.9);
    } else {
      counter.style.display = 'none';
    }
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  simulateInitialMessages() {
    const messages = [
      { user: '@anna738748', text: 'This is amazing!' },
      { user: '@jonahjjames', text: 'Loving the stream 🔥' },
      { user: '@trader_pro', text: 'Market looking bullish today' },
      { user: '@investor_2025', text: 'Great analysis, thanks for the insights!' }
    ];
    
    messages.forEach((msg, index) => {
      setTimeout(() => {
        this.addMessage(msg.user, msg.text);
      }, index * 1200);
    });
  }
  
  simulateRandomMessage() {
    const messages = [
      'Thanks for the update!',
      'This is really helpful',
      'What do you think about crypto?',
      'Market volatility is crazy today',
      'Great stream, keep it up!',
      'Just joined, what did I miss?',
      'Any thoughts on the Fed announcement?'
    ];
    
    const users = ['@investor_jane', '@trader_mike', '@analyst_sarah', '@finance_guru', '@market_watcher'];
    
    const user = users[Math.floor(Math.random() * users.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    this.addMessage(user, message);
  }
  
  startRandomMessages() {
    setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance
        this.simulateRandomMessage();
      }
    }, Math.random() * 7000 + 8000);
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
}

// Add to your existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', async function() {
  // ... your existing initialization code ...
  
  // Initialize live chat
  setTimeout(() => {
    new LiveChat();
  }, 500);
});


class AIEnhancedLiveChat extends LiveChat {
  constructor() {
    super();

    // ===== AI Configuration =====
    this.aiConfig = {
      provider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      apiEndpoint: '/api/chat', // Vercel serverless function
      maxTokens: 150,
      temperature: 0.7,
      enabled: true,
      // Client-side rate limiting (per user)
      rateLimit: {
        maxRequestsPerMinute: 5,
        requestCount: 0,
        resetTime: Date.now() + 60000
      },
      // Request timeout (15 seconds)
      timeout: 15000
    };

    // ===== State Management =====
    this.conversationContext = [];
    this.pendingQuestions = new Set();
    this.activeRequests = new Map(); // Track in-flight requests
    this.messageQueue = []; // Queue for sequential processing

    // ===== Health Check =====
    this.checkAPIHealth();
  }

  /**
   * Check if the API endpoint is accessible
   */
  async checkAPIHealth() {
    try {
      const response = await fetch(this.aiConfig.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' })
      });
      
      if (response.ok) {
        console.log('✅ AI API endpoint is healthy');
      } else {
        console.warn(`⚠️ AI API returned status ${response.status}`);
        this.aiConfig.enabled = false;
      }
    } catch (error) {
      console.error('❌ AI API health check failed:', error);
      this.aiConfig.enabled = false;
    }
  }

  /**
   * Override sendMessage to handle AI commands
   */
  sendMessage() {
    const message = this.input.value.trim();
    
    if (!message) return;

    // Check character limit
    if (message.length > this.maxChars) {
      alert(`Message too long! Maximum ${this.maxChars} characters.`);
      return;
    }

    // ===== Handle AI Commands =====
    // User can type "/ai [question]" to directly query AI
    if (this.aiConfig.enabled && message.startsWith('/ai ')) {
      const prompt = message.slice(4).trim();
      
      if (!prompt) {
        this.addMessage('@System', 'Please provide a question after /ai', false);
        return;
      }

      console.log('🤖 Processing AI command:', prompt);
      this.handleAICommand(prompt);
      this.input.value = '';
      this.updateCharacterCount();
      return;
    }

    // ===== Regular Message =====
    // Add user's message to chat
    this.addMessage(this.username, message, true);
    this.input.value = '';
    this.updateCharacterCount();

    // ===== Auto-AI Response for Questions =====
    // If message looks like a question, queue it for AI response
    if (this.aiConfig.enabled && this.isQuestion(message)) {
      this.pendingQuestions.add(message);
      
      // Random delay to simulate natural conversation (15-45 seconds)
      setTimeout(() => {
        if (this.pendingQuestions.has(message)) {
          this.pendingQuestions.delete(message);
          this.generateAIResponse(message);
        }
      }, Math.random() * 30000 + 15000);
    }

    // Simulate other users responding occasionally
    if (Math.random() > 0.7) {
      setTimeout(() => {
        this.simulateRandomMessage();
      }, Math.random() * 3000 + 1000);
    }
  }

  /**
   * Handle direct AI command (/ai command)
   */
  async handleAICommand(prompt) {
    // ===== Rate Limit Check =====
    if (!this.checkRateLimit()) {
      this.addMessage('@AI_Bot', 
        '⏱️ Rate limit exceeded. Please wait a moment before asking another question.', 
        false
      );
      return;
    }

    // ===== Show User's Command =====
    this.addMessage(this.username, `/ai ${prompt}`, true);

    // ===== Add "Thinking" Placeholder =====
    const thinkingMessageId = `thinking-${Date.now()}`;
    this.addMessageWithId(thinkingMessageId, '@AI_Bot', '🤔 Thinking...', false);

    try {
      // ===== Call AI API =====
      const response = await this.callAIAPI(prompt);

      // ===== Replace "Thinking" with Response =====
      this.updateMessage(thinkingMessageId, response);
      
      console.log('✅ AI response delivered');

    } catch (error) {
      console.error('❌ AI Command Error:', error);

      // ===== Show Error Message =====
      const errorMsg = this.getErrorMessage(error);
      this.updateMessage(thinkingMessageId, `❌ ${errorMsg}`);
    }
  }

  /**
   * Generate AI response to a user's question
   */
  async generateAIResponse(question) {
    if (!this.checkRateLimit()) return;

    // Build context from recent chat messages
    const context = this.buildContext(question);

    try {
      const response = await this.callAIAPI(context);
      this.addMessage('@AI_Bot', response, false);
      console.log('✅ AI auto-response delivered');
    } catch (error) {
      console.error('❌ AI Auto-Response Error:', error);
      // Silently fail for auto-responses (don't spam errors)
    }
  }

  /**
   * Build context prompt from recent chat history
   */
  buildContext(question) {
    // Get last 10 messages for context
    const messages = this.messagesContainer.querySelectorAll('.chat-message');
    const recentMessages = Array.from(messages)
      .slice(-10)
      .map(msg => {
        const username = msg.querySelector('strong')?.textContent?.replace(':', '') || '';
        const text = msg.querySelector('.message-text')?.textContent || '';
        return `${username}: ${text}`;
      })
      .filter(msg => !msg.includes('Thinking...') && !msg.includes('❌'))
      .join('\n');

    // Create focused prompt
    return `You are a helpful financial markets assistant in a live chat. 
Answer briefly (1-2 sentences max) in a conversational tone.

Recent chat context:
${recentMessages}

Question: ${question}

Response:`;
  }

  /**
   * Call the AI API endpoint with proper error handling
   */
  async callAIAPI(prompt) {
    // ===== Rate Limit Check =====
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    // ===== Increment Request Counter =====
    this.aiConfig.rateLimit.requestCount++;

    // ===== Create Request with Timeout =====
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.aiConfig.timeout);

    try {
      console.log(`📤 Calling AI API: ${this.aiConfig.apiEndpoint}`);

      // ===== Make API Request =====
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

      // ===== Parse Response =====
      const data = await response.json();

      console.log('📥 API Response:', {
        status: response.status,
        success: data.success,
        hasReply: !!data.reply
      });

      // ===== Handle Error Responses =====
      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP ${response.status}`);
      }

      // ===== Validate Response Data =====
      if (!data.reply || typeof data.reply !== 'string') {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response format from AI');
      }

      // ===== Return Clean Response =====
      return data.reply.trim();

    } catch (error) {
      clearTimeout(timeoutId);

      // ===== Handle Different Error Types =====
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - AI took too long to respond');
      }

      if (error.message?.includes('fetch')) {
        throw new Error('Network error - unable to reach AI service');
      }

      // Re-throw with context
      throw error;
    }
  }

  /**
   * Check and manage rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if minute has passed
    if (now > this.aiConfig.rateLimit.resetTime) {
      this.aiConfig.rateLimit.requestCount = 0;
      this.aiConfig.rateLimit.resetTime = now + 60000;
    }

    // Check if under limit
    const allowed = this.aiConfig.rateLimit.requestCount < 
                    this.aiConfig.rateLimit.maxRequestsPerMinute;

    if (!allowed) {
      console.warn('⚠️ Rate limit reached');
    }

    return allowed;
  }

  /**
   * Add a message with a unique ID for later updates
   */
  addMessageWithId(id, username, text, isOwnMessage = false) {
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

    this.cleanupOldMessages();
  }

  /**
   * Update an existing message by ID
   */
  updateMessage(messageId, newText) {
    const messageDiv = this.messagesContainer.querySelector(
      `[data-message-id="${messageId}"]`
    );

    if (messageDiv) {
      const textSpan = messageDiv.querySelector('.message-text');
      if (textSpan) {
        textSpan.textContent = newText;
      }
    }
  }

  /**
   * Check if a message is likely a question
   */
  isQuestion(text) {
    const lowerText = text.toLowerCase();
    
    return text.includes('?') || 
           lowerText.startsWith('what') ||
           lowerText.startsWith('how') ||
           lowerText.startsWith('why') ||
           lowerText.startsWith('when') ||
           lowerText.startsWith('who') ||
           lowerText.startsWith('where') ||
           lowerText.startsWith('can') ||
           lowerText.startsWith('could') ||
           lowerText.startsWith('would') ||
           lowerText.startsWith('should') ||
           lowerText.startsWith('is') ||
           lowerText.startsWith('are') ||
           lowerText.startsWith('does') ||
           lowerText.startsWith('do');
  }

  /**
   * Get user-friendly error messages
   */
  getErrorMessage(error) {
    const message = error.message || '';

    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection error. Please check your internet.';
    }
    if (message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment.';
    }
    if (message.includes('authentication') || message.includes('API key')) {
      return 'Service configuration error.';
    }
    if (message.includes('quota')) {
      return 'Service quota exceeded. Please try later.';
    }

    return 'Something went wrong. Please try again.';
  }
}

// ===== Initialize AI Chat on Page Load =====
document.addEventListener('DOMContentLoaded', async function() {
  // ... your existing initialization code ...

  // Initialize AI-enhanced live chat with slight delay
  setTimeout(() => {
    try {
      window.chatInstance = new AIEnhancedLiveChat();
      console.log('✅ AI-Enhanced Live Chat initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI chat:', error);
      // Fallback to basic LiveChat
      window.chatInstance = new LiveChat();
      console.log('⚠️ Fallback to basic LiveChat');
    }
  }, 500);
});