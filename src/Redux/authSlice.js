import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:3002/users";

// **Signup API**
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

      alert(response.data.message || "Account created successfully!");
      return response.data;
    } catch (error) {
      let errorMessage = error.response?.data?.message || "Signup failed. Try again.";
      alert(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// **Login API**
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

      alert(response.data.message || "Login successful!");
      return response.data;
    } catch (error) {
      let errorMessage = error.response?.data?.message || "Login failed. Check your credentials.";
      alert(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// **Logout API**
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get(`${API_BASE_URL}/logout`, { withCredentials: true });
      alert("Logged out successfully!");
      return null;
    } catch (error) {
      let errorMessage = error.response?.data?.message || "Logout failed. Try again.";
      alert(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// **Auth Slice**
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
