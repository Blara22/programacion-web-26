// VISTA: único módulo que pinta en pantalla. No toma decisiones de negocio.
const catalogo = document.querySelector("#catalogo");
const listaCarrito = document.querySelector("#carrito");
const totalEl = document.querySelector("#total");
const vacioEl = document.querySelector("#vacio");
const log = document.querySelector("#log");
const tplTarjeta = document.querySelector("#tpl-tarjeta");
const tplItem = document.querySelector("#tpl-item-carrito");

// ---------- Renderizado con <template> ----------
function crearTarjeta(p) {
  const clon = tplTarjeta.content.cloneNode(true);       // copia profunda del molde
  const tarjeta = clon.querySelector(".tarjeta");
  tarjeta.dataset.id = p.id;
  tarjeta.classList.toggle("favorita", p.favorito);
  clon.querySelector(".emoji").textContent = p.emoji;    // textContent: seguro
  clon.querySelector("h3").textContent = p.nombre;
  clon.querySelector(".precio").textContent = `$${p.precio.toFixed(2)}`;
  const fav = clon.querySelector(".fav");
  fav.classList.toggle("activo", p.favorito);
  fav.setAttribute("aria-pressed", p.favorito);
  fav.textContent = p.favorito ? "♥" : "♡";
  return clon;
}

export function renderCatalogo(productos) {
  catalogo.replaceChildren(...productos.map(crearTarjeta));
}

export function renderCarrito(carrito, productos, total) {
  const items = carrito.map((item) => {
    const p = productos.find((prod) => prod.id === item.id);
    const clon = tplItem.content.cloneNode(true);
    clon.querySelector("li").dataset.id = item.id;
    clon.querySelector(".nombre").textContent = p.nombre;
    clon.querySelector(".cantidad").textContent = item.cantidad;
    clon.querySelector(".subtotal").textContent = `$${(p.precio * item.cantidad).toFixed(2)}`;
    return clon;
  });
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
  Object.entries(errores).forEach(([nombre, msg]) => mostrarError(form, nombre, msg));
  form.elements[Object.keys(errores)[0]]?.focus();
}

// Errores de la Constraint Validation API
export function mostrarErroresNativos(form) {
  const invalidos = [...form.elements].filter((campo) => !campo.checkValidity());
  invalidos.forEach((campo) => mostrarError(form, campo.name, campo.validationMessage));
  invalidos[0]?.focus();
}

export function limpiarErrores(form) {
  form.querySelectorAll("[data-error-para]").forEach((s) => (s.textContent = ""));
  form.querySelectorAll(".invalido").forEach((c) => c.classList.remove("invalido"));
  mostrarMensaje(form, "");
}

export function limpiarError(campo) {
  campo.classList.remove("invalido");
  campo.closest(".campo")?.querySelector(".error-campo")?.replaceChildren();
}

export function mostrarMensaje(form, texto, esError = false) {
  const p = form.querySelector(".mensaje");
  p.textContent = texto;
  p.classList.toggle("error", esError);
}

export function mostrarLog(e) {
  const accion = e.target.closest("[data-accion]")?.dataset.accion ?? "ninguna";
  log.textContent =
    `target: <${e.target.tagName.toLowerCase()}> · ` +
    `currentTarget: ${e.currentTarget === document ? "document" : "?"} · acción: ${accion}`;
}
