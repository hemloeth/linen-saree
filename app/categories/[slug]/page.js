import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilteredProducts from "@/components/merchandising/FilteredProducts";

export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <>
      <Header />
      <FilteredProducts kind="category" value={slug} />
      <Footer />
    </>
  );
}
