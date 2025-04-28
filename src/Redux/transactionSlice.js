import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://khatasystem.martendigitals.com/api/v1/transactions";
const EDIT_URL = "https://khatasystem.martendigitals.com/api/v1/edit";
const PROFIT_URL = "https://khatasystem.martendigitals.com/api/v1";

export const fetchTransactionsAsync = createAsyncThunk(
  "transactions/fetchTransactions",
  async ({ rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }
);

export const fetchProfitAsync = createAsyncThunk(
  "transactions/fetchProfit",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${PROFIT_URL}/profit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profit data"
      );
    }
  }
);


export const addTransactionAsync = createAsyncThunk(
  "transactions/addTransaction",
  async (
    { type, amount, description, date },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.user._id;
      const response = await axios.post(
        `${API_URL}/add`,
        { type, amount, description, date, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add transaction"
      );
    }
  }
);

export const updateTransactionAsync = createAsyncThunk(
  "transactions/updateTransaction",
  async (
    { id, amount, description, date, type },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(
        `${EDIT_URL}/${id}`,
        { amount, description, date, type },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update transaction"
      );
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [],
    profits: [],   
    loading: false,
    error: null,
    pendingTransactions: [],
    pendingUpdates: {},
  },
  reducers: {
    addTransactionOptimistic: (state, action) => {
      const tempId = `temp-${Date.now()}`;
      state.transactions.unshift({
        ...action.payload,
        _id: tempId,
        isOptimistic: true,
      });
      state.pendingTransactions.push(tempId);
      if (action.payload.type === "credit") {
        state.profit.totalCredit += Number(action.payload.amount);
        state.profit.balance += Number(action.payload.amount);
      } else {
        state.profit.totalDebit += Number(action.payload.amount);
        state.profit.balance -= Number(action.payload.amount);
      }
    },
    updateTransactionOptimistic: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.transactions.findIndex((t) => t._id === id);

      if (index !== -1) {
        const originalTransaction = state.transactions[index];

        if (!state.pendingUpdates[id]) {
          state.pendingUpdates[id] = {
            original: { ...originalTransaction },
            updates: { ...updates },
          };
        }

        state.transactions[index] = {
          ...state.transactions[index],
          ...updates,
          isOptimistic: true,
        };

        if (updates.amount !== undefined || updates.type !== undefined) {
          const oldAmount = Number(originalTransaction.amount);
          const newAmount =
            updates.amount !== undefined ? Number(updates.amount) : oldAmount;
          const newType = updates.type || originalTransaction.type;

          if (originalTransaction.type === "credit") {
            state.profit.totalCredit -= oldAmount;
            state.profit.balance -= oldAmount;
          } else {
            state.profit.totalDebit -= oldAmount;
            state.profit.balance += oldAmount;
          }

          if (newType === "credit") {
            state.profit.totalCredit += newAmount;
            state.profit.balance += newAmount;
          } else {
            state.profit.totalDebit += newAmount;
            state.profit.balance -= newAmount;
          }
        }
      }
    },

    rollbackTransaction: (state, action) => {
      const { tempId, id, error, transaction } = action.payload;

      if (tempId) {
        const index = state.transactions.findIndex((t) => t._id === tempId);
        if (index !== -1) {
          const t = state.transactions[index];
          state.transactions.splice(index, 1);
          state.pendingTransactions = state.pendingTransactions.filter(
            (i) => i !== tempId
          );

          if (t.type === "credit") {
            state.profit.totalCredit -= Number(t.amount);
            state.profit.balance -= Number(t.amount);
          } else {
            state.profit.totalDebit -= Number(t.amount);
            state.profit.balance += Number(t.amount);
          }
        }
      }

      if (id && state.pendingUpdates[id]) {
        const { original } = state.pendingUpdates[id];
        const index = state.transactions.findIndex((t) => t._id === id);
        if (index !== -1) {
          state.transactions[index] = original;

          state.profit.totalCredit = state.transactions
            .filter((t) => t.type === "credit")
            .reduce((sum, t) => sum + Number(t.amount), 0);

          state.profit.totalDebit = state.transactions
            .filter((t) => t.type === "debit")
            .reduce((sum, t) => sum + Number(t.amount), 0);

          state.profit.balance =
            state.profit.totalCredit - state.profit.totalDebit;
        }

        delete state.pendingUpdates[id];
      }

      toast.error(error || "Operation failed. Changes reverted.");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.pendingTransactions = state.pendingTransactions.filter(
          (tempId) => !action.payload.some((t) => t._id === tempId)
        );
      })
      .addCase(fetchTransactionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfitAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfitAsync.fulfilled, (state, action) => {
        state.loading = false;
                
        const arr = action.payload;
        const totalCredit = arr.reduce((sum, p) => sum + p.totalCredit, 0);
        const totalDebit  = arr.reduce((sum, p) => sum + p.totalDebit,  0);
      
        state.profit = {
          totalCredit,
          totalDebit,
          profit: totalCredit - totalDebit,
        };
      })
      .addCase(fetchProfitAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTransactionAsync.fulfilled, (state, action) => {
        const realTransaction = action.payload.transaction;

        const optimisticIndex = state.transactions.findIndex(
          (t) =>
            t.isOptimistic &&
            t._id === state.pendingTransactions.find((id) => id === t._id)
        );

        if (optimisticIndex !== -1) {
          state.transactions[optimisticIndex] = {
            ...realTransaction,
            isOptimistic: false,
          };
          state.pendingTransactions = state.pendingTransactions.filter(
            (id) => id !== state.transactions[optimisticIndex]._id
          );
        } else {
          state.transactions.unshift(realTransaction);
        }

        if (realTransaction.type === "credit") {
          state.profit.totalCredit += Number(realTransaction.amount);
          state.profit.balance += Number(realTransaction.amount);
        } else {
          state.profit.totalDebit += Number(realTransaction.amount);
          state.profit.balance -= Number(realTransaction.amount);
        }
      })
      .addCase(addTransactionAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateTransactionAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.transactions.findIndex(
          (t) => t._id === updated._id
        );

        if (index !== -1) {
          const wasOptimistic = state.transactions[index].isOptimistic;
          const old =
            state.pendingUpdates[updated._id]?.original ||
            state.transactions[index];

          if (!wasOptimistic && old) {
            if (old.type === "credit") {
              state.profit.totalCredit -= Number(old.amount);
              state.profit.balance -= Number(old.amount);
            } else {
              state.profit.totalDebit -= Number(old.amount);
              state.profit.balance += Number(old.amount);
            }

            if (updated.type === "credit") {
              state.profit.totalCredit += Number(updated.amount);
              state.profit.balance += Number(updated.amount);
            } else {
              state.profit.totalDebit += Number(updated.amount);
              state.profit.balance -= Number(updated.amount);
            }
          }

          state.transactions[index] = { ...updated, isOptimistic: false };

          delete state.pendingUpdates[updated._id];
        }
      })

      .addCase(updateTransactionAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  addTransactionOptimistic,
  updateTransactionOptimistic,
  rollbackTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;
