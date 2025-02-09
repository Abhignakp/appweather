const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionSection = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apikey = "cdf6452dcb57e0e39c5cac0f29d5ff7b";

const darkModeBtn = document.querySelector('#dark-mode-btn');

darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Event listener for the search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
});

// Event listener for pressing Enter key
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim()) {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = '';
        cityInput.blur();
    }
});

// Fetch data from the API
async function getFetchData(endPoint, city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('City not found');
        return response.json();
    } catch (error) {
        console.error(error);
        return { cod: '404' }; // Simulate error response if something goes wrong
    }
}

// Get weather icon based on weather condition ID and temperature
function getWeatherIcon(temp, id) {
    if (temp < -1) return 'snow.svg'; // Snowy weather for temp below -1°C
    if (temp < 10) return 'atmosphere.svg'; // Atmosphere icon for temp below 10°C
    if (id <= 232) return 'thunderstorm.svg'; // Thunderstorm
    if (id <= 321) return 'drizzle.svg'; // Drizzle
    if (id <= 531) return 'rain.svg'; // Rain
    if (temp >= 40) return 'sunny.svg'; // Sunny weather for temp above 40°C
    if (temp >= 20 && temp < 40) return 'cloud.svg'; // Cloudy weather for temp 20-40°C
    if (id === 800) return 'clear.svg'; // Clear sky
    return 'cloud.svg'; // Default to cloud icon
}

// Get the current date in a friendly format
function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

// Update the weather information on the page
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const { name: country, main: { temp, humidity }, weather: [{ id, main }], wind: { speed } } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionSection.textContent = main;
    humidityValueTxt.textContent = `${humidity} %`;
    windValueTxt.textContent = `${speed} m/s`;

    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `${getWeatherIcon(temp, id)}`;

    await updateForecastsInfo(city);
    showDisplaySection(weatherInfoSection);
}

// Update the forecast information for the city
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';

    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    });
}

// Update the individual forecast item
function updateForecastItems(weatherData) {
    const { dt_txt: date, weather: [{ id }], main: { temp } } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = 
        `<div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="${getWeatherIcon(temp, id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>`;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Show the appropriate section based on the result
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}
