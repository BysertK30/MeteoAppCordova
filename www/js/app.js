document.addEventListener('deviceready', onDeviceReady, false);

const API_KEY = 'a0d1fbf0eb608101f49d03b743d1ad69'; // Remplacez par votre clé API OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const citySearchInput = document.getElementById('city-search');
const searchButton = document.getElementById('search-button');
const currentLocationButton = document.getElementById('current-location-button');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const weatherIconElement = document.getElementById('weather-icon');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');

function onDeviceReady() {
    console.log('Device is ready');
    // Charger la météo de la position actuelle au démarrage si possible
    getCurrentLocationWeather();
}

searchButton.addEventListener('click', () => {
    const city = citySearchInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
});

currentLocationButton.addEventListener('click', getCurrentLocationWeather);

async function getWeatherByCity(city) {
    try {
        const response = await fetch(`${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric&lang=fr`);
        if (!response.ok) {
            throw new Error(`Ville non trouvée: ${response.statusText}`);
        }
        const data = await response.json();
        displayCurrentWeather(data);
        getForecastByCity(city);
    } catch (error) {
        console.error('Erreur lors de la récupération de la météo par ville:', error);
        alert(error.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);
        if (!response.ok) {
            throw new Error(`Impossible de récupérer la météo pour ces coordonnées: ${response.statusText}`);
        }
        const data = await response.json();
        displayCurrentWeather(data);
        getForecastByCoords(lat, lon);
    } catch (error) {
        console.error('Erreur lors de la récupération de la météo par coordonnées:', error);
        alert(error.message);
    }
}

async function getForecastByCity(city) {
    try {
        const response = await fetch(`${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric&lang=fr`);
        if (!response.ok) {
            throw new Error(`Prévisions non disponibles pour cette ville: ${response.statusText}`);
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des prévisions par ville:', error);
    }
}

async function getForecastByCoords(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`);
        if (!response.ok) {
            throw new Error(`Prévisions non disponibles pour ces coordonnées: ${response.statusText}`);
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des prévisions par coordonnées:', error);
    }
}

function displayCurrentWeather(data) {
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionElement.textContent = data.weather[0].description;
    weatherIconElement.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
    pressureElement.textContent = `${data.main.pressure} hPa`;

    // Changer le fond en fonction de la météo
    updateBackground(data.weather[0].main);
}

function displayForecast(data) {
    forecastContainer.innerHTML = ''; // Nettoyer les prévisions précédentes
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temp: [],
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        }
        dailyForecasts[day].temp.push(item.main.temp);
    });

    // Afficher les 5 prochains jours (en ignorant le jour actuel si la première entrée est pour aujourd'hui)
    let count = 0;
    for (const day in dailyForecasts) {
        if (count >= 5) break; // Limiter à 5 jours
        const avgTemp = Math.round(dailyForecasts[day].temp.reduce((a, b) => a + b) / dailyForecasts[day].temp.length);

        const forecastDayElement = document.createElement('div');
        forecastDayElement.classList.add('forecast-day');
        forecastDayElement.innerHTML = `
            <p>${day}</p>
            <img src="http://openweathermap.org/img/wn/${dailyForecasts[day].icon}@2x.png" alt="${dailyForecasts[day].description}">
            <p>${avgTemp}°C</p>
        `;
        forecastContainer.appendChild(forecastDayElement);
        count++;
    }
}

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            (error) => {
                console.error('Erreur de géolocalisation:', error);
                alert('Impossible de récupérer votre position actuelle. Veuillez autoriser la géolocalisation ou rechercher une ville manuellement.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert('La géolocalisation n'est pas supportée par ce navigateur/appareil.');
    }
}

function updateBackground(weatherMain) {
    let gradient = '';
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            gradient = 'linear-gradient(to bottom, #87CEEB, #ADD8E6)'; // Ciel clair
            break;
        case 'clouds':
            gradient = 'linear-gradient(to bottom, #B0C4DE, #778899)'; // Nuageux
            break;
        case 'rain':
        case 'drizzle':
            gradient = 'linear-gradient(to bottom, #6A82FB, #C0C0C0)'; // Pluie
            break;
        case 'thunderstorm':
            gradient = 'linear-gradient(to bottom, #4B0082, #2F4F4F)'; // Orage
            break;
        case 'snow':
            gradient = 'linear-gradient(to bottom, #E0FFFF, #B0E0E6)'; // Neige
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            gradient = 'linear-gradient(to bottom, #D3D3D3, #A9A9A9)'; // Brouillard
            break;
        default:
            gradient = 'linear-gradient(to bottom, #87CEEB, #ADD8E6)'; // Par défaut
            break;
    }
    document.body.style.background = gradient;
}

// Initialisation au chargement de l'application
// Note: cordova.js doit être chargé avant app.js
// et onDeviceReady est appelé quand Cordova est prêt.
