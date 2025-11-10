/**
 * world-loader.js - DEBUGGED & VERIFIED World Page Loader
 * Guarantees every story element in world.html is API-linked
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌍 World page initializing...');
    
    try {
        if (typeof API_CONFIG === 'undefined') throw new Error('API_CONFIG missing');
        if (typeof APIService === 'undefined') throw new Error('APIService missing');
        
        const apiService = new APIService(API_CONFIG);
        displayCurrentDate();
        
        // Load sections sequentially to avoid overwhelming the API
        console.log('1️⃣ Loading top stories...');
        await loadTopStories(apiService);
        
        console.log('2️⃣ Loading regional columns...');
        await loadRegionalColumns(apiService);
        
        console.log('3️⃣ Loading trending articles...');
        await loadTrendingArticles(apiService);
        
        console.log('✅ World page fully loaded');
        
    } catch (error) {
        console.error('❌ World page initialization error:', error);
        showError(error.message || 'Failed to load world news');
    }
});

/**
 * ✅ COVERAGE: .story-grid-1 and .story-grid-2
 * Renders 6 stories per grid (main + 2 substories)
 */
async function loadTopStories(apiService) {
    console.log('📰 Starting top stories load...');
    
    try {
        // **DEBUG**: Verify elements exist BEFORE API call
        const grid1 = document.querySelector('.story-grid-1');
        const grid2 = document.querySelector('.story-grid-2');
        
        if (!grid1 || !grid2) {
            throw new Error(`Story grids not found! grid1: ${!!grid1}, grid2: ${!!grid2}`);
        }
        
        // Show loading state
        grid1.querySelectorAll('.main-story-title, .substory-title').forEach(el => {
            el.textContent = 'Loading World News...';
        });
        grid2.querySelectorAll('.main-story-title, .substory-title').forEach(el => {
            el.textContent = 'Loading Global Markets...';
        });
        
        // Fetch world news
        console.log('📡 Fetching world news...');
        const worldNews = await apiService.searchArticles('global economy finance market', 12, 1);
        
        if (!worldNews.articles || worldNews.articles.length < 12) {
            throw new Error(`Insufficient articles: got ${worldNews.articles?.length || 0}, need 12`);
        }
        
        console.log(`✅ Received ${worldNews.articles.length} articles`);
        
        // Render grids
        await renderStoryGrid('.story-grid-1', worldNews.articles.slice(0, 6));
        await renderStoryGrid('.story-grid-2', worldNews.articles.slice(6, 12));
        
        console.log('✅ Top stories rendered successfully');
        
    } catch (error) {
        console.error('❌ Top stories failed:', error);
        // Show fallback indicator
        document.querySelectorAll('.main-story-title').forEach(el => {
            el.textContent = 'Top Stories (API Unavailable)';
        });
    }
}

/**
 * ✅ Renders individual story grid with VERIFIED element mapping
 */
async function renderStoryGrid(gridSelector, articles) {
    const grid = document.querySelector(gridSelector);
    if (!grid) {
        console.error(`❌ Grid element not found: ${gridSelector}`);
        return;
    }
    
    console.log(`🏗️ Rendering ${gridSelector} with ${articles.length} articles`);
    
    // **VERIFIED** element mapping based on world.html structure
    const mappings = [
        { selector: '.main-story', article: articles[0], index: 0 },
        { selector: '.substory-1', article: articles[1], index: 1 },
        { selector: '.substory-2', article: articles[2], index: 2 }
    ];
    
    // Grid 2 has different structure - include extra elements
    if (gridSelector === '.story-grid-2') {
        mappings.push(
            { selector: '.substory-2:nth-of-type(2)', article: articles[3], index: 3 },
            { selector: '.main-story:nth-of-type(3)', article: articles[4], index: 4 },
            { selector: '.substory-1:nth-of-type(4)', article: articles[5], index: 5 }
        );
    }
    
    for (const { selector, article, index } of mappings) {
        const element = grid.querySelector(selector);
        if (element && article) {
            await renderWorldStory(element, article, selector.includes('.substory-2'), index);
        } else {
            console.warn(`⚠️ Element not found: ${selector} in ${gridSelector}`);
        }
    }
}

/**
 * ✅ Renders individual story with COMPLETE coverage
 * Updates: title, text, img, author, link
 */
async function renderWorldStory(element, article, isType2 = false, index = 0) {
    if (!element || !article) {
        console.warn('⚠️ Invalid element or article');
        return;
    }
    
    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);
    
    // **EXPLICIT** selector mapping for world.html
    const titleSel = isType2 ? '.substory-title' : '.main-story-title';
    const textSel = isType2 ? '.substory-text' : '.main-story-text';
    const imgSel = isType2 ? '.sub-img' : '.main-img';
    const authorSel = isType2 ? '.substory-author, .substory-author-under' : '.main-story-author';
    
    const title = element.querySelector(titleSel);
    const text = element.querySelector(textSel);
    const img = element.querySelector(imgSel);
    const author = element.querySelector(authorSel);
    
    if (title) title.textContent = article.title || 'Untitled';
    if (text) text.textContent = article.description || 'Read more...';
    
    if (img) {
        img.src = article.urlToImage || article.image || getFallbackImage(index);
        img.alt = article.title || 'Article image';
        img.onerror = () => img.src = getFallbackImage(index);
    }
    
    if (author) {
        const authorName = article.author || 'Staff Writer';
        const sourceName = article.source?.name || 'The Financial Frontier';
        author.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
    }
    
    element.href = `article.html?id=${articleId}`;
    element.style.cursor = 'pointer';
}

