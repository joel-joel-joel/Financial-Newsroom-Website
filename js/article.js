// Sample article database
const articlesDatabase = {
    1: {
        title: "Fed Decision Looms—What's Priced In?",
        author: "Sarah Chen",
        date: "November 5, 2025",
        category: "Markets",
        excerpt: "Markets are split on whether the Federal Reserve will cut rates by 25 or 50 basis points. Here's what traders are betting on.",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
        imageCaption: "Stock market trading floor",
        content: `
            <p>The Federal Reserve's upcoming decision has markets on edge, with traders and analysts deeply divided on the magnitude of the expected rate cut. As inflation continues to cool and economic data suggests weakening growth, the central bank faces pressure from multiple directions.</p>

            <h2>Market Expectations</h2>
            <p>Current pricing suggests a 70% probability of a 25-basis-point cut, while 30% of traders are betting on a more aggressive 50-basis-point reduction. This split reflects broader uncertainty about the Fed's assessment of economic conditions.</p>
            
            <p>Investment banks have been divided in their guidance. Some argue that a 50-basis-point cut would signal heightened concern about a potential recession, while others maintain that such a move would be premature given the still-resilient labor market.</p>

            <h2>Key Economic Indicators</h2>
            <p>Several factors will influence the Fed's decision:</p>
            <ul>
                <li><strong>Inflation data:</strong> Recent CPI prints show cooling headline inflation at 3.2% year-over-year</li>
                <li><strong>Employment:</strong> The unemployment rate ticked up to 4.1%, signaling loosening labor conditions</li>
                <li><strong>GDP growth:</strong> Q3 GDP came in at 2.1%, below expectations</li>
                <li><strong>Core inflation:</strong> Remains sticky at 3.8%, a key concern for Fed officials</li>
            </ul>

            <h2>Market Positioning</h2>
            <p>Large hedge funds and asset managers have been hedging their equity exposure ahead of the announcement. Volatility indices have spiked to levels not seen since August, indicating elevated uncertainty.</p>

            <blockquote>
                "This is a data-dependent decision, and the data has been mixed. We're likely to see significant market reaction either way," says Michael Rodriguez, Chief Strategist at Goldman Sachs.
            </blockquote>

            <h2>What Happens Next?</h2>
            <p>Regardless of the outcome, the Fed's guidance will be crucial. Markets are watching not just for the immediate decision, but for signals about future policy paths. A hawkish hold or a dovish cut could dramatically reshape asset allocation strategies heading into year-end.</p>
        `,
        related: [2, 3, 4]
    },
    2: {
        title: "Oil Volatility Returns",
        author: "James Patterson",
        date: "November 4, 2025",
        category: "Commodities",
        excerpt: "Geopolitical tensions are pushing crude oil toward the $90 mark, reshaping energy market dynamics.",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
        imageCaption: "Oil refinery at sunset",
        content: `
            <p>After months of relative stability, the oil market is showing renewed volatility as geopolitical risks resurface and supply concerns take center stage. West Texas Intermediate crude has climbed to $89.50 a barrel, up 8% from lows seen earlier this year.</p>

            <h2>Supply Pressures</h2>
            <p>Key production regions are facing disruptions. Maintenance schedules in the North Sea and production concerns in West Africa are tightening global supplies at a time when demand remains resilient.</p>

            <h2>Demand Outlook</h2>
            <p>Despite economic headwinds, demand destruction has been limited so far. Global aviation fuels and gasoline consumption remain elevated, supporting prices.</p>

            <blockquote>
                "We're in a fragile equilibrium. If supply disruptions worsen or demand holds up, we could see a breach of $90 sooner than expected," notes Emma Whitmore, Energy Analyst at Morgan Stanley.
            </blockquote>

            <p>Energy sector stocks have benefited from the rally, with integrated oil companies showing particular strength.</p>
        `,
        related: [1, 5]
    },
    3: {
        title: "Tech Stocks Rally on AI Optimism",
        author: "David Wong",
        date: "November 3, 2025",
        category: "Technology",
        excerpt: "Artificial intelligence enthusiasm is driving a new wave of investor interest in mega-cap technology stocks.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop",
        imageCaption: "Technology innovation",
        content: `
            <p>The technology sector is experiencing renewed momentum as investors gain confidence in the profitability potential of artificial intelligence investments. The Nasdaq-100 has gained 5% over the past week, with mega-cap tech stocks leading the charge.</p>

            <h2>AI Earnings Surprises</h2>
            <p>Several major technology companies have reported better-than-expected earnings, attributing growth to enterprise AI adoption and cloud infrastructure expansion.</p>

            <h2>Valuation Concerns</h2>
            <p>Despite strong fundamentals, some analysts warn that valuations remain stretched on a forward earnings basis. The risk-reward scenario depends heavily on sustained AI adoption rates and management execution.</p>

            <p>Smaller cap technology stocks, however, remain under pressure as investors rotate toward proven business models and profitability.</p>
        `,
        related: [1, 4]
    },
    4: {
        title: "Corporate Earnings Beat Expectations",
        author: "Lisa Anderson",
        date: "November 2, 2025",
        category: "Earnings",
        excerpt: "Third-quarter earnings season concludes with better-than-expected results from major corporations.",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
        imageCaption: "Financial charts and data",
        content: `
            <p>As the third-quarter earnings season winds down, the data shows a resilient corporate environment with companies delivering stronger-than-expected results across multiple sectors.</p>

            <h2>Key Takeaways</h2>
            <ul>
                <li>78% of S&P 500 companies beat earnings estimates</li>
                <li>Revenue guidance for Q4 remains cautiously optimistic</li>
                <li>Margin expansion continued for most sectors</li>
            </ul>

            <p>Companies have largely managed cost pressures effectively, enabling stronger-than-expected profitability despite economic headwinds.</p>
        `,
        related: [3, 5]
    },
    5: {
        title: "Bond Markets Signal Shifting Rate Expectations",
        author: "Robert Chen",
        date: "November 1, 2025",
        category: "Fixed Income",
        excerpt: "Treasury yields are declining as markets price in potential Fed policy shifts.",
        image: "https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=800&h=400&fit=crop",
        imageCaption: "Market data visualization",
        content: `
            <p>Bond markets are recalibrating expectations for Federal Reserve policy, with 10-year Treasury yields falling to 3.8% from recent highs above 4.2%. This shift reflects growing market expectations for policy easing.</p>

            <h2>Yield Curve Dynamics</h2>
            <p>The 2-10 year spread has continued to compress, though the curve remains inverted—a signal closely watched by recession-watchers.</p>

            <p>Investment-grade corporate spreads have tightened modestly as risk sentiment improves on the back of better-than-expected earnings.</p>
        `,
        related: [1, 2]
    }
};

