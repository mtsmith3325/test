# Tech Brief: Weather Widget Implementation with 7Timer! API

## Overview
Implementation of a 3-location weather widget using 7Timer! API for a static HTML/CSS website hosted on Vercel. 7Timer! is chosen for its simplicity (no API key required) and reliability.

## 7Timer! API Analysis

### Advantages
- **No API key required** - Zero authentication overhead
- **Completely free** - No rate limits or usage restrictions
- **Simple endpoints** - Straightforward JSON responses
- **Reliable** - Academic project with good uptime
- **Multiple data types** - Civil, astronomical, and meteorological data

### API Endpoints
- **Civil weather**: `http://www.7timer.info/bin/api.pl?lon={lon}&lat={lat}&product=civil&output=json`
- **Meteorological**: `http://www.7timer.info/bin/api.pl?lon={lon}&lat={lat}&product=astro&output=json`

### Data Structure
```json
{
  "product": "civil",
  "init": "2024021400",
  "dataseries": [
    {
      "timepoint": 3,
      "cloudcover": 2,
      "seeing": 4,
      "transparency": 3,
      "lifted_index": -1,
      "rh2m": 85,
      "wind10m": {"direction": "SW", "speed": 2},
      "temp2m": 8,
      "prec_type": "none"
    }
  ]
}
```

## Implementation Plan

### Phase 1: Project Setup & Structure
**Duration**: 30 minutes

1. **File Structure**
   ```
   /
   ├── index.html
   ├── styles/
   │   └── weather-widget.css
   ├── scripts/
   │   └── weather-widget.js
   └── data/
       └── locations.js
   ```

2. **Location Configuration**
   - Define 3 target locations with coordinates
   - Create location data structure

### Phase 2: Core Implementation
**Duration**: 2-3 hours

1. **HTML Structure** (15 min)
   - Create weather widget container
   - Define card template structure
   - Add loading states

2. **CSS Styling** (45 min)
   - Responsive grid layout for 3 cards
   - Weather condition icons/styling
   - Loading animations
   - Mobile-first responsive design

3. **JavaScript Logic** (90 min)
   - API fetch functions
   - Data parsing and transformation
   - DOM manipulation
   - Error handling
   - Auto-refresh functionality

### Phase 3: Enhancement & Polish
**Duration**: 1-2 hours

1. **Weather Condition Mapping** (30 min)
   - Map 7Timer codes to readable descriptions
   - Add weather icons or emoji

2. **User Experience** (30 min)
   - Loading states
   - Error messages
   - Last updated timestamps

3. **Performance Optimization** (30 min)
   - Caching strategy
   - Minimize API calls

## Detailed Implementation

### Step 1: Location Configuration

**Create `data/locations.js`:**
```javascript
const LOCATIONS = [
    {
        name: "New York",
        lat: 40.7128,
        lon: -74.0060,
        timezone: "America/New_York"
    },
    {
        name: "London", 
        lat: 51.5074,
        lon: -0.1278,
        timezone: "Europe/London"
    },
    {
        name: "Tokyo",
        lat: 35.6762,
        lon: 139.6503,
        timezone: "Asia/Tokyo"
    }
];
```

### Step 2: HTML Structure

**Update `index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Dashboard</title>
    <link rel="stylesheet" href="styles/weather-widget.css">
</head>
<body>
    <main>
        <h1>Weather Dashboard</h1>
        <div id="weather-container" class="weather-grid">
            <!-- Weather cards will be dynamically inserted here -->
        </div>
        <div id="last-updated" class="last-updated"></div>
    </main>
    
    <script src="data/locations.js"></script>
    <script src="scripts/weather-widget.js"></script>
</body>
</html>
```

### Step 3: CSS Implementation

**Create `styles/weather-widget.css`:**
```css
.weather-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.weather-card {
    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
    border-radius: 12px;
    padding: 1.5rem;
    color: white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
}

.weather-card:hover {
    transform: translateY(-2px);
}

.weather-card.loading {
    background: #ddd;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.location-name {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.temperature {
    font-size: 2.5rem;
    font-weight: 300;
    margin: 0.5rem 0;
}

.weather-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: 0.9rem;
}

.error-card {
    background: #e74c3c;
    text-align: center;
}

@media (max-width: 768px) {
    .weather-grid {
        grid-template-columns: 1fr;
    }
}
```

### Step 4: JavaScript Implementation