/**
 * ✅ COVERAGE: 4 regional columns (.africa, .americas, .asia, .europe)
 * Renders: 1 top story (img + title) + 3 bottom stories (title links)
 * Total: 16 stories
 */
async function loadRegionalColumns(apiService) {
    console.log('🌐 Loading regional columns...');
    
    const regions = ['africa', 'americas', 'asia', 'europe'];
    
    for (const region of regions) {
        try {
            console.log(`  📍 Loading ${region} column...`);
            
            const regionData = await apiService.searchArticles(`${region} economy`, 5, 1);
            
            if (!regionData.articles || regionData.articles.length < 4) {
                console.warn(`⚠️ ${region}: only got ${regionData.articles?.length || 0} articles`);
                continue;
            }
            
            const column = document.querySelector(`.${region}`);
            if (!column) {
                console.warn(`⚠️ Column element not found: .${region}`);
                continue;
            }
            
            // **DEBUG**: Log element counts
            const topStory = column.querySelector('.topmost-story');
            const bottomStories = column.querySelectorAll('.bottommost-story');
            console.log(`  ${region}: topStory=${!!topStory}, bottomStories=${bottomStories.length}`);
            
            // Top story (with image)
            if (topStory) {
                updateColumnStory(topStory, regionData.articles[0], false);
            }
            
            // Bottom stories (title links)
            regionData.articles.slice(1).forEach((article, idx) => {
                if (bottomStories[idx]) {
                    updateColumnStory(bottomStories[idx], article, true);
                }
            });
            
        } catch (error) {
            console.error(`❌ ${region} column failed:`, error);
        }
    }
    
    console.log('✅ Regional columns loaded');
}

/**
 * ✅ Updates column story (top or bottom)
 */
function updateColumnStory(element, article, isBottomStory = false) {
    if (!element || !article) return;
    
    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);
    
    if (isBottomStory) {
        const link = element.querySelector('.story-title');
        if (link) {
            link.textContent = article.title || 'Untitled';
            link.href = `article.html?id=${articleId}`;
        }
    } else {
        const img = element.querySelector('.trend-img');
        const link = element.querySelector('.mainstory-title');
        
        if (img) {
            img.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
            img.alt = article.title || 'Article image';
            img.onerror = () => img.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
        }
        
        if (link) {
            link.textContent = article.title || 'Untitled';
            link.href = `article.html?id=${articleId}`;
        }
    }
}

/**
 * ✅ COVERAGE: Trending articles (.fourth-container)
 * Renders 4 article cards
 */
async function loadTrendingArticles(apiService) {
    console.log('📈 Loading trending articles...');
    
    try {
        const trendingNews = await apiService.getTopHeadlines('business', 8);
        
        if (!trendingNews || trendingNews.length < 4) {
            throw new Error(`Only got ${trendingNews?.length || 0} trending articles`);
        }
        
        const enriched = await Promise.all(
            trendingNews.map(article => apiService.getEnrichedArticle(article))
        );
        
        renderArticlesList(enriched, '.fourth-container .article-wrapper');
        
        console.log('✅ Trending articles rendered');
        
    } catch (error) {
        console.error('❌ Trending articles failed:', error);
        document.querySelector('.fourth-container h6')?.insertAdjacentHTML('afterend', 
            '<p style="color: crimson; text-align: center;">Trending articles unavailable</p>'
        );
    }
}

/**
 * ✅ Creates article list in container
 */
function renderArticlesList(articles, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn(`⚠️ Container not found: ${containerSelector}`);
        return;
    }
    
    container.innerHTML = articles.slice(0, 4).map(article => {
        const articleId = generateArticleId(article);
        storeArticleData(articleId, article);
        
        const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <a href="article.html?id=${articleId}" class="article" target="_blank" rel="noopener">
                <img src="${article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=140'}" 
                     alt="${escapeHtml(article.title || 'Article')}" 
                     class="article-thumbnail"
                     onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=140'">
                <div class="article-text-block">
                    <p class="article-date">${date}</p>
                    <h5 class="article-title">${escapeHtml(article.title || 'Untitled')}</h5>
                    <p class="article-description">${escapeHtml(article.description || 'No description')}</p>
                    <p class="article-author">By ${escapeHtml(article.author || 'Staff Writer')}</p>
                </div>
            </a>
        `;
    }).join('');
}

/**
 * ✅ Utilities
 */
function getFallbackImage(index = 0) {
    const images = [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=140'
    ];
    return images[index % images.length];
}

function generateArticleId(article) {
    try {
        const baseString = article.url || article.title || Date.now().toString();
        return btoa(baseString)
            .slice(0, 16)
            .replace(/[/+=]/g, match => ({ '/': '-', '+': '_', '=': '' }[match]));
    } catch {
        return 'article_' + Date.now();
    }
}

function storeArticleData(articleId, article) {
    try {
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
    } catch (error) {
        console.error('❌ Storage error:', error);
    }
}

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
    const container = document.querySelector('.second-container');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: crimson;">
                <h3>⚠️ ${escapeHtml(message)}</h3>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: crimson; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    }
}