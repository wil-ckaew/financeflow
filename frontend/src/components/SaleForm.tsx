// src/components/SaleForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface SaleFormProps {
  sale?: {
    id: string;
    product_id: string;
    quantity: number;
  };
}

export default function SaleForm({ sale }: SaleFormProps) {
  const router = useRouter();
  const isEdit = !!sale;

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(sale?.product_id || '');
  const [quantity, setQuantity] = useState(sale?.quantity || 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Erro ao carregar produtos:', err));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = isEdit
      ? `http://localhost:8080/api/sales/${sale?.id}`
      : 'http://localhost:8080/api/sales';

    const method = isEdit ? 'PATCH' : 'POST';
    const body = { product_id: productId, quantity };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/sales');
    } else {
      alert('Erro ao salvar venda');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4"
    >
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Produto</label>
        <select
          value={productId}
          onChange={e => setProductId(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white"
        >
          <option value="">Selecione um produto</option>
          {products.map(prod => (
            <option key={prod.id} value={prod.id}>
              {prod.name} - R$ {prod.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Quantidade</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          required
          className="w-full border rounded px-3 py-2 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
      >
        {loading ? 'Salvando...' : isEdit ? 'Atualizar Venda' : 'Cadastrar Venda'}
      </button>
    </form>
  );
}
