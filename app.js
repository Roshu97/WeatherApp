/**
 * Weather App - JavaScript Application
 * Fetches real-time weather data from OpenWeatherMap API
 * Provides interactive UI with temperature unit conversion
 * Includes Air Quality Index (AQI) data
 */

// ============ CONFIGURATION ============
const API_KEY = '8cdab3da013f0f5842b2eeae466dc39d'; 
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const AQI_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const DELAY_THRESHOLD = 5000; // milliseconds
let lastSearchTime = 0;

// ============ DOM ELEMENTS ============
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const loadingEl = document.getElementById('loading');
const errorContainer = document.getElementById('errorContainer');
const errorText = document.getElementById('errorText');
const weatherDisplay = document.getElementById('weatherDisplay');
const welcomeMessage = document.getElementById('welcomeMessage');
const unitToggle = document.getElementById('unitToggle');
const unitLabel = document.getElementById('unitLabel');
const unitSymbol = document.getElementById('unitSymbol');

// ============ STATE ============
let isCelsius = true;
let currentWeatherData = null;

// ============ EVENT LISTENERS ============
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
geoBtn.addEventListener('click', handleGeolocation);
unitToggle.addEventListener('change', toggleTemperatureUnit);

// ============ MAIN FUNCTIONS ============

/**
 * Handles the search functionality
 */
