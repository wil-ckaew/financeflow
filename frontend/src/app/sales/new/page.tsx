// src/app/sales/new/page.tsx
import SaleForm from "../../../components/SaleForm";

export default function NewSalePage() {
  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nova Venda</h1>
      <SaleForm />
    </main>
  );
}
