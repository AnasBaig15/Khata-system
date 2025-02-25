import { useSelector, useDispatch } from "react-redux";
import "../App.css"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { addTransaction } from "../Redux/transactionSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transactions.list);

  const totalCredit = transactions.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalCredit - totalDebit;

  const [credit, setCredit] = useState({ amount: "", description: "", date: "" });
  const [debit, setDebit] = useState({ amount: "", description: "", date: "" });

  const creditRefs = [useRef(), useRef(), useRef()];
  const debitRefs = [useRef(), useRef(), useRef()];

  const handleKeyDown = (e, index, refs) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index < refs.length - 1) {
        refs[index + 1].current.focus();
      } else {
        if (refs === creditRefs) {
          handleAddTransaction(credit.amount, credit.description, credit.date, "credit");
        } else {
          handleAddTransaction(debit.amount, debit.description, debit.date, "debit");
        }
      }
    }
  };

  const handleAddTransaction = (amount, description, date, type) => {
    if (!amount || !description || !date) return;
    dispatch(addTransaction({ description, amount: parseFloat(amount), date, type }));
    
    if (type === "credit") {
      setCredit({ amount: "", description: "", date: "" });
      creditRefs[0].current.focus();
    } else {
      setDebit({ amount: "", description: "", date: "" });
      debitRefs[0].current.focus();
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 bg-green-100 border border-green-500 shadow-md">
        <div className="flex items-center gap-2 text-green-700 font-semibold">
          <TrendingUp /> Total Credit
        </div>
        <p className="text-3xl font-bold text-green-700 mt-2">₹{totalCredit}</p>
      </Card>

      <Card className="p-6 bg-red-100 border border-red-500 shadow-md">
        <div className="flex items-center gap-2 text-red-700 font-semibold">
          <TrendingDown /> Total Debit
        </div>
        <p className="text-3xl font-bold text-red-700 mt-2">₹{totalDebit}</p>
      </Card>

      <Card className="p-6 bg-blue-100 border border-blue-500 shadow-md">
        <div className="flex items-center gap-2 text-blue-700 font-semibold">
          <Wallet /> Net Profit
        </div>
        <p className="text-3xl font-bold text-blue-700 mt-2">₹{netProfit}</p>
      </Card>

      <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-center text-green-700">Credit Entry</h3>
          <div className="flex gap-4">
            <Input ref={creditRefs[0]} type="number" placeholder="Amount" value={credit.amount} onChange={(e) => setCredit({ ...credit, amount: e.target.value })} onKeyDown={(e) => handleKeyDown(e, 0, creditRefs)} />
            <Input ref={creditRefs[1]} type="text" placeholder="Description" value={credit.description} onChange={(e) => setCredit({ ...credit, description: e.target.value })} onKeyDown={(e) => handleKeyDown(e, 1, creditRefs)} />
            <Input ref={creditRefs[2]} type="date" value={credit.date} onChange={(e) => setCredit({ ...credit, date: e.target.value })} onKeyDown={(e) => handleKeyDown(e, 2, creditRefs)} />
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-center text-red-700">Debit Entry</h3>
          <div className="flex gap-4">
            <Input ref={debitRefs[0]} type="number" placeholder="Amount" value={debit.amount} onChange={(e) => setDebit({ ...debit, amount: e.target.value })} onKeyDown={(e) => handleKeyDown(e, 0, debitRefs)} />
            <Input ref={debitRefs[1]} type="text" placeholder="Description" value={debit.description} onChange={(e) => setDebit({ ...debit, description: e.target.value })} onKeyDown={(e) => handleKeyDown(e, 1, debitRefs)} />
            <Input ref={debitRefs[2]} type="date" value={debit.date} onChange={(e) => setDebit({ ...debit, date: e.target.value })} onKeyDown={(e) => handleKeyDown(e, 2, debitRefs)} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
