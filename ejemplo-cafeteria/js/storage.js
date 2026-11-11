// STORAGE: concentra el acceso a localStorage.
// Los valores se serializan como JSON para admitir arreglos y objetos.

/** Guarda un valor JavaScript como JSON. Devuelve true si se guardó. */
export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error(`No fue posible guardar "${clave}"`, error);
    return false;
  }
}

/** Lee y convierte JSON. Si falta o está dañado, devuelve el valor por defecto. */
export function leer(clave, defecto = null) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? defecto;
  } catch (error) {
    console.warn(`No fue posible leer "${clave}"; se usará el valor por defecto.`, error);
    return defecto;
  }
}

/** Elimina una sola clave. */
export function eliminar(clave) {
  try {
    localStorage.removeItem(clave);
  } catch (error) {
    console.error(`No fue posible eliminar "${clave}"`, error);
  }
}

/** Guarda datos acompañados de su fecha de expiración. */
export function guardarConTTL(clave, datos, ttlMs) {
  return guardar(clave, {
    datos,
    expira: Date.now() + ttlMs,
  });
}

/** Devuelve los datos del caché o null si no existen/ya vencieron. */
export function leerConTTL(clave) {
  const entrada = leer(clave, null);

  if (
    !entrada ||
    typeof entrada !== "object" ||
    typeof entrada.expira !== "number" ||
    !("datos" in entrada)
  ) {
    return null;
  }

  if (Date.now() >= entrada.expira) {
    eliminar(clave);
    return null;
  }

  return entrada.datos;
}
