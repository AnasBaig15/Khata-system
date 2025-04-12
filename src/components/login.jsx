import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../Redux/authSlice";
import { useNavigate } from "react-router-dom";
import Logo from "../images/logo1.png";
import "../signup.css";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password })).then((action) => {
      if (action.meta.requestStatus === "fulfilled") {
        setEmail("");
        setPassword("");
        navigate("/dashboard");
      }
    });
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h2 className="signup-title">Welcome Back!</h2>
        <p className="signup-subtitle">Sign in to continue</p>

        <form className="signup-form" onSubmit={handleLogin}>
          <div>
            <label className="signup-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signup-input"
            />
          </div>

          <div>
            <label className="signup-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="signup-input password-input"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="signup-footer">
          Don’t have an account?{" "}
          <a href="/register" className="register-link">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;

{/* <div className="container">
<div className="card">
  <div className="logo">
    <img src={Logo} alt="Logo" />
  </div>

  <h2 className="title">Welcome Back!</h2>
  <p className="subtitle">Sign in to continue</p>

  <form className="form" onSubmit={handleLogin}>
    <div>
      <label className="label">Email Address</label>
      <input
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
    </div>

    <div>
      <label className="label">Password</label>
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
    </div>

    <div>
      <a href="#" className="forgot-password">
        Forgot your password?
      </a>
    </div>

    <button type="submit" className="button" disabled={loading}>
      {loading ? "Signing in..." : "Sign in"}
    </button>
  </form>

  <p className="register-text">
    Don’t have an account?{" "}
    <a href="/register" className="register-link">
      Register here
    </a>
  </p>
</div>
</div> */}