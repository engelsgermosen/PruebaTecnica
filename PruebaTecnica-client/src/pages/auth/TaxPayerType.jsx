import { useState, useEffect, useContext } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import TaxPayerTypeCard from "../../components/TaxPayerTypeCard";
import TaxPayerTypeModal from "../../components/TaxPayerTypeModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../middlewares/Auth";
import PageHeader from "../../components/PageHeader";
import { toast } from "sonner";
import { useApi } from "../../lib/axiosClient";

const TaxPayerType = () => {
  // Estados principales
  const [taxPayerTypes, setTaxPayerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTaxPayerType, setSelectedTaxPayerType] = useState(null);

  // Estados para operaciones CRUD
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const api = useApi();

  // Cargar tipos de contribuyente
  const fetchTaxPayerTypes = async () => {
    try {
      if (!token) return;
      setLoading(true);
      setError("");

      const response = await api.get("/taxpayertypes");

      if (response.status === 204) {
        setTaxPayerTypes([]);
        return;
      }

      setTaxPayerTypes(response.data);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Error al cargar los tipos de contribuyente. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // Crear tipo de contribuyente
  const handleCreate = async (formData) => {
    try {
      setCreating(true);
      setError("");

      const response = await api.post( `/taxpayertypes`, formData,
      );


      if (response.status !== 201) {
        setError(response.data.detail || "Error al crear el tipo de contribuyente");
        setShowCreateModal(false);
        return;
      }

      setShowCreateModal(false);
      fetchTaxPayerTypes();
      toast.success("Tipo de contribuyente creado exitosamente");
    } catch (error) {
      setError(error.response?.data?.detail || "Error al crear el tipo de contribuyente");
    } finally {
      setCreating(false);
      setShowCreateModal(false);
    }
  };

  // Actualizar tipo de contribuyente
  const handleUpdate = async (formData) => {
    try {
      setUpdating(true);
      setError("");

      const response = await api.put(
        `/taxpayertypes/${selectedTaxPayerType.id}`,{ id: selectedTaxPayerType.id, ...formData },
      );

      if (!response.status === 200) {
        setError(response.data.detail);
        setShowEditModal(false);
        return;
      }

      const updatedTaxPayerType = response.data;
      setTaxPayerTypes((prev) =>
        prev.map((type) =>
          type.id === selectedTaxPayerType.id ? updatedTaxPayerType : type
        )
      );
      setShowEditModal(false);
      setSelectedTaxPayerType(null);
      toast.success("Tipo de contribuyente actualizado exitosamente");
    } catch (error) {
      setError(error.response?.data?.detail || "Error al actualizar el tipo de contribuyente");
    } finally {
      setUpdating(false);
      setShowEditModal(false);
      setSelectedTaxPayerType(null);
    }
  };

  // Eliminar tipo de contribuyente
  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      const response = await api.delete(
        `/taxpayertypes/${selectedTaxPayerType.id}`,
      );

      if (response.status !== 204 && response.status !== 200) {
        
        setError(
          response?.data?.detail || "Error al eliminar el tipo de contribuyente"
        );
        return;
      }
      setTaxPayerTypes((prev) =>
        prev.filter((type) => type.id !== selectedTaxPayerType.id)
      );
      setShowDeleteModal(false);
      setSelectedTaxPayerType(null);
      toast.success("Tipo de contribuyente eliminado exitosamente");
    } catch (error) {
      setError(error.response?.data?.detail || "Error al eliminar el tipo de contribuyente");
    } finally {
      setDeleting(false);
    }
  };

  // Handlers para modales
  const handleEdit = (taxPayerType) => {
    setSelectedTaxPayerType(taxPayerType);
    setShowEditModal(true);
  };

  const handleDeleteClick = (taxPayerType) => {
    setSelectedTaxPayerType(taxPayerType);
    setShowDeleteModal(true);
  };

  const handleRefresh = () => {
    fetchTaxPayerTypes();
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedTaxPayerType(null);
    setError("");
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (token) {
      fetchTaxPayerTypes();
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen flex-1 bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Tipos de Contribuyente"
          description="Gestión de tipos de contribuyente en el sistema"
          onRefresh={handleRefresh}
        />

        {/* Botón crear se moverá al header de la card */}
        <div className="mb-6" />

        {/* Contenido principal */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error && <ErrorAlert message={error} />}

          {loading ? (
            <LoadingSpinner message="Cargando tipos de contribuyente..." />
          ) : taxPayerTypes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-6">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lista de Tipos de Contribuyente
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total: {taxPayerTypes.length} tipos de contribuyente
                  </p>
                </div>
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                  <svg
                    className="w-4 h-4 mr-2"
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
                  Crear Nuevo Tipo
                </button>
              </header>

              <div className="grid gap-4">
                {taxPayerTypes.map((taxPayerType) => (
                  <TaxPayerTypeCard
                    key={taxPayerType.id}
                    taxPayerType={taxPayerType}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    deleting={
                      deleting && selectedTaxPayerType?.id === taxPayerType.id
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer con estadísticas */}
        {!loading && taxPayerTypes.length > 0 && (
          <footer className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total de tipos:{" "}
                <span className="font-medium text-gray-900">
                  {taxPayerTypes.length}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Última actualización:{" "}
                <time className="font-medium text-gray-900">
                  {new Date().toLocaleDateString()}
                </time>
              </div>
            </div>
          </footer>
        )}
      </div>

      <TaxPayerTypeModal
        isOpen={showCreateModal}
        taxPayerType={null}
        onSubmit={handleCreate}
        onCancel={closeModals}
        isEditing={false}
        loading={creating}
      />

      <TaxPayerTypeModal
        isOpen={showEditModal}
        taxPayerType={selectedTaxPayerType}
        onSubmit={handleUpdate}
        onCancel={closeModals}
        isEditing={true}
        loading={updating}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        taxPayerType={selectedTaxPayerType}
        onConfirm={handleDelete}
        onCancel={closeModals}
        deleting={deleting}
      />
    </div>
  );
};

export default TaxPayerType;
