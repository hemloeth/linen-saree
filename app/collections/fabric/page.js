import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionPageView from "@/components/CollectionPageView";

export const metadata = {
  title: "Shop by Fabric",
  description: "Silk, cotton classic, pure georgette, pure muslin and more — shop sarees by fabric.",
};

export default function FabricCollectionPage() {
  return (
    <>
      <Header />
      <CollectionPageView
        title="Shop by Fabric"
        subtitle="Silk, cotton, georgette and muslin weaves"
      />
      <Footer />
    </>
  );
}