// src/app/page.tsx
// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type MonthlyData = { month: string; sales: number };

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function Home() {
  const [totalClients, setTotalClients] = useState<number | null>(null);
  const [totalSales, setTotalSales] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlyData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      setLoading(true);

      try {
        // IMPORTANTE: usamos /api/clients (lista) em vez de /api/clients/count
        const [
          clientsRes,
          salesRes,
          revenueRes,
          expensesRes,
          monthlyRes,
        ] = await Promise.all([
          fetch(`${API}/api/clients`),
          fetch(`${API}/api/sales/count`),
          fetch(`${API}/api/sales/revenue`),
          fetch(`${API}/api/expenses/total`),
          fetch(`${API}/api/sales/monthly`),
        ]);

        // Verifica cada resposta e loga detalhes se não ok
        const responses = [
          { name: "clients", res: clientsRes },
          { name: "sales", res: salesRes },
          { name: "revenue", res: revenueRes },
          { name: "expenses", res: expensesRes },
          { name: "monthly", res: monthlyRes },
        ];

        for (const r of responses) {
          if (!r.res.ok) {
            // pega body para debug (se houver)
            const text = await r.res.text().catch(() => "<no body>");
            const msg = `API ${r.name} returned ${r.res.status}: ${text}`;
            console.error(msg);
            setError(msg);
            setLoading(false);
            return;
          }
        }

        // Todas ok -> parse JSON
        const clientsJson = await clientsRes.json();
        const salesJson = await salesRes.json();
        const revenueJson = await revenueRes.json();
        const expensesJson = await expensesRes.json();
        const monthlyJson = await monthlyRes.json();

        // --- totalClients: suportar vários formatos ---
        // Possíveis formatos:
        // 1) array direto -> clientsJson = [ {id,...}, ... ]
        // 2) objeto { status: "success", clients: [...] }
        // 3) objeto { count: N } (menos provável no seu caso)
        let clientsCount: number | null = null;
        if (Array.isArray(clientsJson)) {
          clientsCount = clientsJson.length;
        } else if (clientsJson && typeof clientsJson === "object") {
          if (Array.isArray((clientsJson as any).clients)) {
            clientsCount = (clientsJson as any).clients.length;
          } else if (typeof (clientsJson as any).count === "number") {
            clientsCount = (clientsJson as any).count;
          } else {
            clientsCount = null;
          }
        }

        setTotalClients(clientsCount ?? null);
        setTotalSales(salesJson.count ?? null);
        setTotalRevenue(revenueJson.revenue ?? null);
        setTotalExpenses(expensesJson.total ?? null);

        // normaliza monthlyJson para o formato esperado
        setMonthlySales(
          Array.isArray(monthlyJson)
            ? monthlyJson.map((m: any) => ({
                month: m.month ?? m.month_name ?? "N/A",
                sales: Number(m.sales ?? m.total ?? 0),
              }))
            : []
        );
      } catch (err: any) {
        console.error("Erro na requisição:", err);
        setError(String(err) || "Erro desconhecido ao buscar dados da API");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Carregando painel...</div>;
  if (error)
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">Erro ao carregar painel</h2>
        <pre className="whitespace-pre-wrap text-sm text-red-600">{error}</pre>
      </div>
    );

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Bem-vindo ao <span className="text-emerald-600">FinanceFlow</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Gerencie clientes, produtos, vendas e relatórios financeiros.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Clientes" value={totalClients ?? "—"} color="emerald" />
        <Card title="Vendas" value={totalSales ?? "—"} color="blue" />
        <Card
          title="Faturamento"
          value={totalRevenue !== null ? `R$ ${totalRevenue.toLocaleString()}` : "—"}
          color="purple"
        />
        <Card
          title="Despesas"
          value={totalExpenses !== null ? `R$ ${totalExpenses.toLocaleString()}` : "—"}
          color="red"
        />
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Vendas Mensais
        </h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={monthlySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString()}`} />
              <Bar dataKey="sales" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color: "emerald" | "blue" | "purple" | "red";
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-600 text-emerald-100",
    blue: "bg-blue-600 text-blue-100",
    purple: "bg-purple-600 text-purple-100",
    red: "bg-red-600 text-red-100",
  };

  return (
    <div className={`rounded-lg p-5 shadow-md flex flex-col justify-between ${colors[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
