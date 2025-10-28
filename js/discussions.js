const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('section');

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove "active" from all buttons and sections
      navButtons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      // Add "active" to clicked button and corresponding section
      button.classList.add('active');
      const targetId = button.dataset.target;
      document.getElementById(targetId).classList.add('active');
    });
  });


  // Stock Exchange Live Data
document.addEventListener("DOMContentLoaded", function() {
    // Display current date
    const dateElement = document.querySelector(".date");
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    // Tab switching functionality
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Stock Exchange API Integration
    const API_KEY = 'A013U359DE2M782C'; // Get free key from alphavantage.co
    const USE_DEMO_DATA = false; 
    
    const stockSymbols = ['SPY', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'GLD'];
    
    // Demo data for development (remove when using real API)
    function generateDemoStockData() {
        return stockSymbols.map(symbol => {
            const basePrice = {
                'SPY': 450.25,
                'AAPL': 178.50,
                'MSFT': 375.80,
                'GOOGL': 142.30,
                'TSLA': 242.15,
                'NVDA': 495.60,
                'BTC-USD': 43250.00,
                'GLD': 185.90
            };
            
            const price = basePrice[symbol] + (Math.random() - 0.5) * 10;
            const change = (Math.random() - 0.5) * 5;
            
            return {
                symbol: symbol,
                price: price.toFixed(2),
                change: change.toFixed(2),
                changePercent: ((change / price) * 100).toFixed(2)
            };
        });
    }

    function updateStockTicker() {
        const tickerContainer = document.getElementById('stock-ticker');
        if (!tickerContainer) return;

        let stockData;
        
        if (USE_DEMO_DATA) {
            // Use demo data
            stockData = generateDemoStockData();
            displayStocks(stockData);
        } else {
            // Use real API (requires API key)
            fetchRealStockData().then(data => {
                displayStocks(data);
            });
        }

        // Update last updated time
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            const now = new Date();
            lastUpdated.textContent = `Updated: ${now.toLocaleTimeString()}`;
        }
    }

    function displayStocks(stockData) {
        const tickerContainer = document.getElementById('stock-ticker');
        
        // Duplicate stocks for seamless infinite scroll
        const duplicatedData = [...stockData, ...stockData];
        
        tickerContainer.innerHTML = duplicatedData.map(stock => {
            const changeClass = parseFloat(stock.changePercent) > 0 ? 'positive' : 
                               parseFloat(stock.changePercent) < 0 ? 'negative' : 'neutral';
            const changeSign = parseFloat(stock.changePercent) > 0 ? '+' : '';
            
            return `
                <div class="stock-item">
                    <span class="stock-symbol">${stock.symbol}</span>
                    <span class="stock-price">$${stock.price}</span>
                    <span class="stock-change ${changeClass}">
                        ${changeSign}${stock.changePercent}%
                    </span>
                </div>
            `;
        }).join('');
    }

    // Real API function (uncomment and use when you have API key)
    async function fetchRealStockData() {
        const promises = stockSymbols.map(async (symbol) => {
            try {
                const response = await fetch(
                    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
                );
                const data = await response.json();
                const quote = data['Global Quote'];
                
                return {
                    symbol: symbol,
                    price: parseFloat(quote['05. price']).toFixed(2),
                    change: parseFloat(quote['09. change']).toFixed(2),
                    changePercent: parseFloat(quote['10. change percent'].replace('%', '')).toFixed(2)
                };
            } catch (error) {
                console.error(`Error fetching ${symbol}:`, error);
                return null;
            }
        });
        
        const results = await Promise.all(promises);
        return results.filter(r => r !== null);
    }

    // Initialize and update every 10 seconds
    updateStockTicker();
    setInterval(updateStockTicker, 10000); // Update every 10 seconds
});

