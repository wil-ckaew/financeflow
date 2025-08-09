// src/components/ProductForm.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stock" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const method = product ? "PATCH" : "POST";
    const url = product
      ? `http://localhost:8080/api/products/${product.id}`
      : "http://localhost:8080/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/products");
      router.refresh();
    } else {
      alert("Erro ao salvar produto");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">
        {product ? "Editar Produto" : "Novo Produto"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <textarea
          name="description"
          placeholder="Descrição"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <input
          type="number"
          name="price"
          placeholder="Preço"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Estoque"
          value={formData.stock}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
