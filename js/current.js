const cityForm = document.getElementById("city-form");
const cityInput = document.getElementById("city-input");
const formError = document.getElementById("form-error");
const statusMessage = document.getElementById("status-message");
const locationName = document.getElementById("location-name");
const currentTime = document.getElementById("current-time");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const apparentTemperature = document.getElementById("apparent-temperature");
const pressure = document.getElementById("pressure");
const windSpeed = document.getElementById("wind-speed");
const humidity = document.getElementById("humidity");
const precipitation = document.getElementById("precipitation");
const chartCaption = document.getElementById("chart-caption");
const tempButton = document.getElementById("show-temp");
const rainButton = document.getElementById("show-rain");
const windButton = document.getElementById("show-wind");
const hourlyMinTemp = document.getElementById("hourly-min-temp");
const hourlyMaxTemp = document.getElementById("hourly-max-temp");
const hourlyRainSum = document.getElementById("hourly-rain-sum");
const hourlyMaxWind = document.getElementById("hourly-max-wind");

let selectedDataset = 0;
let currentHourlyData = null;

const weatherCodes = {
  0: "Bezchmurnie",
  1: "Przewaznie bezchmurnie",
  2: "Czesciowe zachmurzenie",
  3: "Pochmurno",
  45: "Mgla",
  48: "Osadzajaca sie mgla",
  51: "Lekka mzawka",
  53: "Umiarkowana mzawka",
  55: "Silna mzawka",
  56: "Lekka marznaca mzawka",
  57: "Silna marznaca mzawka",
  61: "Lekki deszcz",
  63: "Umiarkowany deszcz",
  65: "Silny deszcz",
  66: "Lekki marznacy deszcz",
  67: "Silny marznacy deszcz",
  71: "Lekki snieg",
  73: "Umiarkowany snieg",
  75: "Silny snieg",
  77: "Ziarna sniegu",
  80: "Lekkie przelotne opady",
  81: "Umiarkowane przelotne opady",
  82: "Silne przelotne opady",
  85: "Lekkie przelotne opady sniegu",
  86: "Silne przelotne opady sniegu",
  95: "Burza",
  96: "Burza z lekkim gradem",
  99: "Burza z silnym gradem"
};

if (tempButton) {
  tempButton.addEventListener("click", function () {
    showDataset(0);
  });
}

if (rainButton) {
  rainButton.addEventListener("click", function () {
    showDataset(1);
  });
}

if (windButton) {
  windButton.addEventListener("click", function () {
    showDataset(2);
  });
}

renderSearchHistory(function (city) {
  cityInput.value = city;
  formError.textContent = "";
  loadCurrentWeather(city);
});

cityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  formError.textContent = "";

  if (city.length < 2) {
    formError.textContent = "Wpisz nazwe miasta.";
    cityInput.focus();
    return;
  }

  loadCurrentWeather(city);
});

loadCurrentWeather("Warszawa");

function loadCurrentWeather(city) {
  statusMessage.textContent = "Ladowanie danych...";

  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=pl&format=json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Nie udalo sie pobrac miasta.");
      }
      return response.json();
    })
    .then(function (data) {
      if (!data.results || data.results.length === 0) {
        throw new Error("Nie znaleziono miasta.");
      }

      const place = data.results[0];
      const url = "https://api.open-meteo.com/v1/forecast"
        + "?latitude=" + place.latitude
        + "&longitude=" + place.longitude
        + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,pressure_msl,wind_speed_10m"
        + "&hourly=temperature_2m,precipitation,wind_speed_10m"
        + "&forecast_hours=24"
        + "&timezone=auto";

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Nie udalo sie pobrac pogody.");
          }
          return response.json();
        })
        .then(function (weather) {
          showWeather(place, weather.current);
          showHourlyChart(weather.hourly);
          addSearchHistoryCity(place.name);
          statusMessage.textContent = "Pobrano aktualna pogode.";
        });
    })
    .catch(function (error) {
      clearView();
      statusMessage.textContent = error.message;
    });
}

