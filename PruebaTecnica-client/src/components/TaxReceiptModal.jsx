import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
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
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Comprobante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Comprobante Fiscal</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
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