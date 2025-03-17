import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addTransaction,
  fetchTransactions,
  updateTransaction,
  fetchProfit,
} from "../../api/transaction";

export const addTransactionAsync = createAsyncThunk(
  "transactions/add",
  async (transactionData, { getState }) => {
    const token = getState().auth.token;
    const response = await addTransaction(transactionData, token);
    return response.data;
  }
);
export const fetchProfitAsync = createAsyncThunk(
  "transactions/fetchProfit",
  async (userId, { getState }) => {
    const token = getState().auth.token;
    const response = await fetchProfit(userId, token);
    return response;
  }
);
export const fetchTransactionsAsync = createAsyncThunk(
  "transactions/fetch",
  async (userId, { getState }) => {
    const token = getState().auth.token;
    const response = await fetchTransactions(userId, token);
    return response;
  }
);
export const updateTransactionAsync = createAsyncThunk(
  "transactions/update",
  async ({ id, ...transactionData }, { getState, rejectWithValue, dispatch }) => {
    try {
      const token = getState().auth.token;
      const response = await updateTransaction(id, transactionData, token);

      dispatch(fetchProfitAsync(getState().auth.user._id));

      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Update failed");
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [],
    profit: { totalCredit: 0, totalDebit: 0, netProfit: 0 },
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(addTransactionAsync.fulfilled, (state, action) => {
      if (!action.payload || !action.payload.transaction) return;
    
      state.transactions = [...state.transactions, action.payload.transaction];
      state.profit = action.payload.profit;
    })
      .addCase(fetchTransactionsAsync.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(updateTransactionAsync.fulfilled, (state, action) => {
        if (!action.payload) return;
      
        const { updatedTransaction, profit } = action.payload;
      
        if (!updatedTransaction) return;
      
        state.transactions = state.transactions.map((t) =>
          t._id === updatedTransaction._id ? updatedTransaction : t
        );
      
        if (profit) {
          state.profit = { ...profit };
        }
      })      
      .addCase(updateTransactionAsync.rejected, (state, action) => {
        console.error("Transaction update failed:", action.payload);
      })
      .addCase(fetchProfitAsync.fulfilled, (state, action) => {
        state.profit = action.payload;
      });
  },
});

export default transactionSlice.reducer;
