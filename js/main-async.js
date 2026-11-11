const caja = document.getElementById("caja");

function vacio() {
  caja.textContent = "No hay resultados.";
}

function pintar(lista) {
  caja.innerHTML = lista.map((u) => `<p>${u.name}</p>`).join("");
}

async function obtenerDatos() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) throw new Error(res.status);
  return [];
}

async function mostrar() {
  caja.textContent = "Cargando…";
  try {
    const lista = await obtenerDatos();
    if (!lista.length) return vacio();
    pintar(lista);
  } catch (err) {
    caja.textContent = "No pudimos cargar.";
  }
}

mostrar();