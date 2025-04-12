import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "https://khatasystem.martendigitals.com/api/v1/users";
// const LOCAL_AUTH_URL = "http://localhost:3002/api/v1/users"

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("fullname", userData.fullname);
      formData.append("email", userData.email);
      formData.append("password", userData.password);

      const response = await axios.post(`${API_BASE_URL}/register`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      });

      toast.success(response.data.message || "Account created successfully!");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed. Try again.";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", credentials.email);
      formData.append("password", credentials.password);

      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      });

      toast.success(response.data.message || "Login successful!");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Check your credentials.";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get(`${API_BASE_URL}/logout`, { withCredentials: true });
      toast.success("Logged out successfully!");
      return null;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed. Try again.";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, loading: false, error: null },
 reducers: {
    initializeAuth: (state) => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.exp * 1000 > Date.now()) {
            state.token = token;
            state.user = JSON.parse(localStorage.getItem("user")) || null;
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            state.token = null;
            state.user = null;
          }
        } catch (error) {
          console.error("Invalid token format:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          state.token = null;
          state.user = null;
        }
      } else {
        state.token = null;
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
  },
});

export const { initializeAuth } = authSlice.actions;
export default authSlice.reducer;