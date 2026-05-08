const cityForm = document.getElementById("city-form");
const cityInput = document.getElementById("city-input");
const formError = document.getElementById("form-error");
const statusMessage = document.getElementById("status-message");
const locationName = document.getElementById("location-name");
const chart = document.getElementById("weather-chart");
const chartLegend = document.getElementById("chart-legend");
const temperatureButton = document.getElementById("show-temperature");
const rainButton = document.getElementById("show-rain");

let currentMode = "temperature";

cityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  formError.textContent = "";

  if (city.length < 2) {
    formError.textContent = "Wpisz nazwe miasta.";
    cityInput.focus();
    return;
  }

  loadChartData(city);
});

temperatureButton.addEventListener("click", function () {
  currentMode = "temperature";
  temperatureButton.className = "active";
  rainButton.className = "";
  loadChartData(cityInput.value.trim() || "Warszawa");
});

rainButton.addEventListener("click", function () {
  currentMode = "rain";
  rainButton.className = "active";
  temperatureButton.className = "";
  loadChartData(cityInput.value.trim() || "Warszawa");
});

loadChartData("Warszawa");

function loadChartData(city) {
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
        + "&hourly=temperature_2m,precipitation"
        + "&forecast_hours=24"
        + "&timezone=auto";

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Nie udalo sie pobrac prognozy.");
          }
          return response.json();
        })
        .then(function (weather) {
          locationName.textContent = place.name + ", " + place.country;
          drawChart(weather.hourly);
          statusMessage.textContent = "Pobrano dane.";
        });
    })
    .catch(function (error) {
      locationName.textContent = "Brak danych";
      chart.innerHTML = "";
      chartLegend.textContent = "";
      statusMessage.textContent = error.message;
    });
}

function drawChart(hourly) {
  const labels = hourly.time.map(function (time) {
    return time.slice(11, 16);
  });

  if (currentMode === "temperature") {
    drawWeatherChart({
      element: chart,
      labels: labels,
      values: hourly.temperature_2m,
      type: "line",
      color: "#d97b29",
      unit: " C"
    });
    chartLegend.textContent = "Temperatura w stopniach Celsjusza";
    return;
  }

  drawWeatherChart({
    element: chart,
    labels: labels,
    values: hourly.precipitation,
    type: "bar",
    color: "#2e7db7",
    unit: " mm",
    minValue: 0
  });
  chartLegend.textContent = "Opady w milimetrach";
}
