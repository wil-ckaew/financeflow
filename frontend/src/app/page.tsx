import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-start justify-center gap-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Bem-vindo ao <span className="text-blue-600">FinanceFlow</span>
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl">
        Gerencie clientes, produtos, vendas e relatórios financeiros com
        facilidade e eficiência em um painel intuitivo.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/clients"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
        >
          Acessar Clientes
        </Link>
        <Link
          href="/reports"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition"
        >
          Ver Relatórios
        </Link>
      </div>
    </div>
  );
}
