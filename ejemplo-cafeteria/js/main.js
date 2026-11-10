// PUNTO DE ENTRADA: guarda el estado y conecta eventos con lógica y vista.
import { obtenerProductos } from "./api.js";
import { esNombreValido, existeProducto, validarPedido } from "./validators.js";
import {
  renderCatalogo, renderCarrito, mostrarErrores, mostrarErroresNativos,
  limpiarErrores, limpiarError, mostrarMensaje, mostrarLog,
} from "./ui.js";

const catalogo = document.querySelector("#catalogo");
const listaCarrito = document.querySelector("#carrito");
const formProducto = document.querySelector("#form-producto");
const formPedido = document.querySelector("#form-pedido");

// ---------- ESTADO (un import no se puede reasignar, por eso vive aquí) ----------
let productos = [];
let carrito = [];   // [{ id, cantidad }]

// ---------- LÓGICA sin mutar: devuelve arreglos nuevos ----------
const agregarAlCarrito = (carrito, id) =>
  carrito.some((i) => i.id === id)
    ? carrito.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i))
    : [...carrito, { id, cantidad: 1 }];

const cambiarCantidad = (carrito, id, delta) =>
  carrito
    .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
    .filter((i) => i.cantidad > 0);

const quitarDelCarrito = (carrito, id) => carrito.filter((i) => i.id !== id);

const alternarFavorito = (productos, id) =>
  productos.map((p) => (p.id === id ? { ...p, favorito: !p.favorito } : p));

const calcularTotal = (carrito, productos) =>
  carrito.reduce((suma, i) => suma + productos.find((p) => p.id === i.id).precio * i.cantidad, 0);

// ---------- Pintar: la pantalla es resultado de los datos ----------
const pintarCatalogo = () => renderCatalogo(productos);
const pintarCarrito = () => renderCarrito(carrito, productos, calcularTotal(carrito, productos));

// ---------- Eventos con delegación ----------
catalogo.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-accion]");
  if (!btn) return;
  const id = Number(btn.closest(".tarjeta").dataset.id);

  if (btn.dataset.accion === "agregar") {
    carrito = agregarAlCarrito(carrito, id);
    pintarCarrito();
  }
  if (btn.dataset.accion === "favorito") {
    productos = alternarFavorito(productos, id);
    pintarCatalogo();
  }
});

listaCarrito.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-accion]");
  if (!btn) return;
  const id = Number(btn.closest("li").dataset.id);
  const acciones = {
    mas: () => (carrito = cambiarCantidad(carrito, id, 1)),
    menos: () => (carrito = cambiarCantidad(carrito, id, -1)),
    quitar: () => (carrito = quitarDelCarrito(carrito, id)),
  };
  acciones[btn.dataset.accion]?.();
  pintarCarrito();
});

// ---------- Formulario 1: Constraint Validation API ----------
function validarNombreProducto(campo) {
  let mensaje = "";
  if (!esNombreValido(campo.value)) mensaje = "Escribe un nombre de al menos 3 letras";
  else if (existeProducto(productos, campo.value)) mensaje = "Ese producto ya está en el menú";
  campo.setCustomValidity(mensaje);   // "" = válido; ¡siempre limpiar!
}

formProducto.addEventListener("submit", (e) => {
  e.preventDefault();
  limpiarErrores(formProducto);
  validarNombreProducto(formProducto.elements.nombre);

  if (!formProducto.checkValidity()) {
    mostrarErroresNativos(formProducto);
    return;
  }

  const { nombre, precio, emoji } = Object.fromEntries(new FormData(formProducto));
  productos = [...productos, { id: Date.now(), nombre: nombre.trim(), precio: Number(precio), emoji, favorito: false }];
  pintarCatalogo();
  mostrarMensaje(formProducto, "Producto agregado.");
  formProducto.reset();
  formProducto.elements.nombre.focus();
});

// ---------- Formulario 2: validadores propios (validators.js) ----------
formPedido.addEventListener("submit", (e) => {
  e.preventDefault();
  limpiarErrores(formPedido);
  const datos = Object.fromEntries(new FormData(formPedido));

  const errores = validarPedido(datos, carrito);
  if (Object.keys(errores).length > 0) {
    mostrarErrores(formPedido, errores);
    return;
  }

  const total = calcularTotal(carrito, productos);
  carrito = [];
  pintarCarrito();
  formPedido.reset();
  mostrarMensaje(formPedido, `Gracias, ${datos.nombre.trim()}. Pedido de $${total.toFixed(2)} confirmado a ${datos.email}.`);
});

// Al escribir en un campo, se quita su error
[formProducto, formPedido].forEach((form) =>
  form.addEventListener("input", (e) => limpiarError(e.target))
);

// ---------- Burbujeo (de la clase pasada) ----------
document.addEventListener("click", mostrarLog);

async function iniciarAplicacion() {
  try {
    productos = await obtenerProductos();

    pintarCatalogo();
    pintarCarrito();

  } catch (error) {
    console.error(error);
    catalogo.textContent =
      "No fue posible cargar el menú. Intenta nuevamente.";
  }
}

iniciarAplicacion();
