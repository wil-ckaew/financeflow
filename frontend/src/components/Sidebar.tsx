'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Box,
  ShoppingCart,
  FileText,
  LayoutDashboard,
  CreditCard,
  DollarSign,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/clients', label: 'Clientes', icon: <Users size={20} /> },
  { href: '/products', label: 'Produtos', icon: <Box size={20} /> },
  { href: '/sales', label: 'Vendas', icon: <ShoppingCart size={20} /> },
  { href: '/expenses', label: 'Despesas', icon: <DollarSign size={20} /> },
  { href: '/payments', label: 'Pagamentos', icon: <CreditCard size={20} /> },
  { href: '/reports', label: 'Relatórios', icon: <FileText size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-md hidden md:flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6 text-emerald-600">Menu</h2>
      <nav className="flex flex-col space-y-2">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-gray-800'
                }`}
            >
              {icon}
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
