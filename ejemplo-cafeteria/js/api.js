// API: centraliza las peticiones HTTP.
export async function obtenerProductos() {
  const respuesta = await fetch("./data/productos.json");

  // Verificar que la respuesta HTTP sea correcta.
  if (!respuesta.ok) {
    throw new Error("Error al cargar los productos");
  }

  // Convertir la respuesta a un objeto JavaScript.
  return await respuesta.json();
}