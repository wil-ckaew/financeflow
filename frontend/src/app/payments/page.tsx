'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

interface Payment {
  id: string;
  expense_id?: string;
  payment_date: string;
  amount: number;
  method?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  async function loadPayments() {
    try {
      const res = await fetch("http://localhost:8080/api/payments");
      if (!res.ok) throw new Error("Erro ao buscar pagamentos");
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function deletePayment(id: string) {
    if (!confirm("Deseja excluir este pagamento?")) return;
    const res = await fetch(`http://localhost:8080/api/payments/${id}`, { method: "DELETE" });
    if (res.ok) loadPayments();
  }

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <Link
          href="/payments/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
        >
          Novo Pagamento
        </Link>
      </div>

      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="p-3 text-left">Despesa ID</th>
            <th className="p-3 text-left">Data Pagamento</th>
            <th className="p-3 text-left">Valor (R$)</th>
            <th className="p-3 text-left">Método</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id} className="border-b hover:bg-emerald-50">
              <td className="p-3">{payment.expense_id ?? "-"}</td>
              <td className="p-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
              <td className="p-3">{payment.amount.toFixed(2)}</td>
              <td className="p-3">{payment.method ?? "-"}</td>
              <td className="p-3 flex gap-2">
                <Link
                  href={`/payments/${payment.id}/edit`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </Link>
                <button
                  onClick={() => deletePayment(payment.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">Nenhum pagamento cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
