import { useState } from "react";
// import "../assets/css/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8888/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Login successful! Token: " + data.accessToken);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong!");
    }
  };

  return (
    <>
      <div className="login-page">
        <header className="login-header">
          <div className="logo">LOGO</div>
        </header>

        <main className="login-main">
          <h1 className="login-title">Welcome to BloomUp!</h1>

          <div className="login-card" role="region" aria-label="Log in">
            <form className="login-form" onSubmit={handleLogin}>
              <label className="form-title">Log In</label>

              <input
                className="form-input"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
                required
              />

              <input
                className="form-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                required
              />

              <a href="#" className="forgot-password">
                Forgot password?
              </a>

              <button className="submit-button" type="submit">
                Log In
              </button>

              <p className="signup-text">
                Don't have an account? <a href="/signup">Sign Up</a>
              </p>

              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
