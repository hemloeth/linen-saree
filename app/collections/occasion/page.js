import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionPageView from "@/components/CollectionPageView";

export const metadata = {
  title: "Shop by Occasion",
  description: "Festive wear and wedding sarees — shop by occasion from the House of Qalakari.",
};

export default function OccasionCollectionPage() {
  return (
    <>
      <Header />
      <CollectionPageView
        title="Shop by Occasion"
        subtitle="Festive, wedding and everyday occasion edits"
      />
      <Footer />
    </>
  );
}