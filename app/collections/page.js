import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionPageView from "@/components/CollectionPageView";

export const metadata = {
  title: "Collections",
  description: "Shop sarees by fabric, occasion and weave — silk, cotton, georgette, muslin and festive edits.",
};

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <CollectionPageView
        title="Top Collection"
        subtitle="Handpicked weaves from the House of Qalakari"
      />
      <Footer />
    </>
  );
}