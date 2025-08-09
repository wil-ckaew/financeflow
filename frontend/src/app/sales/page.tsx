// src/app/sales/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  created_at: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  async function loadSales() {
    try {
      const res = await fetch('http://localhost:8080/api/sales'); // corrigido para /api/sales
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao buscar vendas: ${errorText}`);
      }
      const data = await res.json();
      setSales(data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      alert(`Erro ao buscar vendas: ${(error as Error).message}`);
    }
  }

  async function deleteSale(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;
    const res = await fetch(`http://localhost:8080/api/sales/${id}`, { method: 'DELETE' }); // também com /api
    if (res.ok) loadSales();
    else alert('Erro ao excluir venda');
  }

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Link
          href="/sales/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Nova Venda
        </Link>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Produto ID</th>
              <th className="p-3">Produto</th>
              <th className="p-3">Quantidade</th>
              <th className="p-3">Total</th>
              <th className="p-3">Data</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b dark:border-gray-700">
                <td className="p-3">{sale.id}</td>
                <td className="p-3">{sale.product_id}</td>
                <td className="p-3">{sale.product_name}</td>
                <td className="p-3">{sale.quantity}</td>
                <td className="p-3">R$ {(sale.total_price ?? 0).toFixed(2)}</td>
                <td className="p-3">{new Date(sale.created_at).toLocaleString()}</td>
                <td className="p-3 flex gap-2">
                  <Link
                    href={`/sales/${sale.id}/edit`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteSale(sale.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  Nenhuma venda encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
