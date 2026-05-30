# Aplikacja pogodowa

Projekt zaliczeniowy z przedmiotu WWW. Aplikacja pozwala sprawdzac aktualna pogode, prognoze godzinowa, prognoze 7-dniowa, dane historyczne oraz jakosc powietrza dla wybranego miasta.

Live demo:  
https://zukkc.github.io/WWWprojekt/

## Uruchomienie

Projekt jest statyczna aplikacja HTML/CSS/JavaScript i nie wymaga instalowania zaleznosci.

1. Pobierz lub sklonuj repozytorium.
2. Otworz plik `index.html` w przegladarce.
3. Do poprawnego dzialania wymagane jest polaczenie z internetem, poniewaz dane sa pobierane z zewnetrznego API.

## Uzyte technologie

- HTML5
- CSS3
- JavaScript
- Fetch API
- localStorage
- SVG do rysowania wykresow
- Open-Meteo API

## Zrodla danych

Aplikacja korzysta z publicznych uslug Open-Meteo:

- Geocoding API - zamiana nazwy miasta na wspolrzedne geograficzne.
- Forecast API - aktualna pogoda, prognoza godzinowa i prognoza 7-dniowa.
- Archive API - dane historyczne.
- Air Quality API - jakosc powietrza.

## Widoki aplikacji

### Strona glowna

Plik: `index.html`

Widok pokazuje aktualna pogode dla miasta:

- temperatura,
- temperatura odczuwalna,
- cisnienie,
- wiatr,
- wilgotnosc,
- opady,
- opis pogody,
- wykres danych godzinowych.

Uzytkownik moze przelaczac wykres pomiedzy temperatura, opadami i wiatrem.

### Prognoza godzinowa

Plik: `hourly.html`

Widok prezentuje prognoze na najblizsze 24 godziny. Dane sa renderowane dynamicznie na wykresie SVG. Dostepne sa trzy tryby:

- temperatura,
- opady,
- wiatr.

### Prognoza 7-dniowa

Plik: `weekly.html`

Widok pokazuje prognoze na kolejne 7 dni. Dla kazdego dnia wyswietlane sa m.in.:

- pogoda,
- temperatura minimalna i maksymalna,
- suma opadow,
- maksymalna predkosc wiatru,
- wschod i zachod slonca.

Dodatkowo aplikacja oblicza podsumowanie tygodnia:

- najcieplejszy dzien,
- najchlodniejszy dzien,
- suma opadow,
- maksymalny wiatr.

### Dane historyczne

Plik: `history.html`

Widok pozwala pobrac dane archiwalne dla wybranego miasta i zakresu dat. Formularz posiada walidacje:

- wymagane sa obie daty,
- data poczatkowa nie moze byc pozniejsza niz koncowa,
- dane sa dostepne tylko dla zakonczonych dni,
- zakres nie moze byc dluzszy niz 31 dni.

Dane sa wyswietlane w tabeli.

### Jakosc powietrza

Plik: `air.html`

Widok pokazuje aktualne parametry jakosci powietrza:

- europejski AQI,
- PM2.5,
- PM10,
- NO2,
- O3,
- UV.

Dodatkowo wyswietlana jest tabela godzinowa dla najblizszych 24 godzin.

## Rozszerzenia

- Historia wyszukiwania miast w `localStorage`.
- Kilka widokow korzystajacych z roznych endpointow API.
- Wykres SVG dla danych godzinowych.
- Przelaczanie typu danych na wykresie.
- Dane historyczne z wyborem zakresu dat.
- Agregacje w prognozie tygodniowej.
- Widok jakosci powietrza.

## Dokumentacja

### Struktura projektu

Projekt jest podzielony na trzy glowne czesci:

- pliki `.html` - odpowiadaja za strukture poszczegolnych widokow,
- katalog `css` - zawiera style globalne i style przypisane do konkretnych podstron,
- katalog `js` - zawiera logike pobierania danych, walidacje, renderowanie danych i obsluge interakcji.

