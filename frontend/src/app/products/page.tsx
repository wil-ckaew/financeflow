// src/app/products/page.tsx
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch("http://localhost:8080/api/products", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar produtos");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Link
          href="/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Novo Produto
        </Link>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border text-left">Nome</th>
              <th className="p-3 border text-left">Descrição</th>
              <th className="p-3 border text-right">Preço</th>
              <th className="p-3 border text-center">Estoque</th>
              <th className="p-3 border text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 border">{p.name}</td>
                <td className="p-3 border">{p.description}</td>
                <td className="p-3 border text-right">
                  R$ {p.price.toFixed(2)}
                </td>
                <td className="p-3 border text-center">{p.stock}</td>
                <td className="p-3 border text-center">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Editar
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await fetch(`http://localhost:8080/api/products/${p.id}`, {
                          method: "DELETE",
                        });
                      }}
                    >
                      <button
                        type="submit"
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
