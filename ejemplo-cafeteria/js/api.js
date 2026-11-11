// API: concentra las peticiones HTTP. En este ejemplo la fuente es un JSON estático.
import { guardarConTTL, leerConTTL } from "./storage.js";

const URL_PRODUCTOS = "./data/productos.json";
const TTL_PRODUCTOS = 5 * 60 * 1000; // 5 minutos

export async function obtenerProductos() {
  // La URL completa identifica el recurso que se está almacenando en caché.
  const cacheKey = `cache:${URL_PRODUCTOS}`;
  const productosEnCache = leerConTTL(cacheKey);

  if (productosEnCache !== null) {
    console.info("Productos obtenidos desde caché.");
    return productosEnCache;
  }

  console.info("Solicitando productos mediante fetch...");
  const respuesta = await fetch(URL_PRODUCTOS);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}: no fue posible cargar los productos.`);
  }

  const productos = await respuesta.json();

  if (!Array.isArray(productos)) {
    throw new TypeError("El archivo de productos debe contener un arreglo JSON.");
  }

  guardarConTTL(cacheKey, productos, TTL_PRODUCTOS);
  return productos;
}