Najwazniejszy plik startowy to `index.html`. Z niego uzytkownik moze przejsc przez menu do pozostalych widokow: `hourly.html`, `weekly.html`, `history.html` i `air.html`.

### Pliki HTML

`index.html` jest strona glowna aplikacji. Zawiera formularz wyszukiwania miasta, panel z aktualnymi danymi pogodowymi, przyciski do przelaczania typu danych oraz kontener SVG na wykres godzinowy. Do tego widoku podlaczone sa pliki `weather_chart.js`, `geocoding.js`, `search_history.js` i `current.js`.

`hourly.html` odpowiada za widok prognozy godzinowej. Struktura jest podobna do strony glownej, ale widok skupia sie tylko na wykresie danych z najblizszych 24 godzin. Dane sa obslugiwane przez `hourly.js`.

`weekly.html` odpowiada za prognoze 7-dniowa. Zawiera miejsce na podsumowanie tygodnia, szybki przeglad dni oraz liste kart z danymi dla kazdego dnia. Logika tego widoku znajduje sie w `weekly.js`.

`history.html` odpowiada za dane historyczne. Oprocz pola miasta ma dwa pola typu `date`, ktore pozwalaja wybrac zakres dat. Wyniki sa renderowane w tabeli. Logika widoku znajduje sie w `history.js`.

`air.html` odpowiada za jakosc powietrza. Zawiera panel aktualnych pomiarow oraz tabele godzinowa. Dane sa pobierane i renderowane przez `air.js`.

### Pliki CSS

`css/base.css` zawiera style wspolne dla aplikacji: kolory, zmienne CSS, typografie, tlo, nawigacje, formularze, karty, tabele, przyciski, komunikaty, wykresy oraz podstawowa responsywnosc. Ten plik jest podlaczony do wszystkich glownych widokow.

`css/index.css` rozszerza style strony glownej. Definiuje proporcje dwoch kolumn oraz wyglad podsumowania wykresu.

`css/hourly.css` zawiera drobne style dla widoku godzinowego.

`css/weekly.css` zawiera style kart dni, podsumowania tygodnia i szybkiego przegladu prognozy.

`css/history.css` styluje uklad pol dat oraz tabele historyczna.

`css/air.css` zawiera style specyficzne dla widoku jakosci powietrza.

### Pliki JavaScript

`js/geocoding.js` zawiera funkcje `geocodeCity(city)`. Jej zadaniem jest zamiana nazwy miasta wpisanej przez uzytkownika na wspolrzedne geograficzne. Funkcja korzysta z Open-Meteo Geocoding API i zwraca obiekt z szerokoscia, dlugoscia, nazwa miasta i krajem. Wszystkie widoki korzystaja z tej funkcji przed pobraniem wlasciwych danych pogodowych.

`js/search_history.js` odpowiada za historie wyszukiwania. Po poprawnym pobraniu danych nazwa miasta jest zapisywana w `localStorage` pod kluczem `weatherSearchHistory`. Historia jest ograniczona do 8 pozycji. Funkcja `renderSearchHistory()` tworzy przyciski z ostatnio wyszukiwanymi miastami i pozwala szybko ponownie pobrac dane.

`js/current.js` obsluguje strone glowna. Po wyslaniu formularza sprawdza, czy nazwa miasta ma przynajmniej 2 znaki, pobiera wspolrzedne przez `geocodeCity()`, a potem wykonuje zapytanie do Forecast API. Widok pokazuje dane aktualne oraz dane godzinowe. Plik zawiera tez obsluge przelaczania wykresu pomiedzy temperatura, opadami i wiatrem.

`js/hourly.js` obsluguje widok prognozy godzinowej. Pobiera dane dla najblizszych 24 godzin i przekazuje je do wspolnej funkcji rysujacej wykres. Stan `selectedDataset` okresla, ktory typ danych jest aktualnie widoczny.

