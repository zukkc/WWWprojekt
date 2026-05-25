const cityForm = document.getElementById("city-form");
const cityInput = document.getElementById("city-input");
const submitButton = cityForm.querySelector('button[type="submit"]');
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const formError = document.getElementById("form-error");
const statusMessage = document.getElementById("status-message");
const locationName = document.getElementById("location-name");
const dateRange = document.getElementById("date-range");
const historyBody = document.getElementById("history-body");
const maxHistoryDays = 31;

setDefaultDateRange();

cityForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  const dates = getSelectedDates();
  formError.textContent = "";

  if (city.length < 2) {
    formError.textContent = "Wpisz nazwę miasta.";
    cityInput.focus();
    return;
  }

  const validationError = validateDates(dates);

  if (validationError) {
    formError.textContent = validationError;
    return;
  }

  loadHistory(city, dates);
});

startDateInput.addEventListener("change", updateDateInputLimits);
endDateInput.addEventListener("change", updateDateInputLimits);

renderSearchHistory(function (city) {
  const dates = getSelectedDates();
  const validationError = validateDates(dates);

  cityInput.value = city;
  formError.textContent = "";

  if (validationError) {
    formError.textContent = validationError;
    return;
  }

  loadHistory(city, dates);
});

loadHistory("Warszawa", getSelectedDates());

function loadHistory(city, dates) {
  statusMessage.textContent = "Ładowanie danych...";
  submitButton.disabled = true;

  geocodeCity(city)
    .then(function (place) {
      const url = "https://archive-api.open-meteo.com/v1/archive"
        + "?latitude=" + place.latitude
        + "&longitude=" + place.longitude
        + "&start_date=" + dates.startDate
        + "&end_date=" + dates.endDate
        + "&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"
        + "&timezone=auto";

      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Nie udało się pobrać danych historycznych.");
          }
          return response.json();
        })
        .then(function (weather) {
          showHistory(place, dates, weather.daily);
          addSearchHistoryCity(place.name);
          statusMessage.textContent = "Pobrano dane historyczne.";
          submitButton.disabled = false;
        });
    })
    .catch(function (error) {
      locationName.textContent = "Brak danych";
      dateRange.textContent = "-";
      historyBody.innerHTML = "";
      statusMessage.textContent = error.message;
      submitButton.disabled = false;
    });
}

function showHistory(place, dates, daily) {
  locationName.textContent = place.name + ", " + place.country;
  dateRange.textContent = "Zakres: " + dates.startDate + " - " + dates.endDate;
  historyBody.innerHTML = "";

  for (let i = 0; i < daily.time.length; i++) {
    const row = document.createElement("tr");

    addCell(row, daily.time[i]);
    addCell(row, roundValue(daily.temperature_2m_mean[i]) + " C");
    addCell(row, roundValue(daily.temperature_2m_min[i]) + " C");
    addCell(row, roundValue(daily.temperature_2m_max[i]) + " C");
    addCell(row, roundValue(daily.precipitation_sum[i]) + " mm");
    addCell(row, roundValue(daily.wind_speed_10m_max[i]) + " km/h");

    historyBody.appendChild(row);
  }
}

function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

function getArchiveDates() {
  const end = new Date();
  end.setDate(end.getDate() - 1);

  const start = new Date();
  start.setDate(start.getDate() - 7);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
}

function setDefaultDateRange() {
  const dates = getArchiveDates();
  const maxDate = dates.endDate;

  startDateInput.value = dates.startDate;
  endDateInput.value = dates.endDate;
  startDateInput.max = maxDate;
  endDateInput.max = maxDate;
  updateDateInputLimits();
}

function updateDateInputLimits() {
  const yesterday = getYesterdayDate();
  const maxDate = formatDate(yesterday);

  startDateInput.max = endDateInput.value || maxDate;
  endDateInput.min = startDateInput.value;
  endDateInput.max = maxDate;
}

function getSelectedDates() {
  return {
    startDate: startDateInput.value,
    endDate: endDateInput.value
  };
}

function validateDates(dates) {
  if (!dates.startDate || !dates.endDate) {
    return "Wybierz obie daty.";
  }

  const start = new Date(dates.startDate + "T00:00:00");
  const end = new Date(dates.endDate + "T00:00:00");
  const yesterday = getYesterdayDate();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Podaj poprawny zakres dat.";
  }

  if (start > end) {
    return "Data początkowa nie może być późniejsza niż końcowa.";
  }

  if (end > yesterday) {
    return "Dane historyczne są dostępne tylko dla zakończonych dni.";
  }

  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const selectedDays = Math.floor((end - start) / dayInMilliseconds) + 1;

  if (selectedDays > maxHistoryDays) {
    return "Zakres nie może być dłuższy niż " + maxHistoryDays + " dni.";
  }

  return "";
}

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function roundValue(value) {
  return Math.round(value * 10) / 10;
}
