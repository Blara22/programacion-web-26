const productos = [
  { id: 1, nombre: "Teclado", precio: 450, stock: 5 },
  { id: 2, nombre: "Mouse", precio: 200, stock: 0 },
  { id: 3, nombre: "Monitor", precio: 3200, stock: 2 },
  { id: 4, nombre: "Cable HDMI", precio: 90, stock: 20 },
];

const nombres = productos.map(productito => productito.precio);
const conIva = productos.map(p => ({... p,  precio: p.precio * .80}));
console.log(conIva);
console.log(productos);

const conStock = productos.filter(p => p.stock < 5);
console.log(conStock);

const precioTotal = productos.reduce((acc, { precio }) => acc + precio, 0);
console.log(precioTotal);

productos.sort((a, b) => b.precio - a.precio);
console.log(productos);

/*const campo = "stock";

const producto = {
  nombre: "Teclado",
  precio: 23,
  describir() {
    console.log("Descripción del objeto")
  }
}

console.log(producto);
let { nombre: titulo, precio, describir } = producto;

/*console.log("nombre", titulo);
console.log("precio", precio);
console.log(describir)*/

/*const copia = { ...producto, stock: 5 };
producto.nombre = "Computadora";
console.log("copia: ", copia);
console.log("producto: ", producto);*/
