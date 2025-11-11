// ===== Navigation Button Functionality =====
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove "active" class from all buttons and sections
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        // Add "active" to clicked button and corresponding section
        button.classList.add('active');
        const targetId = button.dataset.target; // get target section id
        document.getElementById(targetId).classList.add('active');
    });
});


// ===== Stock Exchange Live Data =====
document.addEventListener("DOMContentLoaded", function() {

    // Display current date in the format: Month Day, Year
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

            // Remove "active" from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add "active" to clicked button and target section
            button.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Stock Exchange API Integration
    const API_KEY = 'A013U359DE2M782C'; // Get free key from alphavantage.co
    const USE_DEMO_DATA = false;        // Set true to use demo data for testing

    // List of stock symbols to display
    const stockSymbols = ['SPY', 'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'GLD'];

    // Generate demo stock data with random price fluctuations
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

            const price = basePrice[symbol] + (Math.random() - 0.5) * 10; // small random fluctuation
            const change = (Math.random() - 0.5) * 5; // change in price
            return {
                symbol: symbol,
                price: price.toFixed(2),
                change: change.toFixed(2),
                changePercent: ((change / price) * 100).toFixed(2)
            };
        });
    }

    // Update the stock ticker with either demo or real API data
    function updateStockTicker() {
        const tickerContainer = document.getElementById('stock-ticker');
        if (!tickerContainer) return;

        if (USE_DEMO_DATA) {
            // Use demo data for development/testing
            const stockData = generateDemoStockData();
            displayStocks(stockData);
        } else {
            // Fetch real data from API
            fetchRealStockData().then(data => {
                displayStocks(data);
            });
        }

        // Update the "last updated" timestamp
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            const now = new Date();
            lastUpdated.textContent = `Updated: ${now.toLocaleTimeString()}`;
        }
    }

    // Render the stock ticker HTML
    function displayStocks(stockData) {
        const tickerContainer = document.getElementById('stock-ticker');

        // Duplicate data for infinite scroll effect
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

    // Fetch real stock data from Alpha Vantage API
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

    // Initial stock ticker update and auto-refresh every 10 seconds
    updateStockTicker();
    setInterval(updateStockTicker, 10000);
});


// ===== Thread Forum Functionality =====
import { getAllThreads, addThread } from './persist.js';

// Build HTML card for a single thread
function buildCard(t) {
    return `
    <a href="thread.html?id=${t.id}" class="thread-card">
        <div class="thread-header">
            <h5 class="thread-title">${t.title}</h5>
            <i class="fa-solid fa-message"></i>
        </div>
        <p class="thread-blurb">${t.content}</p>
        <span class="thread-reply">${t.replies} replies</span>
        <span class="thread-meta">·</span>
        <span class="thread-time">last post ${t.lastPost}</span>
        <span class="thread-meta">·</span>
        <span class="thread-author">${t.author}</span>
    </a>`;
}

// Render all threads in the container
function renderThreads() {
    const container = document.querySelector('#news .tab-content');
    container.innerHTML = ''; // Clear previous static placeholders
    getAllThreads().forEach(t => container.insertAdjacentHTML('beforeend', buildCard(t)));
}

// Handle new thread form submission
document.getElementById('new-thread-form').addEventListener('submit', e => {
    e.preventDefault(); // Prevent page reload

    const title   = document.getElementById('new-thread-title').value.trim();
    const author  = document.getElementById('new-thread-name').value.trim();
    const content = document.getElementById('new-thread-content').value.trim();

    if (!title || !author || !content) return; // Validate input

    addThread({ title, author, content }); // Save thread
    e.target.reset();                     // Reset form fields
    renderThreads();                       // Immediately show new thread

    // Optionally switch to the "News" tab after adding a thread
    document.querySelector('[data-target="news"]').click();
});

// Initial rendering of threads on page load
renderThreads();
