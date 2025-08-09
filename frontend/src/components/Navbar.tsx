'use client';
import { Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-[#00b87c] shadow px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-white">
        FinanceFlow
      </h1>
      <Menu className="h-6 w-6 text-white md:hidden" />
    </header>
  );
}
