// src/app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface Sale {
  id: string;
  total_price: number;
  created_at: string;
}

interface ProductStock {
  name: string;
  stock: number;
}

const COLORS = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6",
  "#EC4899", "#F87171", "#34D399", "#60A5FA", "#A78BFA"
];

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stock, setStock] = useState<ProductStock[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/sales")
      .then(res => res.json())
      .then(data => {
        setSales(data);
      });

    fetch("http://localhost:8080/api/products")
      .then(res => res.json())
      .then(data => {
        setStock(data);
      });
  }, []);

  // Processar dados para gráfico de vendas por mês (com ano)
  const monthlyData = sales.reduce((acc: any[], sale) => {
    const date = new Date(sale.created_at);
    const month = date.toLocaleString("pt-BR", { month: "short" });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;

    const found = acc.find(item => item.month === monthYear);
    if (found) {
      found.total += sale.total_price;
    } else {
      acc.push({ month: monthYear, total: sale.total_price });
    }
    return acc;
  }, []);

  // Estoque baixo: produtos com estoque < 5
  const lowStock = stock.filter(p => p.stock < 5);

  // Para o gráfico de pizza precisamos somar os estoques para porcentagens ou usar como está (cada fatia é um produto)
  // Vamos usar como está, mostrando a proporção dos produtos em estoque baixo

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_price, 0);
  const totalSales = sales.length;

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-600">Total de Vendas</h2>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-600">Receita Total</h2>
          <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-gray-600">Produtos com Estoque Baixo</h2>
          <p className="text-2xl font-bold">{lowStock.length}</p>
        </div>
      </div>

      {/* Gráfico de Vendas - BARRAS */}
      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Vendas por Mês</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" interval={0} angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="total" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Estoque Baixo - PIZZA */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Estoque Baixo (Produtos)</h2>
        {lowStock.length === 0 ? (
          <p>Nenhum produto com estoque baixo.</p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                    data={lowStock}
                    dataKey="stock"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }: { name: string; percent?: number }) =>
                        `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                    }
                    >
                    {lowStock.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>

                <Tooltip formatter={(value: number) => `Estoque: ${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}