function showWeather(place, current) {
  locationName.textContent = place.name + ", " + place.country;
  currentTime.textContent = "Aktualizacja: " + formatDateTime(current.time);
  temperature.textContent = roundValue(current.temperature_2m) + " C";
  weatherDescription.textContent = getWeatherText(current.weather_code);
  apparentTemperature.textContent = roundValue(current.apparent_temperature) + " C";
  pressure.textContent = roundValue(current.pressure_msl) + " hPa";
  windSpeed.textContent = roundValue(current.wind_speed_10m) + " km/h";
  humidity.textContent = roundValue(current.relative_humidity_2m) + " %";
  precipitation.textContent = roundValue(current.precipitation) + " mm";
}

function clearView() {
  locationName.textContent = "Brak danych";
  currentTime.textContent = "-";
  temperature.textContent = "--";
  weatherDescription.textContent = "-";
  apparentTemperature.textContent = "--";
  pressure.textContent = "--";
  windSpeed.textContent = "--";
  humidity.textContent = "--";
  precipitation.textContent = "--";

  currentHourlyData = null;
  clearWeatherChart(document.getElementById("hourly-chart"));
  clearHourlySummary();

  if (chartCaption) {
    chartCaption.textContent = "Dane dla najblizszych 24 godzin.";
  }
}

function getWeatherText(code) {
  if (weatherCodes[code]) {
    return weatherCodes[code];
  }

  return "Nieznana pogoda";
}

function formatDateTime(dateTime) {
  const parts = dateTime.split("T");
  return parts[0] + " " + parts[1];
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
}

function showHourlyChart(hourly) {
  currentHourlyData = hourly;

  if (chartCaption) {
    chartCaption.textContent = "Dane dla najblizszych " + hourly.time.length + " godzin.";
  }

  showHourlySummary(hourly);
  showDataset(selectedDataset);
}

function showHourlySummary(hourly) {
  const minTemp = Math.min.apply(null, hourly.temperature_2m);
  const maxTemp = Math.max.apply(null, hourly.temperature_2m);
  const rainSum = hourly.precipitation.reduce(function (sum, value) {
    return sum + value;
  }, 0);
  const maxWind = Math.max.apply(null, hourly.wind_speed_10m);

  hourlyMinTemp.textContent = roundValue(minTemp) + " C";
  hourlyMaxTemp.textContent = roundValue(maxTemp) + " C";
  hourlyRainSum.textContent = roundValue(rainSum) + " mm";
  hourlyMaxWind.textContent = roundValue(maxWind) + " km/h";
}

function clearHourlySummary() {
  hourlyMinTemp.textContent = "--";
  hourlyMaxTemp.textContent = "--";
  hourlyRainSum.textContent = "--";
  hourlyMaxWind.textContent = "--";
}

function showDataset(index) {
  if (!currentHourlyData) {
    return;
  }

  selectedDataset = index;

  if (tempButton) {
    tempButton.classList.toggle("active", index === 0);
  }

  if (rainButton) {
    rainButton.classList.toggle("active", index === 1);
  }

  if (windButton) {
    windButton.classList.toggle("active", index === 2);
  }

  drawSelectedHourlyChart();
}

function drawSelectedHourlyChart() {
  const chart = document.getElementById("hourly-chart");
  const labels = currentHourlyData.time.map(function (time) {
    return time.slice(11, 16);
  });

  if (selectedDataset === 1) {
    drawWeatherChart({
      element: chart,
      labels: labels,
      values: currentHourlyData.precipitation.map(roundValue),
      type: "bar",
      color: "#5fa8d3",
      unit: " mm",
      minValue: 0
    });
    return;
  }

  if (selectedDataset === 2) {
    drawWeatherChart({
      element: chart,
      labels: labels,
      values: currentHourlyData.wind_speed_10m.map(roundValue),
      type: "bar",
      color: "#8fb85a",
      unit: " km/h",
      minValue: 0
    });
    return;
  }

  drawWeatherChart({
    element: chart,
    labels: labels,
    values: currentHourlyData.temperature_2m.map(roundValue),
    type: "line",
    color: "#9dd9ff",
    unit: " C"
  });
}
