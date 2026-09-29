import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import History from "./pages/History";
import Alerts from "./pages/Alerts";
import Equipment from "./pages/Equipment";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import "./App.css";

function App() {

const [user, setUser] = useState(() => {
  try {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      return JSON.parse(storedUser);
    }

    return null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return null;
  }
});

  // Called after successful login
  const handleLogin = (userData) => {
    setUser(userData);
  };


  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };


  // ========================================
  // USER NOT LOGGED IN
  // ========================================

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  // ========================================
  // USER LOGGED IN
  // ========================================

  return (
    <BrowserRouter>

      <div className="app-layout">

        <Sidebar />

        <main className="main-content">

          {/* TOP USER BAR */}

          <div className="top-user-bar">

            <div className="user-details">

              <span className="user-name">
                {user.name}
              </span>

              <span className="user-role">
                {user.role}
              </span>

            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>


          {/* APPLICATION ROUTES */}

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/live"
              element={<LiveMonitoring />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/alerts"
              element={<Alerts />}
            />

            <Route
              path="/equipment"
              element={<Equipment />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* Unknown URL → Dashboard */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>
  );
}

export default App;