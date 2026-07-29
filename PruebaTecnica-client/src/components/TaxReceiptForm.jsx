import { useState, useContext, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import TaxPayerCombobox from "./TaxPayerCombobox";
import ProductCombobox from "./ProductCombobox";
import { useApi } from "../lib/axiosClient";
import { useDebounce } from "../hooks/useDebounce";
import { AlertCircle, UserPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { formatDOP } from "../utils/currency";
import { lineSubtotal, computeReceiptTotals, ITBIS_RATE } from "../utils/receiptCalc";

const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const inputOk = "border-slate-300 focus:border-blue-500 focus:ring-blue-500/30";
const inputError = "border-red-400 focus:border-red-500 focus:ring-red-500/30";

const TaxReceiptForm = ({ onSubmit, onCancel, loading = false }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const api = useApi();

  // Campos principales
  const [taxReceiptTypeId, setTaxReceiptTypeId] = useState("");
  const [taxReceiptTypes, setTaxReceiptTypes] = useState([]);
  const [rncIdentification, setRncIdentification] = useState("");
  const [errors, setErrors] = useState({});

  // --- Contribuyente (combobox con búsqueda en servidor) ---
  const [taxPayers, setTaxPayers] = useState([]);
  const [searchingTaxPayer, setSearchingTaxPayer] = useState(false);
  const [isTaxPayerOpen, setIsTaxPayerOpen] = useState(false);
  const [hasFocusedTaxPayer, setHasFocusedTaxPayer] = useState(false);
  const debouncedRnc = useDebounce(rncIdentification, 500);

  // --- Productos / líneas ---
  const [activeProducts, setActiveProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [lines, setLines] = useState([]);

  // Cargar productos activos (para el selector de líneas)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await api.get("/products?isActive=true&page=1&pageSize=1000");
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
        setActiveProducts(items.filter((p) => p.isActive));
      } catch {
        // el combobox mostrará "sin resultados"
      } finally {
        setLoadingProducts(false);
      }
    };
    if (token) loadProducts();
  }, [api, token]);

  // Cargar tipos de comprobante (para el selector). Endpoint anónimo.
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await api.get("/taxreceipttypes");
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        setTaxReceiptTypes(items);
      } catch {
        // el selector queda vacío
      }
    };
    loadTypes();
  }, [api]);

  // Buscar contribuyentes en el servidor
  const fetchTaxPayers = useCallback(
    async (searchQuery = "") => {
      try {
        setSearchingTaxPayer(true);
        const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/taxpayers`;
        const params = new URLSearchParams();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) params.append("rncIdentification", trimmedQuery);
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
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setTaxPayers(list);
      } catch {
        setTaxPayers([]);
      } finally {
        setSearchingTaxPayer(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!hasFocusedTaxPayer || !debouncedRnc) return;
    if (token) fetchTaxPayers(debouncedRnc);
  }, [debouncedRnc, token, fetchTaxPayers, hasFocusedTaxPayer]);

  useEffect(() => {
    if (taxPayers.length > 0 && !searchingTaxPayer) setIsTaxPayerOpen(true);
  }, [taxPayers, searchingTaxPayer]);

  // Productos filtrados (nombre) para el combobox — filtrado en cliente
  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const base = q
      ? activeProducts.filter((p) => p.name?.toLowerCase().includes(q))
      : activeProducts;
    return base.slice(0, 50);
  }, [activeProducts, productQuery]);

  // Totales del preview (misma fórmula que el servidor)
  const totals = useMemo(() => computeReceiptTotals(lines), [lines]);

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  // --- Handlers contribuyente ---
  const handleRncChange = useCallback((val) => {
    setRncIdentification(val);
    setIsTaxPayerOpen(true);
  }, []);
  const handleRncSelect = useCallback((item) => {
    setRncIdentification(item.rncIdentification);
    setIsTaxPayerOpen(false);
  }, []);
  const taxPayerExists = useMemo(() => {
    if (!rncIdentification.trim()) return true;
    return taxPayers.some((tp) => tp.rncIdentification === rncIdentification.trim());
  }, [taxPayers, rncIdentification]);
  const handleCreateTaxPayerFromRnc = () => {
    if (!rncIdentification.trim()) return;
    navigate(`/auth/taxpayers?create=1&rnc=${encodeURIComponent(rncIdentification.trim())}`);
  };

  // --- Handlers productos / líneas ---
  const handleProductQueryChange = (val) => {
    setProductQuery(val);
    setSelectedProduct(null);
    setIsProductOpen(true);
  };
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductQuery(product.name);
    setIsProductOpen(false);
    clearError("product");
  };

  const handleAddLine = () => {
    const qty = parseInt(quantity, 10);
    const nextErrors = {};
    if (!selectedProduct) nextErrors.product = "Seleccione un producto";
    if (!qty || qty <= 0) nextErrors.quantity = "Cantidad inválida";
    if (Object.keys(nextErrors).length) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      return;
    }

    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === selectedProduct.id);
      if (idx >= 0) {
        // Ya existe: sumar a la cantidad en vez de duplicar la línea
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [
        ...prev,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          unitPrice: selectedProduct.unitPrice,
          quantity: qty,
        },
      ];
    });

    setSelectedProduct(null);
    setProductQuery("");
    setQuantity("1");
    setErrors((prev) => ({ ...prev, product: "", quantity: "", lines: "" }));
  };

  const handleLineQtyChange = (productId, value) => {
    const qty = Math.max(1, parseInt(value, 10) || 1);
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l))
    );
  };
  const handleRemoveLine = (productId) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  };

  // --- Submit ---
  const validateForm = () => {
    const e = {};
    if (!taxReceiptTypeId) {
      e.taxReceiptTypeId = "Seleccione el tipo de comprobante";
    }
    if (!rncIdentification.trim()) {
      e.rncIdentification = "El RNC o Cédula es requerido";
    } else if (
      rncIdentification.trim().length < 9 ||
      rncIdentification.trim().length > 11
    ) {
      e.rncIdentification = "El RNC/Cédula debe tener entre 9 y 11 dígitos";
    }
    if (lines.length === 0) {
      e.lines = "Agregue al menos un producto";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    // El NCF lo genera el servidor a partir del tipo.
    // Los montos NO se envían: el servidor los calcula a partir de details.
    onSubmit({
      taxReceiptTypeId: Number(taxReceiptTypeId),
      rncIdentification: rncIdentification.trim(),
      details: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de comprobante — el servidor genera el NCF a partir del tipo */}
      <div className="space-y-2">
        <Label htmlFor="taxReceiptTypeId">Tipo de comprobante</Label>
        <select
          id="taxReceiptTypeId"
          name="taxReceiptTypeId"
          value={taxReceiptTypeId}
          onChange={(e) => {
            setTaxReceiptTypeId(e.target.value);
            clearError("taxReceiptTypeId");
          }}
          aria-invalid={Boolean(errors.taxReceiptTypeId)}
          className={`${inputBase} ${errors.taxReceiptTypeId ? inputError : inputOk}`}
        >
          <option value="">Seleccione el tipo de comprobante</option>
          {taxReceiptTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.code} - {t.description}
            </option>
          ))}
        </select>
        {errors.taxReceiptTypeId && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.taxReceiptTypeId}
          </p>
        )}
      </div>

      {/* Contribuyente */}
      <div className="space-y-2">
        <Label htmlFor="RncIdentification">
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
            value={rncIdentification}
            onChange={handleRncChange}
            isOpen={isTaxPayerOpen}
            onOpenChange={setIsTaxPayerOpen}
            items={taxPayers}
            loading={searchingTaxPayer}
            onSelect={handleRncSelect}
            onInputFocus={() => {
              if (!hasFocusedTaxPayer) {
                setHasFocusedTaxPayer(true);
                fetchTaxPayers(rncIdentification);
              }
            }}
          />
          {!searchingTaxPayer &&
            hasFocusedTaxPayer &&
            rncIdentification.trim().length >= 9 &&
            rncIdentification.trim().length <= 11 &&
            !taxPayerExists && (
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
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

      {/* Agregar productos */}
      <div className="space-y-2">
        <Label htmlFor="productSearch">Productos</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex-1">
            <ProductCombobox
              value={productQuery}
              onChange={handleProductQueryChange}
              isOpen={isProductOpen}
              onOpenChange={setIsProductOpen}
              items={filteredProducts}
              loading={loadingProducts}
              onSelect={handleProductSelect}
            />
          </div>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              clearError("quantity");
            }}
            aria-label="Cantidad"
            className={`${inputBase} ${errors.quantity ? inputError : inputOk} sm:w-24`}
            placeholder="Cant."
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLine}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
        {(errors.product || errors.quantity) && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.product || errors.quantity}
          </p>
        )}
      </div>

      {/* Tabla de líneas */}
      {lines.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Producto</th>
                <th className="px-4 py-2.5 text-right">P. Unitario</th>
                <th className="px-4 py-2.5 text-center">Cantidad</th>
                <th className="px-4 py-2.5 text-right">Subtotal</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lines.map((line) => (
                <tr key={line.productId}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {line.productName}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                    {formatDOP(line.unitPrice)}
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => handleLineQtyChange(line.productId, e.target.value)}
                      aria-label={`Cantidad de ${line.productName}`}
                      className="mx-auto block w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                    {formatDOP(lineSubtotal(line.quantity, line.unitPrice))}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.productId)}
                      title="Quitar línea"
                      aria-label={`Quitar ${line.productName}`}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Agregue productos para calcular el comprobante.
        </div>
      )}
      {errors.lines && (
        <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errors.lines}
        </p>
      )}

      {/* Resumen en vivo (preview — el servidor es la fuente de verdad) */}
      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal:</span>
          <span className="font-medium tabular-nums text-slate-900">
            {formatDOP(totals.base)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            ITBIS ({Math.round(ITBIS_RATE * 100)}%):
          </span>
          <span className="font-medium tabular-nums text-amber-700">
            {formatDOP(totals.itbis)}
          </span>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-slate-900">Total:</span>
            <span className="tabular-nums text-blue-600">{formatDOP(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !taxReceiptTypeId || !rncIdentification.trim() || lines.length === 0}
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
