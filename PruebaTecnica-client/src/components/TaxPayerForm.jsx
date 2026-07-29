import { useState, useEffect, } from "react";
import { AlertCircle, Info } from "lucide-react";
import useApi from "@/lib/axiosClient";

const inputBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
const inputNormal =
  "border-slate-300 focus:border-blue-500 focus:ring-blue-500/30";
const inputError =
  "border-red-400 focus:border-red-500 focus:ring-red-500/30";

const TaxPayerForm = ({
  taxPayer,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  initialRnc = "",
}) => {
  const [formData, setFormData] = useState({
    rncIdentification: taxPayer?.rncIdentification || initialRnc || "",
    name: taxPayer?.name || "",
    status: taxPayer?.status !== undefined ? String(taxPayer.status) : "",
    taxPayerTypeId: taxPayer?.taxPayerTypeId || "",
  });
  const [errors, setErrors] = useState({});
  const [taxPayerTypes, setTaxPayerTypes] = useState([]);
  const api = useApi();

  // Actualizar formData cuando cambie taxPayer (modo edición)
  useEffect(() => {
    if (taxPayer) {
      setFormData({
        rncIdentification: taxPayer.rncIdentification || "",
        name: taxPayer.name || "",
        status: taxPayer.status !== undefined ? String(taxPayer.status) : "",
        taxPayerTypeId: taxPayer.taxPayerTypeId || "",
      });
    } else if (initialRnc) {
      setFormData((prev) => ({
        ...prev,
        rncIdentification: initialRnc,
      }));
    }
  }, [taxPayer, initialRnc]);

  useEffect(() => {
    const fetchTaxPayerTypes = async () => {
      try {
        const response = await api.get("/taxpayertypes");
        if(response.status == 200 || response.status == 204){

          setTaxPayerTypes(response.data || []);
        }else{
          console.error("Failed to fetch taxpayer types:", response);
        }
      } catch (error) {
        console.error("Error fetching taxpayer types:", error);
      }
    };

    fetchTaxPayerTypes();
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    // For RNC/Cédula enforce only digits and length (9-11)
    if (name === "rncIdentification") {
      // Remove non-digits
      nextValue = value.replace(/\D/g, "").slice(0, 11);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rncIdentification.trim()) {
      newErrors.rncIdentification = "El RNC o Cedula es requerido";
    } else if (formData.rncIdentification.trim().length < 9) {
      newErrors.rncIdentification = "El RNC/Cédula debe tener mínimo 9 dígitos";
    } else if (formData.rncIdentification.trim().length > 11) {
      newErrors.rncIdentification = "El RNC/Cédula debe tener máximo 11 dígitos";
    }

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.status) {
      newErrors.status = "El estado es requerido";
    }

    if (!formData.taxPayerTypeId) {
      newErrors.taxPayerTypeId = "El tipo es requerido";
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
      name: formData.name.trim(),
      status: formData.status === "true",
      taxPayerTypeId: parseInt(formData.taxPayerTypeId, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label
          htmlFor="rncIdentification"
          className="block text-sm font-medium text-slate-700"
        >
          RNC/Identificación
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="rncIdentification"
          name="rncIdentification"
          value={formData.rncIdentification}
          onChange={handleChange}
          disabled={isEditing}
          inputMode="numeric"
          minLength={9}
          maxLength={11}
          aria-invalid={Boolean(errors.rncIdentification)}
          className={`${inputBase} ${
            errors.rncIdentification ? inputError : inputNormal
          }`}
          placeholder="Ingrese el RNC o Cédula (9-11 dígitos)"
        />
        {errors.rncIdentification && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4" />
            {errors.rncIdentification}
          </p>
        )}
        {isEditing && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Info className="h-4 w-4" />
            El RNC o Cedula no puede ser modificado
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700"
        >
          Nombre del Contribuyente
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
          placeholder="Ingrese el nombre del contribuyente"
          disabled={loading}
        />
        {errors.name && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4" />
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-slate-700"
        >
          Estado
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`${inputBase} ${errors.status ? inputError : inputNormal}`}
          disabled={loading}
        >
          <option value="">Seleccione un estado</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        {errors.status && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4" />
            {errors.status}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="type"
          className="block text-sm font-medium text-slate-700"
        >
          Tipo de Contribuyente
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="type"
          name="taxPayerTypeId"
          value={formData.taxPayerTypeId}
          onChange={handleChange}
          className={`${inputBase} ${
            errors.taxPayerTypeId ? inputError : inputNormal
          }`}
          disabled={loading}
        >
          <option value="">Seleccione un tipo</option>
          {taxPayerTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {errors.taxPayerTypeId && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600" role="alert">
            <AlertCircle className="h-4 w-4" />
            {errors.taxPayerTypeId}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:pointer-events-none disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            !formData.rncIdentification.trim() ||
            !formData.name.trim() ||
            !formData.status ||
            !formData.taxPayerTypeId
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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

export default TaxPayerForm;
