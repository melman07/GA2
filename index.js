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