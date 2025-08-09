// src/app/clients/[id]/edit/page.tsx
import React from 'react';
import ClienteForm from '../../../../components/ClienteForm';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface EditClientPageProps {
  params: { id: string };
}

async function getClient(id: string): Promise<Client> {
  const res = await fetch(`http://localhost:8080/api/clients/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Falha ao carregar cliente');
  }

  const data = await res.json();
  return data.client;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const client = await getClient(params.id);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Editar Cliente</h1>
      <ClienteForm client={client} />
    </main>
  );
}
