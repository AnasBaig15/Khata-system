import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../Redux/authSlice";
import { useNavigate } from "react-router-dom";
import Logo from "../images/logo1.png";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 space-y-6">
        <div className="flex justify-center">
          <img src={Logo} alt="Logo" className="h-16 w-auto" />
        </div>

        <h2 className="text-center text-2xl font-semibold text-gray-800">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-500">Sign in to continue</p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <div className="flex justify-between items-center">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-800 transition"
            >
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gray-800 text-white font-medium rounded-lg shadow-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-gray-800 font-medium hover:underline"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
