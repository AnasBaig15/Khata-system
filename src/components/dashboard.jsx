import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../dashboard.css";
import { useDebouncedCallback } from "use-debounce";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { logoutUser } from "../Redux/authSlice";
import {
  addTransactionAsync,
  fetchTransactionsAsync,
  updateTransactionAsync,
  fetchProfitAsync,
  addTransactionOptimistic,
  updateTransactionOptimistic,
  rollbackTransaction,
} from "../Redux/transactionSlice";
import Logo from "../images/logo1.png";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, profit, pendingTransactions } = useSelector(
    (state) => state.transactions
  );
  const { user } = useSelector((state) => state.auth);
  const userId = useSelector((state) => state.auth.user?._id);
  const token = useSelector((state) => state.auth.token);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchTransactionsAsync(user._id));
    }
  }, [dispatch, user?._id]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchProfitAsync(userId));
    }
  }, [dispatch, userId]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (dateA === dateB) {
        return b._id.localeCompare(a._id);
      }      
      return dateB - dateA;
    });
  }, [transactions]);
  const filteredTransactions = useMemo(() => {
    let filtered = sortedTransactions;
    
    if (selectedDate) {
      filtered = filtered.filter(
        t => new Date(t.date).toISOString().split("T")[0] === selectedDate
      );
    } else if (filter === "credit") {
      filtered = filtered.filter(t => t.type === "credit");
    } else if (filter === "debit") {
      filtered = filtered.filter(t => t.type === "debit");
    }
    
    return filtered;
  }, [sortedTransactions, filter, selectedDate]);
  
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * transactionsPerPage;
    return filteredTransactions.slice(start, start + transactionsPerPage);
  }, [filteredTransactions, currentPage, transactionsPerPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedDate]);
  console.log("Transaction dates:", 
    transactions.map(t => ({
      id: t._id, 
      date: t.date,
      parsedDate: new Date(t.date),
      isValid: !isNaN(new Date(t.date).getTime())
    }))
  );
  
  const [credit, setCredit] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [debit, setDebit] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const creditRefs = [useRef(), useRef(), useRef()];
  const debitRefs = [useRef(), useRef(), useRef()];

  const handleKeyDown = useCallback(
    (e, index, refs, type) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (index < refs.length - 1) {
          refs[index + 1].current.focus();
        } else {
          if (type === "credit") {
            handleAddTransaction(
              credit.amount,
              credit.description,
              credit.date,
              "credit"
            );
          } else {
            handleAddTransaction(
              debit.amount,
              debit.description,
              debit.date,
              "debit"
            );
          }
        }
      }
    },
    [credit, debit]
  );

  const handleAddTransaction = useCallback(
    async (amount, description, date, type) => {
      if (!amount || !description) {
        alert("Please fill all fields");
        return;
      }

      const selectedDate = new Date(date);
      const transactionData = {
        type,
        amount,
        description,
        date: selectedDate.toISOString(),
      };

      try {
        dispatch(addTransactionOptimistic(transactionData));

        if (type === "credit") {
          setCredit({
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          });
        } else {
          setDebit({
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          });
        }

        await dispatch(addTransactionAsync(transactionData)).unwrap();
        dispatch(fetchTransactionsAsync(userId));
        dispatch(fetchProfitAsync(userId));
      } catch (error) {
        const tempId = pendingTransactions.find((id) =>
          transactions.some(
            (t) => t._id === id && t.description === description
          )
        );
        dispatch(
          rollbackTransaction({
            tempId,
            error: error.message || "Failed to add transaction",
            transaction: transactionData,
          })
        );
      }
    },
    [dispatch, userId, pendingTransactions, transactions]
  );

  const [editingCell, setEditingCell] = useState(null);
  const editRef = useRef();

  const startEditing = useCallback((index, transaction) => {
    setEditingCell({
      index,
      transactionId: transaction._id,
      fields: {
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.split("T")[0],
        type: transaction.type,
      },
    });
  }, []);

  const handleInlineChange = useDebouncedCallback(
    (field, value) => {
      setEditingCell((prev) => ({
        ...prev,
        fields: { ...prev.fields, [field]: value },
      }));
    },
    300,
    [editingCell]
  );

  const saveInlineEdit = useCallback(async () => {
    if (!editingCell) return;

    const { amount, description, date, type } = editingCell.fields;
    const transaction = sortedTransactions[editingCell.index];

    if (!amount || !description || !date || !type) {
      alert("Please fill all fields");
      return;
    }

    try {
      dispatch(
        updateTransactionOptimistic({
          id: transaction._id,
          updates: {
            amount,
            description,
            date: new Date(date).toISOString(),
            type,
          },
        })
      );

      const result = await dispatch(
        updateTransactionAsync({
          id: transaction._id,
          amount,
          description,
          date: new Date(date).toISOString(),
          type,
        })
      ).unwrap();

      setEditingCell(null);
    } catch (error) {
      dispatch(
        rollbackTransaction({
          id: transaction._id,
          error: error.message || "Failed to update transaction",
        })
      );
      setEditingCell(null);
    }
  }, [dispatch, editingCell, sortedTransactions]);

  const handleInlineKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveInlineEdit();
      }
    },
    [saveInlineEdit]
  );

  const [isSticky, setIsSticky] = useState(false);

  const handleScroll = () => {
    const offsetTop = document
      .getElementById("stickyCards")
      .getBoundingClientRect().top;
    if (offsetTop <= 0) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editingCell &&
        editRef.current &&
        !editRef.current.contains(event.target)
      ) {
        saveInlineEdit();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingCell, saveInlineEdit]);

  return (
    <div className="main-container">
      <header className="header">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        <div className="card-container">
        <div
          id="stickyCards"
          className={`card-grid ${isSticky ? "no-border" : "with-border"}`}
        >
          <Card className={`card green-card ${isSticky ? "no-shadow" : ""}`}>
            <div className="card-content">
              <div className="card-icon green-icon">
                <TrendingUp className="icon-green" size={24} />
              </div>
              <div>
                <p className="card-title">Total Credit</p>
                <p className="card-value green-text">
                  {(profit?.totalCredit ?? 0).toLocaleString("en-IN")} Rs
                </p>
              </div>
            </div>
          </Card>

          <Card className={`card red-card ${isSticky ? "no-shadow" : ""}`}>
            <div className="card-content">
              <div className="card-icon red-icon">
                <TrendingDown className="icon-red" size={24} />
              </div>
              <div>
                <p className="card-title">Total Debit</p>
                <p className="card-value red-text">
                  {(profit?.totalDebit ?? 0).toLocaleString("en-IN")} Rs
                </p>
              </div>
            </div>
          </Card>

          <Card className={`card blue-card ${isSticky ? "no-shadow" : ""}`}>
            <div className="card-content">
              <div className="card-icon blue-icon">
                <Wallet className="icon-blue" size={24} />
              </div>
              <div>
                <p className="card-title">Net Profit</p>
                <p className="card-value blue-text">
                  {(profit?.profit ?? 0).toLocaleString("en-IN")} Rs
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="responsive-row">
        <div className="form-wrapper">
          <Card className="form-card">
            <div className="form-content">
              <div className="form-header green-header">
                <div className="form-icon green-icon">
                  <TrendingUp className="icon-green" size={21} />
                </div>
                <h3 className="form-title green-text">Credit Entry</h3>
              </div>
              <Input
                ref={creditRefs[0]}
                type="number"
                placeholder="Amount"
                value={credit.amount}
                onChange={(e) =>
                  setCredit({ ...credit, amount: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 0, creditRefs, "credit")}
                className="form-input"
              />
              <Input
                ref={creditRefs[1]}
                type="text"
                placeholder="Description"
                value={credit.description}
                onChange={(e) =>
                  setCredit({ ...credit, description: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 1, creditRefs, "credit")}
                className="form-input"
              />
              <Input
                ref={creditRefs[2]}
                type="date"
                value={credit.date}
                onChange={(e) => setCredit({ ...credit, date: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 2, creditRefs, "credit")}
                className="form-input date-input"
              />
            </div>
          </Card>

          <Card className="form-card">
            <div className="form-content">
              <div className="form-header red-header">
                <div className="form-icon red-icon">
                  <TrendingDown className="icon-red" size={21} />
                </div>
                <h3 className="form-title red-text">Debit Entry</h3>
              </div>
              <Input
                ref={debitRefs[0]}
                type="number"
                placeholder="Amount"
                value={debit.amount}
                onChange={(e) => setDebit({ ...debit, amount: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 0, debitRefs, "debit")}
                className="form-input"
              />
              <Input
                ref={debitRefs[1]}
                type="text"
                placeholder="Description"
                value={debit.description}
                onChange={(e) =>
                  setDebit({ ...debit, description: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 1, debitRefs, "debit")}
                className="form-input"
              />
              <Input
                ref={debitRefs[2]}
                type="date"
                value={debit.date}
                onChange={(e) => setDebit({ ...debit, date: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 2, debitRefs, "debit")}
                className="form-input date-input"
              />
            </div>
          </Card>
        </div>

        <div className="transactions-container">
          <Card className="transactions-card">
            <div className="transactions-inner">
              <div className="transactions-header">
                <h3 className="transactions-title">Transaction List</h3>

                <div className="transactions-filters">
                  <div className="filter-buttons">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setSelectedDate("");
                      }}
                      className={`filter-btn ${
                        filter === "all" && !selectedDate
                          ? "active-all"
                          : "inactive"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setFilter("credit");
                        setSelectedDate("");
                      }}
                      className={`filter-btn ${
                        filter === "credit" && !selectedDate
                          ? "active-credit"
                          : "inactive"
                      }`}
                    >
                      Credit
                    </button>
                    <button
                      onClick={() => {
                        setFilter("debit");
                        setSelectedDate("");
                      }}
                      className={`filter-btn ${
                        filter === "debit" && !selectedDate
                          ? "active-debit"
                          : "inactive"
                      }`}
                    >
                      Debit
                    </button>
                  </div>

                  <div className="date-filter">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="date-input no-native-icon"
                    />
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate("")}
                        className="clear-date-btn"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Added by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction, index) => (
                      <tr
                        key={transaction._id}
                        className={`transaction-row ${
                        transaction.type === "credit" ? "credit-bg" : "debit-bg"
                        }`}
                        onClick={() =>
                          startEditing(
                            (currentPage - 1) * transactionsPerPage + index,
                            transaction
                          )
                        }
                      >
                        <td>
                          {editingCell?.index ===
                          (currentPage - 1) * transactionsPerPage + index ? (
                            <select
                              value={editingCell.fields.type}
                              onChange={(e) =>
                                handleInlineChange("type", e.target.value)
                              }
                              onKeyDown={handleInlineKeyDown}
                              className="editable-input"
                            >
                              <option value="credit">Credit</option>
                              <option value="debit">Debit</option>
                            </select>
                          ) : (
                            <span
                              className={`type-label ${
                                transaction.type === "credit"
                                  ? "credit-label"
                                  : "debit-label"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell?.index ===
                          (currentPage - 1) * transactionsPerPage + index ? (
                            <Input
                              type="date"
                              value={editingCell.fields.date}
                              onChange={(e) =>
                                handleInlineChange("date", e.target.value)
                              }
                              onKeyDown={handleInlineKeyDown}
                              className="editable-input"
                            />
                          ) : (
                            <span className="secondary-text">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell?.index ===
                          (currentPage - 1) * transactionsPerPage + index ? (
                            <Input
                              type="text"
                              value={editingCell.fields.description}
                              onChange={(e) =>
                                handleInlineChange(
                                  "description",
                                  e.target.value
                                )
                              }
                              onKeyDown={handleInlineKeyDown}
                              className="editable-input"
                            />
                          ) : (
                            <span className="secondary-text">
                              {transaction.description}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell?.index ===
                          (currentPage - 1) * transactionsPerPage + index ? (
                            <Input
                              type="number"
                              value={editingCell.fields.amount}
                              onChange={(e) =>
                                handleInlineChange("amount", e.target.value)
                              }
                              onKeyDown={handleInlineKeyDown}
                              className="editable-input"
                            />
                          ) : (
                            <span className="secondary-text">
                              Rs {transaction.amount?.toLocaleString("en-IN")}
                            </span>
                          )}
                        </td>
                        <td>
                         <span className="secondary-text">
                          {transaction.userId?.fullname || "--"}
                         </span>
                        </td>
                      </tr>
                    ))}
                    {paginatedTransactions.length === 0 && (
                      <tr>
                        <td colSpan="4" className="no-data">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
