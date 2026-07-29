import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus, AlertCircle } from "lucide-react";
import TaxReceiptForm from "./TaxReceiptForm";
import { toast } from "sonner";
import useApi from "@/lib/axiosClient";


const TaxReceiptModal = ({ onTaxReceiptCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const api = useApi();

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post(`/taxreceipts`,formData);

      if(response.status === 201){
        if(onTaxReceiptCreated){
          setOpen(false);
          setError("");
          onTaxReceiptCreated();
          toast.success("Comprobante creado exitosamente");
          return;
        }
      }
      else{
        setOpen(false);
        setError(response.data?.detail ||"Error al crear el comprobante fiscal");
      }

      // Cerrar modal y resetear estados
      
    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear el comprobante fiscal");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setError("");
  };

  const handleOpenChange = (newOpen) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) {
        setError("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98]">
          <Plus className="h-4 w-4" />
          Nuevo Comprobante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Crear Nuevo Comprobante Fiscal
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <TaxReceiptForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaxReceiptModal;