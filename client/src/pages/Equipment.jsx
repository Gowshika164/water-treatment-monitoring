import { useEffect, useState } from "react";
import { apiFetch } from "../api";

import {
  CircleGauge,
  Cylinder,
  Filter,
  Settings,
  Droplets
} from "lucide-react";

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await apiFetch("/api/equipment");

        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        const data = await response.json();

        setEquipment(data);
      } catch (error) {
        console.error("Error fetching equipment:", error);
        setError("Unable to load equipment information.");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Choose icon based on equipment type/name
  const getEquipmentIcon = (item) => {
    const name = item.name.toLowerCase();
    const type = item.type.toLowerCase();

    if (type === "pump" || name.includes("pump")) {
      return <CircleGauge size={30} />;
    }

    if (type === "tank" || name.includes("tank")) {
      return <Cylinder size={30} />;
    }

    if (type === "filter" || name.includes("filter")) {
      return <Filter size={30} />;
    }

    if (type === "valve" || name.includes("valve")) {
      return <Settings size={30} />;
    }

    return <Droplets size={30} />;
  };

  if (loading) {
    return <h2>Loading equipment...</h2>;
  }

  return (
    <div className="equipment-page">

      <div className="page-header">
        <h1>Equipment Monitoring</h1>
        <p>
          Monitor water treatment plant equipment status
        </p>
      </div>

      {error && (
        <div className="settings-message">
          {error}
        </div>
      )}

      <div className="equipment-summary">

        <div className="equipment-summary-card">
          <h3>Total Equipment</h3>
          <strong>{equipment.length}</strong>
        </div>

        <div className="equipment-summary-card">
          <h3>Normal Equipment</h3>

          <strong className="equipment-normal-count">
            {
              equipment.filter(
                (item) => item.condition === "Normal"
              ).length
            }
          </strong>
        </div>

      </div>

      {equipment.length === 0 ? (

        <div className="no-equipment">
          No equipment information available.
        </div>

      ) : (

        <div className="equipment-grid">

          {equipment.map((item) => (

            <div
              className="equipment-card"
              key={item._id}
            >

              <div className="equipment-card-header">

                <div className="equipment-title-section">

                  <div className="equipment-icon">
                    {getEquipmentIcon(item)}
                  </div>

                  <h2>{item.name}</h2>

                </div>

                <span
                  className={
                    item.condition === "Normal"
                      ? "equipment-normal"
                      : "equipment-warning"
                  }
                >
                  {item.condition}
                </span>

              </div>

              <div className="equipment-details">

                <p>
                  <strong>Type:</strong>{" "}
                  {item.type}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {item.status}
                </p>

                <p>
                  <strong>Condition:</strong>{" "}
                  {item.condition}
                </p>

                <p>
                  <strong>Last Updated:</strong>{" "}
                  {item.updatedAt
                    ? new Date(
                        item.updatedAt
                      ).toLocaleString()
                    : "Not available"}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Equipment;