// Get article ID from URL
function getArticleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '1';
}

// Display current date
function displayDate() {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = today;
}

// Load and display article
function loadArticle() {
    const articleId = getArticleId();
    const article = articlesDatabase[articleId];

    if (!article) {
        document.querySelector('.article-title').textContent = 'Article not found';
        return;
    }

    // Update page title
    document.title = `${article.title} - The Financial Frontier`;

    // Populate article header
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-author').textContent = article.author;
    document.getElementById('article-date').textContent = article.date;
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-excerpt').textContent = article.excerpt;

    // Populate image
    document.getElementById('article-image').src = article.image;
    document.getElementById('article-image').alt = article.imageCaption;
    document.getElementById('image-caption').textContent = article.imageCaption;

    // Populate article body
    document.getElementById('article-body').innerHTML = article.content;

    // Load related articles
    loadRelatedArticles(article.related);
}

// Load related articles
function loadRelatedArticles(relatedIds) {
    const relatedGrid = document.getElementById('related-grid');
    relatedGrid.innerHTML = '';

    relatedIds.forEach(id => {
        const article = articlesDatabase[id];
        if (article) {
            const card = document.createElement('a');
            card.href = `article.html?id=${id}`;
            card.className = 'related-card';
            
            card.innerHTML = `
                <img src="${article.image}" alt="${article.title}" class="related-card-image">
                <div class="related-card-content">
                    <div class="related-card-title">${article.title}</div>
                    <div class="related-card-excerpt">${article.excerpt}</div>
                    <div class="related-card-date">${article.date}</div>
                </div>
            `;
            
            relatedGrid.appendChild(card);
        }
    });
}

// Handle share buttons
function setupShareButtons() {
    const title = document.getElementById('article-title').textContent;
    const url = window.location.href;

    document.querySelector('.share-btn.facebook').addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });

    document.querySelector('.share-btn.twitter').addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    });

    document.querySelector('.share-btn.linkedin').addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    });

    document.querySelector('.share-btn.email').addEventListener('click', () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    displayDate();
    loadArticle();
    setupShareButtons();
});