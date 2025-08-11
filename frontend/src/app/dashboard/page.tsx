// src/app/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";

interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_price: number;
}

interface Client {
  id: string; // UUID puro
  name: string;
}

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [salesRes, clientsRes] = await Promise.all([
          fetch("http://localhost:8080/sales"),
          fetch("http://localhost:8080/clients"),
        ]);

        if (!salesRes.ok) throw new Error("Erro ao carregar vendas");
        if (!clientsRes.ok) throw new Error("Erro ao carregar clientes");

        const salesData: Sale[] = await salesRes.json();
        const clientsData: Client[] = await clientsRes.json();

        // Garantir que id seja só o UUID puro
        const cleanClients = clientsData.map(c => ({
          id: String(c.id).trim(), // garante string limpa
          name: c.name
        }));

        setSales(salesData);
        setClients(cleanClients);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    return client ? client.name : "Cliente não encontrado";
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar painel: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel de Vendas</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Cliente</th>
            <th className="border px-4 py-2">Produto ID</th>
            <th className="border px-4 py-2">Quantidade</th>
            <th className="border px-4 py-2">Preço Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td className="border px-4 py-2">{getClientName(sale.product_id)}</td>
              <td className="border px-4 py-2">{sale.product_id}</td>
              <td className="border px-4 py-2">{sale.quantity}</td>
              <td className="border px-4 py-2">R$ {sale.total_price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
