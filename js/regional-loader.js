/**
 * regional-loader.js - COMPLETE Regional Page Loader (FIXED)
 * Handles: Australia, Europe, Asia, Americas, Africa (standard layout)
 * World page uses separate logic due to different layout
 */

// ===== Global Variables =====
let apiService = null;
let currentRegion = null;

// ===== Region Detection =====
function detectRegion() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('australia')) return 'australia';
    if (path.includes('europe')) return 'europe';
    if (path.includes('asia')) return 'asia';
    if (path.includes('americas')) return 'americas';
    if (path.includes('africa')) return 'africa';
    
    console.warn('⚠️ Could not detect region from URL:', path);
    return null;
}

// ===== API Call to Backend =====
async function fetchRegionalNews(region, pageSize = 20, page = 1) {
    try {
        console.log(`📡 Fetching news for ${region}...`);
        
        // Try Vercel serverless function first
        const response = await fetch('/api/regional-news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region,
                pageSize,
                page
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Received ${data.articles?.length || 0} articles from API`);
        
        return data;
        
    } catch (error) {
        console.error('❌ Regional news fetch error:', error);
        
        // Fallback: use direct API call
        console.log('🔄 Trying fallback with apiService...');
        return await fetchRegionalNewsFallback(region, pageSize);
    }
}

// ===== Fallback API Call (Direct) =====
async function fetchRegionalNewsFallback(region, pageSize = 20) {
    try {
        const query = getRegionalQuery(region);
        const result = await apiService.searchArticles(query, pageSize, 1);
        
        return {
            success: true,
            articles: result.articles || [],
            totalResults: result.totalResults || 0
        };
    } catch (error) {
        console.error('❌ Fallback also failed:', error);
        return {
            success: false,
            articles: getFallbackArticles(region),
            totalResults: 0
        };
    }
}

// ===== Get Region-Specific Search Query =====
function getRegionalQuery(region) {
    const queries = {
        australia: 'Australia Sydney Melbourne market finance economy ASX',
        africa: 'Africa Kenya Nigeria South Africa market finance economy',
        americas: 'Americas USA Canada Brazil Latin America market finance',
        asia: 'Asia China Japan India Singapore market finance economy',
        europe: 'Europe UK Germany France ECB market finance economy'
    };
    
    return queries[region.toLowerCase()] || 'finance market economy';
}

// ===== Render Main Story =====
async function renderMainStory(article, selector = '.main-story') {
    const mainStory = document.querySelector(selector);
    if (!mainStory) {
        console.warn('⚠️ Main story element not found:', selector);
        return;
    }
    
    const title = mainStory.querySelector('.main-story-title');
    const img = mainStory.querySelector('.main-img');
    const text = mainStory.querySelector('.main-story-text');
    const author = mainStory.querySelector('.main-story-author');
    
    // Generate article ID and store
    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);
    
    // Update content
    if (title) title.textContent = article.title || 'Untitled Article';
    
    if (img) {
        img.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
        img.alt = article.title || 'Article image';
        img.onerror = () => { 
            img.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'; 
        };
    }
    
    if (text) {
        text.textContent = article.description || article.content || 'Read full article for more details...';
    }
    
    if (author) {
        const authorName = article.author || 'Staff Writer';
        const sourceName = article.source?.name || 'The Financial Frontier';
        author.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
    }
    
    // Update link
    mainStory.href = `article.html?id=${articleId}`;
    
    console.log('✅ Main story rendered:', article.title?.substring(0, 50));
}

// ===== Render Substory =====
async function renderSubstory(substoryEl, article, isType2 = false) {
    if (!substoryEl) {
        console.warn('⚠️ Substory element not found');
        return;
    }
    
    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);
    
    const title = substoryEl.querySelector('.substory-title');
    const text = substoryEl.querySelector('.substory-text');
    
    if (title) title.textContent = article.title || 'Untitled Article';
    if (text) text.textContent = article.description || 'Read more...';
    
    if (isType2) {
        // Type 2: Text + square thumbnail layout
        const img = substoryEl.querySelector('.sub-img.square-right');
        const authorEl = substoryEl.querySelector('.substory-author-under');
        
        if (img) {
            img.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800';
            img.alt = article.title || 'Article thumbnail';
            img.onerror = () => { 
                img.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800'; 
            };
        }
        
        if (authorEl) {
            const authorName = article.author || 'Staff Writer';
            const sourceName = article.source?.name || 'Staff';
            authorEl.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
        }
    } else {
        // Type 1: Image on top layout
        const img = substoryEl.querySelector('.main-img');
        const authorEl = substoryEl.querySelector('.substory-author');
        
        if (img) {
            img.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800';
            img.alt = article.title || 'Article image';
            img.onerror = () => { 
                img.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'; 
            };
        }
        
        if (authorEl) {
            const authorName = article.author || 'Staff Writer';
            const sourceName = article.source?.name || 'Staff';
            authorEl.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
        }
    }
    
    // Update link
    substoryEl.href = `article.html?id=${articleId}`;
    
    console.log('✅ Substory rendered:', article.title?.substring(0, 40));
}

// ===== Render Articles List =====
function renderArticlesList(articles, containerSelector = '.article-wrapper') {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn('⚠️ Articles list container not found:', containerSelector);
        return;
    }
    
    if (!articles || articles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No additional articles available</p>';
        return;
    }
    
    container.innerHTML = articles.map(article => {
        const articleId = generateArticleId(article);
        storeArticleData(articleId, article);
        
        const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const imageUrl = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
        
        return `
            <a href="article.html?id=${articleId}" class="article">
                <img src="${imageUrl}" 
                     alt="${escapeHtml(article.title || 'Article')}" 
                     class="article-thumbnail"
                     onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'">
                <div class="article-text-block">
                    <p class="article-date">${date}</p>
                    <h5 class="article-title">${escapeHtml(article.title || 'Untitled')}</h5>
                    <p class="article-description">${escapeHtml(article.description || 'No description available')}</p>
                    <p class="article-author">By ${escapeHtml(article.author || 'Staff Writer')}</p>
                </div>
            </a>
        `;
    }).join('');
    
    console.log(`✅ Rendered ${articles.length} articles in list`);
}

// ===== Search Functionality =====
function setupSearchFunctionality() {
    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    
    if (!searchForm || !searchInput) {
        console.warn('⚠️ Search form not found');
        return;
    }
    
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const query = searchInput.value.trim();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        
        console.log(`🔍 Searching for: ${query}`);
        
        // Show loading state
        const storyGrid = document.querySelector('.story-grid');
        const articleWrapper = document.querySelector('.article-wrapper');
        
        if (storyGrid) {
            storyGrid.innerHTML = '<div style="padding: 40px; text-align: center;">Searching...</div>';
        }
        if (articleWrapper) {
            articleWrapper.innerHTML = '<div style="padding: 40px; text-align: center;">Loading results...</div>';
        }
        
        try {
            // Use apiService to search
            const result = await apiService.searchArticles(query, 20, 1);
            
            if (!result.articles || result.articles.length === 0) {
                showError('No articles found for your search');
                return;
            }
            
            console.log(`✅ Found ${result.articles.length} articles`);
            
            // Render search results
            await renderStandardRegionalLayout(result.articles);
            
            // Update ticker with search results
            updateNewsTicker(result.articles);
            
            // Show search results count
            const mainHeader = document.querySelector('.main-header h2');
            if (mainHeader) {
                mainHeader.textContent = `Search Results: "${query}" (${result.articles.length} found)`;
            }
            
        } catch (error) {
            console.error('❌ Search error:', error);
            showError('Search failed. Please try again.');
        }
    });
    
    console.log('✅ Search functionality enabled');
}

// ===== Load Regional Videos =====
async function loadRegionalVideos(region) {
    try {
        console.log(`🎬 Loading videos for ${region}...`);
        
        const videosWrapper = document.querySelector('.videos-wrapper');
        if (!videosWrapper) {
            console.log('📺 No videos wrapper found');
            return;
        }
        
        videosWrapper.innerHTML = '<div class="video-loading">Loading videos...</div>';
        
        const videoQuery = getRegionalVideoQuery(region);
        const videos = await apiService.searchVideos(videoQuery, 4);
        
        if (!videos || videos.length === 0) {
            throw new Error('No videos found');
        }
        
        renderRegionalVideos(videos, videosWrapper);
        console.log(`✅ Loaded ${videos.length} videos`);
        
    } catch (error) {
        console.error('❌ Video loading error:', error);
        handleVideoError(region);
    }
}

function getRegionalVideoQuery(region) {
    const queries = {
        australia: 'Australia finance market economy ASX news',
        africa: 'Africa finance market economy investment news',
        americas: 'Americas finance market economy USA news',
        asia: 'Asia finance market economy China Japan news',
        europe: 'Europe finance market economy ECB UK news'
    };
    
    return queries[region.toLowerCase()] || 'finance news';
}

function renderRegionalVideos(videos, container) {
    container.innerHTML = videos.map(video => `
        <a href="https://www.youtube.com/watch?v=${video.id}" class="video" target="_blank" rel="noopener">
            <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" class="video-thumbnail" loading="lazy">
            <h5 class="video-title">${escapeHtml(video.title)}</h5>
        </a>
    `).join('');
}

function handleVideoError(region) {
    const videosWrapper = document.querySelector('.videos-wrapper');
    if (!videosWrapper) return;
    
    videosWrapper.innerHTML = `
        <div class="video-error">
            <p>Videos temporarily unavailable</p>
        </div>
    `;
}

// ===== Store Article Data =====
function storeArticleData(articleId, article) {
    try {
        if (!articleId || !article || !article.title) {
            console.warn('⚠️ Invalid article data for storage');
            return false;
        }
        
        const articleData = {
            id: articleId,
            title: article.title,
            description: article.description || '',
            author: article.author || 'Staff Writer',
            source: article.source || { name: 'The Financial Frontier' },
            publishedAt: article.publishedAt || new Date().toISOString(),
            url: article.url || '#',
            urlToImage: article.urlToImage || article.image || '',
            content: article.content || article.description || ''
        };
        
        sessionStorage.setItem(`art_${articleId}`, JSON.stringify(articleData));
        return true;
        
    } catch (error) {
        console.error('❌ Error storing article:', error);
        return false;
    }
}

// ===== Generate Article ID =====
function generateArticleId(article) {
    try {
        const baseString = article.url || article.title || Date.now().toString();
        return btoa(baseString)
            .slice(0, 16)
            .replace(/[/+=]/g, match => {
                return { '/': '-', '+': '_', '=': '' }[match];
            });
    } catch {
        return 'article_' + Date.now();
    }
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function displayCurrentDate() {
    const dateElement = document.querySelector(".date");
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

function showError(message) {
    const storyGrid = document.querySelector('.story-grid');
    if (storyGrid) {
        storyGrid.innerHTML = `
            <div style="padding: 40px; text-align: center; color: crimson; grid-column: 1 / -1;">
                <h3>⚠️ ${escapeHtml(message)}</h3>
                <p style="color: #666;">Please try refreshing the page.</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 20px; padding: 10px 20px; background: crimson; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh
                </button>
            </div>
        `;
    }
}

function updateNewsTicker(articles) {
    const ticker = document.querySelector('#ticker-content');
    if (!ticker || !articles || articles.length === 0) return;
    
    const headlines = articles.slice(0, 5).map(a => a.title || 'Breaking News');
    ticker.textContent = headlines.join(' • ');
}

function getFallbackArticles(region) {
    const regionName = region.charAt(0).toUpperCase() + region.slice(1);
    return [
        {
            title: `${regionName} Markets Show Resilience Amid Global Uncertainty`,
            description: `Financial markets in ${regionName} demonstrated stability today as investors carefully monitor economic indicators and central bank policies.`,
            author: 'Financial Correspondent',
            source: { name: 'The Financial Frontier' },
            publishedAt: new Date().toISOString(),
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'
        },
        {
            title: `Economic Growth Projections for ${regionName} Remain Positive`,
            description: 'Economists forecast continued expansion despite headwinds from inflation and geopolitical tensions affecting the region.',
            author: 'Economic Analyst',
            source: { name: 'The Financial Frontier' },
            publishedAt: new Date().toISOString(),
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800'
        },
        {
            title: `${regionName} Central Bank Maintains Current Policy Stance`,
            description: 'Regional monetary authorities signal patience in adjusting interest rates as they assess ongoing economic conditions.',
            author: 'Policy Reporter',
            source: { name: 'The Financial Frontier' },
            publishedAt: new Date().toISOString(),
            url: '#',
            urlToImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
        }
    ];
}

// ===== Auto-Refresh Setup =====
function setUpAutoRefresh(region) {
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
    
    setInterval(() => {
        console.log('🔄 Auto-refreshing regional data...');
        apiService.clearCache();
        loadRegionalContent(region);
    }, REFRESH_INTERVAL);
    
    console.log('✓ Auto-refresh enabled (10 minutes)');
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Regional page initializing...');
    
    try {
        // Check if API_CONFIG exists
        if (typeof API_CONFIG === 'undefined') {
            throw new Error('API_CONFIG not found. Make sure config.js is loaded first.');
        }
        
        // Check if APIService exists
        if (typeof APIService === 'undefined') {
            throw new Error('APIService not found. Make sure api-service.js is loaded first.');
        }
        
        // Create service instance
        apiService = new APIService(API_CONFIG);
        
        // Detect region
        currentRegion = detectRegion();
        console.log(`📍 Detected region: ${currentRegion}`);
        
        if (!currentRegion) {
            throw new Error('Could not detect region from URL');
        }
        
        // Display date
        displayCurrentDate();
        
        // Setup search functionality
        setupSearchFunctionality();
        
        // Load content
        await loadRegionalContent(currentRegion);
        
        // Setup auto-refresh
        setUpAutoRefresh(currentRegion);
        
        console.log('✅ Regional page fully loaded and functional');
        
    } catch (error) {
        console.error('❌ Regional page initialization error:', error);
        showError(error.message || 'Failed to initialize page');
    }
});

// ===== Load All Regional Content =====
// ===== Load All Regional Content =====
async function loadRegionalContent(region) {
  try {
    console.log(`📰 Loading content for ${region}...`);

    // ✅ FIX: Don't destroy the HTML structure - just show loading in place
    const mainTitle = document.querySelector('.main-story-title');
    const substory1Title = document.querySelector('.substory-1 .substory-title');
    const substory2Title = document.querySelector('.substory-2 .substory-title');
    
    if (mainTitle) mainTitle.textContent = 'Loading news...';
    if (substory1Title) substory1Title.textContent = 'Loading...';
    if (substory2Title) substory2Title.textContent = 'Loading...';

    // Fetch articles
    const newsData = await fetchRegionalNews(region, 20, 1);

    if (!newsData.success || !newsData.articles || newsData.articles.length === 0) {
      throw new Error('No articles found for this region');
    }

    console.log(`✅ Received ${newsData.articles.length} articles`);

    // Filter out articles without titles
    const validArticles = newsData.articles.filter(article => article && article.title);

    if (validArticles.length === 0) {
      throw new Error('No valid articles found');
    }

    // Render content - NOW the elements will exist!
    await renderStandardRegionalLayout(validArticles);

    // Update news ticker
    updateNewsTicker(validArticles);

    // Load videos (parallel, non-blocking)
    loadRegionalVideos(region).catch(err => 
      console.warn('⚠️ Video loading failed (non-critical):', err)
    );

    console.log('✅ All content loaded successfully');

  } catch (error) {
    console.error('❌ Content loading error:', error);
    showError(error.message || 'Unable to load content. Please try again.');
  }
}

// ===== Render Standard Regional Layout =====
// ===== Render Standard Regional Layout =====
async function renderStandardRegionalLayout(articles) {
  console.log('🏗️ Rendering Standard Regional layout');

  // Ensure we have enough articles
  if (articles.length < 3) {
    console.warn('⚠️ Not enough articles for full layout, using fallback');
    const fallback = getFallbackArticles(currentRegion || 'australia');
    articles = [...articles, ...fallback].slice(0, 7);
  }

  // Render main story
  await renderMainStory(articles[0]);

  // Render substory 1
  const substory1 = document.querySelector('.substory-1');
  if (substory1 && articles[1]) {
    await renderSubstory(substory1, articles[1], false);
  }

  // Render substory 2
  const substory2 = document.querySelector('.substory-2');
  if (substory2 && articles[2]) {
    await renderSubstory(substory2, articles[2], true);
  }

  // Render additional articles
  const additionalArticles = articles.slice(3, 11);
  renderArticlesList(additionalArticles);

  console.log('✅ Standard layout rendered successfully');
}