const searchHistoryKey = "weatherSearchHistory";
const maxSearchHistoryItems = 8;
let searchHistoryClickHandler = null;

function addSearchHistoryCity(city) {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    return;
  }

  const history = getSearchHistory().filter(function (item) {
    return item.toLowerCase() !== normalizedCity.toLowerCase();
  });

  history.unshift(normalizedCity);
  localStorage.setItem(searchHistoryKey, JSON.stringify(history.slice(0, maxSearchHistoryItems)));
  renderSearchHistory();
}

function getSearchHistory() {
  const savedHistory = localStorage.getItem(searchHistoryKey);

  if (!savedHistory) {
    return [];
  }

  try {
    const history = JSON.parse(savedHistory);

    if (Array.isArray(history)) {
      return history.filter(function (item) {
        return typeof item === "string" && item.trim().length > 0;
      });
    }
  } catch (error) {
    localStorage.removeItem(searchHistoryKey);
  }

  return [];
}

function renderSearchHistory(onCityClick) {
  const historyList = document.getElementById("search-history-list");

  if (!historyList) {
    return;
  }

  if (typeof onCityClick === "function") {
    searchHistoryClickHandler = onCityClick;
  }

  const history = getSearchHistory();
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.hidden = true;
    return;
  }

  historyList.hidden = false;

  history.forEach(function (city) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn search-history-item";
    button.textContent = city;
    button.addEventListener("click", function () {
      if (typeof searchHistoryClickHandler === "function") {
        searchHistoryClickHandler(city);
      }
    });

    historyList.appendChild(button);
  });
}
