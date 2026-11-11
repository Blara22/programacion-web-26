// VISTA: único módulo que pinta en pantalla. No toma decisiones de negocio.
const catalogo = document.querySelector("#catalogo");
const listaCarrito = document.querySelector("#carrito");
const totalEl = document.querySelector("#total");
const vacioEl = document.querySelector("#vacio");
const log = document.querySelector("#log");
const tplTarjeta = document.querySelector("#tpl-tarjeta");
const tplItem = document.querySelector("#tpl-item-carrito");
const estadoCatalogo = document.querySelector("#estado-catalogo");

function crearTarjeta(producto) {
  const clon = tplTarjeta.content.cloneNode(true);
  const tarjeta = clon.querySelector(".tarjeta");
  tarjeta.dataset.id = producto.id;
  tarjeta.classList.toggle("favorita", producto.favorito);
  clon.querySelector(".emoji").textContent = producto.emoji;
  clon.querySelector("h3").textContent = producto.nombre;
  clon.querySelector(".precio").textContent = `$${producto.precio.toFixed(2)}`;

  const botonFavorito = clon.querySelector(".fav");
  botonFavorito.classList.toggle("activo", producto.favorito);
  botonFavorito.setAttribute("aria-pressed", String(producto.favorito));
  botonFavorito.setAttribute(
    "aria-label",
    producto.favorito
      ? `Quitar ${producto.nombre} de favoritos`
      : `Agregar ${producto.nombre} a favoritos`,
  );
  botonFavorito.textContent = producto.favorito ? "♥" : "♡";
  return clon;
}

export function renderCatalogo(productos) {
  catalogo.replaceChildren(...productos.map(crearTarjeta));
}

export function mostrarEstadoCatalogo(cantidad, termino, mensaje = "", esError = false) {
  if (mensaje) {
    estadoCatalogo.textContent = mensaje;
    estadoCatalogo.classList.toggle("error", esError);
    return;
  }

  estadoCatalogo.classList.remove("error");
  if (cantidad === 0) {
    estadoCatalogo.textContent = termino.trim()
      ? `No se encontraron productos para "${termino}".`
      : "No hay productos disponibles.";
  } else {
    estadoCatalogo.textContent = `${cantidad} producto(s) encontrado(s).`;
  }
}

export function renderCarrito(carrito, productos, total) {
  const items = carrito
    .map((item) => {
      const producto = productos.find((actual) => actual.id === item.id);
      if (!producto) return null;

      const clon = tplItem.content.cloneNode(true);
      const fila = clon.querySelector("li");
      fila.dataset.id = item.id;
      clon.querySelector(".nombre").textContent = producto.nombre;
      clon.querySelector(".cantidad").textContent = item.cantidad;
      clon.querySelector(".subtotal").textContent = `$${(producto.precio * item.cantidad).toFixed(2)}`;
      clon.querySelector('[data-accion="menos"]').setAttribute("aria-label", `Disminuir cantidad de ${producto.nombre}`);
      clon.querySelector('[data-accion="mas"]').setAttribute("aria-label", `Aumentar cantidad de ${producto.nombre}`);
      clon.querySelector('[data-accion="quitar"]').setAttribute("aria-label", `Quitar ${producto.nombre} del carrito`);
      return clon;
    })
    .filter(Boolean);

  listaCarrito.replaceChildren(...items);
  totalEl.textContent = total.toFixed(2);
  vacioEl.classList.toggle("oculto", carrito.length > 0);
}

// ---------- Errores en el DOM ----------
export function mostrarError(form, nombre, mensaje) {
  const span = form.querySelector(`[data-error-para="${nombre}"]`);
  if (span) span.textContent = mensaje;
  form.elements[nombre]?.classList.add("invalido");
}

export function mostrarErrores(form, errores) {
  Object.entries(errores).forEach(([nombre, mensaje]) => mostrarError(form, nombre, mensaje));
  form.elements[Object.keys(errores)[0]]?.focus();
}

export function mostrarErroresNativos(form) {
  const invalidos = [...form.elements].filter((campo) => !campo.checkValidity());
  invalidos.forEach((campo) => mostrarError(form, campo.name, campo.validationMessage));
  invalidos[0]?.focus();
}

export function limpiarErrores(form) {
  form.querySelectorAll("[data-error-para]").forEach((elemento) => (elemento.textContent = ""));
  form.querySelectorAll(".invalido").forEach((campo) => campo.classList.remove("invalido"));
  mostrarMensaje(form, "");
}

export function limpiarError(campo) {
  campo.classList.remove("invalido");
  campo.closest(".campo")?.querySelector(".error-campo")?.replaceChildren();
}

export function mostrarMensaje(form, texto, esError = false) {
  const mensaje = form.querySelector(".mensaje");
  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
}

export function mostrarLog(evento) {
  const accion = evento.target.closest("[data-accion]")?.dataset.accion ?? "ninguna";
  log.textContent =
    `target: <${evento.target.tagName.toLowerCase()}> · ` +
    `currentTarget: ${evento.currentTarget === document ? "document" : "?"} · acción: ${accion}`;
}
