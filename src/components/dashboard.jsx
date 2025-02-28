import { useSelector, useDispatch, batch } from "react-redux";
import { useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import "../App.css";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { addTransaction, updateTransaction } from "../Redux/transactionSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transactions.list);

  const sortedTransactions = useMemo(
    () =>
      transactions
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [transactions]
  );

  const totalCredit = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const totalDebit = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );
  const netProfit = useMemo(
    () => totalCredit - totalDebit,
    [totalCredit, totalDebit]
  );

  const [credit, setCredit] = useState({
    amount: "",
    description: "",
    date: "",
  });
  const [debit, setDebit] = useState({ amount: "", description: "", date: "" });
  const creditRefs = [useRef(), useRef(), useRef()];
  const debitRefs = [useRef(), useRef(), useRef()];
  const editRef = useRef();

  const handleKeyDown = (e, index, refs, type) => {
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
  };

  const handleAddTransaction = (amount, description, date, type) => {
    if (!amount || !description || !date) return;
    batch(() => {
      dispatch(
        addTransaction({ description, amount: parseFloat(amount), date, type })
      );
      if (type === "credit")
        setCredit({ amount: "", description: "", date: "" });
      else setDebit({ amount: "", description: "", date: "" });
    });
  };

  const [editingCell, setEditingCell] = useState(null);

  const startEditing = (index, transaction) => {
    setEditingCell({
      index,
      fields: {
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
      },
    });
  };

  const handleInlineChange = useDebouncedCallback((field, value) => {
    setEditingCell((prev) => ({
      ...prev,
      fields: { ...prev.fields, [field]: value },
    }));
  }, 300);

  const handleInlineKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const { amount, description, date, type } = editingCell.fields;
      if (!amount || !description || !date) return;

      const transaction = sortedTransactions[editingCell.index];
      dispatch(
        updateTransaction({
          id: transaction.id,
          amount: parseFloat(amount),
          description,
          date,
          type,
        })
      );
      setEditingCell(null);
    }
  };
  const saveInlineEdit = () => {
    if (editingCell) {
      const { amount, description, date, type } = editingCell.fields;
      if (!amount || !description || !date) return;

      const transaction = sortedTransactions[editingCell.index];
      dispatch(
        updateTransaction({
          id: transaction.id,
          amount: parseFloat(amount),
          description,
          date,
          type,
        })
      );
      setEditingCell(null);
    }
  };

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
  }, [editingCell]);

  return (
    <div className="min-h-screen p-6 bg-gray-100  flex flex-col items-center">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <Card className="p-6 bg-white border border-gray-300 shadow-lg rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-green-200 rounded-full">
              <TrendingUp className="text-green-700" size={24} />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Total Credit</p>
              <p className="text-3xl font-bold text-green-700">
                ₹{totalCredit}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white  border border-gray-300 shadow-lg rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-red-200 rounded-full">
              <TrendingDown className="text-red-700" size={24} />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Total Debit</p>
              <p className="text-3xl font-bold text-red-700">₹{totalDebit}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-300 shadow-lg rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-200 rounded-full">
              <Wallet className="text-blue-700" size={24} />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Net Profit</p>
              <p className="text-3xl font-bold text-blue-700">₹{netProfit}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mt-6">
        <Card className="p-6 shadow-lg bg-white">
          <div className="flex justify-center items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-700" />
            <h3 className="text-xl font-bold text-green-700">Credit Entry</h3>
          </div>
          <div className="flex gap-4">
            <Input
              ref={creditRefs[0]}
              type="alphanumeric"
              placeholder="Amount"
              value={credit.amount}
              onChange={(e) => setCredit({ ...credit, amount: e.target.value })}
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
              className="w-full border border-gray-300 bg-white"
              value={credit.date}
              onChange={(e) => setCredit({ ...credit, date: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 2, creditRefs, "credit")}
            />
          </div>
        </Card>

        <Card className="p-6 shadow-lg bg-white">
          <div className="flex justify-center items-center gap-2 mb-4">
            <TrendingDown className="w-6 h-6 text-red-700" />
            <h3 className="text-xl font-bold text-red-700">Debit Entry</h3>
          </div>
          <div className="flex gap-4">
            <Input
              ref={debitRefs[0]}
              type="alphanumeric"
              placeholder="Amount"
              value={debit.amount}
              onChange={(e) => setDebit({ ...debit, amount: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 0, debitRefs, "debit")}
            />
            <Input
              ref={debitRefs[1]}
              type="text"
              className="text-gray-700 placeholder-black bg-white "
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
              placeholder="Date"
              className="w-full border border-gray-300 bg-white"
              value={debit.date}
              onChange={(e) => setDebit({ ...debit, date: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, 2, debitRefs, "debit")}
            />
          </div>
        </Card>
      </div>

      <div className="w-full max-w-6xl mt-6">
        <h3 className="text-xl font-semibold my-4 text-center">
          Transaction List
        </h3>
        <div className="border-t border-gray-300 p-4">
          <table className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gray-600">
              <tr>
                <th className="p-3 text-left text-gray-200">Type</th>
                <th className="p-3 text-left text-gray-200">Date</th>
                <th className="p-3 text-left text-gray-200">Description</th>
                <th className="p-3 text-left text-gray-200">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => startEditing(index, transaction)}
                >
                  <td className="p-3">
                    {editingCell?.index === index ? (
                      <select
                        value={editingCell.fields.type}
                        onChange={(e) =>
                          handleInlineChange("type", e.target.value)
                        }
                        onKeyDown={handleInlineKeyDown}
                        className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="credit">Credit</option>
                        <option value="debit">Debit</option>
                      </select>
                    ) : (
                      <span
                        className={`font-semibold ${
                          transaction.type === "credit"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingCell?.index === index ? (
                      <Input
                        type="date"
                        value={editingCell.fields.date}
                        onChange={(e) =>
                          handleInlineChange("date", e.target.value)
                        }
                        onKeyDown={handleInlineKeyDown}
                        className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      transaction.date
                    )}
                  </td>
                  <td className="p-3">
                    {editingCell?.index === index ? (
                      <Input
                        type="text"
                        value={editingCell.fields.description}
                        onChange={(e) =>
                          handleInlineChange("description", e.target.value)
                        }
                        onKeyDown={handleInlineKeyDown}
                        className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      transaction.description
                    )}
                  </td>
                  <td className="p-3">
                    {editingCell?.index === index ? (
                      <Input
                        type="alphanumeric"
                        value={editingCell.fields.amount}
                        onChange={(e) =>
                          handleInlineChange("amount", e.target.value)
                        }
                        onKeyDown={handleInlineKeyDown}
                        className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      `₹${transaction.amount}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;