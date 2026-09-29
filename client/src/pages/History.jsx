import { useEffect, useState } from "react";
import { apiFetch } from "../api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH SENSOR HISTORY
  // ==========================================

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiFetch(
          "/api/sensors/history"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch sensor history"
          );
        }

        const data = await response.json();

        // Backend returns newest → oldest.
        // Chart should display oldest → newest.
        setHistory([...data].reverse());

      } catch (error) {
        console.error(
          "Error fetching history:",
          error
        );

      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <h2>
        Loading historical data...
      </h2>
    );
  }


  return (
    <div className="history-page">

      {/* HEADER */}

      <div className="page-header">

        <h1>
          Historical Data
        </h1>

        <p>
          Previous water treatment plant readings
        </p>

      </div>


      {/* ======================================
          SENSOR TREND CHART
      ====================================== */}

      <div className="chart-card">

        <h2>
          Sensor Trends
        </h2>

        {history.length === 0 ? (

          <p>
            No historical sensor data available.
          </p>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <LineChart data={history}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) =>
                  new Date(
                    value
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                }
              />

              <YAxis />

              <Tooltip
                labelFormatter={(value) =>
                  new Date(
                    value
                  ).toLocaleString()
                }
              />

              <Legend />


              <Line
                type="monotone"
                dataKey="pH"
                name="pH"
              />

              <Line
                type="monotone"
                dataKey="turbidity"
                name="Turbidity"
              />

              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature"
              />

              <Line
                type="monotone"
                dataKey="waterLevel"
                name="Water Level"
              />

              <Line
                type="monotone"
                dataKey="flowRate"
                name="Flow Rate"
              />

            </LineChart>

          </ResponsiveContainer>

        )}

      </div>


      {/* ======================================
          HISTORY TABLE
      ====================================== */}

      <div className="history-table-section">

        <h2>
          Sensor Reading History
        </h2>

        {history.length === 0 ? (

          <p>
            No sensor readings available.
          </p>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Date & Time</th>
                  <th>pH</th>
                  <th>Turbidity</th>
                  <th>Temperature</th>
                  <th>Water Level</th>
                  <th>Flow Rate</th>
                </tr>

              </thead>


              <tbody>

                {[...history]
                  .reverse()
                  .map((item) => (

                    <tr key={item._id}>

                      <td>
                        {new Date(
                          item.timestamp
                        ).toLocaleString()}
                      </td>

                      <td>
                        {item.pH}
                      </td>

                      <td>
                        {item.turbidity} NTU
                      </td>

                      <td>
                        {item.temperature} °C
                      </td>

                      <td>
                        {item.waterLevel}%
                      </td>

                      <td>
                        {item.flowRate}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default History;