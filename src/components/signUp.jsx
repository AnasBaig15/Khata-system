import  { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../Redux/authSlice";

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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign up to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                value={formData.fullname}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-3 py-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
