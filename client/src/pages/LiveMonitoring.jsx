import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function LiveMonitoring() {
  const [reading, setReading] = useState(null);
  const [settings, setSettings] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // ==========================================
  // FETCH LIVE DATA
  // ==========================================

  const fetchLiveData = async () => {
    try {
      const [
        readingResponse,
        settingsResponse
      ] = await Promise.all([
        apiFetch("/api/sensors/latest"),
        apiFetch("/api/settings")
      ]);

      const readingData =
        await readingResponse.json();

      const settingsData =
        await settingsResponse.json();

      setReading(readingData);
      setSettings(settingsData);
      setLastRefresh(new Date());

    } catch (error) {
      console.error(
        "Error fetching live monitoring data:",
        error
      );
    }
  };

  // ==========================================
  // AUTO REFRESH EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {
    // Fetch immediately
    fetchLiveData();

    // Refresh every 5 seconds
    const interval = setInterval(
      fetchLiveData,
      5000
    );

    // Stop interval when leaving page
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (!reading || !settings) {
    return (
      <h2>
        Loading live monitoring data...
      </h2>
    );
  }

  // ==========================================
  // SENSOR INFORMATION
  // ==========================================

  const sensors = [
    {
      name: "pH Level",

      value: reading.pH,

      unit: "",

      normal:
        reading.pH >= settings.pHMin &&
        reading.pH <= settings.pHMax,

      range:
        `${settings.pHMin} - ${settings.pHMax}`,
    },

    {
      name: "Turbidity",

      value: reading.turbidity,

      unit: "NTU",

      normal:
        reading.turbidity <=
        settings.turbidityMax,

      range:
        `0 - ${settings.turbidityMax} NTU`,
    },

    {
      name: "Temperature",

      value: reading.temperature,

      unit: "°C",

      normal:
        reading.temperature >=
          settings.temperatureMin &&
        reading.temperature <=
          settings.temperatureMax,

      range:
        `${settings.temperatureMin} - ${settings.temperatureMax} °C`,
    },

    {
      name: "Water Level",

      value: reading.waterLevel,

      unit: "%",

      normal:
        reading.waterLevel >=
          settings.waterLevelMin &&
        reading.waterLevel <=
          settings.waterLevelMax,

      range:
        `${settings.waterLevelMin} - ${settings.waterLevelMax}%`,
    },

    {
      name: "Flow Rate",

      value: reading.flowRate,

      unit: "",

      normal:
        reading.flowRate >=
          settings.flowRateMin &&
        reading.flowRate <=
          settings.flowRateMax,

      range:
        `${settings.flowRateMin} - ${settings.flowRateMax}`,
    },
  ];

  return (
    <div className="live-page">

      {/* HEADER */}

      <div className="page-header">

        <h1>
          Live Monitoring
        </h1>

        <p>
          Current water treatment plant readings
        </p>

      </div>


      {/* LIVE INDICATOR */}

      <div className="live-indicator">

        <span className="live-dot"></span>

        LIVE

      </div>


      {/* SENSOR CARDS */}

      <div className="live-grid">

        {sensors.map((sensor) => (

          <div
            className="live-card"
            key={sensor.name}
          >

            <div className="live-card-header">

              <h3>
                {sensor.name}
              </h3>

              <span
                className={
                  sensor.normal
                    ? "normal"
                    : "danger"
                }
              >

                {sensor.normal
                  ? "Normal"
                  : "Warning"}

              </span>

            </div>


            <div className="live-value">

              {sensor.value}{" "}

              <span>
                {sensor.unit}
              </span>

            </div>


            <div className="normal-range">

              Normal Range:{" "}
              {sensor.range}

            </div>

          </div>

        ))}

      </div>


      {/* FOOTER */}

      <div className="live-footer">

        <p>
          Sensor timestamp:{" "}

          {new Date(
            reading.timestamp
          ).toLocaleString()}
        </p>


        {lastRefresh && (

          <p>
            Dashboard refreshed:{" "}

            {lastRefresh.toLocaleTimeString()}
          </p>

        )}


        <p>
          Automatically refreshes every 5 seconds
        </p>

      </div>

    </div>
  );
}

export default LiveMonitoring;