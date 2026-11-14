import ProductPageView from "@/components/ProductPageView";

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductPageView productId={id} />;
}
