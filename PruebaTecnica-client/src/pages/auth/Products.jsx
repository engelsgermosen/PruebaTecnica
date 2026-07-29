import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { Plus, Search, Package, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { AuthContext } from "../../contexts/AuthContext";
import { useApi } from "../../lib/axiosClient";
import { useDebounce } from "../../hooks/useDebounce";
import PageHeader from "../../components/PageHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import ProductTable from "../../components/ProductTable";
import ProductModal from "../../components/ProductModal";
import DeactivateProductModal from "../../components/DeactivateProductModal";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 10;

const Products = () => {
  const { token } = useContext(AuthContext);
  const api = useApi();

  // Datos (se carga el catálogo completo y se filtra/pagina en el cliente,
  // porque el API solo filtra por isActive y no por nombre).
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros y paginación (cliente)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); // todos | true | false
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modales / CRUD
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState(""); // error de campo (ej. 409 nombre)

  const fetchProducts = useCallback(async () => {
    try {
      if (!token) return;
      setLoading(true);
      setError("");

      const response = await api.get("/products?page=1&pageSize=1000");

      if (response.status === 204) {
        setProducts([]);
        return;
      }

      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : Array.isArray(response.data)
        ? response.data
        : [];
      setProducts(items);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Error al cargar los productos. Por favor, inténtalo de nuevo."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [api, token]);

  useEffect(() => {
    if (token) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Reiniciar a la primera página cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // Filtrado (nombre + estado) en cliente
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesName = !term || p.name?.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "true" && p.isActive === true) ||
        (statusFilter === "false" && p.isActive === false);
      return matchesName && matchesStatus;
    });
  }, [products, debouncedSearch, statusFilter]);

  // Paginación en cliente
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );
  const meta = { currentPage, totalPages, totalItems, pageSize: PAGE_SIZE };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- CRUD ----
  const handleCreate = async (formData) => {
    try {
      setCreating(true);
      setApiError("");
      const response = await api.post("/products", formData);
      if (response.status !== 201 && response.status !== 200) {
        setError(response.data?.detail || "Error al crear el producto");
        return;
      }
      closeModals();
      await fetchProducts();
      toast.success("Producto creado exitosamente");
    } catch (err) {
      if (err.response?.status === 409) {
        setApiError("Ya existe un producto con ese nombre");
      } else {
        toast.error(err.response?.data?.detail || "Error al crear el producto");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setUpdating(true);
      setApiError("");
      const response = await api.put(`/products/${selectedProduct.id}`, {
        id: selectedProduct.id,
        ...formData,
      });
      if (response.status !== 200 && response.status !== 204) {
        setError(response.data?.detail || "Error al actualizar el producto");
        return;
      }
      closeModals();
      await fetchProducts();
      toast.success("Producto actualizado exitosamente");
    } catch (err) {
      if (err.response?.status === 409) {
        setApiError("Ya existe un producto con ese nombre");
      } else {
        toast.error(err.response?.data?.detail || "Error al actualizar el producto");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setDeleting(true);
      const response = await api.delete(`/products/${selectedProduct.id}`);
      if (response.status !== 204 && response.status !== 200) {
        toast.error(response.data?.detail || "Error al desactivar el producto");
        return;
      }
      closeModals();
      await fetchProducts();
      toast.success("Producto desactivado exitosamente");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al desactivar el producto");
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setApiError("");
    setSelectedProduct(null);
    setShowCreateModal(true);
  };
  const openEdit = (product) => {
    setApiError("");
    setSelectedProduct(product);
    setShowEditModal(true);
  };
  const openDeactivate = (product) => {
    setSelectedProduct(product);
    setShowDeactivateModal(true);
  };
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeactivateModal(false);
    setSelectedProduct(null);
    setApiError("");
  };

  return (
    <div className="min-h-screen flex-1 bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Productos"
          description="Gestión del catálogo de productos"
          onRefresh={fetchProducts}
        />

        {/* Filtros */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="product-search" className="mb-2 block text-sm font-medium text-slate-700">
                Buscar producto
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  id="product-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-11 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
            <div>
              <label htmlFor="product-status" className="mb-2 block text-sm font-medium text-slate-700">
                Filtrar por estado
              </label>
              <select
                id="product-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="todos">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>
        </section>

        {error && <ErrorAlert message={error} />}

        {/* Tabla */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Catálogo de Productos</h2>
                <p className="mt-1 text-sm text-slate-500">Total: {totalItems} productos</p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[.98]"
            >
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </button>
          </header>

          {loading ? (
            <LoadingSpinner message="Cargando productos..." />
          ) : totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <PackageSearch className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {debouncedSearch || statusFilter !== "todos"
                  ? "No se encontraron productos"
                  : "No hay productos"}
              </h3>
              <p className="mt-1 max-w-md text-center text-sm text-slate-500">
                {debouncedSearch || statusFilter !== "todos"
                  ? "Intenta con otros términos de búsqueda o cambia el filtro de estado."
                  : "Comienza creando un nuevo producto en el catálogo."}
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <ProductTable
                products={pageItems}
                onEdit={openEdit}
                onDeactivate={openDeactivate}
                deletingId={deleting ? selectedProduct?.id : null}
              />
              <Pagination meta={meta} onPageChange={handlePageChange} />
            </div>
          )}
        </section>
      </div>

      <ProductModal
        isOpen={showCreateModal}
        product={null}
        onSubmit={handleCreate}
        onCancel={closeModals}
        isEditing={false}
        loading={creating}
        apiError={apiError}
      />

      <ProductModal
        isOpen={showEditModal}
        product={selectedProduct}
        onSubmit={handleUpdate}
        onCancel={closeModals}
        isEditing={true}
        loading={updating}
        apiError={apiError}
      />

      <DeactivateProductModal
        isOpen={showDeactivateModal}
        product={selectedProduct}
        onConfirm={handleDeactivate}
        onCancel={closeModals}
        deleting={deleting}
      />
    </div>
  );
};

export default Products;
