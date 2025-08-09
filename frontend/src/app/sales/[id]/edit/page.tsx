// src/app/sales/[id]/edit/page.tsx
import SaleForm from '../../../../components/SaleForm';

export default async function EditSalePage({ params }: { params: { id: string } }) {
  const res = await fetch(`http://localhost:8080/api/sales/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Venda não encontrada</h1>
      </main>
    );
  }

  const sale = await res.json();

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Venda</h1>
      <SaleForm sale={sale} />
    </main>
  );
}
