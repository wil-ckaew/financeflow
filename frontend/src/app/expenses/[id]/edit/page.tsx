// src/app/expenses/[id]/edit/page.tsx
import ExpenseForm, { Expense } from "../../../../components/ExpenseForm";

async function getExpense(id: string): Promise<Expense | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/expenses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const expense = await getExpense(params.id);

  if (!expense) {
    return <p>Despesa não encontrada</p>;
  }

  return <ExpenseForm expenseId={params.id} initialData={expense} />;
}
