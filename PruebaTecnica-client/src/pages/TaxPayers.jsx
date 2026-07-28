import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import TaxPayerCard from "../components/TaxPayerCard";
import TaxPayerModal from "../components/TaxPayerModal";
import DeleteTaxPayerModal from "../components/DeleteTaxPayerModal";
import { isAuthenticated } from "../middlewares/Auth";

const TaxPayers = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // Estados principales
  const [taxPayers, setTaxPayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para el modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingTaxPayer, setEditingTaxPayer] = useState(null);

  // Estados para el modal de eliminar
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [taxPayerToDelete, setTaxPayerToDelete] = useState(null);

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Verificar autenticación
  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     navigate("/login");
  //     return;
  //   }
  // }, []);

  // Cargar contribuyentes
  const fetchTaxPayers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/taxpayer", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTaxPayers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar contribuyentes:", err);
      setError(err.message || "Error al cargar los contribuyentes");
      setTaxPayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTaxPayers();
    }
  }, [isAuthenticated, token]);

  // Filtrar contribuyentes
  const filteredTaxPayers = taxPayers.filter((taxPayer) => {
    const matchesSearch =
      taxPayer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxPayer.rncIdentification
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ||
      taxPayer.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Funciones del modal de crear/editar
  const openCreateModal = () => {
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
  };

  const handleSubmit = async (formData) => {
    try {
      setModalLoading(true);
      setError("");

      const isEdit = editingTaxPayer !== null;
      const url = isEdit
        ? `http://localhost:5000/api/taxpayer/${editingTaxPayer.rncIdentification}`
        : "http://localhost:5000/api/taxpayer";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      // Recargar los datos
      await fetchTaxPayers();
      closeModal();
    } catch (err) {
      console.error(
        `Error al ${editingTaxPayer ? "editar" : "crear"} contribuyente:`,
        err
      );
      setError(err.message || "Error al procesar la solicitud");
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

      const response = await fetch(
        `http://localhost:5000/api/taxpayer/${rncIdentification}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      // Recargar los datos
      await fetchTaxPayers();
      closeDeleteModal();
    } catch (err) {
      console.error("Error al eliminar contribuyente:", err);
      setError(err.message || "Error al eliminar el contribuyente");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Función para ver detalles
  const handleView = (taxPayer) => {
    navigate(`/taxpayer/${taxPayer.rncIdentification}`);
  };

  if (!isAuthenticated()) {
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Gestión de Contribuyentes
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra la información de todos los contribuyentes
                registrados
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
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
        <section className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Buscar contribuyente
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Buscar por nombre o RNC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Filtrar por estado
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTaxPayers.length}
              </div>
              <div className="text-sm text-blue-600">
                Contribuyentes encontrados
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredTaxPayers.filter(
                    (tp) => tp.status?.toLowerCase() === "activo"
                  ).length
                }
              </div>
              <div className="text-sm text-green-600">Activos</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {
                  filteredTaxPayers.filter(
                    (tp) =>
                      tp.status?.toLowerCase() === "inactivo" ||
                      tp.status?.toLowerCase() === "suspendido"
                  ).length
                }
              </div>
              <div className="text-sm text-red-600">Inactivos/Suspendidos</div>
            </div>
          </div>
        </section>

        {/* Mensajes de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de contribuyentes */}
        <section className="bg-white shadow rounded-lg">
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
              {filteredTaxPayers.map((taxPayer, index) => (
                <TaxPayerCard
                  key={taxPayer.rncIdentification}
                  taxPayer={taxPayer}
                  index={index}
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

export default TaxPayers;
