# Cafetería: persistencia, caché, debounce y accesibilidad

Proyecto didáctico de JavaScript con módulos ES. Conserva el catálogo, carrito, formularios y validaciones del ejemplo original, y agrega consumo de JSON con Fetch API, almacenamiento local, caché TTL, búsqueda con debounce, tema oscuro y mejoras de accesibilidad.

## Requisitos

- Navegador moderno.
- Node.js y npm únicamente para ejecutar ESLint y Prettier.
- Un servidor HTTP local para abrir la página. Se puede usar Live Server de VS Code.

No abras `index.html` con `file://`: `fetch()` y los módulos ES necesitan servirse mediante HTTP.

## Ejecutar

1. Abre la carpeta `ejemplo-cafeteria` en VS Code.
2. Inicia Live Server desde `index.html`.
3. Abre la consola y Network → Fetch/XHR en DevTools.

## Herramientas de calidad

```bash
npm install
npm run lint
npm run format
npm run format:check
```

## Estructura

```text
index.html
estilos.css
data/productos.json
js/
  api.js          # fetch + caché TTL de productos
  main.js         # estado, eventos y coordinación
  storage.js      # guardar, leer, eliminar y TTL
  ui.js           # renderizado y mensajes
  validators.js   # validaciones puras
```

## Persistencia y caché

Las claves usadas son `cafeteria_tema`, `cafeteria_favoritos`, `cafeteria_carrito` y `cache:./data/productos.json`. El caché de productos dura cinco minutos. El carrito y los favoritos guardan únicamente identificadores y cantidades, no copias completas de los productos.

El producto agregado manualmente desde el formulario solo vive en memoria: el archivo JSON es estático y `fetch()` no permite modificarlo. Para persistir altas, ediciones y eliminaciones se necesitaría un backend/API con endpoints de escritura.

## Seguridad y privacidad

No guardes contraseñas, tokens sensibles ni datos bancarios en `localStorage`. Cualquier JavaScript ejecutado en el mismo origen puede leerlo. El almacenamiento del navegador tampoco sustituye una base de datos.

## Nota sobre caché

El caché implementado es una estrategia didáctica en `localStorage`, con expiración propia (TTL). No es la HTTP Cache API ni un Service Worker. La clave se deriva de la URL del recurso. En esta aplicación el JSON es estático, por lo que el TTL sirve para observar cuándo se vuelve a solicitar el archivo.
