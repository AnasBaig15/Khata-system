import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { Wallet, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const { transactions, profit, pendingTransactions } = useSelector((state) => state.transactions);
  const { user } = useSelector((state) => state.auth);
  const userId = useSelector((state) => state.auth.user?._id);
  const token = useSelector((state) => state.auth.token);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 4;
 



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
    return [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = sortedTransactions;
  
    if (selectedDate) {
      filtered = filtered.filter(
        (t) => new Date(t.date).toISOString().split("T")[0] === selectedDate
      );
    } else if (filter === "credit") {
      filtered = filtered.filter((t) => t.type === "credit");
    } else if (filter === "debit") {
      filtered = filtered.filter((t) => t.type === "debit");
    }
  
    return filtered;
  }, [sortedTransactions, filter, selectedDate]);
  
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * transactionsPerPage;
    return filteredTransactions.slice(start, start + transactionsPerPage);
  }, [filteredTransactions, currentPage]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedDate]);
  

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

      const timestamp = new Date().toISOString();
      const transactionData = { type, amount, description, date: timestamp };

      try {
        dispatch(addTransactionOptimistic(transactionData));
        
        if (type === "credit") {
          setCredit({ amount: "", description: "", date: timestamp });
        } else {
          setDebit({ amount: "", description: "", date: timestamp });
        }

        const result = await dispatch(addTransactionAsync(transactionData)).unwrap();
        
        dispatch(fetchTransactionsAsync(userId));
        dispatch(fetchProfitAsync(userId));
        
      } catch (error) {

        const tempId = pendingTransactions.find(id => 
          transactions.some(t => t._id === id && t.description === description)
        );
        dispatch(rollbackTransaction({ 
          tempId, 
          error: error.message || "Failed to add transaction",
          transaction: transactionData
        }));
      }
    },
    [dispatch, userId, credit, debit, pendingTransactions, transactions]
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
      dispatch(updateTransactionOptimistic({
        id: transaction._id,
        updates: { amount, description, date: new Date(date).toISOString(), type }
      }));

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
      dispatch(rollbackTransaction({ 
        id: transaction._id,
        error: error.message || "Failed to update transaction"
      }));
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

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="min-h-screen p-6 bg-[var(--primary)] flex flex-col items-center relative">
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <img src={Logo} alt="Logo" className="w-32 h-auto" />
      </div>

      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-colors z-20"
      >
        Logout
      </button>

      <div
        className={`${
          isScrolled ? "sticky top-0" : "absolute top-30"
        } left-6 right-6 z-10 grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300`}
      >
        <Card
          className={`p-6 ${
            isScrolled
              ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
              : "bg-white border-gray-300"
          } shadow-lg rounded-xl`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-green-200 rounded-full">
              <TrendingUp className="text-green-700" size={24} />
            </div>
            <div>
              <p className="text-[var(--secondary)] font-medium">
                Total Credit
              </p>
              <p className="text-3xl font-bold text-green-700">
              {(profit?.totalCredit ?? 0).toLocaleString('en-IN')} Rs
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-6 ${
            isScrolled
              ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
              : "bg-white border-gray-300"
          } shadow-lg rounded-xl`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-red-200 rounded-full">
              <TrendingDown className="text-red-700" size={24} />
            </div>
            <div>
              <p className="text-[var(--secondary)] font-medium">Total Debit</p>
              <p className="text-3xl font-bold text-red-700">
              {(profit?.totalDebit ?? 0).toLocaleString('en-IN')} Rs
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-6 ${
            isScrolled
              ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
              : "bg-white border-gray-300"
          } shadow-lg rounded-xl`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-200 rounded-full">
              <Wallet className="text-blue-700" size={24} />
            </div>
            <div>
              <p className="text-[var(--secondary)] font-medium">Net Profit</p>
              <p className="text-3xl font-bold text-blue-700">
              {(profit?.profit ?? 0).toLocaleString('en-IN')} Rs
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-55 w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-lg bg-white">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center bg-green-200 rounded-full">
                <TrendingUp className="text-green-700" size={21} />
              </div>
              <h3 className="text-xl font-bold text-green-700">Credit Entry</h3>
            </div>
            <div className="flex gap-4">
              <Input
                ref={creditRefs[0]}
                type="number"
                placeholder="Amount"
                value={credit.amount}
                onChange={(e) =>
                  setCredit({ ...credit, amount: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 0, creditRefs, "credit")}
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
              />
              <Input
                ref={creditRefs[2]}
                type="date"
                className="w-full border border-gray-300 bg-white text-[var(--secondary)]"
                value={credit.date}
                onChange={(e) => setCredit({ ...credit, date: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 2, creditRefs, "credit")}
              />
            </div>
          </Card>

          <Card className="p-6 shadow-lg bg-white">
            <div className="flex justify-center items-center gap-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center bg-red-200 rounded-full">
                <TrendingDown className="text-red-700" size={21} />
              </div>
              <h3 className="text-xl font-bold text-red-700">Debit Entry</h3>
            </div>
            <div className="flex gap-4">
              <Input
                ref={debitRefs[0]}
                type="number"
                placeholder="Amount"
                value={debit.amount}
                onChange={(e) => setDebit({ ...debit, amount: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 0, debitRefs, "debit")}
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
              />
              <Input
                ref={debitRefs[2]}
                type="date"
                className="w-full border border-gray-300 bg-white text-[var(--secondary)]"
                value={debit.date}
                onChange={(e) => setDebit({ ...debit, date: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 2, debitRefs, "debit")}
              />
            </div>
          </Card>
        </div>

        <div className="w-full mt-6">

  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
    <div className="flex gap-2">
      <button
        onClick={() => { setFilter('all'); setSelectedDate(''); }}
        className={`px-4 py-2 rounded-lg transition-all ${
          filter === 'all' && !selectedDate
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        All
      </button>
      <button
        onClick={() => { setFilter('credit'); setSelectedDate(''); }}
        className={`px-4 py-2 rounded-lg transition-all ${
          filter === 'credit' && !selectedDate
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        Credit
      </button>
      <button
        onClick={() => { setFilter('debit'); setSelectedDate(''); }}
        className={`px-4 py-2 rounded-lg transition-all ${
          filter === 'debit' && !selectedDate
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        Debit
      </button>
    </div>

    <h3 className="text-xl text-[var(--dark)] font-semibold flex-1 text-center">
      Transaction List
    </h3>

    <div className="flex gap-2 items-center">
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
         className="w-full border border-gray-300 bg-white text-[var(--secondary)]"
      />
      {selectedDate && (
        <button
          onClick={() => setSelectedDate("")}
          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
        >
          Clear
        </button>
      )}
    </div>
  </div>

  <div className="border-t border-gray-300 p-4">
  <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
    <thead className="bg-white">
      <tr>
        <th className="p-3 text-left text-[var(--secondary)]">Type</th>
        <th className="p-3 text-left text-[var(--secondary)]">Date</th>
        <th className="p-3 text-left text-[var(--secondary)]">Description</th>
        <th className="p-3 text-left text-[var(--secondary)]">Amount</th>
      </tr>
    </thead>
    <tbody>
      {paginatedTransactions.map((transaction, index) => (
        <tr
          key={transaction._id}
          className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() =>
            startEditing(
              (currentPage - 1) * transactionsPerPage + index,
              transaction
            )
          }
        >
          <td className="p-3">
            {editingCell?.index === (currentPage - 1) * transactionsPerPage + index ? (
              <select
                value={editingCell.fields.type}
                onChange={(e) => handleInlineChange("type", e.target.value)}
                onKeyDown={handleInlineKeyDown}
                className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            ) : (
              <span
                className={`font-semibold ${
                  transaction.type === "credit" ? "text-green-700" : "text-red-700"
                }`}
              >
                {transaction.type}
              </span>
            )}
          </td>
          <td className="p-3">
              {editingCell?.index === (currentPage - 1) * transactionsPerPage + index ? (
                <Input
                  type="date"
                  value={editingCell.fields.date}
                  onChange={(e) => handleInlineChange("date", e.target.value)}
                  onKeyDown={handleInlineKeyDown}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                new Date(transaction.date).toLocaleDateString()
              )}
            </td>
          <td className="p-3">
            {editingCell?.index === (currentPage - 1) * transactionsPerPage + index ? (
              <Input
                type="text"
                value={editingCell.fields.description}
                onChange={(e) => handleInlineChange("description", e.target.value)}
                onKeyDown={handleInlineKeyDown}
                className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              transaction.description
            )}
          </td>
          <td className="p-3">
            {editingCell?.index === (currentPage - 1) * transactionsPerPage + index ? (
              <Input
                type="number"
                value={editingCell.fields.amount}
                onChange={(e) => handleInlineChange("amount", e.target.value)}
                onKeyDown={handleInlineKeyDown}
                className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              `Rs${(transaction.amount ?? 0).toLocaleString("en-IN")}`
            )}
          </td>
        </tr>
      ))}
      {paginatedTransactions.length === 0 && (
        <tr>
          <td colSpan="4" className="text-center py-6 text-gray-500">
            No transactions found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

  {totalPages > 1 && (
    <div className="mt-4 flex justify-center items-center gap-2">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default Dashboard;