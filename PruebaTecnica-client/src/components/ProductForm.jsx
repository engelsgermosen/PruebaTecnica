import { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const inputOk = "border-slate-300 focus:border-blue-500 focus:ring-blue-500/30";
const inputError = "border-red-400 focus:border-red-500 focus:ring-red-500/30";

const ProductForm = ({
  product,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  apiError = "", // error de negocio del servidor sobre el nombre (ej. 409 duplicado)
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    unitPrice:
      product?.unitPrice !== undefined && product?.unitPrice !== null
        ? String(product.unitPrice)
        : "",
    isActive: product?.isActive !== undefined ? String(product.isActive) : "true",
  });
  const [errors, setErrors] = useState({});

  // Reflejar el error del servidor (ej. nombre duplicado) en el campo nombre.
  useEffect(() => {
    if (apiError) {
      setErrors((prev) => ({ ...prev, name: apiError }));
    }
  }, [apiError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    const price = parseFloat(formData.unitPrice);
    if (!String(formData.unitPrice).trim()) {
      newErrors.unitPrice = "El precio unitario es requerido";
    } else if (isNaN(price) || price <= 0) {
      newErrors.unitPrice = "El precio debe ser un número mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      unitPrice: parseFloat(formData.unitPrice),
      isActive: formData.isActive === "true",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          aria-invalid={Boolean(errors.name)}
          className={`${inputBase} ${errors.name ? inputError : inputOk}`}
          placeholder="Ingrese el nombre del producto"
        />
        {errors.name && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          className={`${inputBase} ${inputOk} resize-none`}
          placeholder="Descripción del producto (opcional)"
        />
      </div>

      {/* Precio unitario */}
      <div>
        <label htmlFor="unitPrice" className="mb-2 block text-sm font-medium text-slate-700">
          Precio unitario (RD$) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="unitPrice"
          name="unitPrice"
          step="any"
          min="0.01"
          value={formData.unitPrice}
          onChange={handleChange}
          disabled={loading}
          aria-invalid={Boolean(errors.unitPrice)}
          className={`${inputBase} ${errors.unitPrice ? inputError : inputOk}`}
          placeholder="0.00"
        />
        {errors.unitPrice && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errors.unitPrice}
          </p>
        )}
      </div>

      {/* Estado */}
      <div>
        <label htmlFor="isActive" className="mb-2 block text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          id="isActive"
          name="isActive"
          value={formData.isActive}
          onChange={handleChange}
          disabled={loading}
          className={`${inputBase} ${inputOk}`}
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !formData.name.trim() || !String(formData.unitPrice).trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Actualizando..." : "Creando..."}
            </>
          ) : isEditing ? (
            "Actualizar"
          ) : (
            "Crear"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
