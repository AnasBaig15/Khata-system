import "./App.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { lazy, Suspense } from "react";
import { initializeAuth } from "./Redux/authSlice";

const Dashboard = lazy(() => import("./components/dashboard"));
const Signup = lazy(() => import("./components/signUp"));
const Login = lazy(() => import("./components/login"));

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const storedToken = localStorage.getItem("token");

  if (!token && !storedToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};
const Loader = () => (
  <div className="flex h-screen justify-center items-center bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-600"></div>
  </div>
);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, []);

  return (
    <Router>
      <ToastContainer />
      <Suspense fallback={<Loader/>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;