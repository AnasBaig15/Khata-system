import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../Redux/authSlice";
import Logo from "../images/logo1.png";
import { Eye, EyeOff } from "lucide-react";
import "../signup.css";

function Signup() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(signupUser(formData));
    if (signupUser.fulfilled.match(resultAction)) {
      setFormData({ fullname: "", email: "", password: "" });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-logo">
          <img src={Logo} alt="Logo" />
        </div>
        <h2 className="signup-title">Create an Account</h2>
        <p className="signup-subtitle">Sign up to get started</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div>
            <label className="signup-label">Full Name</label>
            <input
              type="text"
              name="fullname"
              required
              value={formData.fullname}
              onChange={handleChange}
              className="signup-input"
            />
          </div>

          <div>
            <label className="signup-label">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="signup-input"
            />
          </div>

          <div>
            <label className="signup-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="signup-input"
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <a href="/" className="signup-link">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
