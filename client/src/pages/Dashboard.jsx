import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function Dashboard() {
  const [reading, setReading] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [settings, setSettings] = useState(null);
  const fetchDashboardData = async () => {
    try {
      const [
        readingResponse,
        alertsResponse,
        equipmentResponse,
        settingsResponse,
      ] = await Promise.all([
        apiFetch("/api/sensors/latest"),
        apiFetch("/api/alerts"),
        apiFetch("/api/equipment"),
        apiFetch("/api/settings"),
      ]);

      const readingData = await readingResponse.json();
      const alertsData = await alertsResponse.json();
      const equipmentData = await equipmentResponse.json();
      const settingsData = await settingsResponse.json();

      setReading(readingData);
      setAlerts(alertsData);
      setEquipment(equipmentData);
      setSettings(settingsData);

    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );
    }
  };

  // ==========================================
  // AUTO REFRESH EVERY 5 SECONDS
  // ==========================================

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(
      fetchDashboardData,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (!reading || !settings) {
    return <h2>Loading dashboard...</h2>;
  }

  // ==========================================
  // CHECK SENSOR CONDITIONS
  // ==========================================

  const checkPH =
    reading.pH >= settings.pHMin &&
    reading.pH <= settings.pHMax;

  const checkTurbidity =
    reading.turbidity <= settings.turbidityMax;

  const checkTemperature =
    reading.temperature >= settings.temperatureMin &&
    reading.temperature <= settings.temperatureMax;

  const checkWaterLevel =
    reading.waterLevel >= settings.waterLevelMin &&
    reading.waterLevel <= settings.waterLevelMax;

  const checkFlowRate =
    reading.flowRate >= settings.flowRateMin &&
    reading.flowRate <= settings.flowRateMax;

  // ==========================================
  // OVERALL SYSTEM STATUS
  // ==========================================

  const systemNormal =
    checkPH &&
    checkTurbidity &&
    checkTemperature &&
    checkWaterLevel &&
    checkFlowRate;

  // Latest 5 alerts
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="page-header">
        <h1>Dashboard</h1>

        <p>
          Water Treatment Plant Overview
        </p>
      </div>


      {/* ================= PLANT STATUS ================= */}

      <div
        className={
          systemNormal
            ? "plant-status plant-normal"
            : "plant-status plant-warning"
        }
      >

        <div>
          <h2>Plant Status</h2>

          <p>
            {systemNormal
              ? "All monitored parameters are within normal limits."
              : "One or more parameters require attention."}
          </p>
        </div>

        <span>
          {systemNormal
            ? "NORMAL"
            : "WARNING"}
        </span>

      </div>


      {/* ================= SENSOR READINGS ================= */}

      <h2 className="section-title">
        Latest Sensor Readings
      </h2>

      <div className="dashboard-cards">

        <SensorCard
          title="pH Level"
          value={reading.pH}
          normal={checkPH}
        />

        <SensorCard
          title="Turbidity"
          value={`${reading.turbidity} NTU`}
          normal={checkTurbidity}
        />

        <SensorCard
          title="Temperature"
          value={`${reading.temperature} °C`}
          normal={checkTemperature}
        />

        <SensorCard
          title="Water Level"
          value={`${reading.waterLevel}%`}
          normal={checkWaterLevel}
        />

        <SensorCard
          title="Flow Rate"
          value={reading.flowRate}
          normal={checkFlowRate}
        />

      </div>


      {/* ================= SYSTEM SUMMARY ================= */}

      <h2 className="section-title">
        System Summary
      </h2>

      <div className="dashboard-info">

        <div className="info-box">
          <h3>Total Alerts</h3>

          <strong>
            {alerts.length}
          </strong>
        </div>


        <div className="info-box">
          <h3>Total Equipment</h3>

          <strong>
            {equipment.length}
          </strong>
        </div>


        <div className="info-box">
          <h3>System Status</h3>

          <strong
            className={
              systemNormal
                ? "status-good"
                : "status-bad"
            }
          >
            {systemNormal
              ? "Normal"
              : "Attention Required"}
          </strong>

        </div>

      </div>


      {/* ================= RECENT ALERTS ================= */}

      <div className="recent-alerts-section">

        <h2 className="section-title">
          Recent Alerts
        </h2>

        {recentAlerts.length === 0 ? (

          <p>No alerts recorded.</p>

        ) : (

          <div className="recent-alerts-table">

            <table>

              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Message</th>
                  <th>Date & Time</th>
                </tr>
              </thead>

              <tbody>

                {recentAlerts.map((alert) => (

                  <tr key={alert._id}>

                    <td className="alert-parameter">
                      ⚠ {alert.parameter}
                    </td>

                    <td>
                      {alert.value}
                    </td>

                    <td>
                      {alert.message}
                    </td>

                    <td>
                      {new Date(
                        alert.timestamp
                      ).toLocaleString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================= LAST UPDATE ================= */}

      <p className="dashboard-time">

        Latest sensor reading:{" "}

        {new Date(
          reading.timestamp
        ).toLocaleString()}

      </p>

    </div>
  );
}


// ==========================================
// SENSOR CARD COMPONENT
// ==========================================

function SensorCard({
  title,
  value,
  normal
}) {

  return (

    <div className="sensor-card">

      <div className="sensor-card-header">

        <h3>
          {title}
        </h3>

        <span
          className={
            normal
              ? "normal"
              : "danger"
          }
        >
          {normal
            ? "Normal"
            : "Warning"}
        </span>

      </div>

      <div className="sensor-value">
        {value}
      </div>

    </div>
  );
}

export default Dashboard;