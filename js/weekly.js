const cityForm = document.getElementById("city-form");
const cityInput = document.getElementById("city-input");
const formError = document.getElementById("form-error");
const statusMessage = document.getElementById("status-message");
const locationName = document.getElementById("location-name");
const daysList = document.getElementById("days-list");
const warmestDay = document.getElementById("warmest-day");
const warmestDayDate = document.getElementById("warmest-day-date");
const coldestDay = document.getElementById("coldest-day");
const coldestDayDate = document.getElementById("coldest-day-date");
const weeklyRainSum = document.getElementById("weekly-rain-sum");
const weeklyMaxWind = document.getElementById("weekly-max-wind");
const weeklyOverviewList = document.getElementById("weekly-overview-list");

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

cityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  formError.textContent = "";

  if (city.length < 2) {
    formError.textContent = "Wpisz nazwe miasta.";
    cityInput.focus();
    return;
  }

  loadWeeklyWeather(city);
});

renderSearchHistory(function (city) {
  cityInput.value = city;
  formError.textContent = "";
  loadWeeklyWeather(city);
});

loadWeeklyWeather("Warszawa");

function loadWeeklyWeather(city) {
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
        + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset"
        + "&forecast_days=7"
        + "&timezone=auto";

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Nie udalo sie pobrac prognozy 7-dniowej.");
          }
          return response.json();
        })
        .then(function (weather) {
          showDays(place, weather.daily);
          showWeeklySummary(weather.daily);
          showWeeklyOverview(weather.daily);
          addSearchHistoryCity(place.name);
          statusMessage.textContent = "Pobrano prognoze 7-dniowa.";
        });
    })
    .catch(function (error) {
      locationName.textContent = "Brak danych";
      daysList.innerHTML = "";
      clearWeeklySummary();
      weeklyOverviewList.innerHTML = "";
      statusMessage.textContent = error.message;
    });
}

function showDays(place, daily) {
  locationName.textContent = place.name + ", " + place.country;
  daysList.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const card = document.createElement("article");
    card.className = "day-card";

    const title = document.createElement("h3");
    title.textContent = daily.time[i];
    card.appendChild(title);

    const text1 = document.createElement("p");
    text1.textContent = "Pogoda: " + getWeatherText(daily.weather_code[i]);
    card.appendChild(text1);

    const text2 = document.createElement("p");
    text2.textContent = "Temp. min: " + roundValue(daily.temperature_2m_min[i]) + " C";
    card.appendChild(text2);

    const text3 = document.createElement("p");
    text3.textContent = "Temp. max: " + roundValue(daily.temperature_2m_max[i]) + " C";
    card.appendChild(text3);

    const text4 = document.createElement("p");
    text4.textContent = "Opady: " + roundValue(daily.precipitation_sum[i]) + " mm";
    card.appendChild(text4);

    const text5 = document.createElement("p");
    text5.textContent = "Wiatr max: " + roundValue(daily.wind_speed_10m_max[i]) + " km/h";
    card.appendChild(text5);

    const text6 = document.createElement("p");
    text6.textContent = "Wschod: " + daily.sunrise[i].slice(11, 16);
    card.appendChild(text6);

    const text7 = document.createElement("p");
    text7.textContent = "Zachod: " + daily.sunset[i].slice(11, 16);
    card.appendChild(text7);

    daysList.appendChild(card);
  }
}

function getWeatherText(code) {
  if (weatherCodes[code]) {
    return weatherCodes[code];
  }

  return "Nieznana pogoda";
}

function showWeeklySummary(daily) {
  const warmestIndex = getMaxIndex(daily.temperature_2m_max);
  const coldestIndex = getMinIndex(daily.temperature_2m_min);
  const rainSum = daily.precipitation_sum.reduce(function (sum, value) {
    return sum + value;
  }, 0);
  const maxWind = Math.max.apply(null, daily.wind_speed_10m_max);

  warmestDay.textContent = roundValue(daily.temperature_2m_max[warmestIndex]) + " C";
  warmestDayDate.textContent = daily.time[warmestIndex];
  coldestDay.textContent = roundValue(daily.temperature_2m_min[coldestIndex]) + " C";
  coldestDayDate.textContent = daily.time[coldestIndex];
  weeklyRainSum.textContent = roundValue(rainSum) + " mm";
  weeklyMaxWind.textContent = roundValue(maxWind) + " km/h";
}

function showWeeklyOverview(daily) {
  weeklyOverviewList.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const item = document.createElement("article");
    item.className = "weekly-overview-item";

    const date = document.createElement("p");
    date.className = "weekly-overview-date";
    date.textContent = formatShortDate(daily.time[i]);
    item.appendChild(date);

    const temp = document.createElement("p");
    temp.className = "weekly-overview-temp";
    temp.textContent = roundValue(daily.temperature_2m_min[i]) + " / " + roundValue(daily.temperature_2m_max[i]) + " C";
    item.appendChild(temp);

    const weather = document.createElement("p");
    weather.className = "weekly-overview-weather";
    weather.textContent = getWeatherText(daily.weather_code[i]);
    item.appendChild(weather);

    weeklyOverviewList.appendChild(item);
  }
}

function clearWeeklySummary() {
  warmestDay.textContent = "--";
  warmestDayDate.textContent = "--";
  coldestDay.textContent = "--";
  coldestDayDate.textContent = "--";
  weeklyRainSum.textContent = "--";
  weeklyMaxWind.textContent = "--";
}

function formatShortDate(dateText) {
  const parts = dateText.split("-");
  return parts[2] + "." + parts[1];
}

function getMaxIndex(values) {
  let maxIndex = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[maxIndex]) {
      maxIndex = i;
    }
  }

  return maxIndex;
}

function getMinIndex(values) {
  let minIndex = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[minIndex]) {
      minIndex = i;
    }
  }

  return minIndex;
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
}
