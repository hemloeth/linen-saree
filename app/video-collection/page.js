import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveVideoCollection from "@/components/video/LiveVideoCollection";
export const metadata = { title: "Video Collection", description: "Watch product videos and shop sarees" };
export default function VideoCollectionPage() { return <><Header /><main className="flex-1"><LiveVideoCollection /></main><Footer /></>; }
