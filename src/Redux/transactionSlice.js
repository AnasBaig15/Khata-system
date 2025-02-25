import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: { list: [] },
  reducers: {
    addTransaction: (state, action) => {
      state.list.push({ id: Date.now(), date: new Date().toLocaleDateString(), ...action.payload });
    },
  },
});

export const { addTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
