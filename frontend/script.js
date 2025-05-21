const chartCanvas = document.getElementById('weatherChart');
const locationSelect = document.getElementById('locationSelect');
let weatherChart = null;

// Escuchar cambios de ubicación
locationSelect.addEventListener('change', () => {
    const [lat, lon] = locationSelect.value.split(',');
    fetchWeatherData(parseFloat(lat), parseFloat(lon));
});

// Función para obtener icono según el código del tiempo
function getWeatherIcon(code) {
    const iconMap = {
        0: "☀️",   // Soleado
        1: "🌤️",  // Parcialmente despejado
        2: "⛅",
        3: "☁️",
        45: "🌫️",
        48: "🌫️",
        51: "🌦️",
        53: "🌦️",
        55: "🌧️",
        61: "🌧️",
        63: "🌧️",
        65: "🌧️",
        66: "🌨️",
        67: "🌨️",
        71: "🌨️",
        73: "🌨️",
        75: "❄️",
        77: "❄️",
        80: "🌧️",
        81: "🌧️",
        82: "🌧️",
        95: "⛈️",
        96: "⛈️",
        99: "⛈️"
    };
    return iconMap[code] || "❓";
}

// Función para obtener y mostrar datos del clima
async function fetchWeatherData(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=auto`
        );
        const data = await response.json();
        const hours = data.hourly.time;
        const temperatures = data.hourly.temperature_2m;
        const weatherCodes = data.hourly.weathercode;

        const today = new Date().toISOString().split('T')[0];
        const todayHours = [];
        const todayTemps = [];
        const todayWeatherCodes = [];

        for (let i = 0; i < hours.length; i++) {
            if (hours[i].startsWith(today)) {
                const hour = new Date(hours[i]).getHours();
                todayHours.push(`${hour}:00`);
                todayTemps.push(temperatures[i]);
                todayWeatherCodes.push(weatherCodes[i]);
            }
        }

        renderChart(todayHours, todayTemps, todayWeatherCodes);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Función para renderizar la gráfica con iconos
function renderChart(labels, temperatures, weatherCodes) {
    if (weatherChart) {
        weatherChart.destroy();
    }

    const weatherIcons = weatherCodes.map(code => getWeatherIcon(code));

    weatherChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temperatures,
                backgroundColor: 'rgba(99, 132, 255, 0.2)',
                borderColor: 'rgba(99, 132, 255, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(99,132,255,1)'
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const temp = context.formattedValue;
                            const icon = weatherIcons[context.dataIndex];
                            return `${icon} ${temp} °C`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        font: { size: 10 }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 }
                    }
                }
            }
        },
        plugins: [{
            id: 'weatherIconPlugin',
            afterDatasetsDraw(chart) {
                const ctx = chart.ctx;
                const dataset = chart.getDatasetMeta(0);
                dataset.data.forEach((point, index) => {
                    ctx.save();
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(weatherIcons[index], point.x, point.y - 15);
                    ctx.restore();
                });
            }
        }]
    });
}

// Carga inicial (Bilbao por defecto)
const [defaultLat, defaultLon] = locationSelect.value.split(',');
fetchWeatherData(parseFloat(defaultLat), parseFloat(defaultLon));
