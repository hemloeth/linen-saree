import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/account/AuthForm";
export const metadata = { title: "Account" };
export default function AccountPage() { return <><Header /><main className="flex-1 bg-linen px-4 py-12 lg:py-20"><AuthForm /></main><Footer /></>; }
