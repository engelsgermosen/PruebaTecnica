import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { Toaster } from "sonner";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <Header />
      <Toaster richColors position="top-right" />
      <main className="flex flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
