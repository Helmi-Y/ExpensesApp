interface ExpenseListProps {
  expenses: { id: number; amount: number; category: string; date: string }[];
  onDelete: (id: number) => void;
}

function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <h3>Expenses List</h3>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.category} - ${expense.amount} | {formatDate(expense.date)}
            <button onClick={() => onDelete(expense.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseList;
