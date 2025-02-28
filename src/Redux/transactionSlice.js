import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: { list: [] },
  reducers: {
    addTransaction: (state, action) => {
      state.list.push({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...action.payload,
      });
    },
    updateTransaction: (state, action) => {
      const { id, ...changes } = action.payload;
      const transaction = state.list.find((t) => t.id === id);
      if (transaction) {
        Object.assign(transaction, changes);
      }
    },
  },
});

export const { addTransaction, updateTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
