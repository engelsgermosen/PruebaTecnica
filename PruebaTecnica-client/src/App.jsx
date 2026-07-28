import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import NotFound from "./pages/NotFound";
import TaxPayer from "./pages/TaxPayer";
import TaxPayerAuth from "./pages/auth/TaxPayer";
import TaxPayerType from "./pages/auth/TaxPayerType";
import TaxReceipt from "./pages/auth/TaxReceipt";
import Dashboard from "./pages/auth/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/taxpayer/:rncIdentification" element={<TaxPayer />} />
            <Route path="/auth/dashboard" element={<Dashboard />} />
            <Route path="/auth/taxpayertypes" element={<TaxPayerType />} />
            <Route path="/auth/taxpayers" element={<TaxPayerAuth />} />
            <Route path="/auth/taxreceipts" element={<TaxReceipt />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
