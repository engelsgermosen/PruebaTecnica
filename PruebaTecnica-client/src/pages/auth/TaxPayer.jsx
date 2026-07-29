import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import TaxPayerCard from "../../components/TaxPayerCard";
import TaxPayerModal from "../../components/TaxPayerModal";
import DeleteTaxPayerModal from "../../components/DeleteTaxPayerModal";
import { toast } from "sonner";
import useApi from "@/lib/axiosClient";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

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

  return (
    <div className="min-h-screen flex-1 bg-slate-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="md:flex md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Gestión de Contribuyentes
                </h1>
              </div>
              <p className="mt-2 text-sm text-slate-500 md:ml-[3.25rem]">
                Administra la información de todos los contribuyentes registrados
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Nuevo Contribuyente
              </button>
            </div>
          </div>
        </header>

        {/* Filtros y búsqueda */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Búsqueda */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-slate-700"
              >
                Buscar contribuyente
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  id="search"
                  placeholder="Buscar por nombre o RNC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label
                htmlFor="statusFilter"
                className="block text-sm font-medium text-slate-700"
              >
                Filtrar por estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="todos">Todos los estados</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total encontrados
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-blue-600">
                    {filteredTaxPayers.length}
                  </p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Activos</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-600">
                    {filteredTaxPayers.filter((tp) => tp.status === true).length}
                  </p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Inactivos</p>
                  <p className="mt-1 text-2xl font-semibold text-red-600">
                    {filteredTaxPayers.filter((tp) => tp.status === false).length}
                  </p>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Mensajes de error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <div className="mt-0.5 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de contribuyentes */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Cargando contribuyentes...
              </p>
            </div>
          ) : filteredTaxPayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No hay contribuyentes
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm || statusFilter !== "todos"
                  ? "No se encontraron contribuyentes con los filtros aplicados."
                  : "Comienza creando un nuevo contribuyente."}
              </p>
              {!searchTerm && statusFilter === "todos" && (
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98]"
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Contribuyente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
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
