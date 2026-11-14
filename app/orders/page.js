import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrdersView from "@/components/orders/OrdersView";
export const metadata={title:"My orders"};
export default function OrdersPage(){return <><Header /><main className="flex-1"><OrdersView /></main><Footer /></>;}
