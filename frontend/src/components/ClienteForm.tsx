// src/components/ClienteForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

interface ClienteFormProps {
  client?: Client; // Opcional: se vier, é edição
}

export default function ClienteForm({ client }: ClienteFormProps) {
  const router = useRouter();

  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [loading, setLoading] = useState(false);
  const isEdit = !!client;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = isEdit
      ? `http://localhost:8080/api/clients/${client?.id}`
      : 'http://localhost:8080/api/clients';

    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/clients');
    } else {
      alert('Erro ao salvar cliente');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 max-w-xl mx-auto"
    >
      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
          Telefone
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-60"
      >
        {loading ? 'Salvando...' : isEdit ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
      </button>
    </form>
  );
}
