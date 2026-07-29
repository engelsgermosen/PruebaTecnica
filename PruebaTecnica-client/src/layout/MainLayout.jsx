import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { Toaster } from "sonner";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <Toaster richColors position="top-right" />
      <main className="container mx-auto flex w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