`js/weekly.js` obsluguje prognoze 7-dniowa. Po pobraniu danych tworzy karty dni w funkcji `showDays()`. Funkcja `showWeeklySummary()` oblicza proste agregacje: najcieplejszy dzien, najchlodniejszy dzien, sume opadow i maksymalny wiatr. Funkcja `showWeeklyOverview()` tworzy skrocony przeglad tygodnia.

`js/history.js` obsluguje dane archiwalne. Ustawia domyslny zakres dat, waliduje formularz i blokuje niepoprawne zakresy. Najwazniejsza walidacja znajduje sie w funkcji `validateDates()`. Po pobraniu danych funkcja `showHistory()` tworzy wiersze tabeli.

`js/air.js` obsluguje jakosc powietrza. Po wyszukaniu miasta pobiera aktualny AQI, pyl PM2.5, PM10, NO2, O3, indeks UV oraz dane godzinowe. Aktualne wartosci trafiaja do panelu statystyk, a prognoza godzinowa do tabeli.

`js/weather_chart.js` jest wspolnym modulem do rysowania wykresow SVG. Nie korzysta z zewnetrznej biblioteki. Funkcja `drawWeatherChart(options)` przyjmuje konfiguracje wykresu:

- `element` - element SVG, w ktorym ma zostac narysowany wykres,
- `labels` - etykiety osi X, np. godziny,
- `values` - wartosci liczbowe,
- `type` - typ wykresu: `line` albo `bar`,
- `color` - kolor serii danych,
- `unit` - jednostka wyswietlana przy wartosciach,
- `minValue` - opcjonalna minimalna wartosc osi Y.

Przed rysowaniem wykres czysci swoja zawartosc i ustawia `viewBox`. Nastepnie obliczany jest zakres wartosci, odstepy na osi X oraz skala osi Y. Osie, siatka i etykiety sa tworzone jako elementy SVG. Dla wykresu liniowego tworzona jest linia `polyline` oraz punkty `circle`. Dla wykresu slupkowego tworzone sa elementy `rect`.

### Przeplyw danych

Typowy przeplyw danych wyglada tak:

1. Uzytkownik wpisuje miasto i wysyla formularz.
2. JavaScript sprawdza podstawowa poprawnosc formularza.
3. Funkcja `geocodeCity()` pobiera wspolrzedne miasta.
4. Odpowiedni plik widoku wykonuje zapytanie do API pogodowego.
5. Dane JSON sa przetwarzane w funkcjach renderujacych.
6. Wyniki sa wpisywane do elementow HTML przez `textContent`, `innerHTML` albo przez dynamicznie tworzone elementy.
7. Nazwa miasta jest zapisywana w historii wyszukiwania.

### Obsluga formularzy i bledow

Kazdy widok ma formularz z polem miasta. Wspolna zasada walidacji polega na tym, ze nazwa miasta musi miec co najmniej 2 znaki. Widok historyczny ma dodatkowa walidacje dat. Podczas pobierania danych przycisk wysylania formularza jest blokowany, zeby ograniczyc przypadkowe wielokrotne zapytania.

Bledy z API oraz bledy walidacji sa pokazywane w elementach komunikatow. Jezeli zapytanie sie nie powiedzie, widok czysci stare dane i pokazuje informacje o problemie.

### Wykresy SVG

Wykresy sa rysowane recznie w pliku `weather_chart.js`. Dzieki temu aplikacja nie wymaga biblioteki typu Chart.js. Ten sam mechanizm jest wykorzystywany w widoku strony glownej i prognozy godzinowej.

Wykres liniowy jest uzywany dla temperatury, poniewaz dobrze pokazuje zmiane wartosci w czasie. Wykres slupkowy jest uzywany dla opadow i wiatru, poniewaz latwo porownac wartosci godzinowe. Przyciski w interfejsie zmieniaja aktualnie wybrany zestaw danych, a potem wywoluja ponowne rysowanie wykresu.
