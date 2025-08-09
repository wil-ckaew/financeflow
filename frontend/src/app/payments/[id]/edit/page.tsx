// src/app/payments/[id]/edit/page.tsx
import PaymentForm, { Payment } from "../../../../components/PaymentForm";

async function getPayment(id: string): Promise<Payment | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/payments/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function EditPaymentPage({ params }: { params: { id: string } }) {
  const payment = await getPayment(params.id);

  if (!payment) {
    return <p>Pagamento não encontrado</p>;
  }

  return <PaymentForm paymentId={params.id} initialData={payment} />;
}
