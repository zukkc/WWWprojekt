const cityForm = document.getElementById("city-form");
const cityInput = document.getElementById("city-input");
const formError = document.getElementById("form-error");
const statusMessage = document.getElementById("status-message");
const locationName = document.getElementById("location-name");
const chartCaption = document.getElementById("chart-caption");
const tempButton = document.getElementById("show-temp");
const rainButton = document.getElementById("show-rain");
const windButton = document.getElementById("show-wind");

let selectedDataset = 0;
let currentHourlyData = null;

cityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  formError.textContent = "";

  if (city.length < 2) {
    formError.textContent = "Wpisz nazwe miasta.";
    cityInput.focus();
    return;
  }

  loadHourlyWeather(city);
});

tempButton.addEventListener("click", function () {
  showDataset(0);
});

rainButton.addEventListener("click", function () {
  showDataset(1);
});

windButton.addEventListener("click", function () {
  showDataset(2);
});

renderSearchHistory(function (city) {
  cityInput.value = city;
  formError.textContent = "";
  loadHourlyWeather(city);
});

loadHourlyWeather("Warszawa");

function loadHourlyWeather(city) {
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
        + "&hourly=temperature_2m,precipitation,wind_speed_10m"
        + "&forecast_hours=24"
        + "&timezone=auto";

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Nie udalo sie pobrac prognozy godzinowej.");
          }
          return response.json();
        })
        .then(function (weather) {
          showChart(place, weather.hourly);
          addSearchHistoryCity(place.name);
          statusMessage.textContent = "Pobrano prognoze godzinowa.";
        });
    })
    .catch(function (error) {
      clearChart();
      statusMessage.textContent = error.message;
    });
}

function showChart(place, hourly) {
  locationName.textContent = place.name + ", " + place.country;
  chartCaption.textContent = "Dane dla najblizszych " + hourly.time.length + " godzin.";
  currentHourlyData = hourly;

  showDataset(selectedDataset);
}

function clearChart() {
  locationName.textContent = "Brak danych";
  chartCaption.textContent = "Dane dla najblizszych 24 godzin.";
  currentHourlyData = null;
  clearWeatherChart(document.getElementById("hourly-chart"));
}

function showDataset(index) {
  if (!currentHourlyData) {
    return;
  }

  selectedDataset = index;

  tempButton.classList.toggle("active", index === 0);
  rainButton.classList.toggle("active", index === 1);
  windButton.classList.toggle("active", index === 2);

  drawSelectedHourlyChart();
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
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
