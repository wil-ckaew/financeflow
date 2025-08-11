// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Box,
  ShoppingCart,
  FileText,
  LayoutDashboard,
  CreditCard,
  DollarSign,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/products", label: "Produtos", icon: Box },
  { href: "/sales", label: "Vendas", icon: ShoppingCart },
  { href: "/expenses", label: "Despesas", icon: DollarSign },
  { href: "/payments", label: "Pagamentos", icon: CreditCard },
  { href: "/reports", label: "Relatórios", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg hidden md:flex flex-col p-4 border-r border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-8 text-emerald-600 tracking-tight">
        FinanceFlow
      </h2>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-600"
                }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
