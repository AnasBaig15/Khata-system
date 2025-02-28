import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "./transactionSlice";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    auth: authReducer,
  },
});

export default store;
