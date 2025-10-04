
const UNSPLASH_ACCESS_KEY = '3tkxT89VRzbHBzOTifADYcfpQ0-GDU71Px7ZM-jlDy8';
const OPENWEATHERMAP_API_KEY = 'a3f393757952e53709bd47c7781ff9c0';


const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const resultsContainer = document.getElementById('results-container');


searchBtn.addEventListener('click', searchDestination);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchDestination();
    }
});


async function searchDestination() {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    resultsContainer.innerHTML = `<div class="loading">Fetching your adventure...</div>`;

    try {
        const [weatherData, imageData, wikiData] = await Promise.all([
            getWeather(city),
            getImage(city),
            getWikipediaInfo(city)
        ]);
        
        displayResults(weatherData, imageData, wikiData);

    } catch (error) {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = `<div class="error">${error.message}</div>`;
    }
}



async function getWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`Could not fetch weather. Is the city name correct?`);
    }
    const data = await response.json();
    return {
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon
    };
}


async function getImage(city) {
    const apiUrl = `https://api.unsplash.com/search/photos?query=${city}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error('Could not fetch image from Unsplash.');
    }
    const data = await response.json();
    if (data.results.length === 0) {
        throw new Error(`No images found for ${city}.`);
    }
    return {
        url: data.results[0].urls.regular,
        alt: data.results[0].alt_description
    };
}

async function getWikipediaInfo(city) {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`;
    const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
        return {
            title: city,
            extract: "No detailed description found on Wikipedia. It might be a hidden gem!"
        };
    }
    const data = await response.json();
    return {
        title: data.title,
        extract: data.extract
    };
}


function displayResults(weather, image, wiki) {
    resultsContainer.innerHTML = '';
    
    const temp = Math.round(weather.temp);
    const weatherIconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
    
    
    const resultHTML = `
        <div class="destination-info">
            <div class="destination-header">
                <h2>${wiki.title}</h2>
                <div class="weather-info">
                    <img src="${weatherIconUrl}" alt="Weather icon">
                    <span>${temp}°C, ${weather.description}</span>
                </div>
            </div>
            <div class="destination-body">
                <div class="description">
                    <h3>About this place</h3>
                    <p>${wiki.extract}</p>
                </div>
                <div class="image-gallery">
                    <img src="${image.url}" alt="${image.alt}">
                </div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = resultHTML;
}