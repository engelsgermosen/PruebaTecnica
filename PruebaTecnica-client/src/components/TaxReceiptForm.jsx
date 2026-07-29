import { useState, useContext, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import TaxPayerCombobox from "./TaxPayerCombobox";
import { useDebounce } from "../hooks/useDebounce";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { AlertCircle, UserPlus, Loader2 } from "lucide-react";

const TaxReceiptForm = ({ onSubmit, onCancel, loading = false }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    rncIdentification: "",
    amount: "",
    type: ""
  });
  const [errors, setErrors] = useState({});
  
  // Estados para contribuyentes
  const [taxPayers, setTaxPayers] = useState([]);
  const [searchingTaxPayer, setSearchingTaxPayer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasFocusedTaxPayerInput, setHasFocusedTaxPayerInput] = useState(false);

  // Debounce search term
  const debouncedRnc = useDebounce(formData.rncIdentification, 500);

  // Calcular ITBIS y total
  const itbis18 = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    return (amount * 0.18).toFixed(2);
  }, [formData.amount]);

  const total = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    const itbis = parseFloat(itbis18) || 0;
    return (amount + itbis).toFixed(2);
  }, [formData.amount, itbis18]);

  // Buscar contribuyentes
  const fetchTaxPayers = useCallback(
    async (searchQuery = "") => {
      try {
        setSearchingTaxPayer(true);
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/taxpayers`;
        const params = new URLSearchParams();
        const trimmedQuery = searchQuery.trim();

        if (trimmedQuery) {
          params.append("rncIdentification", trimmedQuery);
        }

        const url = params.toString() ? `${baseUrl}?${params}` : baseUrl;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 204) {
          setTaxPayers([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setTaxPayers(list);
      } catch (err) {
        console.error("Error al cargar los contribuyentes:", err);
        setErrors(prev => ({
          ...prev,
          general: err.message || "Error al cargar los contribuyentes"
        }));
      } finally {
        setSearchingTaxPayer(false);
      }
    },
    [token]
  );

  // Effect para búsqueda con debounce
  useEffect(() => {
    if (!hasFocusedTaxPayerInput || !debouncedRnc) return;
    
    if (token) {
      fetchTaxPayers(debouncedRnc);
    }
  }, [debouncedRnc, token, fetchTaxPayers, hasFocusedTaxPayerInput]);

  // Abrir dropdown cuando hay resultados
  useEffect(() => {
    if (taxPayers.length > 0 && !searchingTaxPayer) {
      setIsDropdownOpen(true);
    }
  }, [taxPayers, searchingTaxPayer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTypeChange = useCallback((val) => {
    setFormData((prev) => ({ ...prev, type: val }));
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: "" }));
    }
  }, [errors.type]);

  const handleComboboxChange = useCallback((val) => {
    setFormData(prev => ({
      ...prev,
      rncIdentification: val
    }));
    setIsDropdownOpen(true);
    
    // Limpiar error
    if (errors.rncIdentification) {
      setErrors(prev => ({
        ...prev,
        rncIdentification: "",
      }));
    }
  }, [errors.rncIdentification]);

  const handleComboboxSelect = useCallback((item) => {
    setFormData(prev => ({
      ...prev,
      rncIdentification: item.rncIdentification
    }));
    setIsDropdownOpen(false);
  }, []);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.rncIdentification.trim()) {
      newErrors.rncIdentification = "El RNC o Cédula es requerido";
    } else if (formData.rncIdentification.trim().length < 9) {
      newErrors.rncIdentification = "El RNC/Cédula debe tener mínimo 9 dígitos";
    } else if (formData.rncIdentification.trim().length > 11) {
      newErrors.rncIdentification = "El RNC/Cédula debe tener máximo 11 dígitos";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "El monto es requerido";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "El monto debe ser un número mayor a 0";
      }
    }

    if (!formData.type) {
      newErrors.type = "Seleccione el tipo de comprobante";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      rncIdentification: formData.rncIdentification.trim(),
      amount: parseFloat(formData.amount),
      type: formData.type ? parseInt(formData.type, 10) : undefined,
    });
  };

  // Verificar si el contribuyente existe
  const taxPayerExists = useMemo(() => {
    if (!formData.rncIdentification.trim()) return true;
    return taxPayers.some(
      (tp) => tp.rncIdentification === formData.rncIdentification.trim()
    );
  }, [taxPayers, formData.rncIdentification]);

  // Navegar a crear contribuyente con RNC prellenado
  const handleCreateTaxPayerFromRnc = () => {
    if (!formData.rncIdentification.trim()) return;
    navigate(`/auth/taxpayers?create=1&rnc=${encodeURIComponent(formData.rncIdentification.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error general */}
      {errors.general && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Campo RNC/Cédula */}
      <div className="space-y-2">
        <Label htmlFor="rncIdentification">
          Cédula o RNC
          {searchingTaxPayer && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Buscando...
            </span>
          )}
        </Label>
        <div className="relative">
          <TaxPayerCombobox
            value={formData.rncIdentification}
            onChange={handleComboboxChange}
            isOpen={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
            items={taxPayers}
            loading={searchingTaxPayer}
            onSelect={handleComboboxSelect}
            onInputFocus={() => {
              if (!hasFocusedTaxPayerInput) {
                setHasFocusedTaxPayerInput(true);
                fetchTaxPayers(formData.rncIdentification);
              }
            }}
          />
          {!searchingTaxPayer && 
           hasFocusedTaxPayerInput && 
           formData.rncIdentification.trim().length >= 9 && 
           formData.rncIdentification.trim().length <= 11 &&
           !taxPayerExists && (
            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              <button
                type="button"
                onClick={handleCreateTaxPayerFromRnc}
                title="Crear contribuyente con este RNC"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Crear contribuyente
              </button>
            </div>
          )}
        </div>
        {errors.rncIdentification && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.rncIdentification}
          </p>
        )}
      </div>


      <div className="space-y-2">
        <Label htmlFor="type">Tipo de comprobante</Label>
        <Select value={formData.type} onValueChange={handleTypeChange}>
          <SelectTrigger id="type" className="w-full" aria-invalid={Boolean(errors.type)}>
            <SelectValue placeholder="Seleccione el tipo de comprobante" />
          </SelectTrigger>
          <SelectContent>
            {/* B01–B16 (10 códigos vigentes) */}
            <SelectItem value="1">B01 – Factura con Crédito Fiscal</SelectItem>
            <SelectItem value="2">B02 – Consumidor Final</SelectItem>
            <SelectItem value="3">B03 – Regímenes Especiales</SelectItem>
            <SelectItem value="4">B04 – Proveedores Informales</SelectItem>
            <SelectItem value="5">B11 – Nota de Débito</SelectItem>
            <SelectItem value="6">B12 – Nota de Crédito</SelectItem>
            <SelectItem value="7">B13 – Comprobante gubernamental</SelectItem>
            <SelectItem value="8">B14 – Pagos al exterior</SelectItem>
            <SelectItem value="9">B15 – Gastos menores</SelectItem>
            <SelectItem value="10">B16 – Regímenes especiales de tributación</SelectItem>

            {/* e-CF E31–E45 (9 códigos electrónicos) */}
            <SelectItem value="11">E31 – Factura crédito fiscal electrónica</SelectItem>
            <SelectItem value="12">E32 – Factura consumidor final electrónica</SelectItem>
            <SelectItem value="13">E33 – Nota de crédito electrónica</SelectItem>
            <SelectItem value="14">E34 – Nota de débito electrónica</SelectItem>
            <SelectItem value="15">E41 – Comprobante gubernamental electrónico</SelectItem>
            <SelectItem value="16">E42 – Pago al exterior electrónico</SelectItem>
            <SelectItem value="17">E43 – Compras electrónicas</SelectItem>
            <SelectItem value="18">E44 – Gastos menores electrónicos</SelectItem>
            <SelectItem value="19">E45 – Proveedores informales electrónico</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.type}
          </p>
        )}
      </div>

      {/* Campo Monto */}
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          type="number"
          id="amount"
          name="amount"
          step="any"
          min="0.01"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Ingrese el monto de la factura"
          aria-invalid={Boolean(errors.amount)}
          className={errors.amount ? "border-red-400 focus:border-red-500 focus:ring-red-500/30" : ""}
        />
        {errors.amount && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.amount}
          </p>
        )}
      </div>

      {/* Cálculos */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal:</span>
          <span className="font-medium text-slate-900">
            {new Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP"
            }).format(parseFloat(formData.amount || 0))}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">ITBIS (18%):</span>
          <span className="font-medium text-amber-700">{new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
          }).format(parseFloat(itbis18))}</span>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-slate-900">Total:</span>
            <span className="text-blue-600">{new Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP"
            }).format(parseFloat(total))}</span>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            loading ||
            !formData.rncIdentification.trim() ||
            !formData.amount.trim() ||
            !formData.type
          }
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </span>
          ) : (
            "Crear Comprobante"
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaxReceiptForm;