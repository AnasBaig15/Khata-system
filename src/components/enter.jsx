import { useState } from "react";
import "../App.css";

const CreditDebitForm = () => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const entry = { amount, type, date: new Date() };
      console.log("Saving entry:", entry);

      await fetch("/api/save-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      setAmount("");
    }
  };

  return (
    <form className="p-4 bg-gray-100 rounded-md shadow-md">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter amount"
        className="border p-2 rounded-md w-full mb-2"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 rounded-md w-full"
      >
        <option value="credit">Credit</option>
        <option value="debit">Debit</option>
      </select>
    </form>
  );
};

export default CreditDebitForm;
