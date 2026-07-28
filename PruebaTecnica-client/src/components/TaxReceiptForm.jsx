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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Campo RNC/Cédula */}
      <div className="space-y-2">
        <Label htmlFor="rncIdentification">
          Cédula o RNC
          {searchingTaxPayer && (
            <span className="ml-2 text-xs text-primary">Buscando...</span>
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                onClick={handleCreateTaxPayerFromRnc}
                title="Crear contribuyente con este RNC"
              >
                <svg
                  className="h-3 w-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear
              </Button>
            </div>
          )}
        </div>
        {errors.rncIdentification && (
          <p className="text-sm text-red-600" role="alert">
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
          <p className="text-sm text-red-600" role="alert">
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
          className={errors.amount ? "border-red-400 ring-red-300 bg-red-50" : ""}
        />
        {errors.amount && (
          <p className="text-sm text-red-600" role="alert">
            {errors.amount}
          </p>
        )}
      </div>

      {/* Cálculos */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">
            {new Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP"
            }).format(parseFloat(formData.amount || 0))}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ITBIS (18%):</span>
          <span className="font-medium">{new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
          }).format(parseFloat(itbis18))}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span>Total:</span>
            <span>{new Intl.NumberFormat("es-DO", {
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
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creando...
            </div>
          ) : (
            "Crear Comprobante"
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaxReceiptForm;