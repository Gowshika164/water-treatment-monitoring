import { useEffect, useState } from "react";
import { apiFetch } from "../api";

import {
FlaskConical,
Waves,
Thermometer,
Droplets,
Gauge,
Save
} from "lucide-react";

function Settings() {
const [settings, setSettings] = useState(null);
const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState("");
const [saving, setSaving] = useState(false);
const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState("");

// ==========================================
// FETCH SETTINGS
// ==========================================

const fetchSettings = async () => {
try {
setLoading(true);
setFetchError("");

  const response = await apiFetch("/api/settings");

  if (!response.ok) {
    throw new Error("Failed to fetch settings. Please try again.");
  }

  const data = await response.json();

  setSettings(data);
} catch (error) {
  console.error("Error fetching settings:", error);
  setFetchError(error.message || "Unable to load settings.");
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchSettings();
}, []);

// ==========================================
// HANDLE INPUT CHANGE
// ==========================================

const handleChange = (e) => {
const { name, value } = e.target;


setSettings((previousSettings) => ({
  ...previousSettings,
  [name]: Number(value)
}));


};

// ==========================================
// VALIDATE SETTINGS
// ==========================================

const validateSettings = () => {
if (settings.pHMin >= settings.pHMax) {
return "pH minimum must be less than pH maximum.";
}


if (settings.temperatureMin >= settings.temperatureMax) {
  return "Temperature minimum must be less than temperature maximum.";
}

if (settings.waterLevelMin >= settings.waterLevelMax) {
  return "Water level minimum must be less than water level maximum.";
}

if (settings.flowRateMin >= settings.flowRateMax) {
  return "Flow rate minimum must be less than flow rate maximum.";
}

if (settings.turbidityMax < 0) {
  return "Turbidity maximum cannot be negative.";
}

return null;


};

// ==========================================
// SAVE SETTINGS
// ==========================================

const handleSubmit = async (e) => {
e.preventDefault();


setMessage("");

const validationError = validateSettings();

if (validationError) {
  setMessage(validationError);
  setMessageType("error");
  return;
}

try {
  setSaving(true);

  const response = await apiFetch("/api/settings", {
    method: "PUT",
    body: JSON.stringify({
      pHMin: settings.pHMin,
      pHMax: settings.pHMax,
      turbidityMax: settings.turbidityMax,
      temperatureMin: settings.temperatureMin,
      temperatureMax: settings.temperatureMax,
      waterLevelMin: settings.waterLevelMin,
      waterLevelMax: settings.waterLevelMax,
      flowRateMin: settings.flowRateMin,
      flowRateMax: settings.flowRateMax
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update settings");
  }

  setSettings(data);
  setMessage("Threshold settings updated successfully.");
  setMessageType("success");

  setTimeout(() => {
    setMessage("");
    setMessageType("");
  }, 3000);

} catch (error) {
  console.error("Error updating settings:", error);

  setMessage(error.message || "Failed to update settings.");
  setMessageType("error");

} finally {
  setSaving(false);
}


};

// ==========================================
// LOADING
// ==========================================

if (loading) {
return <h2>Loading settings...</h2>;
}

// ==========================================
// FETCH ERROR
// ==========================================

if (fetchError && !settings) {
return ( <div className="settings-page"> <h2>Unable to load settings</h2> <p>{fetchError}</p>

    <button onClick={fetchSettings}>
      Try Again
    </button>
  </div>
);


}

if (!settings) {
return <h2>Settings are unavailable.</h2>;
}

// ==========================================
// UI
// ==========================================

return ( <div className="settings-page">

  <div className="page-header">
    <h1>Threshold Settings</h1>

    <p>
      Configure acceptable ranges for water
      treatment plant parameters
    </p>
  </div>

  {message && (
    <div
      className={
        messageType === "error"
          ? "settings-message settings-error"
          : "settings-message"
      }
    >
      {message}
    </div>
  )}

  <form
    className="settings-form settings-grid"
    onSubmit={handleSubmit}
  >

    {/* pH LEVEL */}

    <div className="setting-group">

      <div className="setting-card-header">

        <div className="setting-title">
          <div className="setting-icon">
            <FlaskConical size={23} />
          </div>

          <div>
            <h2>pH Level</h2>
            <p>Acceptable acidity and alkalinity range</p>
          </div>
        </div>

        <span className="range-badge">
          {settings.pHMin} – {settings.pHMax}
        </span>

      </div>

      <div className="setting-inputs">

        <div>
          <label>Minimum</label>
          <input
            type="number"
            step="0.1"
            name="pHMin"
            value={settings.pHMin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Maximum</label>
          <input
            type="number"
            step="0.1"
            name="pHMax"
            value={settings.pHMax}
            onChange={handleChange}
            required
          />
        </div>

      </div>
    </div>

    {/* TURBIDITY */}

    <div className="setting-group">

      <div className="setting-card-header">

        <div className="setting-title">
          <div className="setting-icon">
            <Waves size={23} />
          </div>

          <div>
            <h2>Turbidity</h2>
            <p>Maximum acceptable water cloudiness</p>
          </div>
        </div>

        <span className="range-badge">
          ≤ {settings.turbidityMax} NTU
        </span>

      </div>

      <div className="setting-inputs">

        <div>
          <label>Maximum (NTU)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            name="turbidityMax"
            value={settings.turbidityMax}
            onChange={handleChange}
            required
          />
        </div>

      </div>
    </div>

    {/* TEMPERATURE */}

    <div className="setting-group">

      <div className="setting-card-header">

        <div className="setting-title">
          <div className="setting-icon">
            <Thermometer size={23} />
          </div>

          <div>
            <h2>Temperature</h2>
            <p>Safe operating temperature range</p>
          </div>
        </div>

        <span className="range-badge">
          {settings.temperatureMin} – {settings.temperatureMax} °C
        </span>

      </div>

      <div className="setting-inputs">

        <div>
          <label>Minimum (°C)</label>
          <input
            type="number"
            step="0.1"
            name="temperatureMin"
            value={settings.temperatureMin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Maximum (°C)</label>
          <input
            type="number"
            step="0.1"
            name="temperatureMax"
            value={settings.temperatureMax}
            onChange={handleChange}
            required
          />
        </div>

      </div>
    </div>

    {/* WATER LEVEL */}

    <div className="setting-group">

      <div className="setting-card-header">

        <div className="setting-title">
          <div className="setting-icon">
            <Droplets size={23} />
          </div>

          <div>
            <h2>Water Level</h2>
            <p>Recommended storage level range</p>
          </div>
        </div>

        <span className="range-badge">
          {settings.waterLevelMin} – {settings.waterLevelMax} %
        </span>

      </div>

      <div className="setting-inputs">

        <div>
          <label>Minimum (%)</label>
          <input
            type="number"
            step="0.1"
            name="waterLevelMin"
            value={settings.waterLevelMin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Maximum (%)</label>
          <input
            type="number"
            step="0.1"
            name="waterLevelMax"
            value={settings.waterLevelMax}
            onChange={handleChange}
            required
          />
        </div>

      </div>
    </div>

    {/* FLOW RATE */}

    <div className="setting-group flow-setting">

      <div className="setting-card-header">

        <div className="setting-title">
          <div className="setting-icon">
            <Gauge size={23} />
          </div>

          <div>
            <h2>Flow Rate</h2>
            <p>Acceptable plant water flow range</p>
          </div>
        </div>

        <span className="range-badge">
          {settings.flowRateMin} – {settings.flowRateMax}
        </span>

      </div>

      <div className="setting-inputs">

        <div>
          <label>Minimum</label>
          <input
            type="number"
            step="0.1"
            name="flowRateMin"
            value={settings.flowRateMin}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Maximum</label>
          <input
            type="number"
            step="0.1"
            name="flowRateMax"
            value={settings.flowRateMax}
            onChange={handleChange}
            required
          />
        </div>

      </div>
    </div>

    {/* SAVE BUTTON */}

    <div className="settings-actions">

      <button
        type="submit"
        className="save-settings-btn"
        disabled={saving}
      >
        <Save size={17} />

        {saving
          ? "Saving..."
          : "Save Threshold Settings"}
      </button>

    </div>

  </form>
</div>


);
}

export default Settings;
