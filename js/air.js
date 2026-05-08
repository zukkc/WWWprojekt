const cityForm = document.getElementById("city-form");
const cityInput = document.getElementById("city-input");
const formError = document.getElementById("form-error");
const statusMessage = document.getElementById("status-message");
const locationName = document.getElementById("location-name");
const europeanAqi = document.getElementById("european-aqi");
const pm25 = document.getElementById("pm25");
const pm10 = document.getElementById("pm10");
const no2 = document.getElementById("no2");
const ozone = document.getElementById("ozone");
const uvIndex = document.getElementById("uv-index");
const airBody = document.getElementById("air-body");

cityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  formError.textContent = "";

  if (city.length < 2) {
    formError.textContent = "Wpisz nazwe miasta.";
    cityInput.focus();
    return;
  }

  loadAirQuality(city);
});

renderSearchHistory(function (city) {
  cityInput.value = city;
  formError.textContent = "";
  loadAirQuality(city);
});

loadAirQuality("Warszawa");

function loadAirQuality(city) {
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
      const url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        + "?latitude=" + place.latitude
        + "&longitude=" + place.longitude
        + "&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,uv_index"
        + "&hourly=european_aqi,pm2_5,pm10"
        + "&forecast_hours=24"
        + "&timezone=auto";

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Nie udalo sie pobrac jakosci powietrza.");
          }
          return response.json();
        })
        .then(function (air) {
          showAir(place, air);
          addSearchHistoryCity(place.name);
          statusMessage.textContent = "Pobrano jakosc powietrza.";
        });
    })
    .catch(function (error) {
      clearAir();
      statusMessage.textContent = error.message;
    });
}

function showAir(place, air) {
  locationName.textContent = place.name + ", " + place.country;
  europeanAqi.textContent = roundValue(air.current.european_aqi);
  pm25.textContent = roundValue(air.current.pm2_5) + " ug/m3";
  pm10.textContent = roundValue(air.current.pm10) + " ug/m3";
  no2.textContent = roundValue(air.current.nitrogen_dioxide) + " ug/m3";
  ozone.textContent = roundValue(air.current.ozone) + " ug/m3";
  uvIndex.textContent = roundValue(air.current.uv_index);

  airBody.innerHTML = "";

  for (let i = 0; i < air.hourly.time.length; i++) {
    const row = document.createElement("tr");
    addCell(row, air.hourly.time[i].slice(11, 16));
    addCell(row, roundValue(air.hourly.european_aqi[i]));
    addCell(row, roundValue(air.hourly.pm2_5[i]));
    addCell(row, roundValue(air.hourly.pm10[i]));
    airBody.appendChild(row);
  }
}

function clearAir() {
  locationName.textContent = "Brak danych";
  europeanAqi.textContent = "--";
  pm25.textContent = "--";
  pm10.textContent = "--";
  no2.textContent = "--";
  ozone.textContent = "--";
  uvIndex.textContent = "--";
  airBody.innerHTML = "";
}

function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
}
