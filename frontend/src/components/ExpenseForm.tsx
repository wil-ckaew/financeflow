// components/ExpenseForm.tsx
'use client';
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface Expense {
  id?: string;
  description: string;
  due_date: string;
  amount: number;
  paid: boolean;
}

interface ExpenseFormProps {
  expenseId?: string;
  initialData?: Expense;
}

export default function ExpenseForm({ expenseId, initialData }: ExpenseFormProps) {
  const router = useRouter();

  const [description, setDescription] = useState(initialData?.description ?? "");
  const [due_date, setDueDate] = useState(initialData?.due_date ?? "");
  const [amount, setAmount] = useState(initialData?.amount ?? 0);
  const [paid, setPaid] = useState(initialData?.paid ?? false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const method = expenseId ? "PATCH" : "POST";
      const url = expenseId
        ? `http://localhost:8080/api/expenses/${expenseId}`
        : "http://localhost:8080/api/expenses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, due_date, amount, paid }),
      });

      if (!res.ok) throw new Error("Erro ao salvar despesa");

      router.push("/expenses");
    } catch (err) {
      alert("Erro ao salvar despesa");
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">{expenseId ? "Editar Despesa" : "Nova Despesa"}</h2>

      <label className="block mb-2">
        Descrição:
        <input
          type="text"
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </label>

      <label className="block mb-2">
        Vencimento:
        <input
          type="date"
          required
          value={due_date}
          onChange={e => setDueDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </label>

      <label className="block mb-2">
        Valor (R$):
        <input
          type="number"
          required
          min={0}
          step="0.01"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </label>

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={paid}
          onChange={e => setPaid(e.target.checked)}
          className="mr-2"
        />
        Pago
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
