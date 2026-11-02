import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store login information
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);

    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">
          <div className="login-icon">
            💧
          </div>

          <h1>Water Monitor</h1>

          <p>
            Water Treatment Plant Monitoring System
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="login-heading">
            <h2>Welcome Back</h2>
            <p>
              Sign in to access the monitoring dashboard
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <p className="login-footer">
          Real-Time Water Treatment Plant Monitoring
        </p>

      </div>

    </div>
  );
}

export default Login;