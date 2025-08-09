// src/app/clients/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

async function getClients(): Promise<Client[]> {
  const res = await fetch('http://localhost:8080/api/clients', { cache: 'no-store' });
  if (!res.ok) throw new Error('Erro ao carregar clientes');
  const data = await res.json();
  return data.clients ?? [];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, []);

  function toggleExpand(id: string) {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  }

  return (
    <main className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
            Clientes
          </h1>
          <p className="text-lg text-gray-600">
            Veja a lista completa de clientes cadastrados.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Novo Cliente
        </Link>
      </header>

      <ul className="space-y-4">
        {clients.map(client => {
          const isExpanded = expandedIds.has(client.id);
          return (
            <li
              key={client.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => toggleExpand(client.id)}
                className="text-left flex-1 focus:outline-none"
                aria-expanded={isExpanded}
                aria-controls={`client-details-${client.id}`}
              >
                <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
                {isExpanded && (
                  <div
                    id={`client-details-${client.id}`}
                    className="mt-1 text-gray-700 space-y-1 sm:mt-0 sm:ml-4"
                  >
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                  </div>
                )}
              </button>

              <Link
                href={`/clients/${client.id}/edit`}
                className="mt-3 sm:mt-0 sm:ml-6 inline-block rounded-md bg-blue-100 px-4 py-2 text-blue-700 font-medium hover:bg-blue-200 transition whitespace-nowrap"
                onClick={e => e.stopPropagation()}
              >
                Editar
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
