import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2>Water Monitor</h2>

      <nav>
        <NavLink to="/">
          Dashboard
        </NavLink>

        <NavLink to="/live">
          Live Monitoring
        </NavLink>

        <NavLink to="/history">
          Historical Data
        </NavLink>

        <NavLink to="/alerts">
          Alerts
        </NavLink>

        <NavLink to="/equipment">
          Equipment
        </NavLink>

        <NavLink to="/settings">
          Settings
        </NavLink>
      </nav>

    </div>
  );
}

export default Sidebar;