**Create `scripts/weather-widget.js`:**
```javascript
class WeatherWidget {
    constructor() {
        this.container = document.getElementById('weather-container');
        this.lastUpdated = document.getElementById('last-updated');
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    async fetchWeatherData(location) {
        const cacheKey = `${location.lat},${location.lon}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(
                `http://www.7timer.info/bin/api.pl?lon=${location.lon}&lat=${location.lat}&product=civil&output=json`
            );
            
            if (!response.ok) throw new Error('Weather data unavailable');
            
            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Error fetching weather for ${location.name}:`, error);
            return null;
        }
    }

    parseWeatherData(data, location) {
        if (!data || !data.dataseries || data.dataseries.length === 0) {
            return null;
        }

        const current = data.dataseries[0];
        
        return {
            location: location.name,
            temperature: current.temp2m,
            humidity: current.rh2m,
            windSpeed: current.wind10m.speed,
            windDirection: current.wind10m.direction,
            cloudCover: this.getCloudCoverText(current.cloudcover),
            precipitation: current.prec_type,
            lastUpdate: new Date().toLocaleString()
        };
    }

    getCloudCoverText(code) {
        const cloudMap = {
            1: 'Clear',
            2: 'Partly Cloudy', 
            3: 'Partly Cloudy',
            4: 'Partly Cloudy',
            5: 'Partly Cloudy',
            6: 'Cloudy',
            7: 'Cloudy',
            8: 'Overcast',
            9: 'Overcast'
        };
        return cloudMap[code] || 'Unknown';
    }

    createWeatherCard(weatherData) {
        if (!weatherData) {
            return `
                <div class="weather-card error-card">
                    <div class="location-name">Weather Unavailable</div>
                    <div>Unable to load weather data</div>
                </div>
            `;
        }

        return `
            <div class="weather-card">
                <div class="location-name">${weatherData.location}</div>
                <div class="temperature">${weatherData.temperature}°C</div>
                <div class="weather-condition">${weatherData.cloudCover}</div>
                <div class="weather-details">
                    <div>💨 ${weatherData.windSpeed} km/h ${weatherData.windDirection}</div>
                    <div>💧 ${weatherData.humidity}%</div>
                </div>
            </div>
        `;
    }

    createLoadingCard(locationName) {
        return `
            <div class="weather-card loading">
                <div class="location-name">${locationName}</div>
                <div>Loading weather data...</div>
            </div>
        `;
    }

    async loadWeatherWidgets() {
        // Show loading cards first
        this.container.innerHTML = LOCATIONS
            .map(location => this.createLoadingCard(location.name))
            .join('');

        // Fetch weather data for all locations
        const weatherPromises = LOCATIONS.map(async (location) => {
            const rawData = await this.fetchWeatherData(location);
            return this.parseWeatherData(rawData, location);
        });

        const weatherResults = await Promise.all(weatherPromises);

        // Update with actual weather data
        this.container.innerHTML = weatherResults
            .map(data => this.createWeatherCard(data))
            .join('');

        // Update last updated timestamp
        this.lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }

    startAutoRefresh(intervalMinutes = 15) {
        setInterval(() => {
            this.loadWeatherWidgets();
        }, intervalMinutes * 60 * 1000);
    }
}

// Initialize weather widget when page loads
document.addEventListener('DOMContentLoaded', () => {
    const widget = new WeatherWidget();
    widget.loadWeatherWidgets();
    widget.startAutoRefresh(15); // Refresh every 15 minutes
});
```

## Deployment Considerations

### Vercel Configuration
No special configuration needed - static files deploy automatically.

### CORS Handling
7Timer! supports CORS, but if issues arise:
1. Use Vercel serverless function as proxy
2. Add `Access-Control-Allow-Origin` headers

### Performance Optimization
1. **Caching**: 10-minute client-side cache implemented
2. **Lazy Loading**: Consider intersection observer for below-fold widgets
3. **Compression**: Vercel handles gzip automatically

## Testing Strategy

1. **Unit Tests**: Weather data parsing functions
2. **Integration Tests**: API connectivity
3. **Cross-browser**: Chrome, Firefox, Safari, Edge
4. **Mobile Testing**: Responsive design validation
5. **Error Scenarios**: Network failures, invalid coordinates

## Maintenance & Monitoring

1. **Error Logging**: Console errors for debugging
2. **Fallback Handling**: Graceful degradation when API fails
3. **Cache Management**: Automatic cache expiration
4. **Performance Monitoring**: Load times and API response times

## Timeline Summary
- **Setup**: 30 minutes
- **Core Development**: 2-3 hours  
- **Testing & Polish**: 1-2 hours
- **Total**: 4-6 hours

This implementation provides a robust, maintainable weather widget solution using 7Timer!'s free API with no authentication requirements.
