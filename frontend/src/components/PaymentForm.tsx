// components/PaymentForm.tsx
'use client';
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface Payment {
  id?: string;
  expense_id?: string;
  payment_date: string;
  amount: number;
  method?: string;
}

interface PaymentFormProps {
  paymentId?: string;
  initialData?: Payment;
}

export default function PaymentForm({ paymentId, initialData }: PaymentFormProps) {
  const router = useRouter();

  const [expense_id, setExpenseId] = useState(initialData?.expense_id ?? "");
  const [payment_date, setPaymentDate] = useState(initialData?.payment_date ?? "");
  const [amount, setAmount] = useState(initialData?.amount ?? 0);
  const [method, setMethod] = useState(initialData?.method ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const methodHttp = paymentId ? "PATCH" : "POST";
      const url = paymentId
        ? `http://localhost:8080/api/payments/${paymentId}`
        : "http://localhost:8080/api/payments";

      const res = await fetch(url, {
        method: methodHttp,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense_id: expense_id || null, payment_date, amount, method }),
      });

      if (!res.ok) throw new Error("Erro ao salvar pagamento");

      router.push("/payments");
    } catch (err) {
      alert("Erro ao salvar pagamento");
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">{paymentId ? "Editar Pagamento" : "Novo Pagamento"}</h2>

      <label className="block mb-2">
        Despesa ID (opcional):
        <input
          type="text"
          value={expense_id}
          onChange={e => setExpenseId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="UUID da despesa vinculada"
        />
      </label>

      <label className="block mb-2">
        Data do Pagamento:
        <input
          type="date"
          required
          value={payment_date}
          onChange={e => setPaymentDate(e.target.value)}
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

      <label className="block mb-4">
        Método:
        <input
          type="text"
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
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