async function handleSearch() {
    const city = searchInput.value.trim();

    // Validation
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('API key is not configured. Please add your OpenWeatherMap API key to the app.js file');
        return;
    }

    // Throttle requests to prevent excessive API calls
    const currentTime = Date.now();
    if (currentTime - lastSearchTime < DELAY_THRESHOLD) {
        showError('Please wait a moment before searching again');
        return;
    }
    lastSearchTime = currentTime;

    // Show loading and clear previous errors
    hideError();
    showLoading(true);

    try {
        // Try to get weather directly using city name (alternative method)
        const weatherData = await fetchWeatherByCityName(city);
        
        // Display weather data
        displayWeather(weatherData);
        searchInput.value = '';
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Fetches weather data directly by city name (alternative method)
 * This method uses the direct city parameter instead of geocoding
 */
async function fetchWeatherByCityName(cityName) {
    try {
        const directUrl = `${API_BASE_URL}?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`;
        console.log('🌍 Direct city search for:', cityName);
        console.log('📡 URL:', directUrl);
        
        const response = await fetch(directUrl);
        console.log('📬 Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ API Key Error - 401');
                throw new Error('Invalid API key. Please verify your OpenWeatherMap API key.');
            } else if (response.status === 404) {
                console.log('⚠️ City not found');
                throw new Error(`City "${cityName}" not found. Please check the spelling and try again.`);
            } else if (response.status === 429) {
                console.error('❌ Rate limit exceeded');
                throw new Error('Too many requests. Please wait a moment and try again.');
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Weather data received:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Direct search error:', error);
        throw error;
    }
}

/**
 * Gets coordinates for a city using geocoding API
 */
async function getCoordinatesFromCity(cityName) {
    try {
        const geocodingUrl = `${GEOCODING_URL}?name=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;
        console.log('🔍 Geocoding request for:', cityName);
        console.log('📡 URL:', geocodingUrl);
        
        const response = await fetch(geocodingUrl);
        console.log('📬 Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ API Key Error - 401');
                throw new Error('Invalid API key. Please verify your OpenWeatherMap API key is correct and has Geocoding API enabled.');
            } else if (response.status === 404) {
                console.log('⚠️ City not found (404)');
                return null;
            }
            console.error('❌ HTTP Error:', response.status);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Geocoding response:', data);

        if (!data || data.length === 0) {
            console.log('⚠️ No results found for city:', cityName);
            return null;
        }

        const result = {
            lat: data[0].lat,
            lon: data[0].lon,
            city: data[0].name,
            country: data[0].country
        };
        
        console.log('📍 Coordinates found:', result);
        return result;
    } catch (error) {
        console.error('❌ Geocoding error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid API key')) {
            throw error;
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to reach the API. Please check your internet connection.');
        }
        throw new Error(`Unable to locate "${cityName}". Please check the spelling or try another city.`);
    }
}

/**
 * Fetches weather data using coordinates
 */
async function fetchWeatherData(lat, lon) {
    try {
        const weatherUrl = `${API_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        console.log('Weather request:', weatherUrl);
        
        const response = await fetch(weatherUrl);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please verify your OpenWeatherMap API key.');
            } else if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            }
            throw new Error(`Failed to fetch weather: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather response:', data);
        return data;
    } catch (error) {
        console.error('Weather fetch error:', error);
        throw error;
    }
}

/**
 * Handles geolocation to get current location weather
 */
function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('API key is not configured');
        return;
    }

    showLoading(true);
    hideError();

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
            showLoading(false);
            handleGeolocationError(error);
        }
    );
}

/**
 * Fetches weather by coordinates
 */
async function getWeatherByCoordinates(lat, lon) {
    try {
        const weatherData = await fetchWeatherData(lat, lon);
        displayWeather(weatherData);
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        showLoading(false);
    }
}

/**
 * Handles geolocation errors
 */
function handleGeolocationError(error) {
    let message;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = 'You denied permission to access your location';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Your location information is unavailable';
            break;
        case error.TIMEOUT:
            message = 'The request to get your location timed out';
            break;
        default:
            message = 'An unknown error occurred while accessing your location';
    }
    showError(message);
}

/**
 * Fetches Air Quality Index data
 */
async function fetchAQIData(lat, lon) {
    try {
        const aqiUrl = `${AQI_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        console.log('🌍 Fetching AQI data:', aqiUrl);
        
        const response = await fetch(aqiUrl);

        if (!response.ok) {
            console.warn('⚠️ AQI fetch error:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('✅ AQI data received:', data);
        return data;
    } catch (error) {
        console.error('❌ AQI fetch error:', error);
        return null;
    }
}

/**
 * Displays AQI data on the page
 */
async function displayAQIData(lat, lon) {
    try {
        const aqiData = await fetchAQIData(lat, lon);
        
        if (!aqiData || !aqiData.list || aqiData.list.length === 0) {
            console.warn('No AQI data available');
            return;
        }

        const current = aqiData.list[0];
        const aqi = current.main.aqi;
        const components = current.components;

        // Set AQI color and description based on level
        const aqiInfo = getAQIInfo(aqi);
        
        // Update AQI circle
        const aqiCircle = document.querySelector('.aqi-circle');
        aqiCircle.className = `aqi-circle ${aqiInfo.class}`;
        
        // Update AQI value and level
        document.getElementById('aqiValue').textContent = aqi;
        document.getElementById('aqiLevel').textContent = aqiInfo.level;
        document.getElementById('aqiDescription').textContent = aqiInfo.description;

        // Update pollutant values
        document.getElementById('pm25Value').textContent = (components.pm2_5 || 0).toFixed(1);
        document.getElementById('pm10Value').textContent = (components.pm10 || 0).toFixed(1);
        document.getElementById('o3Value').textContent = (components.o3 || 0).toFixed(1);
        document.getElementById('no2Value').textContent = (components.no2 || 0).toFixed(1);
        document.getElementById('so2Value').textContent = (components.so2 || 0).toFixed(1);
        document.getElementById('coValue').textContent = (components.co || 0).toFixed(1);

        console.log('✅ AQI display updated');
    } catch (error) {
        console.error('❌ Error displaying AQI:', error);
    }
}

/**
 * Gets AQI information based on level
 */
function getAQIInfo(aqi) {
    const aqiMap = {
        1: {
            level: '1 - Good',
            description: 'Air quality is good. Enjoy outdoor activities!',
            class: 'good'
        },
        2: {
            level: '2 - Fair',
            description: 'Air quality is acceptable. Sensitive groups should limit outdoor activities.',
            class: 'fair'
        },
        3: {
            level: '3 - Moderate',
            description: 'Air quality is moderate. Some groups may experience respiratory symptoms.',
            class: 'moderate'
        },
        4: {
            level: '4 - Poor',
            description: 'Air quality is poor. Many people may experience respiratory symptoms.',
            class: 'poor'
        },
        5: {
            level: '5 - Very Poor',
            description: 'Air quality is very poor. Everyone should reduce outdoor activities.',
            class: 'veryPoor'
        }
    };

    return aqiMap[aqi] || aqiMap[1];
}

/**
 * Displays weather data on the page
 */
function displayWeather(weatherData) {
    currentWeatherData = weatherData;

    // Update location and date
    document.getElementById('cityName').textContent = 
        `${weatherData.name}, ${weatherData.sys.country}`;
    document.getElementById('date').textContent = 
        new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

    // Update temperature and description
    const temperature = Math.round(weatherData.main.temp);
    const temperatureFahrenheit = Math.round((temperature * 9/5) + 32);
    
    document.getElementById('temperature').textContent = 
        isCelsius ? temperature : temperatureFahrenheit;
    
    document.getElementById('description').textContent = 
        weatherData.weather[0].main;
    
    const feelsLike = Math.round(weatherData.main.feels_like);
    const feelsLikeFahrenheit = Math.round((feelsLike * 9/5) + 32);
    document.getElementById('feelsLike').textContent = 
        `Feels like ${isCelsius ? feelsLike : feelsLikeFahrenheit}°${isCelsius ? 'C' : 'F'}`;

    // Update weather icon
    const iconCode = weatherData.weather[0].icon;
    const iconEmoji = getWeatherEmoji(weatherData.weather[0].main, iconCode);
    document.getElementById('weatherIcon').textContent = iconEmoji;

    // Update weather details
    document.getElementById('windSpeed').textContent = 
        `${Math.round(weatherData.wind.speed)} m/s`;
    
    document.getElementById('humidity').textContent = 
        `${weatherData.main.humidity}%`;
    
    document.getElementById('visibility').textContent = 
        `${(weatherData.visibility / 1000).toFixed(1)} km`;
    
    document.getElementById('pressure').textContent = 
        `${weatherData.main.pressure} hPa`;

    // Sunrise and Sunset
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
    const sunsetTime = new Date(weatherData.sys.sunset * 1000);
    
    document.getElementById('sunrise').textContent = formatTime(sunriseTime);
    document.getElementById('sunriseTime').textContent = formatTime(sunriseTime);
    document.getElementById('sunsetTime').textContent = formatTime(sunsetTime);

    // Cloud Cover
    const cloudPercentage = weatherData.clouds.all;
    document.getElementById('cloudProgress').style.width = `${cloudPercentage}%`;
    document.getElementById('cloudPercentage').textContent = `${cloudPercentage}% Cloud Cover`;

    // UV Index (Mock data - would need separate API call)
    const uvIndex = (Math.random() * 12).toFixed(1);
    document.getElementById('uvIndex').textContent = uvIndex;

    // Fetch and display AQI data
    displayAQIData(weatherData.coord.lat, weatherData.coord.lon);

    // Toggle visibility
    welcomeMessage.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
}

/**
 * Returns emoji based on weather condition
 */
function getWeatherEmoji(description, iconCode) {
    const emojiMap = {
        'Thunderstorm': '⛈️',
        'Drizzle': '🌧️',
        'Rain': '🌧️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🌪️',
        'Fog': '🌫️',
        'Sand': '🌪️',
        'Ash': '🌋',
        'Squall': '💨',
        'Tornado': '🌪️',
        'Clear': iconCode.includes('d') ? '☀️' : '🌙',
        'Clouds': '☁️',
        'Overcast': '☁️'
    };

    return emojiMap[description] || '🌤️';
}

/**
 * Formats time to HH:MM format
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Toggles between Celsius and Fahrenheit
 */
function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    unitLabel.textContent = isCelsius ? '°C' : '°F';
    unitSymbol.textContent = isCelsius ? '°C' : '°F';

    // Update display if weather data exists
    if (currentWeatherData) {
        const temperature = Math.round(currentWeatherData.main.temp);
        const temperatureFahrenheit = Math.round((temperature * 9/5) + 32);
        
        document.getElementById('temperature').textContent = 
            isCelsius ? temperature : temperatureFahrenheit;

        const feelsLike = Math.round(currentWeatherData.main.feels_like);
        const feelsLikeFahrenheit = Math.round((feelsLike * 9/5) + 32);
        document.getElementById('feelsLike').textContent = 
            `Feels like ${isCelsius ? feelsLike : feelsLikeFahrenheit}°${isCelsius ? 'C' : 'F'}`;
    }
}

/**
 * Shows loading indicator
 */
function showLoading(show) {
    if (show) {
        loadingEl.classList.remove('hidden');
    } else {
        loadingEl.classList.add('hidden');
    }
}

/**
 * Shows error message
 */
function showError(message) {
    errorText.textContent = message;
    errorContainer.classList.remove('hidden');
}

/**
 * Hides error message
 */
function hideError() {
    errorContainer.classList.add('hidden');
}

/**
 * Closes error message (called from HTML)
 */
function closeError() {
    hideError();
}

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    // Check if API key is set
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ Weather API key is not configured. Please add your OpenWeatherMap API key.');
        console.log('📝 To fix: Open app.js and replace YOUR_API_KEY_HERE with your actual API key');
    } else {
        console.log('✅ API Key configured:', API_KEY.substring(0, 4) + '...' + API_KEY.substring(API_KEY.length - 4));
        console.log('🌐 API Base URL:', API_BASE_URL);
        console.log('📍 Geocoding URL:', GEOCODING_URL);
    }
    
    // Focus on search input
    searchInput.focus();
});

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to search
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSearch();
    }
    // Escape to close error
    if (e.key === 'Escape') {
        hideError();
    }
});
