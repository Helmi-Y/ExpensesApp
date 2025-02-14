import { FormEvent, useState } from "react";
import axios from "axios";

interface ExpenseFormProps {
  onSubmit: (amount: number, category: string, date: string) => void;
}

function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [date, setDate] = useState<string>(new Date().toLocaleDateString());

  //Categories
  const categories = [
    "Food",
    "Entertainment",
    "Gas",
    "Automotive",
    "Groceries",
    "Phone",
    "Bank Charges",
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Pass the data to the parent component (HomePage)
    onSubmit(parseFloat(inputValue), selectedCategory, date);

    // Clear the input fields
    setInputValue("");
    setSelectedCategory("Food");
    setDate(new Date().toLocaleDateString());
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Add Expenses:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter amount"
          />
        </label>
        <label>
          Category:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button type="submit">Add</button>
      </form>
    </>
  );
}

export default ExpenseForm;
