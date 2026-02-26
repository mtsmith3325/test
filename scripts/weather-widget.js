class WeatherWidget {
    constructor() {
        this.container = document.getElementById('weather-container');
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
            temperature: this.toFahrenheit(current.temp2m),
            humidity: current.rh2m,
            windSpeed: current.wind10m.speed,
            windDirection: current.wind10m.direction,
            cloudCover: this.getCloudCoverText(current.cloudcover),
            precipitation: current.prec_type,
            lastUpdate: new Date().toLocaleString()
        };
    }

    toFahrenheit(celsius) {
        return Math.round((celsius * 9) / 5 + 32);
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

    getWindIcon() {
        return `
            <span class="weather-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8H14C16 8 17.5 6.5 17.5 4.5C17.5 2.5 16 1 14 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M3 12H18C20 12 21.5 13.5 21.5 15.5C21.5 17.5 20 19 18 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M3 16H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
            </span>
        `;
    }

    getHumidityIcon() {
        return `
            <span class="weather-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 6 9 6 13.5C6 17.1 8.9 20 12 20C15.1 20 18 17.1 18 13.5C18 9 12 2 12 2Z" stroke="currentColor" stroke-width="1.8"/>
                </svg>
            </span>
        `;
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
                <div class="temperature">${weatherData.temperature}°F</div>
                <div class="weather-condition">${weatherData.cloudCover}</div>
                <div class="weather-details">
                    <div class="weather-stat">${this.getWindIcon()}<span>${weatherData.windSpeed} km/h ${weatherData.windDirection}</span></div>
                    <div class="weather-stat">${this.getHumidityIcon()}<span>${weatherData.humidity}%</span></div>
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
