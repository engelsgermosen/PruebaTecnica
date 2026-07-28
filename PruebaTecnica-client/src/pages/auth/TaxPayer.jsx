import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import TaxPayerCard from "../../components/TaxPayerCard";
import TaxPayerModal from "../../components/TaxPayerModal";
import DeleteTaxPayerModal from "../../components/DeleteTaxPayerModal";
import { isAuthenticated } from "../../middlewares/Auth";
import { toast } from "sonner";
import useApi from "@/lib/axiosClient";

const TaxPayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AuthContext);

  // Estados principales
  const [taxPayers, setTaxPayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const api = useApi();

  // Estados para el modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingTaxPayer, setEditingTaxPayer] = useState(null);
  const [prefillRnc, setPrefillRnc] = useState("");

  // Estados para el modal de eliminar
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [taxPayerToDelete, setTaxPayerToDelete] = useState(null);

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); // "todos", "true", "false"

  // Cargar contribuyentes
  const fetchTaxPayers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/taxpayers`,);

      if (response.status !== 200 && response.status !== 204) {
        setError(response.data?.detail || "Error al cargar los contribuyentes");
        setTaxPayers([]);
        return;
      }

      if (response.status === 204) {
        setTaxPayers([]);
        return;
      }

      setTaxPayers(Array.isArray(response.data.items) ? response.data.items : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al cargar los contribuyentes");
      setTaxPayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchTaxPayers();
    }
  }, [token, fetchTaxPayers]);

  // Detectar query params para apertura modal creación con RNC prellenado
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const create = params.get("create");
    const rnc = params.get("rnc");
    if (create === "1" && rnc) {
      setPrefillRnc(rnc);
      setEditingTaxPayer(null);
      setIsModalOpen(true);
    }
  }, [location.search]);

  // Filtrar contribuyentes
  const filteredTaxPayers = taxPayers.filter((taxPayer) => {
    const matchesSearch =
      taxPayer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxPayer.rncIdentification
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "true" && taxPayer.status === true) ||
      (statusFilter === "false" && taxPayer.status === false);

    return matchesSearch && matchesStatus;
  });

  // Funciones del modal de crear/editar
  const openCreateModal = () => {
    setPrefillRnc("");
    setEditingTaxPayer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (taxPayer) => {
    setEditingTaxPayer(taxPayer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaxPayer(null);
    setModalLoading(false);
    window.history.replaceState({}, "", location.pathname);
  };

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      setError("");

      const isEdit = editingTaxPayer !== null;
      const url = isEdit? `/taxpayers/${editingTaxPayer.rncIdentification}` : `/taxpayers`;

      const dataToSend = {
        rncIdentification: formData.rncIdentification,
        name: formData.name,
        status: formData.status,
        taxPayerTypeId: parseInt(formData.taxPayerTypeId, 10),
      };

      const response = await (isEdit ? api.put(url, dataToSend) : api.post(url, dataToSend));

      if (response.status !== 200 && response.status !== 201) {
        setError(response.data?.detail || "Error processing request");
        setIsModalOpen(false);
        return;
      }

      // Recargar los datos
      await fetchTaxPayers();
      closeModal();
      toast.success(`Contribuyente ${
        editingTaxPayer ? "editado" : "creado"
      } exitosamente`);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al procesar la solicitud");
    } finally {
      setModalLoading(false);
    }
  };

  // Funciones del modal de eliminar
  const openDeleteModal = (taxPayer) => {
    setTaxPayerToDelete(taxPayer);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaxPayerToDelete(null);
    setDeleteLoading(false);
  };

  const handleDelete = async (rncIdentification) => {
    try {
      setDeleteLoading(true);
      setError("");

      const response = await api.delete(`/taxpayers/${rncIdentification}`);

      if (response.status !== 204) {
        setError(response.data?.detail || `Error al eliminar contribuyente`);
      }

      // Recargar los datos
      await fetchTaxPayers();
      closeDeleteModal();
      toast.success("Contribuyente eliminado exitosamente");
    } catch (err) {
      setError(err.response.data.detail || "Error al eliminar el contribuyente");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Función para ver detalles
  const handleView = (taxPayer) => {
    navigate(`/taxpayer/${taxPayer.rncIdentification}`);
  };

  if (!isAuthenticated) {
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 bg-linear-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-xl border border-blue-100 p-8">
          <div className="md:flex md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
                  Gestión de Contribuyentes
                </h1>
              </div>
              <p className="text-gray-600 text-lg ml-14">
                Administra la información de todos los contribuyentes registrados
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <svg
                  className="mr-2 h-4 w-4"
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
                Nuevo Contribuyente
              </button>
            </div>
          </div>
        </header>

        {/* Filtros y búsqueda */}
        <section className="mb-6 bg-linear-to-br from-white via-blue-50/20 to-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Búsqueda */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                🔍 Buscar contribuyente
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="search"
                  placeholder="Buscar por nombre o RNC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full text-gray-900 pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-6 w-6 text-blue-500 group-focus-within:text-blue-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label
                htmlFor="statusFilter"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                📦 Filtrar por estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-4 py-3 border-2 text-gray-900 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md font-medium bg-white"
              >
                <option value="todos">📊 Todos los estados</option>
                <option value="true">✅ Activo</option>
                <option value="false">❌ Inactivo</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">
                    {filteredTaxPayers.length}
                  </div>
                  <div className="text-sm text-blue-100 font-medium mt-1">
                    Total encontrados
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">
                    {filteredTaxPayers.filter((tp) => tp.status === true).length}
                  </div>
                  <div className="text-sm text-green-100 font-medium mt-1">✅ Activos</div>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-linear-to-br from-red-500 to-rose-600 rounded-xl p-5 shadow-lg transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">
                    {filteredTaxPayers.filter((tp) => tp.status === false).length}
                  </div>
                  <div className="text-sm text-red-100 font-medium mt-1">❌ Inactivos</div>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mensajes de error */}
        {error && (
          <div className="mb-6 bg-linear-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 shadow-lg animate-slideInDown">
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2 bg-red-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-red-600"
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
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900 mb-1">⚠️ Error</h3>
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de contribuyentes */}
        <section className="shadow rounded-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
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
                Cargando contribuyentes...
              </div>
            </div>
          ) : filteredTaxPayers.length === 0 ? (
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay contribuyentes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== "todos"
                  ? "No se encontraron contribuyentes con los filtros aplicados."
                  : "Comienza creando un nuevo contribuyente."}
              </p>
              {!searchTerm && statusFilter === "todos" && (
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
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
                    Nuevo Contribuyente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTaxPayers.map((taxPayer) => (
                <TaxPayerCard
                  key={taxPayer.rncIdentification}
                  taxPayer={taxPayer}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onView={handleView}
                  showActions={true}
                  deleting={
                    deleteLoading &&
                    taxPayerToDelete?.rncIdentification ===
                      taxPayer.rncIdentification
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Modal de crear/editar */}
        <TaxPayerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          taxPayer={editingTaxPayer}
          loading={modalLoading}
          prefillRnc={prefillRnc}
        />

        {/* Modal de eliminar */}
        <DeleteTaxPayerModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          taxPayer={taxPayerToDelete}
          loading={deleteLoading}
        />
      </div>
    </div>
  );
};

export default TaxPayer;
