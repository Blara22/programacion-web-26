// PUNTO DE ENTRADA: estado, eventos y coordinación entre API, storage y vista.
import { obtenerProductos } from "./api.js";
import { guardar, leer, eliminar } from "./storage.js";
import { esNombreValido, existeProducto, validarPedido } from "./validators.js";
import {
  renderCatalogo,
  renderCarrito,
  mostrarErrores,
  mostrarErroresNativos,
  limpiarErrores,
  limpiarError,
  mostrarMensaje,
  mostrarLog,
  mostrarEstadoCatalogo,
} from "./ui.js";

const catalogo = document.querySelector("#catalogo");
const listaCarrito = document.querySelector("#carrito");
const formProducto = document.querySelector("#form-producto");
const formPedido = document.querySelector("#form-pedido");
const inputBuscar = document.querySelector("#buscar-productos");
const botonTema = document.querySelector("#btn-tema");

const CLAVES = {
  tema: "cafeteria_tema",
  favoritos: "cafeteria_favoritos",
  carrito: "cafeteria_carrito",
};

// ---------- ESTADO ----------
let productos = [];
let carrito = leer(CLAVES.carrito, []);
let favoritos = leer(CLAVES.favoritos, []);
let tema = leer(CLAVES.tema, "claro");
let terminoBusqueda = "";

// Normalizar datos persistidos: pueden haber quedado ids de productos eliminados.
if (!Array.isArray(carrito)) carrito = [];
if (!Array.isArray(favoritos)) favoritos = [];
if (tema !== "claro" && tema !== "oscuro") tema = "claro";

// ---------- LÓGICA: funciones que producen nuevos arreglos ----------
const agregarAlCarrito = (items, id) =>
  items.some((item) => item.id === id)
    ? items.map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item))
    : [...items, { id, cantidad: 1 }];

const cambiarCantidad = (items, id, delta) =>
  items
    .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + delta } : item))
    .filter((item) => item.cantidad > 0);

const quitarDelCarrito = (items, id) => items.filter((item) => item.id !== id);

const calcularTotal = (items, listaProductos) =>
  items.reduce((suma, item) => {
    const producto = listaProductos.find((p) => p.id === item.id);
    return producto ? suma + producto.precio * item.cantidad : suma;
  }, 0);

function persistirCarrito() {
  guardar(CLAVES.carrito, carrito);
}

function persistirFavoritos() {
  guardar(CLAVES.favoritos, favoritos);
}

function aplicarTema() {
  document.documentElement.dataset.tema = tema;
  botonTema.setAttribute("aria-pressed", String(tema === "oscuro"));
  botonTema.textContent = tema === "oscuro" ? "☀️ Modo claro" : "🌙 Modo oscuro";
}

function alternarTema() {
  tema = tema === "claro" ? "oscuro" : "claro";
  aplicarTema();
  guardar(CLAVES.tema, tema);
}

function alternarFavorito(id) {
  favoritos = favoritos.includes(id)
    ? favoritos.filter((favoritoId) => favoritoId !== id)
    : [...favoritos, id];
  persistirFavoritos();
}

// ---------- PINTAR: la pantalla es resultado de los datos ----------
function productosVisibles() {
  const termino = terminoBusqueda.trim().toLocaleLowerCase("es");
  return productos
    .map((producto) => ({ ...producto, favorito: favoritos.includes(producto.id) }))
    .filter((producto) => producto.nombre.toLocaleLowerCase("es").includes(termino));
}

function pintarCatalogo() {
  const visibles = productosVisibles();
  renderCatalogo(visibles);
  mostrarEstadoCatalogo(visibles.length, terminoBusqueda);
}

function pintarCarrito() {
  renderCarrito(carrito, productos, calcularTotal(carrito, productos));
}

// ---------- DEBOUNCE ----------
function debounce(fn, ms) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), ms);
  };
}

const buscarConPausa = debounce((valor) => {
  terminoBusqueda = valor;
  pintarCatalogo();
}, 400);

inputBuscar.addEventListener("input", (evento) => {
  buscarConPausa(evento.target.value);
});

