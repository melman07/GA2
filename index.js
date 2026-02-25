const express = require("express");
const {getData, saveData} = require("./functions")
const app = express();
const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});

app.use(express.json());
app.use(express.static("public"));



app.get("/data", async(req, res)=>{
    res.json(await getData("data.json"))
})

app.post("/data", async(req,res)=>{

    const product = {}

    

    if(!req.body.name)
        return res.status(400).json({success: false, message: "Name is required"});
    product.id = "id_2";

    const allProducts = await getData("data.json");
    const idExists = allProducts.some(p => p.id === product.id);

    if (allProducts.some(p => String(p.id) === String(product.id)))
        return res.status(400).json({success: false, message: "Product ID already exists"});

    product.name = req.body.name || "no_name"
    product.description = req.body.description || "no_description"
    product.price = req.body.price || "no_price"

    allProducts.push(product);
    await saveData(allProducts, "data.json");

    res.status(201).json(product);
    
})

app.delete("/data/:id", async(req, res)=>{
    const id = req.params.id
    const products = await getData("data.json");
    const product = products.find(p=>p.id==id);

    if(!product) return res.status(404).json({success: false, message: "Product not found"});

    const filteredProducts = products.filter(p=>p.id != id);
    await saveData(filteredProducts, "data.json");

    res.json({success: true, message: "Product deleted"});

    /* res.json(await getData("data.json")) */
});