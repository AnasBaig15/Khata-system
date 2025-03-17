import  { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../Redux/authSlice";
import Logo from "../images/logo1.png"

function Signup() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 space-y-6">
        
        <div className="flex justify-center">
          <img src={Logo} alt="Logo" className="h-16 w-auto" />
        </div>

        <h2 className="text-center text-2xl font-semibold text-gray-800">
          Create an Account
        </h2>
        <p className="text-center text-gray-500">Sign up to get started</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              required
              value={formData.fullname}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
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
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gray-800 text-white font-medium rounded-lg shadow-md hover:bg-gray-900 transition"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/" className="text-gray-800 font-medium hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
