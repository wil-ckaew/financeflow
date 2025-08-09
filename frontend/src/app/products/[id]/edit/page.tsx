// src/app/products/[id]/edit/page.tsx
import ProductForm, { Product } from "../../../../components/ProductForm";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null; // evita throw
    return res.json();
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="p-6 text-red-500">
        Produto não encontrado ou ocorreu um erro ao buscar os dados.
      </div>
    );
  }

  return <ProductForm product={product} />;
}
