# DGII Tax Management System - Client

Sistema de gestión de contribuyentes y comprobantes fiscales para la Dirección General de Impuestos Internos (DGII).

## 🚀 Características

- ✅ Gestión de Contribuyentes
- ✅ Gestión de Tipos de Contribuyentes  
- ✅ Gestión de Comprobantes Fiscales
- ✅ Búsqueda y filtrado avanzado
- ✅ Autenticación y autorización
- ✅ Interfaz moderna con shadcn/ui
- ✅ Diseño responsive

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Backend API corriendo

## 🛠️ Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/engelsgermosen/PruebaTecnica-client.git
cd PruebaTecnica-client
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus valores:
```env
VITE_BACKEND_URL=https://localhost:7129/api/v1
VITE_APP_NAME="DGII Tax Management"
VITE_API_TIMEOUT=10000
VITE_ENABLE_LOGGING=true
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Build para Producción
```bash
npm run build
```

### Preview de Producción
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── api/              # Cliente Axios configurado
│   └── axiosClient.js
├── assets/           # Imágenes, iconos, etc.
├── components/       # Componentes React reutilizables
│   └── ui/          # Componentes shadcn/ui
├── constants/        # Constantes de la aplicación
│   └── index.js     # API_CONFIG, HTTP_STATUS, STORAGE_KEYS, ROUTES
├── contexts/         # React Context
│   └── AuthContext.jsx
├── hooks/           # Custom hooks
│   ├── useApi.js    # Hook para llamadas API con manejo de errores
│   ├── useDebounce.js
│   └── useTaxReceipts.js
├── layout/          # Componentes de layout
│   └── MainLayout.jsx
├── lib/             # Utilidades
│   └── utils.js
├── middlewares/     # Middlewares de autenticación
│   └── Auth.js
├── pages/           # Páginas de la aplicación
│   ├── auth/       # Páginas protegidas
│   │   ├── TaxPayer.jsx
│   │   ├── TaxPayerType.jsx
│   │   └── TaxReceipt.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── NotFound.jsx
│   ├── TaxPayer.jsx
│   └── TaxPayers.jsx
└── utils/           # Funciones utilitarias
    ├── errorHandler.js  # Manejo centralizado de errores
    └── logger.js        # Sistema de logging condicional
```

## 🎨 Tecnologías

- **React 19** - Framework UI
- **React Router v7** - Navegación
- **Vite** - Build tool y dev server
- **Tailwind CSS v4** - Estilos utility-first
- **shadcn/ui** - Componentes UI accesibles
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## 🔑 Autenticación

El sistema usa JWT tokens almacenados en `sessionStorage`:
- Token de acceso con expiración automática
- Redirección automática al login cuando expira la sesión
- Interceptor de Axios para adjuntar tokens a todas las peticiones

## 📝 Guía de Uso

### Logger (Sistema de Logging)
Reemplaza todos los `console.log` por el logger. Solo muestra logs en desarrollo:

```javascript
import logger from '@/utils/logger';

// En desarrollo: muestra en consola
// En producción: no hace nada
logger.log('Información general');
logger.error('Error crítico');
logger.warn('Advertencia');
logger.info('Información');
logger.debug('Debug detallado');
```

### useApi Hook (Llamadas API)
Hook personalizado para llamadas API con manejo automático de errores:

```javascript
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { loading, error, get, post, put, delete: del } = useApi();

  const fetchData = async () => {
    const { data, error } = await get('/taxpayers');
    if (data) {
      // Maneja los datos
    }
  };

  const createData = async (newData) => {
    const { data, error } = await post('/taxpayers', newData);
  };

  return loading ? <LoadingSpinner /> : <div>...</div>;
}
```

### useDebounce Hook (Búsquedas)
Hook para debouncing en búsquedas en tiempo real:

```javascript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Esta búsqueda solo se ejecuta 500ms después de que el usuario deje de escribir
    if (debouncedSearch) {
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

### Constantes
Usa constantes en lugar de valores hardcodeados:

```javascript
import { HTTP_STATUS, STORAGE_KEYS, ROUTES } from '@/constants';

// En lugar de: if (response.status === 401)
if (response.status === HTTP_STATUS.UNAUTHORIZED) {
  // ...
}

// En lugar de: sessionStorage.getItem('token')
const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);

// En lugar de: navigate('/auth/taxpayers')
navigate(ROUTES.TAXPAYERS);
```

## 🐛 Troubleshooting

### Error de conexión con el backend
- Verificar que el backend esté corriendo
- Revisar la URL en `.env`
- Verificar certificados SSL si usa HTTPS

### Errores de autenticación
```javascript
// Limpiar sesión manualmente
sessionStorage.clear();
```

### Errores de build
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## ✨ Mejoras Implementadas

### 🔒 Seguridad
- ✅ Variables de entorno protegidas (`.env` en `.gitignore`)
- ✅ Manejo seguro de tokens JWT
- ✅ Interceptores de Axios para autenticación automática
- ✅ Timeout configurable en peticiones API

### 📊 Calidad del Código
- ✅ Sistema de logging condicional (solo desarrollo)
- ✅ Manejo centralizado de errores
- ✅ Custom hooks reutilizables
- ✅ Constantes centralizadas
- ✅ Código más mantenible y profesional

### ⚡ Performance
- ✅ Debouncing en búsquedas
- ✅ Timeout en peticiones API
- ✅ Optimización de renders

### 🎨 UX/UI
- ✅ Feedback de loading automático
- ✅ Mensajes de error claros y en español
- ✅ Estados vacíos consistentes

## 📚 Convenciones de Código

- ✅ Componentes en PascalCase (`TaxPayerCard.jsx`)
- ✅ Utilidades en camelCase (`errorHandler.js`)
- ✅ Usar custom hooks para lógica reutilizable
- ✅ Importar constantes desde `@/constants`
- ✅ Usar logger en lugar de console.log
- ✅ Extraer lógica de negocio de componentes UI

## 👥 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial - DGII

## 📞 Contacto

**DGII** - Dirección General de Impuestos Internos  
República Dominicana

---

Desarrollado con ❤️ para la DGII
