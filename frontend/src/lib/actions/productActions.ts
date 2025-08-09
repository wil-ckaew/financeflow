// src/lib/actions/productActions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const product = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    stock: parseInt(formData.get("stock") as string, 10),
  };

  await fetch("http://localhost:8080/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  revalidatePath("/products");
}
