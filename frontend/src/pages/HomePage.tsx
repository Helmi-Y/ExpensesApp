import { useState, useEffect } from "react";
import axios from "axios";
import "./HomePage.css";
import ExpenseForm from "../components/ExpensesForm";
import ExpenseList from "../components/ExpensesList";

interface Expense {
  amount: number;
  category: string;
  date: string;
  id: number;
}

function HomePage() {
  const [totalCost, setTotalCost] = useState<number>(0); // Ensure totalCost is a number
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<
    Record<string, number>
  >({});

  // Function to fetch all expenses from the backend
  const fetchExpenses = () => {
    axios
      .get("http://127.0.0.1:5000/api/expenses")
      .then((response) => {
        // Map the response data to ensure amount is always a number
        const expensesWithNumbers = response.data.map((expense: any) => ({
          ...expense,
          amount: parseFloat(expense.amount), // Convert to number
        }));

        setExpenses(expensesWithNumbers);

        // Calculate total cost using the updated expenses
        const total = expensesWithNumbers.reduce(
          (acc: number, expense: Expense) => acc + expense.amount,
          0
        );

        setTotalCost(total); // Update total cost
        console.log("Total calculated:", total); // Debug log

        // Group expenses by category
        const grouped = expensesWithNumbers.reduce(
          (
            acc: Record<string, number>,
            expense: { category: string | number; amount: number }
          ) => {
            acc[expense.category] =
              (acc[expense.category] || 0) + expense.amount;
            return acc;
          },
          {}
        );

        setExpensesByCategory(grouped); // Update grouped data
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
      });
  };

  // Handle adding a new expense
  const handleNewExpense = (amount: number, category: string, date: string) => {
    const newExpense = { amount, category, date };

    // Send the new expense to the backend
    axios
      .post("http://127.0.0.1:5000/api/expenses", newExpense)
      .then((response) => {
        console.log("Expense added:", response.data); // Log the backend response
        fetchExpenses(); // Refetch expenses after adding a new one
      })
      .catch((error) => {
        console.error("Error adding expense:", error);
      });
  };

  // Delete an individual expense
  const handleDeleteExpense = (id: number) => {
    axios
      .delete(`http://127.0.0.1:5000/api/expenses/${id}`)
      .then(() => {
        fetchExpenses(); // Re-fetch expenses after deletion
      })
      .catch((error) => {
        console.error("Error deleting expense:", error);
      });
  };

  // Clear all expenses
  const handleClearExpenses = () => {
    axios
      .delete("http://127.0.0.1:5000/api/expenses")
      .then(() => {
        fetchExpenses(); // Re-fetch expenses after clearing
      })
      .catch((error) => {
        console.error("Error clearing expenses:", error);
      });
  };

  // Fetch expenses when the component first mounts
  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <>
      <header>
        <h1>Expense Tracker</h1>
        <h2>
          Total Monthly Expenses: $
          {typeof totalCost === "number" && !isNaN(totalCost)
            ? totalCost.toFixed(2)
            : "0.00"}
        </h2>
      </header>
      <main>
        {/* Form Section */}
        <section>
          <ExpenseForm onSubmit={handleNewExpense} />
        </section>

        {/* Expense List Section */}
        <section>
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
          <button onClick={handleClearExpenses}>Clear All Expenses</button>
        </section>

        {/* Expenses by Category Section */}
        <section>
          <h3>Expenses by Category:</h3>
          <ul>
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <li key={category}>
                <span>{category}</span> ${amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

export default HomePage;
