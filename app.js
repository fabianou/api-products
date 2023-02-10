const express = require('express');
const { json } = require('express/lib/response');

const app = express();
const fs = require('fs')


app.use(express.json())

app.get('/api/products', (req, res) => {
    products = fs.readFileSync('./products.json');
    let json = JSON.parse(products);
       
    res.send(json);
})

app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    products = fs.readFileSync('./products.json');
    let json = JSON.parse(products);
    
    const product = json.find(u=>u.id === productId);

    if(!product) {
        return res.send({error: 'Producto no encontrado'});
    } 

    res.send(product);
})

app.post('/api/products', (req, res) => {
    const file = fs.readFileSync('./products.json')

    newProduct = req.body

    if (file.length == 0) {
        //add data to json file
        newProduct.id = "1"
        fs.writeFileSync("./products.json", JSON.stringify([newProduct]))

    } else {
        //append data to jso file
        const json = JSON.parse(file.toString())
        newId = Number(json[json.length-1].id) + 1
        newProduct.id = String(newId)

        //add json element to json object
        json.push(newProduct);
        fs.writeFileSync("./products.json", JSON.stringify(json))
    }

    res.send(newProduct);
})

app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    products = fs.readFileSync('./products.json');
    let json = JSON.parse(products);
    
    let targetIndex
    const i = json.find(function(item, i) {
        if (item.id === productId) {
            targetIndex = i
            return i;
        }

    });

    console.log("asdasd " + targetIndex)
    //if(!targetIndex) {
       // return res.send({error: 'Producto no encontrado para eliminar'});
   // } 

    json.splice(targetIndex, 1)
    fs.writeFileSync("./products.json", JSON.stringify(json))

    res.send("Producto eliminado");
})


app.listen(8080, () => console.log('Listening on port 8080'));