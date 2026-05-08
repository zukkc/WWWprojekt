function drawWeatherChart(options) {
  const chart = options.element;
  const labels = options.labels || [];
  const values = (options.values || []).map(Number);
  const type = options.type || "line";
  const color = options.color || "#2e7db7";
  const unit = options.unit || "";
  const minFromZero = options.minValue === 0;

  if (!chart) {
    return;
  }

  chart.innerHTML = "";
  chart.setAttribute("viewBox", "0 0 760 360");

  if (labels.length === 0 || values.length === 0) {
    drawEmptyMessage(chart, "Brak danych do wyswietlenia");
    return;
  }

  const width = 760;
  const height = 360;
  const marginLeft = 62;
  const marginRight = 24;
  const marginTop = 24;
  const marginBottom = 52;
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;
  const valueRange = getValueRange(values, minFromZero);
  const isBarChart = type === "bar";
  const stepX = getStepX(values.length, chartWidth, isBarChart);

  drawAxes(chart, width, height, marginLeft, marginTop, chartHeight, marginBottom);
  drawGrid(chart, valueRange.min, valueRange.max, marginLeft, marginTop, chartWidth, chartHeight, unit);
  drawLabels(chart, labels, marginLeft, marginTop, chartHeight, stepX, isBarChart);

  if (isBarChart) {
    drawBars(chart, values, valueRange.min, valueRange.max, marginLeft, marginTop, chartHeight, stepX, color);
  } else {
    drawLine(chart, values, valueRange.min, valueRange.max, marginLeft, marginTop, chartHeight, stepX, color);
  }
}

function clearWeatherChart(chart) {
  if (chart) {
    chart.innerHTML = "";
  }
}

function getValueRange(values, minFromZero) {
  const minValue = Math.min.apply(null, values);
  const maxValue = Math.max.apply(null, values);
  let safeMin = minFromZero ? 0 : Math.floor(minValue) - 1;
  let safeMax = Math.ceil(maxValue) + 1;

  if (safeMin === safeMax) {
    safeMin -= 1;
    safeMax += 1;
  }

  return {
    min: safeMin,
    max: safeMax
  };
}

function getStepX(valueCount, chartWidth, isBarChart) {
  if (isBarChart) {
    return chartWidth / valueCount;
  }

  return valueCount > 1 ? chartWidth / (valueCount - 1) : chartWidth;
}

function drawAxes(chart, width, height, marginLeft, marginTop, chartHeight, marginBottom) {
  const xAxis = createSvgElement("line");
  xAxis.setAttribute("x1", marginLeft);
  xAxis.setAttribute("y1", height - marginBottom);
  xAxis.setAttribute("x2", width - 20);
  xAxis.setAttribute("y2", height - marginBottom);
  xAxis.setAttribute("stroke", "rgba(238, 243, 246, 0.7)");
  chart.appendChild(xAxis);

  const yAxis = createSvgElement("line");
  yAxis.setAttribute("x1", marginLeft);
  yAxis.setAttribute("y1", marginTop);
  yAxis.setAttribute("x2", marginLeft);
  yAxis.setAttribute("y2", marginTop + chartHeight);
  yAxis.setAttribute("stroke", "rgba(238, 243, 246, 0.7)");
  chart.appendChild(yAxis);
}

function drawGrid(chart, minValue, maxValue, marginLeft, marginTop, chartWidth, chartHeight, unit) {
  const lines = 5;

  for (let i = 0; i <= lines; i++) {
    const y = marginTop + (chartHeight / lines) * i;
    const value = maxValue - ((maxValue - minValue) / lines) * i;

    const gridLine = createSvgElement("line");
    gridLine.setAttribute("x1", marginLeft);
    gridLine.setAttribute("y1", y);
    gridLine.setAttribute("x2", marginLeft + chartWidth);
    gridLine.setAttribute("y2", y);
    gridLine.setAttribute("stroke", "rgba(255, 255, 255, 0.14)");
    chart.appendChild(gridLine);

    const label = createSvgElement("text");
    label.setAttribute("x", 12);
    label.setAttribute("y", y + 4);
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "rgba(238, 243, 246, 0.8)");
    label.textContent = roundChartValue(value) + unit;
    chart.appendChild(label);
  }
}

function drawLabels(chart, labels, marginLeft, marginTop, chartHeight, stepX, isBarChart) {
  const labelStep = Math.max(1, Math.ceil(labels.length / 8));

  for (let i = 0; i < labels.length; i++) {
    if (i % labelStep !== 0 && i !== labels.length - 1) {
      continue;
    }

    const x = getX(i, marginLeft, stepX, isBarChart);
    const label = createSvgElement("text");
    label.setAttribute("x", x - 14);
    label.setAttribute("y", marginTop + chartHeight + 32);
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "rgba(238, 243, 246, 0.75)");
    label.textContent = labels[i];
    chart.appendChild(label);
  }
}

function drawLine(chart, values, minValue, maxValue, marginLeft, marginTop, chartHeight, stepX, lineColor) {
  let points = "";

  for (let i = 0; i < values.length; i++) {
    const x = marginLeft + stepX * i;
    const y = getY(values[i], minValue, maxValue, marginTop, chartHeight);
    points += x + "," + y + " ";

    const circle = createSvgElement("circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 3);
    circle.setAttribute("fill", lineColor);
    chart.appendChild(circle);
  }

  const polyline = createSvgElement("polyline");
  polyline.setAttribute("points", points.trim());
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", lineColor);
  polyline.setAttribute("stroke-width", "3");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");
  chart.appendChild(polyline);
}

function drawBars(chart, values, minValue, maxValue, marginLeft, marginTop, chartHeight, stepX, barColor) {
  const barWidth = Math.max(8, Math.min(22, stepX * 0.55));
  const baseY = marginTop + chartHeight;

  for (let i = 0; i < values.length; i++) {
    const x = getX(i, marginLeft, stepX, true) - barWidth / 2;
    const y = getY(values[i], minValue, maxValue, marginTop, chartHeight);
    const height = Math.max(1, baseY - y);

    const rect = createSvgElement("rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", height);
    rect.setAttribute("rx", 4);
    rect.setAttribute("fill", barColor);
    chart.appendChild(rect);
  }
}

function drawEmptyMessage(chart, message) {
  const text = createSvgElement("text");
  text.setAttribute("x", 380);
  text.setAttribute("y", 180);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "16");
  text.setAttribute("fill", "rgba(238, 243, 246, 0.8)");
  text.textContent = message;
  chart.appendChild(text);
}

function getY(value, minValue, maxValue, marginTop, chartHeight) {
  return marginTop + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
}

function getX(index, marginLeft, stepX, isBarChart) {
  if (isBarChart) {
    return marginLeft + stepX * index + stepX / 2;
  }

  return marginLeft + stepX * index;
}

function roundChartValue(value) {
  return Math.round(value * 10) / 10;
}

function createSvgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
