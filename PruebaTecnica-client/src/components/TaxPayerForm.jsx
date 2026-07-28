import { useState, useEffect, } from "react";
import useApi from "@/lib/axiosClient";

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
      <div className="space-y-2">
        <label
          htmlFor="rncIdentification"
          className="block text-sm font-semibold text-gray-900"
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
          className={`block w-full text-gray-900 px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 transition-all duration-200 ${
            errors.rncIdentification
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50"
              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
          } ${isEditing ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:border-blue-300"}`}
          placeholder="Ingrese el RNC o Cédula (9-11 dígitos)"
        />
        {errors.rncIdentification && (
          <p className="flex items-center gap-2 text-sm text-red-600 font-medium" role="alert">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.rncIdentification}
          </p>
        )}
        {isEditing && (
          <p className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            El RNC o Cedula no puede ser modificado
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-900"
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
          className={`block w-full px-4 py-3 text-gray-900 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 transition-all duration-200 ${
            errors.name ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
          }`}
          placeholder="Ingrese el nombre del contribuyente"
          disabled={loading}
        />
        {errors.name && (
          <p className="flex items-center gap-2 text-sm text-red-600 font-medium" role="alert">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="status"
          className="block text-sm font-semibold text-gray-900"
        >
          Estado
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={`block w-full px-4 py-3 text-gray-900 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 transition-all duration-200 ${
            errors.status ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50" : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
          }`}
          disabled={loading}
        >
          <option value="">Seleccione un estado</option>
          <option value="true">✅ Activo</option>
          <option value="false">❌ Inactivo</option>
        </select>
        {errors.status && (
          <p className="flex items-center gap-2 text-sm text-red-600 font-medium" role="alert">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.status}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="type"
          className="block text-sm font-semibold text-gray-900"
        >
          Tipo de Contribuyente
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="type"
          name="taxPayerTypeId"
          value={formData.taxPayerTypeId}
          onChange={handleChange}
          className={`block w-full px-4 text-gray-900 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-4 transition-all duration-200 ${
            errors.taxPayerTypeId
              ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50"
              : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300"
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
          <p className="flex items-center gap-2 text-sm text-red-600 font-medium" role="alert">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.taxPayerTypeId}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
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
          className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEditing ? "Actualizando..." : "Creando..."}
            </div>
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