// ---------- EVENTOS CON DELEGACIÓN ----------
catalogo.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const tarjeta = boton.closest(".tarjeta");
  if (!tarjeta) return;
  const id = Number(tarjeta.dataset.id);

  if (boton.dataset.accion === "agregar") {
    carrito = agregarAlCarrito(carrito, id);
    persistirCarrito();
    pintarCarrito();
    document.querySelector("#estado-app").textContent = "Producto agregado al carrito.";
  }

  if (boton.dataset.accion === "favorito") {
    alternarFavorito(id);
    pintarCatalogo();
    document.querySelector("#estado-app").textContent = favoritos.includes(id)
      ? "Producto agregado a favoritos."
      : "Producto eliminado de favoritos.";
  }
});

listaCarrito.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const id = Number(boton.closest("li").dataset.id);
  const acciones = {
    mas: () => (carrito = cambiarCantidad(carrito, id, 1)),
    menos: () => (carrito = cambiarCantidad(carrito, id, -1)),
    quitar: () => (carrito = quitarDelCarrito(carrito, id)),
  };

  acciones[boton.dataset.accion]?.();
  persistirCarrito();
  pintarCarrito();
});

botonTema.addEventListener("click", alternarTema);

// ---------- FORMULARIO: Constraint Validation API ----------
function validarNombreProducto(campo) {
  let mensaje = "";
  if (!esNombreValido(campo.value)) mensaje = "Escribe un nombre de al menos 3 letras";
  else if (existeProducto(productos, campo.value)) mensaje = "Ese producto ya está en el menú";
  campo.setCustomValidity(mensaje);
}

formProducto.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarErrores(formProducto);
  validarNombreProducto(formProducto.elements.nombre);

  if (!formProducto.checkValidity()) {
    mostrarErroresNativos(formProducto);
    return;
  }

  const { nombre, precio, emoji } = Object.fromEntries(new FormData(formProducto));
  productos = [
    ...productos,
    { id: Date.now(), nombre: nombre.trim(), precio: Number(precio), emoji },
  ];
  pintarCatalogo();
  mostrarMensaje(formProducto, "Producto agregado al menú. Este cambio es temporal.");
  formProducto.reset();
  formProducto.elements.nombre.focus();
});

// ---------- FORMULARIO: validadores propios ----------
formPedido.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarErrores(formPedido);
  const datos = Object.fromEntries(new FormData(formPedido));
  const errores = validarPedido(datos, carrito);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(formPedido, errores);
    return;
  }

  const total = calcularTotal(carrito, productos);
  carrito = [];
  persistirCarrito();
  pintarCarrito();
  formPedido.reset();
  mostrarMensaje(
    formPedido,
    `Gracias, ${datos.nombre.trim()}. Pedido de $${total.toFixed(2)} confirmado a ${datos.email}.`,
  );
  formPedido.querySelector("button[type='submit']").focus();
});

[formProducto, formPedido].forEach((form) =>
  form.addEventListener("input", (evento) => limpiarError(evento.target)),
);

// ---------- EVENTO STORAGE: sincroniza cambios de otras pestañas ----------
window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVES.tema) {
    tema = leer(CLAVES.tema, "claro");
    aplicarTema();
  }
  if (evento.key === CLAVES.favoritos) {
    favoritos = leer(CLAVES.favoritos, []);
    pintarCatalogo();
  }
  if (evento.key === CLAVES.carrito) {
    carrito = leer(CLAVES.carrito, []);
    pintarCarrito();
  }
});

// El registro de clics se conserva como ejemplo de burbujeo de la clase anterior.
document.addEventListener("click", mostrarLog);

// ---------- INICIALIZACIÓN ASÍNCRONA ----------
async function iniciarAplicacion() {
  aplicarTema();
  mostrarEstadoCatalogo(null, "", "Cargando menú...");
  catalogo.setAttribute("aria-busy", "true");

  try {
    productos = await obtenerProductos();
    const idsDisponibles = new Set(productos.map((producto) => producto.id));
    favoritos = favoritos.filter((id) => idsDisponibles.has(id));
    carrito = carrito.filter((item) => idsDisponibles.has(item.id) && item.cantidad > 0);
    persistirFavoritos();
    persistirCarrito();
    pintarCatalogo();
    pintarCarrito();
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
    mostrarEstadoCatalogo(null, "", "No fue posible cargar el menú. Comprueba tu conexión e inténtalo nuevamente.", true);
  } finally {
    catalogo.setAttribute("aria-busy", "false");
  }
}

iniciarAplicacion();
