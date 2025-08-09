'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

interface Expense {
  id: string;
  supplier_id?: string;
  description: string;
  due_date: string;
  amount: number;
  paid: boolean;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function loadExpenses() {
    try {
      const res = await fetch("http://localhost:8080/api/expenses");
      if (!res.ok) throw new Error("Erro ao buscar despesas");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteExpense(id: string) {
    if (!confirm("Deseja excluir esta despesa?")) return;
    const res = await fetch(`http://localhost:8080/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) loadExpenses();
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <Link
          href="/expenses/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
        >
          Nova Despesa
        </Link>
      </div>

      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="p-3 text-left">Descrição</th>
            <th className="p-3 text-left">Vencimento</th>
            <th className="p-3 text-left">Valor (R$)</th>
            <th className="p-3 text-left">Pago?</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense.id} className="border-b hover:bg-emerald-50">
              <td className="p-3">{expense.description}</td>
              <td className="p-3">{new Date(expense.due_date).toLocaleDateString()}</td>
              <td className="p-3">{expense.amount.toFixed(2)}</td>
              <td className="p-3">{expense.paid ? "Sim" : "Não"}</td>
              <td className="p-3 flex gap-2">
                <Link
                  href={`/expenses/${expense.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {expenses.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">Nenhuma despesa cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
