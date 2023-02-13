const express = require('express');
const { JSON} = require('express/lib/response');

const app = express();
const fs = require('fs')

app.use(express.json())

// ***Router producto

// Obtener todos los productos
app.get('/api/products', (req, res) => {
    productsFile = fs.readFileSync('./products.json');

    if (productsFile.length == 0) {
        return res.send({error: 'No hay productos disponibles'})
    }
    
    res.send(JSON.parse(productsFile))
})

// Obtener solo un producto segun el id
app.get('/api/products/:id', (req, res) => {
    const productId = Number(req.params.id);

    productsFile = fs.readFileSync('./products.json');
    if (productsFile.length == 0) {
        return res.send({error: 'No hay productos disponibles'})
    }

    let productos = JSON.parse(productsFile);
    const producto = productos.find(producto=> producto.id === productId);

    if(!producto) {
        return res.send({error: 'Producto no encontrado'});
    } 

    res.send(producto);
})

// Crear un producto nuevo
app.post('/api/products', (req, res) => {
    nuevoProducto = req.body

    // Chequeo parametros de entrada
    if (!nuevoProducto.title || nuevoProducto.title === "" ||
        !nuevoProducto.price || nuevoProducto.price <= 0 ||
        !nuevoProducto.description || nuevoProducto.description === "" ||
        !nuevoProducto.code  || nuevoProducto.code  === "" ||
        !nuevoProducto.stock || 
        !nuevoProducto.category || nuevoProducto.category === "") {

        return res.send({error: 'Producto nuevo invalido, faltan parametros requeridos'});
    }

    productsFile = fs.readFileSync('./products.json')
    let productos
    if (productsFile.length == 0) {
        productos = []
    } else {
        productos = JSON.parse(productsFile)
    }

    if (productos.length == 0) {
        nuevoProducto.id = 1
        productos = [nuevoProducto]
    } else {
        nuevoProducto.id = productos[productos.length-1].id + 1
        productos.push(nuevoProducto);
    }

    fs.writeFileSync("./products.json", JSON.stringify(productos))

    res.send(nuevoProducto);
})

// Borrar un producto
app.delete('/api/products/:id', (req, res) => {
    const productId = Number(req.params.id)

    productsFile = fs.readFileSync('./products.json');
    let productos = JSON.parse(productsFile);
    
    let targetIndex
    productos.find(function(producto, i) {
        if (producto.id === productId) {
            targetIndex = i
        }
    });

    if(targetIndex === undefined) {
        return res.send({error: 'Producto no encontrado para eliminar'});
    } 

    productos.splice(targetIndex, 1)
    fs.writeFileSync("./products.json", JSON.stringify(productos))

    res.send("Producto eliminado");
})

// Actualizar un producto
app.put('/api/products/:id', (req, res) => {
    const productId = Number(req.params.id);

    productsFile = fs.readFileSync('./products.json');
    if (productsFile.length == 0) {
        return res.send({error: 'No hay productos disponibles'})
    }

    let productos = JSON.parse(productsFile);
    const producto = productos.find(producto=> producto.id === Number(productId));

    if(!producto) {
        return res.send({error: 'Producto no encontrado para actualizar'});
    } 

    // Chequeo uno por uno los parametros del body y actualizo el producto en cuestion
    productoActualizado = req.body

    if (productoActualizado.title != undefined && productoActualizado.title != "") {
        producto.title = productoActualizado.title
    }
    
    if (productoActualizado.price > 0) {
        producto.price = productoActualizado.price
    }

    if (productoActualizado.description != undefined && productoActualizado.description != "") {
        producto.description = productoActualizado.description
    }

    if (productoActualizado.code != undefined && productoActualizado.code != "") {
        producto.code = productoActualizado.code
    }

    if (productoActualizado.status != undefined) {
        producto.status = productoActualizado.status
    }
    
    if (productoActualizado.stock >= 0) {
        producto.stock = productoActualizado.stock
    }

    if (productoActualizado.category != undefined &&  productoActualizado.category != "") {
        producto.category = productoActualizado.category
    }

    if (productoActualizado.thumbnails != undefined) {
        producto.thumbnails = productoActualizado.thumbnails
    }

    fs.writeFileSync("./products.json", JSON.stringify(productos))

    res.send(producto);
})

// ***Router carrito

// Crea un carrito nuevo
app.post('/api/carts', (req, res) => {
    nuevoCarrito = req.body

    if (!nuevoCarrito.productos || nuevoCarrito.productos.length == 0 ) {
        return res.send({error: 'No hay productos suficientes para crear un carrito nuevo'});
    }

    cartsFile = fs.readFileSync('./carts.json')

    let carritos
    if (cartsFile.length == 0) {
        carritos = []
    } else {
        carritos = JSON.parse(cartsFile)
    }

    if (carritos.length == 0) {
        nuevoCarrito.id = 1
        carritos = [nuevoCarrito]
    } else {
        nuevoCarrito.id = carritos[carritos.length-1].id + 1
        carritos.push(nuevoCarrito);
    }

    fs.writeFileSync("./carts.json", JSON.stringify(carritos))

    res.send(nuevoCarrito);
})

// Devuelve una lista de prodcutos del carrito segun el id de carrito recibido
app.get('/api/carts/:id', (req, res) => {
    const cartId = Number(req.params.id);

    cartsFile = fs.readFileSync('./carts.json');
    if (cartsFile.length == 0) {
        return res.send({error: 'No hay carritos disponibles'})
    }

    let carritos = JSON.parse(cartsFile);
    const carrito = carritos.find(carrito=> carrito.id === cartId);

    if(!carrito) {
        return res.send({error: 'Carrito no encontrado'});
    } 

    res.send({productos: [carrito.productos]});
})

// Agrega o aumenta la cantidad de un producto a un carrito especifico
app.post('/api/carts/:cid/product/:pid', (req, res) => {
    const cartId = Number(req.params.cid);

    cartsFile = fs.readFileSync('./carts.json');
    if (cartsFile.length == 0) {
        return res.send({error: 'No hay carritos disponibles'})
    }

    // Busco el carrito al cual se le van a actualizar/agregar el producto
    let carritos = JSON.parse(cartsFile);
    const carrito = carritos.find(carrito=> carrito.id === cartId);

    if(!carrito) {
        return res.send({error: 'Carrito no encontrado'});
    } 

    // Agrego o actualizo el producto al carrito correspondiente
    const productId = Number(req.params.pid);
    nuevoProducto = req.body

    if (!nuevoProducto || !nuevoProducto.id || !nuevoProducto.quantity || nuevoProducto.quantity <= 0) {
        return res.send({error: 'No hay producto para agregar al carrito, faltan parametros'});
    }

    if (productId != nuevoProducto.id) {
        return res.send({error: 'El id del producto a agregar deben coincidir con el del body'});
    }


    if (carrito.productos.length == 0) {
        carrito.productos = [nuevoProducto]
    } else {
        // Si el carrito tiene productos busco el solicitado a actualizar y si lo encuentro sumo 1 a la quantity
        const producto = carrito.productos.find(producto => producto.id === productId);
        if (producto) {
            // Si encontre el producto actualizo el quantity
            producto.quantity++
        } else {
            carrito.productos.push(nuevoProducto)
        }
    }
    
    fs.writeFileSync("./carts.json", JSON.stringify(carritos))

    res.send({productos: [carrito.productos]});
})

app.listen(8080, () => console.log('Listening on port 8080'));
