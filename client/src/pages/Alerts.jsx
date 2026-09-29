import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH ALERTS
  // ==========================================

  const fetchAlerts = async () => {
    try {
      const response = await apiFetch("/api/alerts");

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      setAlerts(data);

    } catch (error) {
      console.error("Error fetching alerts:", error);

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // LOAD ALERTS
  // ==========================================

  useEffect(() => {
    fetchAlerts();

    // Refresh alerts every 5 seconds
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);


  // ==========================================
  // CLEAR ALL ALERTS
  // ==========================================

  const handleClearAlerts = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all alerts?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setMessage("");

      const response = await apiFetch(
        "/api/alerts",
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to clear alerts"
        );
      }

      setAlerts([]);

      setMessage(
        "All alerts cleared successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Error clearing alerts:",
        error
      );

      setMessage(
        "Failed to clear alerts."
      );

    } finally {
      setClearing(false);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <h2>Loading alerts...</h2>;
  }


  return (
    <div className="alerts-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>System Alerts</h1>

          <p>
            Abnormal water quality and plant
            parameter alerts
          </p>
        </div>

      </div>


      {/* SUCCESS / ERROR MESSAGE */}

      {message && (
        <div className="settings-message">
          {message}
        </div>
      )}


      {/* SUMMARY */}

      <div className="alert-summary">

        <div className="alert-summary-card">

          <h3>
            Total Alerts
          </h3>

          <strong>
            {alerts.length}
          </strong>

        </div>


        {alerts.length > 0 && (

          <button
            className="clear-alerts-btn"
            onClick={handleClearAlerts}
            disabled={clearing}
          >
            {clearing
              ? "Clearing..."
              : "Clear All Alerts"}
          </button>

        )}

      </div>


      {/* ALERT LIST */}

      {alerts.length === 0 ? (

        <div className="no-alerts">

          No alerts detected. All monitored
          parameters are normal.

        </div>

      ) : (

        <div className="alerts-table-container">

          <table className="alerts-table">

            <thead>

              <tr>
                <th>Parameter</th>
                <th>Abnormal Value</th>
                <th>Message</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              {alerts.map((alert) => (

                <tr key={alert._id}>

                  <td className="alert-parameter">
                    ⚠ {alert.parameter}
                  </td>

                  <td className="alert-number">
                    {alert.value}
                  </td>

                  <td>
                    {alert.message}
                  </td>

                  <td>
                    {alert.timestamp
                      ? new Date(
                          alert.timestamp
                        ).toLocaleString()
                      : "Not available"}
                  </td>

                  <td>

                    <span className="alert-status">
                      Warning
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Alerts;