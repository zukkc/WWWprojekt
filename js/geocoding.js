function geocodeCity(city) {
  var url = "https://geocoding-api.open-meteo.com/v1/search"
    + "?name=" + encodeURIComponent(city)
    + "&count=1&language=pl&format=json";

  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Nie udało się pobrać miasta.");
      }
      return response.json();
    })
    .then(function (data) {
      if (!data.results || data.results.length === 0) {
        throw new Error("Nie znaleziono miasta.");
      }

      var place = data.results[0];
      return {
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        country: place.country
      };
    });
}
