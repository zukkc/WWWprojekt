const ctx = document.getElementById('daily-weather-chart');
const dwlTempBtn = document.getElementById('dwl-temp');
const dwlRainfallBtn = document.getElementById('dwl-rainfall');

const dailyChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
      '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
      '21:00', '22:00', '23:00'
    ],
    datasets: [
      {
        label: 'temperatura (°C)',
        data: [12, 19, 3, 5, 2, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
        type: 'line',
        borderWidth: 2,
      },
      {
        label: 'Szansa na opady (%)',
        data: [4, 5, 3, 5, 56, 3, 5, 59, 36, 5, 5, 12, 5, 0, 5, 0, 0, 5, 0, 5, 20, 5, 100],
        type: "bar",
        borderWidth: 1,
        hidden: true,
      }
    ]
  },
  options: {
    plugins: {
      legend: {
        display: false,
      }
    }
  }
});

dwlTempBtn.addEventListener("click", () => showDataset(dailyChart, 0));
dwlRainfallBtn.addEventListener("click", () => showDataset(dailyChart, 1));

function showDataset(chart, indexToShow) {
  chart.data.datasets.forEach((_, i) => {
    chart.setDatasetVisibility(i, i === indexToShow);
  });
  chart.update();
}
